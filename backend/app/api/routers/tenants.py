from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...models.tenant import Tenant, TenantUser
from ...schemas.tenant import TenantCreate, TenantUpdate, TenantResponse, TenantUserCreate
from ...services.tenant_service import TenantService

router = APIRouter()

@router.get("/tenants", response_model=List[TenantResponse])
async def list_tenants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List tenants for the current user"""
    tenant_service = TenantService(db)
    tenants = await tenant_service.get_user_tenants(current_user.id)
    return tenants

@router.post("/tenants", response_model=TenantResponse)
async def create_tenant(
    tenant: TenantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new tenant"""
    tenant_service = TenantService(db)
    return await tenant_service.create_tenant(tenant, current_user.id)

@router.get("/tenants/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific tenant"""
    tenant_service = TenantService(db)
    tenant = await tenant_service.get_tenant(tenant_id, current_user.id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.put("/tenants/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    tenant: TenantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a tenant"""
    tenant_service = TenantService(db)
    updated_tenant = await tenant_service.update_tenant(tenant_id, tenant, current_user.id)
    if not updated_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return updated_tenant

@router.delete("/tenants/{tenant_id}")
async def delete_tenant(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a tenant"""
    tenant_service = TenantService(db)
    success = await tenant_service.delete_tenant(tenant_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted successfully"}

@router.post("/tenants/{tenant_id}/users")
async def add_tenant_user(
    tenant_id: int,
    user_data: TenantUserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a user to a tenant"""
    tenant_service = TenantService(db)
    success = await tenant_service.add_tenant_user(tenant_id, user_data, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "User added to tenant successfully"}

@router.delete("/tenants/{tenant_id}/users/{user_id}")
async def remove_tenant_user(
    tenant_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a user from a tenant"""
    tenant_service = TenantService(db)
    success = await tenant_service.remove_tenant_user(tenant_id, user_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant or user not found")
    return {"message": "User removed from tenant successfully"}

@router.get("/tenants/{tenant_id}/users")
async def list_tenant_users(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List users in a tenant"""
    tenant_service = TenantService(db)
    users = await tenant_service.get_tenant_users(tenant_id, current_user.id)
    if users is None:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return users

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass
