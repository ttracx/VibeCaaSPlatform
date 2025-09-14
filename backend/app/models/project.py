from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # Project configuration
    framework = Column(String)  # react, vue, angular, nextjs, etc.
    runtime = Column(String)    # node, python, go, rust, etc.
    language = Column(String)   # javascript, typescript, python, etc.
    
    # Deployment settings
    subdomain = Column(String, unique=True, index=True)
    custom_domain = Column(String)
    status = Column(String, default="creating")  # creating, building, deploying, running, stopped, failed
    
    # Container settings
    container_image = Column(String)
    container_config = Column(JSON)  # Docker/container configuration
    environment_variables = Column(JSON)
    
    # Resource usage
    cpu_limit = Column(String, default="1000m")
    memory_limit = Column(String, default="1Gi")
    storage_limit = Column(String, default="10Gi")
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    tenant = relationship("Tenant", back_populates="projects")
    agents = relationship("Agent", back_populates="project")