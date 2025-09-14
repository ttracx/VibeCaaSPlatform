from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base

class BillingRecord(Base):
    __tablename__ = "billing_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    
    # Stripe information
    stripe_customer_id = Column(String, unique=True, index=True)
    stripe_subscription_id = Column(String, unique=True, index=True)
    stripe_price_id = Column(String)
    
    # Subscription details
    plan_name = Column(String, nullable=False)  # starter, pro, team
    plan_type = Column(String, nullable=False)  # monthly, annual
    status = Column(String, nullable=False)     # active, cancelled, past_due, trialing
    
    # Pricing
    amount = Column(Numeric(10, 2), nullable=False)  # Amount in cents
    currency = Column(String, default="usd")
    
    # Billing cycle
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="billing_records")
    tenant = relationship("Tenant")
    usage_records = relationship("UsageRecord", back_populates="billing_record")

class UsageRecord(Base):
    __tablename__ = "usage_records"
    
    id = Column(Integer, primary_key=True, index=True)
    billing_record_id = Column(Integer, ForeignKey("billing_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # Usage details
    resource_type = Column(String, nullable=False)  # compute, storage, api_calls, agent_time
    quantity = Column(Numeric(10, 4), nullable=False)  # Amount used
    unit = Column(String, nullable=False)  # hours, gb, calls, seconds
    rate = Column(Numeric(10, 4), nullable=False)  # Rate per unit
    
    # Cost calculation
    amount = Column(Numeric(10, 2), nullable=False)  # Total cost in cents
    currency = Column(String, default="usd")
    
    # Time period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Metadata
    metadata = Column(JSON)  # Additional usage metadata
    
    # Relationships
    billing_record = relationship("BillingRecord", back_populates="usage_records")
    user = relationship("User")
    project = relationship("Project")