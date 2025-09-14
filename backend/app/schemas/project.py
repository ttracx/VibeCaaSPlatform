from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    framework: Optional[str] = None
    runtime: Optional[str] = None
    language: Optional[str] = None

class ProjectCreate(ProjectBase):
    tenant_id: Optional[int] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    framework: Optional[str] = None
    runtime: Optional[str] = None
    language: Optional[str] = None
    container_config: Optional[Dict[str, Any]] = None

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    tenant_id: int
    project_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    status: str
    container_id: Optional[str] = None
    container_image: Optional[str] = None
    container_config: Optional[Dict[str, Any]] = None
    preview_url: Optional[str] = None

    class Config:
        from_attributes = True

class ProjectStatusResponse(BaseModel):
    project_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    container_status: Optional[str] = None
    container_id: Optional[str] = None
    preview_url: Optional[str] = None
    uptime: Optional[str] = None
