from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...models.secrets import Secret
from ...schemas.secrets import SecretCreate, SecretUpdate, SecretResponse
from ...services.secrets_service import SecretsService

router = APIRouter()

@router.get("/secrets", response_model=List[SecretResponse])
async def list_secrets(
    project_id: Optional[int] = None,
    secret_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List secrets for the current user"""
    secrets_service = SecretsService(db)
    secrets = await secrets_service.get_user_secrets(
        current_user.id, project_id, secret_type
    )
    return secrets

@router.post("/secrets", response_model=SecretResponse)
async def create_secret(
    secret: SecretCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new secret"""
    secrets_service = SecretsService(db)
    return await secrets_service.create_secret(secret, current_user.id)

@router.get("/secrets/{secret_id}", response_model=SecretResponse)
async def get_secret(
    secret_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific secret"""
    secrets_service = SecretsService(db)
    secret = await secrets_service.get_secret(secret_id, current_user.id)
    if not secret:
        raise HTTPException(status_code=404, detail="Secret not found")
    return secret

@router.put("/secrets/{secret_id}", response_model=SecretResponse)
async def update_secret(
    secret_id: int,
    secret: SecretUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a secret"""
    secrets_service = SecretsService(db)
    updated_secret = await secrets_service.update_secret(secret_id, secret, current_user.id)
    if not updated_secret:
        raise HTTPException(status_code=404, detail="Secret not found")
    return updated_secret

@router.delete("/secrets/{secret_id}")
async def delete_secret(
    secret_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a secret"""
    secrets_service = SecretsService(db)
    success = await secrets_service.delete_secret(secret_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Secret not found")
    return {"message": "Secret deleted successfully"}

@router.post("/secrets/{secret_id}/access")
async def access_secret(
    secret_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Access a secret (decrypt and return value)"""
    secrets_service = SecretsService(db)
    secret_value = await secrets_service.access_secret(secret_id, current_user.id)
    if not secret_value:
        raise HTTPException(status_code=404, detail="Secret not found")
    return {"value": secret_value}

@router.post("/secrets/{secret_id}/share")
async def share_secret(
    secret_id: int,
    tenant_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Share a secret with other tenants"""
    secrets_service = SecretsService(db)
    success = await secrets_service.share_secret(secret_id, tenant_ids, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Secret not found")
    return {"message": "Secret shared successfully"}

@router.get("/secrets/types")
async def list_secret_types():
    """List available secret types"""
    return {
        "types": [
            {"id": "api_key", "name": "API Key", "description": "API authentication key"},
            {"id": "password", "name": "Password", "description": "User password"},
            {"id": "token", "name": "Token", "description": "Authentication token"},
            {"id": "certificate", "name": "Certificate", "description": "SSL/TLS certificate"},
            {"id": "database_url", "name": "Database URL", "description": "Database connection string"},
            {"id": "ssh_key", "name": "SSH Key", "description": "SSH private key"},
        ]
    }

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass
