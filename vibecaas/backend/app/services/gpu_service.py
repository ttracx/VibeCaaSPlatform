"""
GPU resource management and scheduling service
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from kubernetes import client, config as k8s_config
from sqlalchemy.orm import Session
import json

from app.core.config import settings
from app.models.gpu import GPUNode, GPUAllocation, GPUType
from app.models.user import User, UserTier
from app.models.application import Application

class GPUService:
    """Service for managing GPU resources and allocations"""
    
    # GPU specifications
    GPU_SPECS = {
        GPUType.T4: {
            "memory": 16,  # GB
            "compute_capability": 7.5,
            "tensor_cores": 320,
            "cuda_cores": 2560,
            "fp32_tflops": 8.1,
            "cost_per_hour": 0.526
        },
        GPUType.V100: {
            "memory": 32,  # GB
            "compute_capability": 7.0,
            "tensor_cores": 640,
            "cuda_cores": 5120,
            "fp32_tflops": 15.7,
            "cost_per_hour": 2.48
        },
        GPUType.A100: {
            "memory": 40,  # GB
            "compute_capability": 8.0,
            "tensor_cores": 432,
            "cuda_cores": 6912,
            "fp32_tflops": 19.5,
            "cost_per_hour": 3.06
        },
        GPUType.H100: {
            "memory": 80,  # GB
            "compute_capability": 9.0,
            "tensor_cores": 528,
            "cuda_cores": 14592,
            "fp32_tflops": 51.0,
            "cost_per_hour": 4.95
        }
    }
    
    # Tier GPU access
    TIER_GPU_ACCESS = {
        UserTier.FREE: [],
        UserTier.HOBBY: [GPUType.T4],  # Shared, time-sliced
        UserTier.PRO: [GPUType.T4, GPUType.V100],
        UserTier.TEAM: [GPUType.T4, GPUType.V100, GPUType.A100],
        UserTier.ENTERPRISE: [GPUType.T4, GPUType.V100, GPUType.A100, GPUType.H100]
    }
    
    def __init__(self, db: Session):
        self.db = db
        self._init_k8s()
    
    def _init_k8s(self):
        """Initialize Kubernetes client"""
        if settings.K8S_IN_CLUSTER:
            k8s_config.load_incluster_config()
        else:
            k8s_config.load_kube_config()
        
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
    
    def discover_gpu_nodes(self) -> List[Dict]:
        """Discover GPU nodes in the cluster"""
        nodes = self.v1.list_node()
        gpu_nodes = []
        
        for node in nodes.items:
            # Check for NVIDIA GPU resources
            if "nvidia.com/gpu" in node.status.allocatable:
                gpu_count = int(node.status.allocatable["nvidia.com/gpu"])
                
                # Get GPU type from node labels
                gpu_type = node.metadata.labels.get("gpu-type", "T4")
                
                gpu_nodes.append({
                    "name": node.metadata.name,
                    "gpu_type": gpu_type,
                    "gpu_count": gpu_count,
                    "allocatable": node.status.allocatable,
                    "capacity": node.status.capacity,
                    "labels": node.metadata.labels,
                    "taints": node.spec.taints or []
                })
                
                # Update database
                self._update_gpu_node(node.metadata.name, gpu_type, gpu_count)
        
        return gpu_nodes
    
    def _update_gpu_node(self, node_name: str, gpu_type: str, gpu_count: int):
        """Update GPU node in database"""
        node = self.db.query(GPUNode).filter(GPUNode.node_name == node_name).first()
        
        if not node:
            node = GPUNode(
                node_name=node_name,
                gpu_type=gpu_type,
                total_gpus=gpu_count,
                available_gpus=gpu_count,
                status="active"
            )
            self.db.add(node)
        else:
            node.gpu_type = gpu_type
            node.total_gpus = gpu_count
            node.status = "active"
            node.last_updated = datetime.utcnow()
        
        self.db.commit()
    
    def allocate_gpu(self, app: Application, user: User) -> Optional[GPUAllocation]:
        """Allocate GPU for an application"""
        # Check user tier GPU access
        allowed_gpus = self.TIER_GPU_ACCESS.get(user.tier, [])
        if not allowed_gpus:
            raise Exception("GPU access not available for your tier")
        
        # Parse requested GPU type
        requested_type = app.gpu_type or "T4"
        if requested_type not in [gpu.value for gpu in allowed_gpus]:
            raise Exception(f"GPU type {requested_type} not available for your tier")
        
        # Find available GPU node
        gpu_node = self._find_available_gpu(requested_type)
        if not gpu_node:
            raise Exception(f"No {requested_type} GPU available")
        
        # Create allocation
        allocation = GPUAllocation(
            application_id=app.id,
            user_id=user.id,
            gpu_node_id=gpu_node.id,
            gpu_type=requested_type,
            gpu_count=1,  # Default to 1 GPU per app
            status="allocated",
            allocated_at=datetime.utcnow()
        )
        
        # Handle time-slicing for hobby tier
        if user.tier == UserTier.HOBBY:
            allocation.time_slice_enabled = True
            allocation.time_slice_duration = 3600  # 1 hour slots
            allocation.expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Update node availability
        gpu_node.available_gpus -= 1
        gpu_node.allocated_gpus += 1
        
        self.db.add(allocation)
        self.db.commit()
        
        # Apply Kubernetes configuration
        self._apply_gpu_config(app, allocation)
        
        return allocation
    
    def _find_available_gpu(self, gpu_type: str) -> Optional[GPUNode]:
        """Find available GPU node of specified type"""
        return self.db.query(GPUNode).filter(
            GPUNode.gpu_type == gpu_type,
            GPUNode.status == "active",
            GPUNode.available_gpus > 0
        ).first()
    
    def _apply_gpu_config(self, app: Application, allocation: GPUAllocation):
        """Apply GPU configuration to Kubernetes deployment"""
        try:
            # Get deployment
            deployment = self.apps_v1.read_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace
            )
            
            # Update container resources
            for container in deployment.spec.template.spec.containers:
                if container.name == app.name:
                    if not container.resources.limits:
                        container.resources.limits = {}
                    
                    # Add GPU resource limit
                    container.resources.limits["nvidia.com/gpu"] = str(allocation.gpu_count)
                    
                    # Add environment variables for GPU
                    if not container.env:
                        container.env = []
                    
                    container.env.extend([
                        client.V1EnvVar(name="NVIDIA_VISIBLE_DEVICES", value="all"),
                        client.V1EnvVar(name="NVIDIA_DRIVER_CAPABILITIES", value="compute,utility"),
                        client.V1EnvVar(name="CUDA_VISIBLE_DEVICES", value="0")
                    ])
            
            # Add node selector for GPU node
            if not deployment.spec.template.spec.node_selector:
                deployment.spec.template.spec.node_selector = {}
            
            deployment.spec.template.spec.node_selector["gpu-type"] = allocation.gpu_type
            
            # Add toleration for GPU nodes
            if not deployment.spec.template.spec.tolerations:
                deployment.spec.template.spec.tolerations = []
            
            deployment.spec.template.spec.tolerations.append(
                client.V1Toleration(
                    key="nvidia.com/gpu",
                    operator="Exists",
                    effect="NoSchedule"
                )
            )
            
            # Apply time-slicing if enabled
            if allocation.time_slice_enabled:
                self._apply_time_slicing(deployment, allocation)
            
            # Update deployment
            self.apps_v1.patch_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace,
                body=deployment
            )
            
        except Exception as e:
            print(f"Failed to apply GPU configuration: {e}")
            raise
    
    def _apply_time_slicing(self, deployment, allocation: GPUAllocation):
        """Apply GPU time-slicing configuration"""
        # Add annotations for NVIDIA GPU time-slicing
        if not deployment.spec.template.metadata.annotations:
            deployment.spec.template.metadata.annotations = {}
        
        deployment.spec.template.metadata.annotations.update({
            "nvidia.com/gpu-time-slicing": "true",
            "nvidia.com/gpu-time-slice-duration": str(allocation.time_slice_duration),
            "nvidia.com/gpu-time-slice-replicas": "4"  # Share GPU among 4 containers
        })
    
    def release_gpu(self, allocation_id: str) -> bool:
        """Release GPU allocation"""
        allocation = self.db.query(GPUAllocation).filter(
            GPUAllocation.id == allocation_id
        ).first()
        
        if not allocation:
            return False
        
        # Update allocation status
        allocation.status = "released"
        allocation.released_at = datetime.utcnow()
        
        # Update node availability
        gpu_node = allocation.gpu_node
        gpu_node.available_gpus += 1
        gpu_node.allocated_gpus -= 1
        
        self.db.commit()
        
        # Remove GPU from Kubernetes deployment
        self._remove_gpu_config(allocation.application)
        
        return True
    
    def _remove_gpu_config(self, app: Application):
        """Remove GPU configuration from Kubernetes deployment"""
        try:
            deployment = self.apps_v1.read_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace
            )
            
            # Remove GPU resource limit
            for container in deployment.spec.template.spec.containers:
                if container.name == app.name:
                    if container.resources.limits and "nvidia.com/gpu" in container.resources.limits:
                        del container.resources.limits["nvidia.com/gpu"]
            
            # Remove GPU node selector
            if deployment.spec.template.spec.node_selector and "gpu-type" in deployment.spec.template.spec.node_selector:
                del deployment.spec.template.spec.node_selector["gpu-type"]
            
            # Update deployment
            self.apps_v1.patch_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace,
                body=deployment
            )
            
        except Exception as e:
            print(f"Failed to remove GPU configuration: {e}")
    
    def get_gpu_usage(self, user: User) -> Dict:
        """Get GPU usage statistics for user"""
        allocations = self.db.query(GPUAllocation).filter(
            GPUAllocation.user_id == user.id,
            GPUAllocation.status == "allocated"
        ).all()
        
        usage = {
            "active_allocations": len(allocations),
            "gpu_hours_used": 0,
            "estimated_cost": 0,
            "allocations": []
        }
        
        for allocation in allocations:
            duration = (datetime.utcnow() - allocation.allocated_at).total_seconds() / 3600
            cost = duration * self.GPU_SPECS[allocation.gpu_type]["cost_per_hour"]
            
            usage["gpu_hours_used"] += duration
            usage["estimated_cost"] += cost
            usage["allocations"].append({
                "id": allocation.id,
                "application_id": allocation.application_id,
                "gpu_type": allocation.gpu_type,
                "allocated_at": allocation.allocated_at.isoformat(),
                "duration_hours": round(duration, 2),
                "cost": round(cost, 2),
                "time_slice": allocation.time_slice_enabled,
                "expires_at": allocation.expires_at.isoformat() if allocation.expires_at else None
            })
        
        usage["gpu_hours_used"] = round(usage["gpu_hours_used"], 2)
        usage["estimated_cost"] = round(usage["estimated_cost"], 2)
        
        return usage
    
    def get_gpu_availability(self) -> Dict:
        """Get current GPU availability across the cluster"""
        nodes = self.db.query(GPUNode).filter(GPUNode.status == "active").all()
        
        availability = {
            "total_gpus": sum(node.total_gpus for node in nodes),
            "available_gpus": sum(node.available_gpus for node in nodes),
            "allocated_gpus": sum(node.allocated_gpus for node in nodes),
            "by_type": {}
        }
        
        for gpu_type in GPUType:
            type_nodes = [n for n in nodes if n.gpu_type == gpu_type.value]
            availability["by_type"][gpu_type.value] = {
                "total": sum(n.total_gpus for n in type_nodes),
                "available": sum(n.available_gpus for n in type_nodes),
                "allocated": sum(n.allocated_gpus for n in type_nodes),
                "nodes": len(type_nodes)
            }
        
        return availability
    
    def schedule_gpu_maintenance(self, node_name: str, maintenance_window: Tuple[datetime, datetime]) -> bool:
        """Schedule GPU node maintenance"""
        node = self.db.query(GPUNode).filter(GPUNode.node_name == node_name).first()
        
        if not node:
            return False
        
        start_time, end_time = maintenance_window
        
        # Mark node for maintenance
        node.status = "maintenance_scheduled"
        node.maintenance_start = start_time
        node.maintenance_end = end_time
        
        # Migrate workloads if maintenance is immediate
        if start_time <= datetime.utcnow():
            self._migrate_gpu_workloads(node)
            node.status = "maintenance"
        
        self.db.commit()
        return True
    
    def _migrate_gpu_workloads(self, node: GPUNode):
        """Migrate GPU workloads from a node"""
        # Get active allocations on this node
        allocations = self.db.query(GPUAllocation).filter(
            GPUAllocation.gpu_node_id == node.id,
            GPUAllocation.status == "allocated"
        ).all()
        
        for allocation in allocations:
            # Find alternative GPU node
            alternative = self._find_available_gpu(allocation.gpu_type)
            
            if alternative and alternative.id != node.id:
                # Update allocation to new node
                allocation.gpu_node_id = alternative.id
                alternative.available_gpus -= 1
                alternative.allocated_gpus += 1
                
                # Trigger pod migration in Kubernetes
                app = allocation.application
                self._trigger_pod_migration(app, alternative.node_name)
        
        self.db.commit()
    
    def _trigger_pod_migration(self, app: Application, target_node: str):
        """Trigger pod migration to a different node"""
        try:
            # Add node affinity to force scheduling on target node
            deployment = self.apps_v1.read_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace
            )
            
            if not deployment.spec.template.spec.affinity:
                deployment.spec.template.spec.affinity = client.V1Affinity()
            
            deployment.spec.template.spec.affinity.node_affinity = client.V1NodeAffinity(
                required_during_scheduling_ignored_during_execution=client.V1NodeSelector(
                    node_selector_terms=[
                        client.V1NodeSelectorTerm(
                            match_expressions=[
                                client.V1NodeSelectorRequirement(
                                    key="kubernetes.io/hostname",
                                    operator="In",
                                    values=[target_node]
                                )
                            ]
                        )
                    ]
                )
            )
            
            # Update deployment to trigger pod recreation
            self.apps_v1.patch_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace,
                body=deployment
            )
            
        except Exception as e:
            print(f"Failed to migrate pod: {e}")