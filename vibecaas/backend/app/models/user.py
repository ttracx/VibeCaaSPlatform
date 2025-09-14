"""
User model
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base

class UserTier(str, enum.Enum):
    FREE = "free"
    HOBBY = "hobby"
    PRO = "pro"
    TEAM = "team"
    ENTERPRISE = "enterprise"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    tier = Column(Enum(UserTier), default=UserTier.FREE)
    
    # Stripe customer ID for billing
    stripe_customer_id = Column(String, unique=True, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Resource quotas
    max_apps = Column(Integer, default=3)
    max_cpu = Column(Integer, default=1)  # in millicores (1000 = 1 CPU)
    max_memory = Column(Integer, default=512)  # in MB
    max_storage = Column(Integer, default=1024)  # in MB
    gpu_enabled = Column(Boolean, default=False)
    gpu_type = Column(String, nullable=True)
    
    # Relationships
    applications = relationship("Application", back_populates="owner", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    billing_history = relationship("BillingHistory", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username}>"