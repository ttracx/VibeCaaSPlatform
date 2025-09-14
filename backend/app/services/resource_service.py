from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from ..models.user import User
from ..models.project import Project
from ..config import settings
import docker
import psutil
from datetime import datetime, timedelta

class ResourceService:
    def __init__(self, db: Session):
        self.db = db
        self.docker_client = docker.from_env()

    async def get_user_usage(self, user_id: int) -> Dict[str, Any]:
        """Get resource usage for a user"""
        # Get user's projects
        projects = self.db.query(Project).filter(
            Project.owner_id == user_id,
            Project.is_active == True
        ).all()
        
        total_cpu_usage = 0
        total_memory_usage = 0
        total_storage_usage = 0
        running_containers = 0
        
        for project in projects:
            try:
                container = self.docker_client.containers.get(f"vibecaas-{project.id}")
                if container.status == "running":
                    running_containers += 1
                    
                    # Get container stats
                    stats = container.stats(stream=False)
                    
                    # Calculate CPU usage
                    cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
                    system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
                    if system_delta > 0:
                        cpu_percent = (cpu_delta / system_delta) * len(stats['cpu_stats']['cpu_usage']['percpu_usage']) * 100.0
                        total_cpu_usage += cpu_percent
                    
                    # Calculate memory usage
                    memory_usage = stats['memory_stats']['usage']
                    total_memory_usage += memory_usage
                    
            except Exception as e:
                print(f"Error getting stats for project {project.id}: {e}")
        
        return {
            "user_id": user_id,
            "total_projects": len(projects),
            "running_containers": running_containers,
            "cpu_usage_percent": round(total_cpu_usage, 2),
            "memory_usage_bytes": total_memory_usage,
            "memory_usage_gb": round(total_memory_usage / (1024**3), 2),
            "storage_usage_bytes": total_storage_usage,
            "storage_usage_gb": round(total_storage_usage / (1024**3), 2),
            "last_updated": datetime.utcnow()
        }

    async def get_user_quotas(self, user_id: int) -> Dict[str, Any]:
        """Get resource quotas for a user"""
        # This would typically come from user's subscription tier
        # For now, return default quotas
        return {
            "user_id": user_id,
            "max_projects": 10,
            "max_cpu_cores": 4,
            "max_memory_gb": 8,
            "max_storage_gb": 50,
            "max_containers": 5,
            "gpu_enabled": False,
            "max_gpu_instances": 0
        }

    async def get_project_resources(self, project_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get resource usage for a specific project"""
        project = self.db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == user_id,
            Project.is_active == True
        ).first()
        
        if not project:
            return None
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{project_id}")
            stats = container.stats(stream=False)
            
            # Calculate CPU usage
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
            cpu_percent = 0
            if system_delta > 0:
                cpu_percent = (cpu_delta / system_delta) * len(stats['cpu_stats']['cpu_usage']['percpu_usage']) * 100.0
            
            # Calculate memory usage
            memory_usage = stats['memory_stats']['usage']
            memory_limit = stats['memory_stats']['limit']
            memory_percent = (memory_usage / memory_limit) * 100.0 if memory_limit > 0 else 0
            
            return {
                "project_id": project_id,
                "container_id": container.id,
                "status": container.status,
                "cpu_usage_percent": round(cpu_percent, 2),
                "memory_usage_bytes": memory_usage,
                "memory_limit_bytes": memory_limit,
                "memory_usage_percent": round(memory_percent, 2),
                "uptime_seconds": stats.get('uptime', 0),
                "last_updated": datetime.utcnow()
            }
        except Exception as e:
            print(f"Error getting resources for project {project_id}: {e}")
            return None

    async def scale_project_resources(
        self, 
        project_id: int, 
        user_id: int, 
        cpu_limit: Optional[str] = None,
        memory_limit: Optional[str] = None
    ) -> bool:
        """Scale resources for a project"""
        project = self.db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == user_id,
            Project.is_active == True
        ).first()
        
        if not project:
            return False
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{project_id}")
            
            # Update container limits
            if cpu_limit or memory_limit:
                container.update(
                    cpu_quota=int(cpu_limit) * 100000 if cpu_limit else None,
                    mem_limit=memory_limit if memory_limit else None
                )
            
            # Update project configuration
            if cpu_limit:
                project.cpu_limit = cpu_limit
            if memory_limit:
                project.memory_limit = memory_limit
                
            self.db.commit()
            return True
            
        except Exception as e:
            print(f"Error scaling resources for project {project_id}: {e}")
            return False

    async def get_gpu_availability(self) -> Dict[str, Any]:
        """Get GPU availability"""
        # This would check actual GPU availability
        # For now, return mock data
        return {
            "available_gpus": 4,
            "total_gpus": 8,
            "gpu_types": [
                {"type": "nvidia-tesla-t4", "available": 2, "price_per_hour": 0.5},
                {"type": "nvidia-tesla-v100", "available": 1, "price_per_hour": 2.0},
                {"type": "nvidia-tesla-a100", "available": 1, "price_per_hour": 3.0}
            ],
            "last_updated": datetime.utcnow()
        }

    async def request_gpu(self, project_id: int, gpu_type: str, user_id: int) -> bool:
        """Request GPU resources for a project"""
        project = self.db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == user_id,
            Project.is_active == True
        ).first()
        
        if not project:
            return False
            
        # Check if GPU is available
        availability = await self.get_gpu_availability()
        gpu_available = any(
            gpu["type"] == gpu_type and gpu["available"] > 0 
            for gpu in availability["gpu_types"]
        )
        
        if not gpu_available:
            return False
            
        try:
            # Update project to use GPU
            project.gpu_enabled = True
            project.gpu_type = gpu_type
            self.db.commit()
            
            # Restart container with GPU support
            container = self.docker_client.containers.get(f"vibecaas-{project_id}")
            container.restart()
            
            return True
            
        except Exception as e:
            print(f"Error requesting GPU for project {project_id}: {e}")
            return False

    async def get_system_resources(self) -> Dict[str, Any]:
        """Get overall system resource usage"""
        # Get system CPU and memory usage
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Get Docker container count
        containers = self.docker_client.containers.list()
        running_containers = len([c for c in containers if c.status == "running"])
        
        return {
            "system_cpu_percent": cpu_percent,
            "system_memory_percent": memory.percent,
            "system_memory_available_gb": round(memory.available / (1024**3), 2),
            "system_disk_percent": disk.percent,
            "system_disk_available_gb": round(disk.free / (1024**3), 2),
            "total_containers": len(containers),
            "running_containers": running_containers,
            "last_updated": datetime.utcnow()
        }