from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class MicroVMStatus(str, Enum):
    CREATING = "creating"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"
    DESTROYING = "destroying"
    DESTROYED = "destroyed"

class MicroVMRuntime(str, Enum):
    NODE = "node"
    PYTHON = "python"
    GO = "go"
    RUST = "rust"
    JAVA = "java"
    DOTNET = "dotnet"

class MicroVMCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    runtime: MicroVMRuntime
    region: str = Field(default="us-east-1", max_length=50)
    cpu_cores: int = Field(default=2, ge=1, le=16)
    memory_mb: int = Field(default=2048, ge=512, le=32768)
    storage_gb: int = Field(default=10, ge=1, le=1000)
    repo_url: Optional[str] = None
    branch: str = Field(default="main", max_length=100)
    build_command: Optional[str] = None
    start_command: Optional[str] = None
    environment_variables: Optional[Dict[str, str]] = None
    gpu_enabled: bool = False
    auto_scale: bool = False

    @validator('repo_url')
    def validate_repo_url(cls, v):
        if v and not v.startswith(('http://', 'https://', 'git@')):
            raise ValueError('Repository URL must be a valid HTTP/HTTPS URL or SSH URL')
        return v

    @validator('memory_mb')
    def validate_memory_mb(cls, v):
        if v % 512 != 0:
            raise ValueError('Memory must be a multiple of 512 MB')
        return v

class MicroVMUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    cpu_cores: Optional[int] = Field(None, ge=1, le=16)
    memory_mb: Optional[int] = Field(None, ge=512, le=32768)
    storage_gb: Optional[int] = Field(None, ge=1, le=1000)
    environment_variables: Optional[Dict[str, str]] = None
    auto_scale: Optional[bool] = None

class MicroVMResponse(BaseModel):
    id: int
    vm_id: str
    name: str
    description: Optional[str]
    owner_id: int
    tenant_id: int
    runtime: MicroVMRuntime
    region: str
    cpu_cores: int
    memory_mb: int
    storage_gb: int
    status: MicroVMStatus
    dev_url: Optional[str]
    internal_ip: Optional[str]
    external_ip: Optional[str]
    repo_url: Optional[str]
    branch: str
    build_command: Optional[str]
    start_command: Optional[str]
    environment_variables: Optional[Dict[str, str]]
    vm_control_id: Optional[str]
    vm_control_region: Optional[str]
    vm_control_status: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    started_at: Optional[datetime]
    stopped_at: Optional[datetime]
    cpu_usage_percent: int
    memory_usage_mb: int
    storage_usage_gb: int
    is_active: bool
    auto_scale: bool
    gpu_enabled: bool

    class Config:
        from_attributes = True

class MicroVMEventResponse(BaseModel):
    id: int
    microvm_id: int
    event_type: str
    message: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class MicroVMQuotaResponse(BaseModel):
    id: int
    tenant_id: int
    max_microvms: int
    max_cpu_cores: int
    max_memory_gb: int
    max_storage_gb: int
    current_microvms: int
    current_cpu_cores: int
    current_memory_gb: int
    current_storage_gb: int
    gpu_enabled: bool
    auto_scale_enabled: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class MicroVMCreateResponse(BaseModel):
    id: int
    vm_id: str
    status: MicroVMStatus
    dev_url: Optional[str]
    message: str

class MicroVMStatusResponse(BaseModel):
    id: int
    vm_id: str
    status: MicroVMStatus
    vm_control_status: Optional[str]
    dev_url: Optional[str]
    internal_ip: Optional[str]
    external_ip: Optional[str]
    cpu_usage_percent: int
    memory_usage_mb: int
    storage_usage_gb: int
    created_at: datetime
    updated_at: Optional[datetime]

class MicroVMListResponse(BaseModel):
    microvms: List[MicroVMResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class MicroVMRuntimeTemplate(BaseModel):
    runtime: MicroVMRuntime
    name: str
    description: str
    default_cpu_cores: int
    default_memory_mb: int
    default_storage_gb: int
    default_build_command: Optional[str]
    default_start_command: str
    icon: str
    color: str

class MicroVMRegion(BaseModel):
    id: str
    name: str
    available: bool
    latency_ms: Optional[int] = None