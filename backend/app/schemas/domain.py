from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DomainStatus(str, Enum):
    REQUESTED = "requested"
    PURCHASED = "purchased"
    DNS_CONFIGURED = "dns_configured"
    PROPAGATING = "propagating"
    TLS_ISSUED = "tls_issued"
    ACTIVE = "active"
    ERROR = "error"
    EXPIRED = "expired"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DNSRecordType(str, Enum):
    A = "A"
    AAAA = "AAAA"
    CNAME = "CNAME"
    MX = "MX"
    TXT = "TXT"
    NS = "NS"
    SOA = "SOA"

# Search and Pricing
class DomainSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=255)
    tlds: Optional[List[str]] = Field(default=["com", "ai", "dev", "io", "co"])
    limit: int = Field(default=20, ge=1, le=100)

class DomainPricing(BaseModel):
    year: int = Field(..., ge=1, le=10)
    price_cents: int = Field(..., ge=0)
    currency: str = Field(default="USD", max_length=3)
    years_allowed: List[int] = Field(default=[1, 2, 3, 5, 10])

class DomainSearchResult(BaseModel):
    domain: str
    available: bool
    premium: bool = False
    pricing: Optional[DomainPricing] = None
    years_allowed: List[int] = Field(default=[1, 2, 3, 5, 10])

class DomainSearchResponse(BaseModel):
    ok: bool = True
    data: List[DomainSearchResult]
    total: int
    query: str
    tlds: List[str]

# Purchase
class ContactInfo(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    organization: Optional[str] = Field(None, max_length=100)
    address1: str = Field(..., min_length=1, max_length=100)
    address2: Optional[str] = Field(None, max_length=100)
    city: str = Field(..., min_length=1, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=2, max_length=2)  # ISO country code
    phone: str = Field(..., min_length=1, max_length=20)
    email: str = Field(..., min_length=1, max_length=255)

class DomainPurchaseRequest(BaseModel):
    domain: str = Field(..., min_length=1, max_length=255)
    years: int = Field(default=1, ge=1, le=10)
    privacy: bool = Field(default=True)
    registrant_contact: ContactInfo
    admin_contact: Optional[ContactInfo] = None
    tech_contact: Optional[ContactInfo] = None
    billing_contact: Optional[ContactInfo] = None

class DomainPurchaseResponse(BaseModel):
    ok: bool = True
    data: Dict[str, Any]
    message: str

# Connect
class DomainConnectRequest(BaseModel):
    app_id: int = Field(..., ge=1)
    mode: str = Field(..., regex="^(A|AAAA|CNAME)$")
    custom_cname: Optional[str] = Field(None, max_length=255)

class DomainConnectResponse(BaseModel):
    ok: bool = True
    data: Dict[str, Any]
    message: str

# DNS Management
class DNSRecordCreate(BaseModel):
    type: DNSRecordType
    host: str = Field(..., min_length=1, max_length=255)
    answer: str = Field(..., min_length=1, max_length=500)
    ttl: int = Field(default=300, ge=60, le=86400)

class DNSRecordUpdate(BaseModel):
    answer: Optional[str] = Field(None, min_length=1, max_length=500)
    ttl: Optional[int] = Field(None, ge=60, le=86400)

class DNSRecordResponse(BaseModel):
    id: int
    type: DNSRecordType
    host: str
    answer: str
    ttl: int
    namecom_record_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# URL Forwarding
class URLForwardingCreate(BaseModel):
    subdomain: str = Field(..., min_length=1, max_length=255)
    target_url: HttpUrl
    forwarding_type: str = Field(default="redirect", regex="^(redirect|frame)$")
    status_code: int = Field(default=301, ge=300, le=399)

class URLForwardingResponse(BaseModel):
    id: int
    subdomain: str
    target_url: str
    forwarding_type: str
    status_code: int
    namecom_forwarding_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Domain Management
class DomainResponse(BaseModel):
    id: int
    domain: str
    user_id: int
    app_id: Optional[int]
    tld: str
    status: DomainStatus
    privacy_enabled: bool
    years: int
    namecom_domain_id: Optional[str]
    namecom_order_id: Optional[str]
    dns_configured: bool
    tls_issued: bool
    deployment_bound: bool
    price_cents: Optional[int]
    currency: str
    created_at: datetime
    updated_at: Optional[datetime]
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True

class DomainListResponse(BaseModel):
    domains: List[DomainResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class DomainOrderResponse(BaseModel):
    id: int
    domain_id: int
    order_id: str
    status: OrderStatus
    price_cents: int
    currency: str
    years: int
    namecom_order_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

# Webhooks
class WebhookEvent(BaseModel):
    event_type: str
    domain: Optional[str] = None
    order_id: Optional[str] = None
    data: Dict[str, Any]
    timestamp: datetime

class WebhookSubscriptionCreate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=100)
    webhook_url: HttpUrl
    secret: Optional[str] = Field(None, max_length=255)

class WebhookSubscriptionResponse(BaseModel):
    id: int
    provider: str
    subscription_id: str
    topic: str
    webhook_url: str
    is_active: bool
    last_delivery_at: Optional[datetime]
    failure_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Error Response
class ErrorResponse(BaseModel):
    ok: bool = False
    error: Dict[str, Any]

# Health Check
class HealthResponse(BaseModel):
    ok: bool = True
    service: str = "domains-service"
    namecom_status: str
    timestamp: datetime
