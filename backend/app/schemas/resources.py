from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResourceUsageResponse(BaseModel):
    user_id: int
    total_projects: int
    running_containers: int
    cpu_usage_percent: float
    memory_usage_bytes: int
    memory_usage_gb: float
    storage_usage_bytes: int
    storage_usage_gb: float
    last_updated: datetime

class ResourceQuotaResponse(BaseModel):
    user_id: int
    max_projects: int
    max_cpu_cores: int
    max_memory_gb: int
    max_storage_gb: int
    max_containers: int
    gpu_enabled: bool
    max_gpu_instances: int

class ProjectResourceResponse(BaseModel):
    project_id: int
    container_id: Optional[str] = None
    status: str
    cpu_usage_percent: float
    memory_usage_bytes: int
    memory_limit_bytes: int
    memory_usage_percent: float
    uptime_seconds: int
    last_updated: datetime

class GPUAvailabilityResponse(BaseModel):
    available_gpus: int
    total_gpus: int
    gpu_types: List[Dict[str, Any]]
    last_updated: datetime

class SystemResourceResponse(BaseModel):
    system_cpu_percent: float
    system_memory_percent: float
    system_memory_available_gb: float
    system_disk_percent: float
    system_disk_available_gb: float
    total_containers: int
    running_containers: int
    last_updated: datetime