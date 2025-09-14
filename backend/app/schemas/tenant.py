from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class TenantBase(BaseModel):
    name: str
    description: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = "starter"

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None
    subscription_tier: Optional[str] = None

class TenantResponse(TenantBase):
    id: int
    owner_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TenantUserCreate(BaseModel):
    user_id: int
    role: Optional[str] = "member"

class TenantUserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    joined_at: datetime
    is_owner: bool

class TenantStatsResponse(BaseModel):
    tenant_id: int
    name: str
    user_count: int
    project_count: int
    subscription_tier: str
    created_at: datetime
    last_activity: Optional[datetime] = None