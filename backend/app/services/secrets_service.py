from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.secrets import Secret
from ..schemas.secrets import SecretCreate, SecretUpdate
from cryptography.fernet import Fernet
import base64
import os
from datetime import datetime

class SecretsService:
    def __init__(self, db: Session):
        self.db = db
        self.encryption_key = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
        self.cipher = Fernet(self.encryption_key)

    async def get_user_secrets(
        self, 
        user_id: int, 
        project_id: Optional[int] = None,
        secret_type: Optional[str] = None
    ) -> List[Secret]:
        """Get secrets for a user"""
        query = self.db.query(Secret).filter(
            Secret.user_id == user_id,
            Secret.is_active == True
        )
        
        if project_id:
            query = query.filter(Secret.project_id == project_id)
        if secret_type:
            query = query.filter(Secret.secret_type == secret_type)
            
        return query.all()

    async def create_secret(self, secret_data: SecretCreate, user_id: int) -> Secret:
        """Create a new secret"""
        # Encrypt the secret value
        encrypted_value = self.cipher.encrypt(secret_data.value.encode()).decode()
        
        secret = Secret(
            name=secret_data.name,
            description=secret_data.description,
            secret_type=secret_data.secret_type,
            encrypted_value=encrypted_value,
            encryption_key_id="default",
            user_id=user_id,
            project_id=secret_data.project_id,
            tenant_id=secret_data.tenant_id,
            tags=secret_data.tags or [],
            expires_at=secret_data.expires_at,
            is_shared=secret_data.is_shared,
            shared_with_tenants=secret_data.shared_with_tenants or []
        )
        
        self.db.add(secret)
        self.db.commit()
        self.db.refresh(secret)
        return secret

    async def get_secret(self, secret_id: int, user_id: int) -> Optional[Secret]:
        """Get a specific secret"""
        return self.db.query(Secret).filter(
            Secret.id == secret_id,
            Secret.user_id == user_id,
            Secret.is_active == True
        ).first()

    async def update_secret(
        self, 
        secret_id: int, 
        secret_data: SecretUpdate, 
        user_id: int
    ) -> Optional[Secret]:
        """Update a secret"""
        secret = await self.get_secret(secret_id, user_id)
        if not secret:
            return None
            
        for field, value in secret_data.dict(exclude_unset=True).items():
            if field == "value" and value:
                # Re-encrypt the new value
                encrypted_value = self.cipher.encrypt(value.encode()).decode()
                secret.encrypted_value = encrypted_value
            else:
                setattr(secret, field, value)
                
        self.db.commit()
        self.db.refresh(secret)
        return secret

    async def delete_secret(self, secret_id: int, user_id: int) -> bool:
        """Delete a secret"""
        secret = await self.get_secret(secret_id, user_id)
        if not secret:
            return False
            
        secret.is_active = False
        self.db.commit()
        return True

    async def access_secret(self, secret_id: int, user_id: int) -> Optional[str]:
        """Access a secret (decrypt and return value)"""
        secret = await self.get_secret(secret_id, user_id)
        if not secret:
            return None
            
        try:
            # Decrypt the secret value
            decrypted_value = self.cipher.decrypt(secret.encrypted_value.encode()).decode()
            
            # Update access tracking
            secret.last_accessed_at = datetime.utcnow()
            secret.access_count += 1
            self.db.commit()
            
            return decrypted_value
        except Exception as e:
            print(f"Error decrypting secret {secret_id}: {e}")
            return None

    async def share_secret(self, secret_id: int, tenant_ids: List[int], user_id: int) -> bool:
        """Share a secret with other tenants"""
        secret = await self.get_secret(secret_id, user_id)
        if not secret:
            return False
            
        # Add tenant IDs to shared list
        current_shared = secret.shared_with_tenants or []
        new_shared = list(set(current_shared + tenant_ids))
        
        secret.shared_with_tenants = new_shared
        secret.is_shared = True
        self.db.commit()
        
        return True

    async def get_secret_types(self) -> List[dict]:
        """Get available secret types"""
        return [
            {"id": "api_key", "name": "API Key", "description": "API authentication key"},
            {"id": "password", "name": "Password", "description": "User password"},
            {"id": "token", "name": "Token", "description": "Authentication token"},
            {"id": "certificate", "name": "Certificate", "description": "SSL/TLS certificate"},
            {"id": "database_url", "name": "Database URL", "description": "Database connection string"},
            {"id": "ssh_key", "name": "SSH Key", "description": "SSH private key"},
        ]

    async def rotate_secret(self, secret_id: int, user_id: int) -> bool:
        """Rotate a secret (generate new encryption key)"""
        secret = await self.get_secret(secret_id, user_id)
        if not secret:
            return False
            
        try:
            # Decrypt with old key
            decrypted_value = self.cipher.decrypt(secret.encrypted_value.encode()).decode()
            
            # Generate new encryption key
            new_key = Fernet.generate_key()
            new_cipher = Fernet(new_key)
            
            # Re-encrypt with new key
            new_encrypted_value = new_cipher.encrypt(decrypted_value.encode()).decode()
            
            # Update secret
            secret.encrypted_value = new_encrypted_value
            secret.encryption_key_id = f"key_{datetime.utcnow().timestamp()}"
            self.db.commit()
            
            return True
        except Exception as e:
            print(f"Error rotating secret {secret_id}: {e}")
            return False

    async def get_secret_usage_stats(self, user_id: int) -> dict:
        """Get secret usage statistics"""
        secrets = await self.get_user_secrets(user_id)
        
        total_secrets = len(secrets)
        shared_secrets = len([s for s in secrets if s.is_shared])
        expired_secrets = len([s for s in secrets if s.expires_at and s.expires_at < datetime.utcnow()])
        
        # Most accessed secrets
        most_accessed = sorted(secrets, key=lambda x: x.access_count, reverse=True)[:5]
        
        return {
            "total_secrets": total_secrets,
            "shared_secrets": shared_secrets,
            "expired_secrets": expired_secrets,
            "most_accessed": [
                {
                    "id": s.id,
                    "name": s.name,
                    "access_count": s.access_count,
                    "last_accessed": s.last_accessed_at
                }
                for s in most_accessed
            ]
        }