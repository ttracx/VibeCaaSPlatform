from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base
import enum

class DomainStatus(str, enum.Enum):
    REQUESTED = "requested"
    PURCHASED = "purchased"
    DNS_CONFIGURED = "dns_configured"
    PROPAGATING = "propagating"
    TLS_ISSUED = "tls_issued"
    ACTIVE = "active"
    ERROR = "error"
    EXPIRED = "expired"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DNSRecordType(str, enum.Enum):
    A = "A"
    AAAA = "AAAA"
    CNAME = "CNAME"
    MX = "MX"
    TXT = "TXT"
    NS = "NS"
    SOA = "SOA"

class Domain(Base):
    __tablename__ = "domains"
    
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    app_id = Column(Integer, ForeignKey("projects.id"), nullable=True)  # Optional app binding
    
    # Domain details
    tld = Column(String(50), nullable=False)
    status = Column(Enum(DomainStatus), nullable=False, default=DomainStatus.REQUESTED)
    privacy_enabled = Column(Boolean, default=False)
    years = Column(Integer, default=1)
    
    # Name.com integration
    namecom_domain_id = Column(String(255), unique=True, index=True)
    namecom_order_id = Column(String(255), index=True)
    
    # Contact information
    registrant_contact = Column(JSON)
    admin_contact = Column(JSON)
    tech_contact = Column(JSON)
    billing_contact = Column(JSON)
    
    # DNS and deployment
    dns_configured = Column(Boolean, default=False)
    tls_issued = Column(Boolean, default=False)
    deployment_bound = Column(Boolean, default=False)
    
    # Pricing
    price_cents = Column(Integer)
    currency = Column(String(3), default="USD")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships
    owner = relationship("User", back_populates="domains")
    app = relationship("Project")
    orders = relationship("DomainOrder", back_populates="domain")
    dns_records = relationship("DNSRecord", back_populates="domain")
    
    def __repr__(self):
        return f"<Domain(id={self.id}, domain={self.domain}, status={self.status})>"

class DomainOrder(Base):
    __tablename__ = "domain_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    order_id = Column(String(255), unique=True, index=True, nullable=False)
    
    # Order details
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    price_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD")
    years = Column(Integer, default=1)
    
    # Name.com response
    raw_response = Column(JSON)
    namecom_order_id = Column(String(255), index=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    domain = relationship("Domain", back_populates="orders")
    
    def __repr__(self):
        return f"<DomainOrder(id={self.id}, order_id={self.order_id}, status={self.status})>"

class DNSRecord(Base):
    __tablename__ = "dns_records"
    
    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    
    # DNS record details
    type = Column(Enum(DNSRecordType), nullable=False)
    host = Column(String(255), nullable=False)  # @ for apex, subdomain name otherwise
    answer = Column(String(500), nullable=False)  # IP address, CNAME target, etc.
    ttl = Column(Integer, default=300)
    
    # Name.com integration
    namecom_record_id = Column(String(255), unique=True, index=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    domain = relationship("Domain", back_populates="dns_records")
    
    def __repr__(self):
        return f"<DNSRecord(id={self.id}, type={self.type}, host={self.host}, answer={self.answer})>"

class URLForwarding(Base):
    __tablename__ = "url_forwardings"
    
    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    
    # Forwarding details
    subdomain = Column(String(255), nullable=False)  # www, api, etc.
    target_url = Column(String(500), nullable=False)
    forwarding_type = Column(String(20), default="redirect")  # redirect, frame
    status_code = Column(Integer, default=301)  # 301, 302, etc.
    
    # Name.com integration
    namecom_forwarding_id = Column(String(255), unique=True, index=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    domain = relationship("Domain")
    
    def __repr__(self):
        return f"<URLForwarding(id={self.id}, subdomain={self.subdomain}, target_url={self.target_url})>"

class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False, default="namecom")
    subscription_id = Column(String(255), unique=True, index=True, nullable=False)
    topic = Column(String(100), nullable=False)  # domain.registered, order.completed, etc.
    webhook_url = Column(String(500), nullable=False)
    secret = Column(String(255))  # For signature verification
    
    # Status
    is_active = Column(Boolean, default=True)
    last_delivery_at = Column(DateTime(timezone=True))
    failure_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<WebhookSubscription(id={self.id}, provider={self.provider}, topic={self.topic})>"

class DomainSearch(Base):
    __tablename__ = "domain_searches"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Search details
    query = Column(String(255), nullable=False)
    tlds = Column(JSON)  # List of TLDs searched
    results_count = Column(Integer, default=0)
    
    # User tracking (optional for public searches)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45))  # For rate limiting
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<DomainSearch(id={self.id}, query={self.query}, results_count={self.results_count})>"
