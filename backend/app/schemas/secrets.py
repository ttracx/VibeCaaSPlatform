from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SecretBase(BaseModel):
    name: str
    description: Optional[str] = None
    secret_type: str
    tags: Optional[List[str]] = None
    expires_at: Optional[datetime] = None
    is_shared: bool = False
    shared_with_tenants: Optional[List[int]] = None

class SecretCreate(SecretBase):
    value: str
    project_id: Optional[int] = None
    tenant_id: Optional[int] = None

class SecretUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    value: Optional[str] = None
    tags: Optional[List[str]] = None
    expires_at: Optional[datetime] = None
    is_shared: Optional[bool] = None
    shared_with_tenants: Optional[List[int]] = None

class SecretResponse(SecretBase):
    id: int
    user_id: int
    project_id: Optional[int] = None
    tenant_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_accessed_at: Optional[datetime] = None
    access_count: int

    class Config:
        from_attributes = True

class SecretAccessResponse(BaseModel):
    value: str

class SecretShareRequest(BaseModel):
    tenant_ids: List[int]

class SecretTypeResponse(BaseModel):
    id: str
    name: str
    description: str
