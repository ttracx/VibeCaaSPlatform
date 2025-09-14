from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class BillingRecordResponse(BaseModel):
    id: int
    user_id: int
    tenant_id: Optional[int] = None
    stripe_customer_id: str
    stripe_subscription_id: str
    stripe_price_id: str
    plan_name: str
    plan_type: str
    status: str
    amount: Decimal
    currency: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UsageRecordResponse(BaseModel):
    id: int
    billing_record_id: int
    user_id: int
    project_id: Optional[int] = None
    resource_type: str
    quantity: Decimal
    unit: str
    rate: Decimal
    amount: Decimal
    currency: str
    period_start: datetime
    period_end: datetime
    recorded_at: datetime
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True

class CreateSubscriptionRequest(BaseModel):
    email: str
    name: str
    price_id: str
    plan_name: str
    plan_type: str

class SubscriptionResponse(BaseModel):
    subscription_id: str
    client_secret: str
    status: str

class InvoiceResponse(BaseModel):
    id: str
    amount: int
    currency: str
    status: str
    created: datetime
    invoice_pdf: Optional[str] = None

class CurrentUsageResponse(BaseModel):
    usage: float
    limit: float
    period_start: datetime
    period_end: datetime

class QuotasResponse(BaseModel):
    projects: int
    compute_hours: int
    storage_gb: int
    monthly_limit: float
