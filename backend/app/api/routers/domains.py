from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from ...db import get_db
from ...models.user import User
from ...schemas.domain import (
    DomainSearchRequest, DomainSearchResponse, DomainPurchaseRequest,
    DomainPurchaseResponse, DomainConnectRequest, DomainConnectResponse,
    DNSRecordCreate, DNSRecordResponse, URLForwardingCreate,
    URLForwardingResponse, DomainResponse, DomainListResponse,
    HealthResponse, ErrorResponse
)
from ...services.domains.domains_service import DomainsService
from ...services.auth_service import get_current_user
from ...config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/domains/hello", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """Health check for domains service"""
    try:
        domains_service = DomainsService(db)
        namecom_status = "healthy"
        
        # Test Name.com connectivity
        try:
            await domains_service.namecom.hello()
        except Exception as e:
            namecom_status = f"unhealthy: {str(e)}"
            logger.warning(f"Name.com health check failed: {e}")
        
        return HealthResponse(
            ok=True,
            service="domains-service",
            namecom_status=namecom_status,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Domains service health check failed: {e}")
        return HealthResponse(
            ok=False,
            service="domains-service",
            namecom_status="unhealthy",
            timestamp=datetime.utcnow()
        )

@router.get("/domains/search", response_model=DomainSearchResponse)
async def search_domains(
    q: str = Query(..., min_length=1, max_length=255, description="Search query"),
    tlds: str = Query("com,ai,dev,io,co", description="Comma-separated TLDs"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Search for domain availability and pricing (public endpoint)"""
    try:
        # Rate limiting (basic implementation)
        client_ip = request.client.host if request else "unknown"
        
        # Parse TLDs
        tld_list = [tld.strip() for tld in tlds.split(",") if tld.strip()]
        
        search_request = DomainSearchRequest(
            query=q,
            tlds=tld_list,
            limit=limit
        )
        
        domains_service = DomainsService(db)
        result = await domains_service.search_domains(
            search_request=search_request,
            user_id=None,  # Public search
            ip_address=client_ip
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Domain search failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "SEARCH_FAILED",
                    "message": "Failed to search domains",
                    "hint": "Please try again later"
                }
            }
        )

@router.post("/domains/purchase", response_model=DomainPurchaseResponse)
async def purchase_domain(
    purchase_request: DomainPurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase a domain (requires authentication)"""
    try:
        domains_service = DomainsService(db)
        result = await domains_service.purchase_domain(
            purchase_request=purchase_request,
            user_id=current_user.id
        )
        
        if not result["ok"]:
            raise HTTPException(
                status_code=400,
                detail=result
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Domain purchase failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "PURCHASE_FAILED",
                    "message": "Failed to purchase domain",
                    "hint": "Please try again later"
                }
            }
        )

@router.post("/domains/{domain}/connect", response_model=DomainConnectResponse)
async def connect_domain(
    domain: str,
    connect_request: DomainConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Connect domain to an app (requires authentication)"""
    try:
        domains_service = DomainsService(db)
        result = await domains_service.connect_domain(
            domain=domain,
            connect_request=connect_request,
            user_id=current_user.id
        )
        
        if not result["ok"]:
            raise HTTPException(
                status_code=400,
                detail=result
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Domain connection failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "ok": False,
                "error": {
                    "code": "CONNECT_FAILED",
                    "message": "Failed to connect domain",
                    "hint": "Please try again later"
                }
            }
        )

