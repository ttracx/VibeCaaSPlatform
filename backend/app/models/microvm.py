from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base
import enum

class MicroVMStatus(str, enum.Enum):
    CREATING = "creating"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"
    DESTROYING = "destroying"
    DESTROYED = "destroyed"

class MicroVMRuntime(str, enum.Enum):
    NODE = "node"
    PYTHON = "python"
    GO = "go"
    RUST = "rust"
    JAVA = "java"
    DOTNET = "dotnet"

class MicroVM(Base):
    __tablename__ = "microvms"
    
    id = Column(Integer, primary_key=True, index=True)
    vm_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # User and tenant relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # VM configuration
    runtime = Column(Enum(MicroVMRuntime), nullable=False)
    region = Column(String(50), nullable=False, default="us-east-1")
    cpu_cores = Column(Integer, nullable=False, default=2)
    memory_mb = Column(Integer, nullable=False, default=2048)
    storage_gb = Column(Integer, nullable=False, default=10)
    
    # VM state
    status = Column(Enum(MicroVMStatus), nullable=False, default=MicroVMStatus.CREATING)
    dev_url = Column(String(500))  # https://<vm-id>.<region>.vibecaas.dev
    internal_ip = Column(String(45))  # Internal IP address
    external_ip = Column(String(45))  # External IP address
    
    # Source configuration
    repo_url = Column(String(500))  # Git repository URL
    branch = Column(String(100), default="main")
    build_command = Column(String(500))
    start_command = Column(String(500))
    environment_variables = Column(JSON)  # Dict of env vars
    
    # VM control integration
    vm_control_id = Column(String(255), unique=True, index=True)  # ID from vm-control API
    vm_control_region = Column(String(50))
    vm_control_status = Column(String(50))  # Status from vm-control API
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    started_at = Column(DateTime(timezone=True))
    stopped_at = Column(DateTime(timezone=True))
    
    # Resource tracking
    cpu_usage_percent = Column(Integer, default=0)
    memory_usage_mb = Column(Integer, default=0)
    storage_usage_gb = Column(Integer, default=0)
    
    # Feature flags
    is_active = Column(Boolean, default=True)
    auto_scale = Column(Boolean, default=False)
    gpu_enabled = Column(Boolean, default=False)
    
    # Relationships
    owner = relationship("User", back_populates="microvms")
    tenant = relationship("Tenant", back_populates="microvms")
    
    def __repr__(self):
        return f"<MicroVM(id={self.id}, vm_id={self.vm_id}, status={self.status})>"

class MicroVMEvent(Base):
    __tablename__ = "microvm_events"
    
    id = Column(Integer, primary_key=True, index=True)
    microvm_id = Column(Integer, ForeignKey("microvms.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # created, started, stopped, failed, etc.
    message = Column(Text)
    metadata = Column(JSON)  # Additional event data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    microvm = relationship("MicroVM")

class MicroVMQuota(Base):
    __tablename__ = "microvm_quotas"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, unique=True)
    
    # Quota limits
    max_microvms = Column(Integer, default=5)
    max_cpu_cores = Column(Integer, default=8)
    max_memory_gb = Column(Integer, default=16)
    max_storage_gb = Column(Integer, default=100)
    
    # Current usage
    current_microvms = Column(Integer, default=0)
    current_cpu_cores = Column(Integer, default=0)
    current_memory_gb = Column(Integer, default=0)
    current_storage_gb = Column(Integer, default=0)
    
    # Feature flags
    gpu_enabled = Column(Boolean, default=False)
    auto_scale_enabled = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
