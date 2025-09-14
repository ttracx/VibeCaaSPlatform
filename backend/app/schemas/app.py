from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class AppBase(BaseModel):
    name: str
    description: Optional[str] = None
    framework: Optional[str] = None
    runtime: Optional[str] = None
    language: Optional[str] = None

class AppCreate(AppBase):
    tenant_id: Optional[int] = None

class AppUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    framework: Optional[str] = None
    runtime: Optional[str] = None
    language: Optional[str] = None
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    container_config: Optional[Dict[str, Any]] = None
    environment_variables: Optional[Dict[str, str]] = None

class AppResponse(AppBase):
    id: int
    owner_id: int
    tenant_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    subdomain: Optional[str] = None
    custom_domain: Optional[str] = None
    status: str
    container_image: Optional[str] = None
    container_config: Optional[Dict[str, Any]] = None
    environment_variables: Optional[Dict[str, str]] = None
    cpu_limit: str
    memory_limit: str
    storage_limit: str

    class Config:
        from_attributes = True
