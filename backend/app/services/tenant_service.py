from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.tenant import Tenant, TenantUser
from ..models.user import User
from ..schemas.tenant import TenantCreate, TenantUpdate, TenantUserCreate
from datetime import datetime

class TenantService:
    def __init__(self, db: Session):
        self.db = db

    async def get_user_tenants(self, user_id: int) -> List[Tenant]:
        """Get all tenants for a user"""
        return self.db.query(Tenant).join(TenantUser).filter(
            TenantUser.user_id == user_id,
            Tenant.is_active == True
        ).all()

    async def create_tenant(self, tenant_data: TenantCreate, owner_id: int) -> Tenant:
        """Create a new tenant"""
        tenant = Tenant(
            name=tenant_data.name,
            description=tenant_data.description,
            owner_id=owner_id,
            settings=tenant_data.settings or {},
            subscription_tier=tenant_data.subscription_tier or "starter",
            is_active=True
        )
        
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        
        # Add owner as admin user
        tenant_user = TenantUser(
            tenant_id=tenant.id,
            user_id=owner_id,
            role="admin",
            is_active=True
        )
        self.db.add(tenant_user)
        self.db.commit()
        
        return tenant

    async def get_tenant(self, tenant_id: int, user_id: int) -> Optional[Tenant]:
        """Get a specific tenant"""
        return self.db.query(Tenant).join(TenantUser).filter(
            Tenant.id == tenant_id,
            TenantUser.user_id == user_id,
            Tenant.is_active == True
        ).first()

    async def update_tenant(
        self, 
        tenant_id: int, 
        tenant_data: TenantUpdate, 
        user_id: int
    ) -> Optional[Tenant]:
        """Update a tenant"""
        tenant = await self.get_tenant(tenant_id, user_id)
        if not tenant:
            return None
            
        # Check if user has admin role
        tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == user_id,
            TenantUser.role == "admin"
        ).first()
        
        if not tenant_user:
            return None
            
        for field, value in tenant_data.dict(exclude_unset=True).items():
            setattr(tenant, field, value)
            
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    async def delete_tenant(self, tenant_id: int, user_id: int) -> bool:
        """Delete a tenant"""
        tenant = await self.get_tenant(tenant_id, user_id)
        if not tenant:
            return False
            
        # Check if user is owner
        if tenant.owner_id != user_id:
            return False
            
        # Soft delete
        tenant.is_active = False
        self.db.commit()
        return True

    async def add_tenant_user(
        self, 
        tenant_id: int, 
        user_data: TenantUserCreate, 
        admin_user_id: int
    ) -> bool:
        """Add a user to a tenant"""
        # Check if admin user has permission
        admin_tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == admin_user_id,
            TenantUser.role == "admin"
        ).first()
        
        if not admin_tenant_user:
            return False
            
        # Check if user exists
        user = self.db.query(User).filter(User.id == user_data.user_id).first()
        if not user:
            return False
            
        # Check if user is already in tenant
        existing = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == user_data.user_id
        ).first()
        
        if existing:
            return False
            
        # Add user to tenant
        tenant_user = TenantUser(
            tenant_id=tenant_id,
            user_id=user_data.user_id,
            role=user_data.role or "member",
            is_active=True
        )
        
        self.db.add(tenant_user)
        self.db.commit()
        return True

    async def remove_tenant_user(
        self, 
        tenant_id: int, 
        user_id: int, 
        admin_user_id: int
    ) -> bool:
        """Remove a user from a tenant"""
        # Check if admin user has permission
        admin_tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == admin_user_id,
            TenantUser.role == "admin"
        ).first()
        
        if not admin_tenant_user:
            return False
            
        # Find tenant user to remove
        tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == user_id
        ).first()
        
        if not tenant_user:
            return False
            
        # Don't allow removing the owner
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if tenant and tenant.owner_id == user_id:
            return False
            
        # Remove user
        tenant_user.is_active = False
        self.db.commit()
        return True

    async def get_tenant_users(self, tenant_id: int, user_id: int) -> Optional[List[dict]]:
        """Get users in a tenant"""
        # Check if user has access to tenant
        tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == user_id,
            TenantUser.is_active == True
        ).first()
        
        if not tenant_user:
            return None
            
        # Get all users in tenant
        tenant_users = self.db.query(TenantUser, User).join(User).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.is_active == True
        ).all()
        
        return [
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": tenant_user.role,
                "joined_at": tenant_user.created_at,
                "is_owner": tenant.owner_id == user.id if (tenant := self.db.query(Tenant).filter(Tenant.id == tenant_id).first()) else False
            }
            for tenant_user, user in tenant_users
        ]

    async def update_tenant_user_role(
        self, 
        tenant_id: int, 
        target_user_id: int, 
        new_role: str, 
        admin_user_id: int
    ) -> bool:
        """Update a user's role in a tenant"""
        # Check if admin user has permission
        admin_tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == admin_user_id,
            TenantUser.role == "admin"
        ).first()
        
        if not admin_tenant_user:
            return False
            
        # Find target user
        tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == target_user_id
        ).first()
        
        if not tenant_user:
            return False
            
        # Don't allow changing owner role
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if tenant and tenant.owner_id == target_user_id:
            return False
            
        # Update role
        tenant_user.role = new_role
        self.db.commit()
        return True

    async def get_tenant_stats(self, tenant_id: int, user_id: int) -> Optional[dict]:
        """Get tenant statistics"""
        # Check if user has access to tenant
        tenant_user = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.user_id == user_id,
            TenantUser.is_active == True
        ).first()
        
        if not tenant_user:
            return None
            
        # Get tenant info
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return None
            
        # Get user count
        user_count = self.db.query(TenantUser).filter(
            TenantUser.tenant_id == tenant_id,
            TenantUser.is_active == True
        ).count()
        
        # Get project count (this would need to be implemented)
        # project_count = self.db.query(Project).filter(
        #     Project.tenant_id == tenant_id,
        #     Project.is_active == True
        # ).count()
        
        return {
            "tenant_id": tenant_id,
            "name": tenant.name,
            "user_count": user_count,
            "project_count": 0,  # Would be calculated from projects
            "subscription_tier": tenant.subscription_tier,
            "created_at": tenant.created_at,
            "last_activity": tenant.updated_at
        }