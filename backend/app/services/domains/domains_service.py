import asyncio
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from ..models.domain import (
    Domain, DomainOrder, DNSRecord, URLForwarding, 
    WebhookSubscription, DomainSearch, DomainStatus, OrderStatus
)
from ..schemas.domain import (
    DomainSearchRequest, DomainSearchResult, DomainPricing,
    DomainPurchaseRequest, DomainConnectRequest, DNSRecordCreate,
    URLForwardingCreate, ContactInfo
)
from .namecom_client import NameComClient
from ..config import settings
from datetime import datetime, timedelta
import uuid

logger = logging.getLogger(__name__)

class DomainsService:
    def __init__(self, db: Session):
        self.db = db
        self.namecom = NameComClient()
        self.platform_edge_ipv4 = settings.PLATFORM_EDGE_IPv4
        self.platform_edge_ipv6 = settings.PLATFORM_EDGE_IPv6
        self.platform_canonical_cname = settings.PLATFORM_CANONICAL_CNAME

    async def search_domains(
        self, 
        search_request: DomainSearchRequest,
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Search for domain availability and pricing"""
        try:
            # Log search for analytics
            search_log = DomainSearch(
                query=search_request.query,
                tlds=search_request.tlds,
                user_id=user_id,
                ip_address=ip_address
            )
            self.db.add(search_log)
            self.db.commit()

            # Search via Name.com
            namecom_results = await self.namecom.search_domains(
                query=search_request.query,
                tlds=search_request.tlds,
                limit=search_request.limit
            )

            # Process results
            results = []
            for result in namecom_results:
                domain_result = DomainSearchResult(
                    domain=result["domainName"],
                    available=result.get("available", False),
                    premium=result.get("premium", False),
                    years_allowed=[1, 2, 3, 5, 10]
                )

                # Get pricing if available
                if domain_result.available:
                    try:
                        pricing_data = await self.namecom.get_domain_pricing(result["domainName"])
                        if pricing_data and "pricing" in pricing_data:
                            pricing = pricing_data["pricing"]
                            domain_result.pricing = DomainPricing(
                                year=1,
                                price_cents=int(pricing.get("registration", {}).get("price", 0) * 100),
                                currency=pricing.get("currency", "USD"),
                                years_allowed=[1, 2, 3, 5, 10]
                            )
                    except Exception as e:
                        logger.warning(f"Failed to get pricing for {result['domainName']}: {e}")

                results.append(domain_result)

            # Update search log with results count
            search_log.results_count = len(results)
            self.db.commit()

            return {
                "ok": True,
                "data": results,
                "total": len(results),
                "query": search_request.query,
                "tlds": search_request.tlds
            }

        except Exception as e:
            logger.error(f"Domain search failed: {e}")
            return {
                "ok": False,
                "error": {
                    "code": "SEARCH_FAILED",
                    "message": "Failed to search domains",
                    "hint": "Please try again later"
                }
            }

    async def purchase_domain(
        self, 
        purchase_request: DomainPurchaseRequest, 
        user_id: int
    ) -> Dict[str, Any]:
        """Purchase a domain"""
        try:
            # Check if domain already exists
            existing_domain = self.db.query(Domain).filter(
                Domain.domain == purchase_request.domain
            ).first()
            
            if existing_domain:
                return {
                    "ok": False,
                    "error": {
                        "code": "DOMAIN_EXISTS",
                        "message": "Domain already exists",
                        "hint": "This domain is already registered"
                    }
                }

            # Register domain with Name.com
            namecom_response = await self.namecom.register_domain_with_contacts(
                domain=purchase_request.domain,
                years=purchase_request.years,
                privacy=purchase_request.privacy,
                registrant_contact=purchase_request.registrant_contact.dict(),
                admin_contact=purchase_request.admin_contact.dict() if purchase_request.admin_contact else None,
                tech_contact=purchase_request.tech_contact.dict() if purchase_request.tech_contact else None,
                billing_contact=purchase_request.billing_contact.dict() if purchase_request.billing_contact else None
            )

            # Create domain record
            domain = Domain(
                domain=purchase_request.domain,
                user_id=user_id,
                tld=purchase_request.domain.split('.')[-1],
                status=DomainStatus.REQUESTED,
                privacy_enabled=purchase_request.privacy,
                years=purchase_request.years,
                namecom_order_id=namecom_response.get("orderId"),
                registrant_contact=purchase_request.registrant_contact.dict(),
                admin_contact=purchase_request.admin_contact.dict() if purchase_request.admin_contact else None,
                tech_contact=purchase_request.tech_contact.dict() if purchase_request.tech_contact else None,
                billing_contact=purchase_request.billing_contact.dict() if purchase_request.billing_contact else None
            )
            
            self.db.add(domain)
            self.db.commit()
            self.db.refresh(domain)

            # Create order record
            order = DomainOrder(
                domain_id=domain.id,
                order_id=str(uuid.uuid4()),
                status=OrderStatus.PENDING,
                price_cents=0,  # Will be updated from Name.com
                currency="USD",
                years=purchase_request.years,
                namecom_order_id=namecom_response.get("orderId"),
                raw_response=namecom_response
            )
            
            self.db.add(order)
            self.db.commit()

            # Start order monitoring
            asyncio.create_task(self._monitor_order(domain.id, order.id))

            return {
                "ok": True,
                "data": {
                    "domain_id": domain.id,
                    "domain": domain.domain,
                    "order_id": order.order_id,
                    "status": domain.status,
                    "namecom_order_id": namecom_response.get("orderId")
                },
                "message": f"Domain {purchase_request.domain} purchase initiated"
            }

        except Exception as e:
            logger.error(f"Domain purchase failed: {e}")
            return {
                "ok": False,
                "error": {
                    "code": "PURCHASE_FAILED",
                    "message": "Failed to purchase domain",
                    "hint": "Please check your information and try again"
                }
            }

    async def connect_domain(
        self, 
        domain: str, 
        connect_request: DomainConnectRequest, 
        user_id: int
    ) -> Dict[str, Any]:
        """Connect domain to an app"""
        try:
            # Get domain
            domain_record = self.db.query(Domain).filter(
                Domain.domain == domain,
                Domain.user_id == user_id
            ).first()
            
            if not domain_record:
                return {
                    "ok": False,
                    "error": {
                        "code": "DOMAIN_NOT_FOUND",
                        "message": "Domain not found",
                        "hint": "Domain may not exist or you may not have permission"
                    }
                }

            if domain_record.status not in [DomainStatus.PURCHASED, DomainStatus.DNS_CONFIGURED]:
                return {
                    "ok": False,
                    "error": {
                        "code": "INVALID_STATUS",
                        "message": "Domain not ready for connection",
                        "hint": "Domain must be purchased and ready"
                    }
                }

            # Get app details
            from ..models.project import Project
            app = self.db.query(Project).filter(
                Project.id == connect_request.app_id,
                Project.owner_id == user_id
            ).first()
            
            if not app:
                return {
                    "ok": False,
                    "error": {
                        "code": "APP_NOT_FOUND",
                        "message": "App not found",
                        "hint": "App may not exist or you may not have permission"
                    }
                }

            # Create DNS record
            dns_record = await self.namecom.create_dns_record_for_app(
                domain=domain,
                app_slug=app.project_id,  # Use project_id as app slug
                mode=connect_request.mode,
                platform_ip=self.platform_edge_ipv4,
                platform_cname=self.platform_canonical_cname
            )

            # Store DNS record
            db_record = DNSRecord(
                domain_id=domain_record.id,
                type=connect_request.mode,
                host=app.project_id if connect_request.mode == "CNAME" else "@",
                answer=dns_record.get("answer", ""),
                ttl=dns_record.get("ttl", 300),
                namecom_record_id=dns_record.get("id")
            )
            
            self.db.add(db_record)
            
            # Update domain status
            domain_record.app_id = connect_request.app_id
            domain_record.status = DomainStatus.DNS_CONFIGURED
            domain_record.dns_configured = True
            
            self.db.commit()

            # Start DNS propagation monitoring
            asyncio.create_task(self._monitor_dns_propagation(domain_record.id))

            return {
                "ok": True,
                "data": {
                    "domain": domain,
                    "app_id": connect_request.app_id,
                    "dns_record_id": db_record.id,
                    "status": domain_record.status
                },
                "message": f"Domain {domain} connected to app"
            }

        except Exception as e:
            logger.error(f"Domain connection failed: {e}")
            return {
                "ok": False,
                "error": {
                    "code": "CONNECT_FAILED",
                    "message": "Failed to connect domain",
                    "hint": "Please check your configuration and try again"
                }
            }

    async def get_domain_dns_records(self, domain: str, user_id: int) -> List[Dict[str, Any]]:
        """Get DNS records for a domain"""
        try:
            domain_record = self.db.query(Domain).filter(
                Domain.domain == domain,
                Domain.user_id == user_id
            ).first()
            
            if not domain_record:
                return []

            # Get from database
            db_records = self.db.query(DNSRecord).filter(
                DNSRecord.domain_id == domain_record.id
            ).all()

            return [
                {
                    "id": record.id,
                    "type": record.type,
                    "host": record.host,
                    "answer": record.answer,
                    "ttl": record.ttl,
                    "namecom_record_id": record.namecom_record_id,
                    "created_at": record.created_at,
                    "updated_at": record.updated_at
                }
                for record in db_records
            ]

        except Exception as e:
            logger.error(f"Failed to get DNS records for {domain}: {e}")
            return []

    async def create_dns_record(
        self, 
        domain: str, 
        record_data: DNSRecordCreate, 
        user_id: int
    ) -> Dict[str, Any]:
        """Create a DNS record"""
        try:
            domain_record = self.db.query(Domain).filter(
                Domain.domain == domain,
                Domain.user_id == user_id
            ).first()
            
            if not domain_record:
                return {
                    "ok": False,
                    "error": {
                        "code": "DOMAIN_NOT_FOUND",
                        "message": "Domain not found"
                    }
                }

            # Create via Name.com
            namecom_record = await self.namecom.create_dns_record(domain, {
                "type": record_data.type,
                "host": record_data.host,
                "answer": record_data.answer,
                "ttl": record_data.ttl
            })

            # Store in database
            db_record = DNSRecord(
                domain_id=domain_record.id,
                type=record_data.type,
                host=record_data.host,
                answer=record_data.answer,
                ttl=record_data.ttl,
                namecom_record_id=namecom_record.get("id")
            )
            
            self.db.add(db_record)
            self.db.commit()
            self.db.refresh(db_record)

            return {
                "ok": True,
                "data": {
                    "id": db_record.id,
                    "type": db_record.type,
                    "host": db_record.host,
                    "answer": db_record.answer,
                    "ttl": db_record.ttl
                },
                "message": "DNS record created"
            }

        except Exception as e:
            logger.error(f"Failed to create DNS record: {e}")
            return {
                "ok": False,
                "error": {
                    "code": "DNS_CREATE_FAILED",
                    "message": "Failed to create DNS record"
                }
            }

    async def _monitor_order(self, domain_id: int, order_id: int):
        """Monitor order status"""
        try:
            order = self.db.query(DomainOrder).filter(DomainOrder.id == order_id).first()
            domain = self.db.query(Domain).filter(Domain.id == domain_id).first()
            
            if not order or not domain:
                return

            # Check order status with Name.com
            namecom_order = await self.namecom.get_order(order.namecom_order_id)
            
            if namecom_order.get("status") == "completed":
                order.status = OrderStatus.COMPLETED
                order.completed_at = datetime.utcnow()
                domain.status = DomainStatus.PURCHASED
                domain.namecom_domain_id = namecom_order.get("domainId")
                
                # Update pricing if available
                if "pricing" in namecom_order:
                    order.price_cents = int(namecom_order["pricing"].get("total", 0) * 100)
                
                self.db.commit()
                
                logger.info(f"Order {order.order_id} completed for domain {domain.domain}")
                
            elif namecom_order.get("status") == "failed":
                order.status = OrderStatus.FAILED
                domain.status = DomainStatus.ERROR
                self.db.commit()
                
                logger.error(f"Order {order.order_id} failed for domain {domain.domain}")

        except Exception as e:
            logger.error(f"Order monitoring failed for {order_id}: {e}")

    async def _monitor_dns_propagation(self, domain_id: int):
        """Monitor DNS propagation"""
        try:
            domain = self.db.query(Domain).filter(Domain.id == domain_id).first()
            if not domain:
                return

            # Check DNS propagation (simplified - in production, use proper DNS checking)
            await asyncio.sleep(30)  # Wait for propagation
            
            domain.status = DomainStatus.PROPAGATING
            self.db.commit()

            # Trigger TLS issuance
            asyncio.create_task(self._issue_tls_certificate(domain_id))

        except Exception as e:
            logger.error(f"DNS propagation monitoring failed for {domain_id}: {e}")

    async def _issue_tls_certificate(self, domain_id: int):
        """Issue TLS certificate for domain"""
        try:
            domain = self.db.query(Domain).filter(Domain.id == domain_id).first()
            if not domain:
                return

            # In production, integrate with ACME/Let's Encrypt
            # For now, simulate TLS issuance
            await asyncio.sleep(60)
            
            domain.tls_issued = True
            domain.status = DomainStatus.TLS_ISSUED
            self.db.commit()

            # Trigger deployment binding
            asyncio.create_task(self._bind_domain_to_app(domain_id))

        except Exception as e:
            logger.error(f"TLS issuance failed for {domain_id}: {e}")

    async def _bind_domain_to_app(self, domain_id: int):
        """Bind domain to app deployment"""
        try:
            domain = self.db.query(Domain).filter(Domain.id == domain_id).first()
            if not domain or not domain.app_id:
                return

            # In production, call deployment API to bind domain
            # For now, simulate binding
            await asyncio.sleep(30)
            
            domain.deployment_bound = True
            domain.status = DomainStatus.ACTIVE
            self.db.commit()

            logger.info(f"Domain {domain.domain} bound to app {domain.app_id}")

        except Exception as e:
            logger.error(f"Domain binding failed for {domain_id}: {e}")

    async def get_user_domains(
        self, 
        user_id: int, 
        page: int = 1, 
        per_page: int = 20
    ) -> Dict[str, Any]:
        """Get user's domains"""
        try:
            query = self.db.query(Domain).filter(Domain.user_id == user_id)
            total = query.count()
            
            domains = query.offset((page - 1) * per_page).limit(per_page).all()
            
            return {
                "domains": domains,
                "total": total,
                "page": page,
                "per_page": per_page,
                "total_pages": (total + per_page - 1) // per_page
            }

        except Exception as e:
            logger.error(f"Failed to get user domains: {e}")
            return {
                "domains": [],
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": 0
            }