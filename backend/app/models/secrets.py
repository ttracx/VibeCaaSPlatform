from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base

class Secret(Base):
    __tablename__ = "secrets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # Secret data (encrypted)
    encrypted_value = Column(Text, nullable=False)
    encryption_key_id = Column(String, nullable=False)
    
    # Secret metadata
    secret_type = Column(String, nullable=False)  # api_key, password, token, certificate
    tags = Column(JSON)  # List of tags for organization
    expires_at = Column(DateTime(timezone=True))
    
    # Access control
    is_shared = Column(Boolean, default=False)
    shared_with_tenants = Column(JSON)  # List of tenant IDs that can access this secret
    
    # Audit
    last_accessed_at = Column(DateTime(timezone=True))
    access_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="secrets")
    tenant = relationship("Tenant")
    project = relationship("Project")