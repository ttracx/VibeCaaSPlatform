from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...schemas.resources import ResourceUsageResponse, ResourceQuotaResponse
from ...services.resource_service import ResourceService

router = APIRouter()

@router.get("/resources/usage", response_model=ResourceUsageResponse)
async def get_resource_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current resource usage for the user"""
    resource_service = ResourceService(db)
    usage = await resource_service.get_user_usage(current_user.id)
    return usage

@router.get("/resources/quotas", response_model=ResourceQuotaResponse)
async def get_resource_quotas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get resource quotas for the user"""
    resource_service = ResourceService(db)
    quotas = await resource_service.get_user_quotas(current_user.id)
    return quotas

@router.get("/resources/projects")
async def get_project_resources(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get resource usage for a specific project"""
    resource_service = ResourceService(db)
    resources = await resource_service.get_project_resources(project_id, current_user.id)
    if not resources:
        raise HTTPException(status_code=404, detail="Project not found")
    return resources

@router.post("/resources/scale")
async def scale_resources(
    project_id: int,
    cpu_limit: Optional[str] = None,
    memory_limit: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scale resources for a project"""
    resource_service = ResourceService(db)
    success = await resource_service.scale_project_resources(
        project_id, current_user.id, cpu_limit, memory_limit
    )
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Resources scaled successfully"}

@router.get("/resources/gpu/availability")
async def get_gpu_availability(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get GPU availability"""
    resource_service = ResourceService(db)
    availability = await resource_service.get_gpu_availability()
    return availability

@router.post("/resources/gpu/request")
async def request_gpu(
    project_id: int,
    gpu_type: str = "nvidia-tesla-t4",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request GPU resources for a project"""
    resource_service = ResourceService(db)
    success = await resource_service.request_gpu(project_id, gpu_type, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found or GPU not available")
    return {"message": "GPU requested successfully"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass