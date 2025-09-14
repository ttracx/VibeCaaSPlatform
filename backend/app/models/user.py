from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Profile information
    first_name = Column(String)
    last_name = Column(String)
    avatar_url = Column(String)
    bio = Column(Text)
    
    # Subscription information
    subscription_tier = Column(String, default="starter")  # starter, pro, team
    subscription_status = Column(String, default="active")  # active, cancelled, past_due
    
    # Usage tracking
    total_projects = Column(Integer, default=0)
    total_compute_hours = Column(Integer, default=0)
    total_storage_gb = Column(Integer, default=0)