@router.get("/domains", response_model=DomainListResponse)
async def list_user_domains(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Results per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's domains (requires authentication)"""
    try:
        domains_service = DomainsService(db)
        result = await domains_service.get_user_domains(
            user_id=current_user.id,
            page=page,
            per_page=per_page
        )
        
        return DomainListResponse(
            domains=result["domains"],
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result["total_pages"]
        )
        
    except Exception as e:
        logger.error(f"Failed to list user domains: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to list domains"
        )

@router.get("/domains/{domain}", response_model=DomainResponse)
async def get_domain(
    domain: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get domain details (requires authentication)"""
    try:
        from ...models.domain import Domain
        
        domain_record = db.query(Domain).filter(
            Domain.domain == domain,
            Domain.user_id == current_user.id
        ).first()
        
        if not domain_record:
            raise HTTPException(
                status_code=404,
                detail="Domain not found"
            )
        
        return domain_record
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get domain {domain}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get domain"
        )

@router.get("/domains/{domain}/dns", response_model=List[DNSRecordResponse])
async def get_domain_dns_records(
    domain: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get DNS records for a domain (requires authentication)"""
    try:
        domains_service = DomainsService(db)
        records = await domains_service.get_domain_dns_records(
            domain=domain,
            user_id=current_user.id
        )
        
        return records
        
    except Exception as e:
        logger.error(f"Failed to get DNS records for {domain}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get DNS records"
        )

@router.post("/domains/{domain}/dns", response_model=Dict[str, Any])
async def create_dns_record(
    domain: str,
    record_data: DNSRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a DNS record (requires authentication)"""
    try:
        domains_service = DomainsService(db)
        result = await domains_service.create_dns_record(
            domain=domain,
            record_data=record_data,
            user_id=current_user.id
        )
        
        if not result["ok"]:
            raise HTTPException(
                status_code=400,
                detail=result
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create DNS record for {domain}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create DNS record"
        )

@router.put("/domains/{domain}/dns/{record_id}", response_model=Dict[str, Any])
async def update_dns_record(
    domain: str,
    record_id: int,
    record_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a DNS record (requires authentication)"""
    try:
        from ...models.domain import DNSRecord, Domain
        
        # Verify domain ownership
        domain_record = db.query(Domain).filter(
            Domain.domain == domain,
            Domain.user_id == current_user.id
        ).first()
        
        if not domain_record:
            raise HTTPException(
                status_code=404,
                detail="Domain not found"
            )
        
        # Get DNS record
        dns_record = db.query(DNSRecord).filter(
            DNSRecord.id == record_id,
            DNSRecord.domain_id == domain_record.id
        ).first()
        
        if not dns_record:
            raise HTTPException(
                status_code=404,
                detail="DNS record not found"
            )
        
        # Update via Name.com
        domains_service = DomainsService(db)
        await domains_service.namecom.update_dns_record(
            domain=domain,
            record_id=dns_record.namecom_record_id,
            record_data=record_data
        )
        
        # Update local record
        if "answer" in record_data:
            dns_record.answer = record_data["answer"]
        if "ttl" in record_data:
            dns_record.ttl = record_data["ttl"]
        
        db.commit()
        
        return {
            "ok": True,
            "message": "DNS record updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update DNS record {record_id} for {domain}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update DNS record"
        )

@router.delete("/domains/{domain}/dns/{record_id}")
async def delete_dns_record(
    domain: str,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a DNS record (requires authentication)"""
    try:
        from ...models.domain import DNSRecord, Domain
        
        # Verify domain ownership
        domain_record = db.query(Domain).filter(
            Domain.domain == domain,
            Domain.user_id == current_user.id
        ).first()
        
        if not domain_record:
            raise HTTPException(
                status_code=404,
                detail="Domain not found"
            )
        
        # Get DNS record
        dns_record = db.query(DNSRecord).filter(
            DNSRecord.id == record_id,
            DNSRecord.domain_id == domain_record.id
        ).first()
        
        if not dns_record:
            raise HTTPException(
                status_code=404,
                detail="DNS record not found"
            )
        
        # Delete via Name.com
        domains_service = DomainsService(db)
        await domains_service.namecom.delete_dns_record(
            domain=domain,
            record_id=dns_record.namecom_record_id
        )
        
        # Delete local record
        db.delete(dns_record)
        db.commit()
        
        return {
            "ok": True,
            "message": "DNS record deleted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete DNS record {record_id} for {domain}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete DNS record"
        )

@router.post("/domains/webhooks/namecom")
async def handle_namecom_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Name.com webhook notifications"""
    try:
        # Get webhook payload
        payload = await request.json()
        
        # Log webhook for debugging
        logger.info(f"Received Name.com webhook: {payload}")
        
        # Process webhook based on event type
        event_type = payload.get("event")
        
        if event_type == "domain.registered":
            await _handle_domain_registered(payload, db)
        elif event_type == "order.completed":
            await _handle_order_completed(payload, db)
        elif event_type == "order.failed":
            await _handle_order_failed(payload, db)
        else:
            logger.warning(f"Unknown webhook event type: {event_type}")
        
        return {"ok": True, "message": "Webhook processed"}
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Webhook processing failed"
        )

async def _handle_domain_registered(payload: Dict[str, Any], db: Session):
    """Handle domain registered webhook"""
    try:
        domain_name = payload.get("domain")
        if not domain_name:
            return
        
        # Update domain status
        from ...models.domain import Domain
        domain = db.query(Domain).filter(
            Domain.domain == domain_name
        ).first()
        
        if domain:
            domain.status = "purchased"
            domain.namecom_domain_id = payload.get("domainId")
            db.commit()
            logger.info(f"Domain {domain_name} registered successfully")
        
    except Exception as e:
        logger.error(f"Failed to handle domain registered webhook: {e}")

async def _handle_order_completed(payload: Dict[str, Any], db: Session):
    """Handle order completed webhook"""
    try:
        order_id = payload.get("orderId")
        if not order_id:
            return
        
        # Update order status
        from ...models.domain import DomainOrder
        order = db.query(DomainOrder).filter(
            DomainOrder.namecom_order_id == order_id
        ).first()
        
        if order:
            order.status = "completed"
            order.completed_at = datetime.utcnow()
            db.commit()
            logger.info(f"Order {order_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Failed to handle order completed webhook: {e}")

async def _handle_order_failed(payload: Dict[str, Any], db: Session):
    """Handle order failed webhook"""
    try:
        order_id = payload.get("orderId")
        if not order_id:
            return
        
        # Update order status
        from ...models.domain import DomainOrder
        order = db.query(DomainOrder).filter(
            DomainOrder.namecom_order_id == order_id
        ).first()
        
        if order:
            order.status = "failed"
            db.commit()
            logger.info(f"Order {order_id} failed")
        
    except Exception as e:
        logger.error(f"Failed to handle order failed webhook: {e}")