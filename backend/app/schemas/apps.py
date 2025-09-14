from __future__ import annotations

from typing import Optional
from pydantic import BaseModel

from ..models.app import AppStatus


class AppCreateRequest(BaseModel):
    name: str
    framework: str
    gpu_enabled: Optional[bool] = False
    cpu_limit: Optional[int] = 1
    memory_limit: Optional[int] = 512


class AppOut(BaseModel):
    id: str
    user_id: str
    name: str
    subdomain: Optional[str] = None
    framework: str
    status: AppStatus
    container_id: Optional[str] = None
    url: Optional[str] = None
    gpu_enabled: bool
    cpu_limit: int
    memory_limit: int

    class Config:
        from_attributes = True


class AppActionRequest(BaseModel):
    action: str

