"""
Mock VM Control Service for Testing
Simulates the vm-control API for local development and testing
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum
import json

class VMStatus(str, Enum):
    CREATING = "creating"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    TERMINATED = "terminated"

class MockVMControl:
    """Mock implementation of vm-control API for testing"""
    
    def __init__(self):
        self.vms: Dict[str, Dict] = {}
        self.regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
        self.runtimes = [
            "nodejs-18",
            "nodejs-20", 
            "python-3.11",
            "python-3.12",
            "go-1.21",
            "rust-1.75",
            "java-17",
            "java-21"
        ]
    
    async def create_vm(
        self,
        name: str,
        runtime: str,
        cpu: int = 1,
        memory_mb: int = 1024,
        region: str = "us-east-1",
        template: Optional[str] = None
    ) -> Dict:
        """Create a new microVM"""
        vm_id = str(uuid.uuid4())
        
        # Validate inputs
        if runtime not in self.runtimes:
            raise ValueError(f"Unsupported runtime: {runtime}")
        
        if region not in self.regions:
            raise ValueError(f"Unsupported region: {region}")
        
        if cpu < 1 or cpu > 8:
            raise ValueError("CPU must be between 1 and 8 cores")
        
        if memory_mb < 256 or memory_mb > 16384:
            raise ValueError("Memory must be between 256MB and 16GB")
        
        # Create VM record
        vm = {
            "id": vm_id,
            "name": name,
            "runtime": runtime,
            "cpu": cpu,
            "memory_mb": memory_mb,
            "region": region,
            "template": template,
            "status": VMStatus.CREATING,
            "dev_url": f"https://{name.lower().replace(' ', '-')}-{vm_id[:8]}.vibecaas.com",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "events": []
        }
        
        self.vms[vm_id] = vm
        
        # Simulate async creation process
        asyncio.create_task(self._simulate_vm_creation(vm_id))
        
        return {
            "id": vm_id,
            "status": VMStatus.CREATING,
            "dev_url": vm["dev_url"],
            "message": "VM creation initiated"
        }
    
    async def get_vm(self, vm_id: str) -> Dict:
        """Get VM details"""
        if vm_id not in self.vms:
            raise ValueError(f"VM not found: {vm_id}")
        
        return self.vms[vm_id]
    
    async def list_vms(self, region: Optional[str] = None) -> List[Dict]:
        """List all VMs, optionally filtered by region"""
        vms = list(self.vms.values())
        
        if region:
            vms = [vm for vm in vms if vm["region"] == region]
        
        return vms
    
    async def delete_vm(self, vm_id: str) -> Dict:
        """Delete a VM"""
        if vm_id not in self.vms:
            raise ValueError(f"VM not found: {vm_id}")
        
        vm = self.vms[vm_id]
        vm["status"] = VMStatus.TERMINATED
        vm["updated_at"] = datetime.utcnow().isoformat()
        
        # Simulate async deletion
        asyncio.create_task(self._simulate_vm_deletion(vm_id))
        
        return {
            "id": vm_id,
            "status": VMStatus.TERMINATED,
            "message": "VM deletion initiated"
        }
    
    async def start_vm(self, vm_id: str) -> Dict:
        """Start a stopped VM"""
        if vm_id not in self.vms:
            raise ValueError(f"VM not found: {vm_id}")
        
        vm = self.vms[vm_id]
        
        if vm["status"] not in [VMStatus.STOPPED, VMStatus.ERROR]:
            raise ValueError(f"Cannot start VM in status: {vm['status']}")
        
        vm["status"] = VMStatus.RUNNING
        vm["updated_at"] = datetime.utcnow().isoformat()
        
        return {
            "id": vm_id,
            "status": VMStatus.RUNNING,
            "message": "VM started successfully"
        }
    
    async def stop_vm(self, vm_id: str) -> Dict:
        """Stop a running VM"""
        if vm_id not in self.vms:
            raise ValueError(f"VM not found: {vm_id}")
        
        vm = self.vms[vm_id]
        
        if vm["status"] != VMStatus.RUNNING:
            raise ValueError(f"Cannot stop VM in status: {vm['status']}")
        
        vm["status"] = VMStatus.STOPPED
        vm["updated_at"] = datetime.utcnow().isoformat()
        
        return {
            "id": vm_id,
            "status": VMStatus.STOPPED,
            "message": "VM stopped successfully"
        }
    
    async def get_vm_logs(self, vm_id: str, lines: int = 100) -> Dict:
        """Get VM logs"""
        if vm_id not in self.vms:
            raise ValueError(f"VM not found: {vm_id}")
        
        # Generate mock logs
        logs = [
            f"[{datetime.utcnow().isoformat()}] VM {vm_id} started",
            f"[{datetime.utcnow().isoformat()}] Runtime: {self.vms[vm_id]['runtime']}",
            f"[{datetime.utcnow().isoformat()}] Resources: {self.vms[vm_id]['cpu']} CPU, {self.vms[vm_id]['memory_mb']}MB RAM",
            f"[{datetime.utcnow().isoformat()}] Dev URL: {self.vms[vm_id]['dev_url']}",
            f"[{datetime.utcnow().isoformat()}] Status: {self.vms[vm_id]['status']}",
        ]
        
        return {
            "vm_id": vm_id,
            "logs": logs[-lines:],
            "total_lines": len(logs)
        }
    
    async def get_vm_metrics(self, vm_id: str) -> Dict:
        """Get VM metrics"""
        if vm_id not in self.vms:
            raise ValueError(f"VM not found: {vm_id}")
        
        vm = self.vms[vm_id]
        
        # Generate mock metrics
        import random
        
        return {
            "vm_id": vm_id,
            "timestamp": datetime.utcnow().isoformat(),
            "cpu_usage_percent": random.uniform(10, 80),
            "memory_usage_mb": random.randint(100, vm["memory_mb"] - 100),
            "memory_usage_percent": random.uniform(20, 90),
            "network_in_bytes": random.randint(1000, 100000),
            "network_out_bytes": random.randint(1000, 100000),
            "disk_usage_mb": random.randint(500, 2000),
            "uptime_seconds": random.randint(60, 3600)
        }
    
    async def _simulate_vm_creation(self, vm_id: str):
        """Simulate the VM creation process"""
        await asyncio.sleep(2)  # Simulate creation time
        
        if vm_id in self.vms:
            vm = self.vms[vm_id]
            vm["status"] = VMStatus.RUNNING
            vm["updated_at"] = datetime.utcnow().isoformat()
            
            # Add creation event
            event = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "vm_created",
                "message": f"VM {vm['name']} created successfully",
                "status": VMStatus.RUNNING
            }
            vm["events"].append(event)
    
    async def _simulate_vm_deletion(self, vm_id: str):
        """Simulate the VM deletion process"""
        await asyncio.sleep(1)  # Simulate deletion time
        
        if vm_id in self.vms:
            # Add deletion event
            vm = self.vms[vm_id]
            event = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "vm_deleted",
                "message": f"VM {vm['name']} deleted successfully",
                "status": VMStatus.TERMINATED
            }
            vm["events"].append(event)
            
            # Remove from active VMs after a delay
            await asyncio.sleep(5)
            if vm_id in self.vms:
                del self.vms[vm_id]

# Global instance for testing
mock_vm_control = MockVMControl()
