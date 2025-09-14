import httpx
import asyncio
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..models.microvm import MicroVM, MicroVMEvent, MicroVMQuota, MicroVMStatus, MicroVMRuntime
from ..schemas.microvm import MicroVMCreate, MicroVMUpdate, MicroVMRuntimeTemplate, MicroVMRegion
from ..config import settings
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class MicroVMService:
    def __init__(self, db: Session):
        self.db = db
        self.vm_control_url = settings.VM_CONTROL_URL
        self.vm_control_token = settings.VM_CONTROL_TOKEN
        self.default_region = settings.VM_DEFAULT_REGION
        self.default_cpu = settings.VM_DEFAULT_CPU
        self.default_memory_mb = settings.VM_DEFAULT_MEMORY_MB

    async def create_microvm(self, microvm_data: MicroVMCreate, user_id: int, tenant_id: int) -> MicroVM:
        """Create a new MicroVM"""
        # Check quotas
        if not await self._check_quotas(tenant_id, microvm_data):
            raise ValueError("Quota exceeded for tenant")

        # Generate unique VM ID
        vm_id = f"vm-{uuid.uuid4().hex[:12]}"
        
        # Create MicroVM record
        microvm = MicroVM(
            vm_id=vm_id,
            name=microvm_data.name,
            description=microvm_data.description,
            owner_id=user_id,
            tenant_id=tenant_id,
            runtime=microvm_data.runtime,
            region=microvm_data.region,
            cpu_cores=microvm_data.cpu_cores,
            memory_mb=microvm_data.memory_mb,
            storage_gb=microvm_data.storage_gb,
            repo_url=microvm_data.repo_url,
            branch=microvm_data.branch,
            build_command=microvm_data.build_command,
            start_command=microvm_data.start_command,
            environment_variables=microvm_data.environment_variables or {},
            gpu_enabled=microvm_data.gpu_enabled,
            auto_scale=microvm_data.auto_scale,
            status=MicroVMStatus.CREATING
        )
        
        self.db.add(microvm)
        self.db.commit()
        self.db.refresh(microvm)
        
        # Log creation event
        await self._log_event(microvm.id, "created", f"MicroVM {vm_id} created")
        
        # Start provisioning asynchronously
        asyncio.create_task(self._provision_microvm(microvm.id))
        
        return microvm

    async def get_microvm(self, microvm_id: int, user_id: int) -> Optional[MicroVM]:
        """Get a MicroVM by ID"""
        return self.db.query(MicroVM).filter(
            MicroVM.id == microvm_id,
            MicroVM.owner_id == user_id,
            MicroVM.is_active == True
        ).first()

    async def get_microvm_by_vm_id(self, vm_id: str, user_id: int) -> Optional[MicroVM]:
        """Get a MicroVM by VM ID"""
        return self.db.query(MicroVM).filter(
            MicroVM.vm_id == vm_id,
            MicroVM.owner_id == user_id,
            MicroVM.is_active == True
        ).first()

    async def list_microvms(
        self, 
        user_id: int, 
        tenant_id: Optional[int] = None,
        status: Optional[MicroVMStatus] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Dict[str, Any]:
        """List MicroVMs for a user"""
        query = self.db.query(MicroVM).filter(
            MicroVM.owner_id == user_id,
            MicroVM.is_active == True
        )
        
        if tenant_id:
            query = query.filter(MicroVM.tenant_id == tenant_id)
        if status:
            query = query.filter(MicroVM.status == status)
        
        total = query.count()
        microvms = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "microvms": microvms,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }

    async def update_microvm(
        self, 
        microvm_id: int, 
        microvm_data: MicroVMUpdate, 
        user_id: int
    ) -> Optional[MicroVM]:
        """Update a MicroVM"""
        microvm = await self.get_microvm(microvm_id, user_id)
        if not microvm:
            return None
        
        # Check if VM is in a state that allows updates
        if microvm.status not in [MicroVMStatus.RUNNING, MicroVMStatus.STOPPED]:
            raise ValueError("Cannot update MicroVM in current status")
        
        # Update fields
        for field, value in microvm_data.dict(exclude_unset=True).items():
            setattr(microvm, field, value)
        
        microvm.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(microvm)
        
        # Log update event
        await self._log_event(microvm.id, "updated", f"MicroVM {microvm.vm_id} updated")
        
        # If VM is running, apply changes via vm-control
        if microvm.status == MicroVMStatus.RUNNING:
            asyncio.create_task(self._update_vm_resources(microvm.id))
        
        return microvm

    async def delete_microvm(self, microvm_id: int, user_id: int) -> bool:
        """Delete a MicroVM"""
        microvm = await self.get_microvm(microvm_id, user_id)
        if not microvm:
            return False
        
        # Mark as destroying
        microvm.status = MicroVMStatus.DESTROYING
        microvm.updated_at = datetime.utcnow()
        self.db.commit()
        
        # Log destruction event
        await self._log_event(microvm.id, "destroying", f"MicroVM {microvm.vm_id} being destroyed")
        
        # Start destruction asynchronously
        asyncio.create_task(self._destroy_microvm(microvm.id))
        
        return True

    async def get_microvm_status(self, microvm_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get MicroVM status and metrics"""
        microvm = await self.get_microvm(microvm_id, user_id)
        if not microvm:
            return None
        
        # If VM has vm_control_id, fetch latest status
        if microvm.vm_control_id:
            try:
                status_data = await self._fetch_vm_status(microvm.vm_control_id)
                if status_data:
                    # Update local status
                    microvm.vm_control_status = status_data.get("status")
                    microvm.cpu_usage_percent = status_data.get("cpu_usage_percent", 0)
                    microvm.memory_usage_mb = status_data.get("memory_usage_mb", 0)
                    microvm.storage_usage_gb = status_data.get("storage_usage_gb", 0)
                    
                    # Update dev_url if available
                    if status_data.get("dev_url") and not microvm.dev_url:
                        microvm.dev_url = status_data["dev_url"]
                    
                    self.db.commit()
            except Exception as e:
                logger.error(f"Failed to fetch VM status for {microvm.vm_id}: {e}")
        
        return {
            "id": microvm.id,
            "vm_id": microvm.vm_id,
            "status": microvm.status,
            "vm_control_status": microvm.vm_control_status,
            "dev_url": microvm.dev_url,
            "internal_ip": microvm.internal_ip,
            "external_ip": microvm.external_ip,
            "cpu_usage_percent": microvm.cpu_usage_percent,
            "memory_usage_mb": microvm.memory_usage_mb,
            "storage_usage_gb": microvm.storage_usage_gb,
            "created_at": microvm.created_at,
            "updated_at": microvm.updated_at
        }

    async def get_runtime_templates(self) -> List[MicroVMRuntimeTemplate]:
        """Get available runtime templates"""
        return [
            MicroVMRuntimeTemplate(
                runtime=MicroVMRuntime.NODE,
                name="Node.js",
                description="JavaScript runtime with npm ecosystem",
                default_cpu_cores=2,
                default_memory_mb=2048,
                default_storage_gb=10,
                default_build_command="npm install",
                default_start_command="npm start",
                icon="node",
                color="green"
            ),
            MicroVMRuntimeTemplate(
                runtime=MicroVMRuntime.PYTHON,
                name="Python",
                description="Python runtime with pip ecosystem",
                default_cpu_cores=2,
                default_memory_mb=2048,
                default_storage_gb=10,
                default_build_command="pip install -r requirements.txt",
                default_start_command="python app.py",
                icon="python",
                color="blue"
            ),
            MicroVMRuntimeTemplate(
                runtime=MicroVMRuntime.GO,
                name="Go",
                description="Go runtime with fast compilation",
                default_cpu_cores=2,
                default_memory_mb=1024,
                default_storage_gb=10,
                default_build_command="go build -o app .",
                default_start_command="./app",
                icon="go",
                color="cyan"
            ),
            MicroVMRuntimeTemplate(
                runtime=MicroVMRuntime.RUST,
                name="Rust",
                description="Rust runtime with Cargo",
                default_cpu_cores=2,
                default_memory_mb=1024,
                default_storage_gb=10,
                default_build_command="cargo build --release",
                default_start_command="./target/release/app",
                icon="rust",
                color="orange"
            ),
            MicroVMRuntimeTemplate(
                runtime=MicroVMRuntime.JAVA,
                name="Java",
                description="Java runtime with Maven/Gradle",
                default_cpu_cores=2,
                default_memory_mb=2048,
                default_storage_gb=10,
                default_build_command="mvn clean package",
                default_start_command="java -jar target/app.jar",
                icon="java",
                color="red"
            ),
            MicroVMRuntimeTemplate(
                runtime=MicroVMRuntime.DOTNET,
                name=".NET",
                description=".NET runtime with NuGet",
                default_cpu_cores=2,
                default_memory_mb=2048,
                default_storage_gb=10,
                default_build_command="dotnet build",
                default_start_command="dotnet run",
                icon="dotnet",
                color="purple"
            )
        ]

    async def get_available_regions(self) -> List[MicroVMRegion]:
        """Get available regions for MicroVM deployment"""
        return [
            MicroVMRegion(id="us-east-1", name="US East (N. Virginia)", available=True, latency_ms=50),
            MicroVMRegion(id="us-west-2", name="US West (Oregon)", available=True, latency_ms=80),
            MicroVMRegion(id="eu-west-1", name="Europe (Ireland)", available=True, latency_ms=120),
            MicroVMRegion(id="ap-southeast-1", name="Asia Pacific (Singapore)", available=True, latency_ms=200),
            MicroVMRegion(id="ap-northeast-1", name="Asia Pacific (Tokyo)", available=True, latency_ms=180),
        ]

    async def _check_quotas(self, tenant_id: int, microvm_data: MicroVMCreate) -> bool:
        """Check if tenant has quota for new MicroVM"""
        quota = self.db.query(MicroVMQuota).filter(MicroVMQuota.tenant_id == tenant_id).first()
        if not quota:
            # Create default quota
            quota = MicroVMQuota(
                tenant_id=tenant_id,
                max_microvms=5,
                max_cpu_cores=8,
                max_memory_gb=16,
                max_storage_gb=100
            )
            self.db.add(quota)
            self.db.commit()
        
        # Check limits
        if quota.current_microvms >= quota.max_microvms:
            return False
        if quota.current_cpu_cores + microvm_data.cpu_cores > quota.max_cpu_cores:
            return False
        if quota.current_memory_gb + (microvm_data.memory_mb // 1024) > quota.max_memory_gb:
            return False
        if quota.current_storage_gb + microvm_data.storage_gb > quota.max_storage_gb:
            return False
        
        return True

    async def _provision_microvm(self, microvm_id: int):
        """Provision MicroVM via vm-control API"""
        try:
            microvm = self.db.query(MicroVM).filter(MicroVM.id == microvm_id).first()
            if not microvm:
                return
            
            # Call vm-control API
            vm_config = {
                "name": microvm.name,
                "region": microvm.region,
                "cpu_cores": microvm.cpu_cores,
                "memory_mb": microvm.memory_mb,
                "storage_gb": microvm.storage_gb,
                "runtime": microvm.runtime.value,
                "repo_url": microvm.repo_url,
                "branch": microvm.branch,
                "build_command": microvm.build_command,
                "start_command": microvm.start_command,
                "environment_variables": microvm.environment_variables,
                "gpu_enabled": microvm.gpu_enabled
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.vm_control_url}/api/v1/vms",
                    json=vm_config,
                    headers={"Authorization": f"Bearer {self.vm_control_token}"},
                    timeout=30.0
                )
                response.raise_for_status()
                
                vm_data = response.json()
                microvm.vm_control_id = vm_data["id"]
                microvm.vm_control_region = vm_data["region"]
                microvm.vm_control_status = vm_data["status"]
                microvm.dev_url = vm_data.get("dev_url")
                microvm.internal_ip = vm_data.get("internal_ip")
                microvm.external_ip = vm_data.get("external_ip")
                
                self.db.commit()
                
                await self._log_event(microvm_id, "provisioning_started", f"VM provisioning started with ID {vm_data['id']}")
                
                # Poll for completion
                await self._poll_vm_status(microvm_id)
                
        except Exception as e:
            logger.error(f"Failed to provision MicroVM {microvm_id}: {e}")
            microvm = self.db.query(MicroVM).filter(MicroVM.id == microvm_id).first()
            if microvm:
                microvm.status = MicroVMStatus.FAILED
                self.db.commit()
                await self._log_event(microvm_id, "provisioning_failed", f"VM provisioning failed: {str(e)}")

    async def _poll_vm_status(self, microvm_id: int):
        """Poll VM status until completion"""
        max_attempts = 60  # 5 minutes with 5-second intervals
        attempt = 0
        
        while attempt < max_attempts:
            try:
                microvm = self.db.query(MicroVM).filter(MicroVM.id == microvm_id).first()
                if not microvm or not microvm.vm_control_id:
                    break
                
                status_data = await self._fetch_vm_status(microvm.vm_control_id)
                if not status_data:
                    break
                
                # Update status
                microvm.vm_control_status = status_data["status"]
                microvm.dev_url = status_data.get("dev_url", microvm.dev_url)
                microvm.internal_ip = status_data.get("internal_ip", microvm.internal_ip)
                microvm.external_ip = status_data.get("external_ip", microvm.external_ip)
                
                if status_data["status"] == "running":
                    microvm.status = MicroVMStatus.RUNNING
                    microvm.started_at = datetime.utcnow()
                    self.db.commit()
                    await self._log_event(microvm_id, "running", f"VM {microvm.vm_id} is now running")
                    break
                elif status_data["status"] == "failed":
                    microvm.status = MicroVMStatus.FAILED
                    self.db.commit()
                    await self._log_event(microvm_id, "failed", f"VM {microvm.vm_id} failed to start")
                    break
                
                self.db.commit()
                await asyncio.sleep(5)
                attempt += 1
                
            except Exception as e:
                logger.error(f"Error polling VM status for {microvm_id}: {e}")
                break

    async def _fetch_vm_status(self, vm_control_id: str) -> Optional[Dict[str, Any]]:
        """Fetch VM status from vm-control API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.vm_control_url}/api/v1/vms/{vm_control_id}",
                    headers={"Authorization": f"Bearer {self.vm_control_token}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch VM status for {vm_control_id}: {e}")
            return None

    async def _destroy_microvm(self, microvm_id: int):
        """Destroy MicroVM via vm-control API"""
        try:
            microvm = self.db.query(MicroVM).filter(MicroVM.id == microvm_id).first()
            if not microvm or not microvm.vm_control_id:
                return
            
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.vm_control_url}/api/v1/vms/{microvm.vm_control_id}",
                    headers={"Authorization": f"Bearer {self.vm_control_token}"},
                    timeout=30.0
                )
                response.raise_for_status()
                
                microvm.status = MicroVMStatus.DESTROYED
                microvm.stopped_at = datetime.utcnow()
                microvm.is_active = False
                self.db.commit()
                
                await self._log_event(microvm_id, "destroyed", f"VM {microvm.vm_id} destroyed")
                
        except Exception as e:
            logger.error(f"Failed to destroy MicroVM {microvm_id}: {e}")
            microvm = self.db.query(MicroVM).filter(MicroVM.id == microvm_id).first()
            if microvm:
                microvm.status = MicroVMStatus.FAILED
                self.db.commit()
                await self._log_event(microvm_id, "destroy_failed", f"VM destruction failed: {str(e)}")

    async def _update_vm_resources(self, microvm_id: int):
        """Update VM resources via vm-control API"""
        try:
            microvm = self.db.query(MicroVM).filter(MicroVM.id == microvm_id).first()
            if not microvm or not microvm.vm_control_id:
                return
            
            resource_config = {
                "cpu_cores": microvm.cpu_cores,
                "memory_mb": microvm.memory_mb,
                "storage_gb": microvm.storage_gb
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    f"{self.vm_control_url}/api/v1/vms/{microvm.vm_control_id}",
                    json=resource_config,
                    headers={"Authorization": f"Bearer {self.vm_control_token}"},
                    timeout=30.0
                )
                response.raise_for_status()
                
                await self._log_event(microvm_id, "resources_updated", f"VM resources updated")
                
        except Exception as e:
            logger.error(f"Failed to update VM resources for {microvm_id}: {e}")

    async def _log_event(self, microvm_id: int, event_type: str, message: str, metadata: Optional[Dict[str, Any]] = None):
        """Log a MicroVM event"""
        event = MicroVMEvent(
            microvm_id=microvm_id,
            event_type=event_type,
            message=message,
            metadata=metadata or {}
        )
        self.db.add(event)
        self.db.commit()
