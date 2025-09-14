"""
Application model
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

from app.core.database import Base

class AppStatus(str, enum.Enum):
    PENDING = "pending"
    BUILDING = "building"
    DEPLOYING = "deploying"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"
    DELETED = "deleted"

class AppFramework(str, enum.Enum):
    PYTHON = "python"
    NODEJS = "nodejs"
    REACT = "react"
    DJANGO = "django"
    FLASK = "flask"
    FASTAPI = "fastapi"
    EXPRESS = "express"
    NEXTJS = "nextjs"
    CUSTOM = "custom"

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(String)
    framework = Column(Enum(AppFramework), default=AppFramework.CUSTOM)
    status = Column(Enum(AppStatus), default=AppStatus.PENDING)
    
    # Owner
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="applications")
    
    # Container configuration
    image = Column(String)  # Container image
    port = Column(Integer, default=8000)
    environment_variables = Column(JSON, default={})
    secrets = Column(JSON, default={})  # Encrypted
    
    # Resource allocation
    cpu_limit = Column(Integer, default=500)  # millicores
    memory_limit = Column(Integer, default=512)  # MB
    storage_limit = Column(Integer, default=1024)  # MB
    gpu_enabled = Column(Boolean, default=False)
    gpu_type = Column(String, nullable=True)
    replicas = Column(Integer, default=1)
    
    # Networking
    subdomain = Column(String, unique=True, nullable=False)  # e.g., myapp-user1
    custom_domain = Column(String, unique=True, nullable=True)
    ssl_enabled = Column(Boolean, default=True)
    
    # Kubernetes metadata
    namespace = Column(String, nullable=False)
    deployment_name = Column(String, nullable=False)
    service_name = Column(String, nullable=False)
    ingress_name = Column(String, nullable=False)
    
    # Source code
    github_repo = Column(String, nullable=True)
    branch = Column(String, default="main")
    build_command = Column(String, nullable=True)
    start_command = Column(String, nullable=True)
    
    # Monitoring
    health_check_path = Column(String, default="/health")
    metrics_enabled = Column(Boolean, default=True)
    logging_enabled = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_deployed = Column(DateTime, nullable=True)
    
    # Relationships
    deployments = relationship("Deployment", back_populates="application", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Application {self.name}>"