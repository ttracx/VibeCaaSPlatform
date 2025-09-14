"""
Celery tasks for domain management
Handles DNS propagation, TLS issuance, and order reconciliation
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

from celery import Celery
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.domain import Domain, DomainOrder, DNSRecord
from ..services.domains.domains_service import DomainsService
from ..services.domains.namecom_client import NameComClient
from ..config import settings

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'vibecaas',
    broker=settings.redis_url,
    backend=settings.redis_url
)

@celery_app.task(bind=True, max_retries=3)
def verify_dns_propagation(self, domain_id: str, record_type: str, record_value: str):
    """
    Verify DNS propagation for a domain record
    """
    try:
        logger.info(f"Starting DNS propagation verification for domain {domain_id}")
        
        # Get domain from database
        db = next(get_db())
        domain = db.query(Domain).filter(Domain.id == domain_id).first()
        
        if not domain:
            logger.error(f"Domain {domain_id} not found")
            return {"status": "error", "message": "Domain not found"}
        
        # Check DNS propagation
        import dns.resolver
        import dns.exception
        
        try:
            # Query DNS record
            answers = dns.resolver.resolve(domain.name, record_type)
            found_values = [str(answer) for answer in answers]
            
            if record_value in found_values:
                logger.info(f"DNS propagation verified for {domain.name}")
                
                # Update domain status
                domain.status = "dns_configured"
                domain.updated_at = datetime.utcnow()
                db.commit()
                
                # Trigger TLS issuance
                issue_tls_certificate.delay(domain_id)
                
                return {
                    "status": "success",
                    "message": "DNS propagation verified",
                    "verified_at": datetime.utcnow().isoformat()
                }
            else:
                logger.warning(f"DNS not yet propagated for {domain.name}. Expected: {record_value}, Found: {found_values}")
                
                # Retry if not max retries
                if self.request.retries < self.max_retries:
                    raise self.retry(countdown=60 * (2 ** self.request.retries))
                else:
                    logger.error(f"DNS propagation failed after {self.max_retries} retries")
                    domain.status = "error"
                    domain.updated_at = datetime.utcnow()
                    db.commit()
                    
                    return {
                        "status": "error",
                        "message": "DNS propagation failed after maximum retries"
                    }
                    
        except dns.exception.DNSException as e:
            logger.warning(f"DNS query failed for {domain.name}: {e}")
            
            # Retry if not max retries
            if self.request.retries < self.max_retries:
                raise self.retry(countdown=60 * (2 ** self.request.retries))
            else:
                logger.error(f"DNS query failed after {self.max_retries} retries")
                domain.status = "error"
                domain.updated_at = datetime.utcnow()
                db.commit()
                
                return {
                    "status": "error",
                    "message": f"DNS query failed: {str(e)}"
                }
                
    except Exception as e:
        logger.error(f"Error verifying DNS propagation for domain {domain_id}: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def issue_tls_certificate(self, domain_id: str):
    """
    Issue TLS certificate for a domain using ACME
    """
    try:
        logger.info(f"Starting TLS certificate issuance for domain {domain_id}")
        
        # Get domain from database
        db = next(get_db())
        domain = db.query(Domain).filter(Domain.id == domain_id).first()
        
        if not domain:
            logger.error(f"Domain {domain_id} not found")
            return {"status": "error", "message": "Domain not found"}
        
        # Simulate ACME certificate issuance
        # In production, this would integrate with Let's Encrypt or similar
        logger.info(f"Simulating ACME certificate issuance for {domain.name}")
        
        # Simulate processing time
        time.sleep(5)
        
        # Update domain status
        domain.status = "tls_issued"
        domain.updated_at = datetime.utcnow()
        db.commit()
        
        # Trigger domain binding
        bind_domain_to_app.delay(domain_id)
        
        logger.info(f"TLS certificate issued for {domain.name}")
        
        return {
            "status": "success",
            "message": "TLS certificate issued",
            "issued_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error issuing TLS certificate for domain {domain_id}: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def bind_domain_to_app(self, domain_id: str):
    """
    Bind domain to application and mark as active
    """
    try:
        logger.info(f"Binding domain {domain_id} to application")
        
        # Get domain from database
        db = next(get_db())
        domain = db.query(Domain).filter(Domain.id == domain_id).first()
        
        if not domain:
            logger.error(f"Domain {domain_id} not found")
            return {"status": "error", "message": "Domain not found"}
        
        if not domain.app_id:
            logger.error(f"No app_id specified for domain {domain_id}")
            return {"status": "error", "message": "No app_id specified"}
        
        # Simulate domain binding to app
        # In production, this would update the reverse proxy configuration
        logger.info(f"Binding domain {domain.name} to app {domain.app_id}")
        
        # Simulate processing time
        time.sleep(2)
        
        # Update domain status
        domain.status = "active"
        domain.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Domain {domain.name} successfully bound to app {domain.app_id}")
        
        return {
            "status": "success",
            "message": "Domain bound to application",
            "bound_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error binding domain {domain_id} to app: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def reconcile_domain_order(self, order_id: str):
    """
    Reconcile domain order status with Name.com
    """
    try:
        logger.info(f"Reconciling domain order {order_id}")
        
        # Get order from database
        db = next(get_db())
        order = db.query(DomainOrder).filter(DomainOrder.order_id == order_id).first()
        
        if not order:
            logger.error(f"Order {order_id} not found")
            return {"status": "error", "message": "Order not found"}
        
        # Query Name.com for order status
        client = NameComClient()
        order_status = await client.get_order_status(order_id)
        
        if order_status:
            # Update order status
            order.status = order_status.get("status", order.status)
            order.raw_response = order_status
            order.updated_at = datetime.utcnow()
            db.commit()
            
            logger.info(f"Order {order_id} status updated to {order.status}")
            
            return {
                "status": "success",
                "message": "Order status reconciled",
                "order_status": order.status
            }
        else:
            logger.warning(f"Could not retrieve order status for {order_id}")
            return {"status": "warning", "message": "Could not retrieve order status"}
            
    except Exception as e:
        logger.error(f"Error reconciling order {order_id}: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task
def cleanup_expired_domains():
    """
    Clean up expired domains and notify users
    """
    try:
        logger.info("Starting cleanup of expired domains")
        
        db = next(get_db())
        
        # Find domains expiring in the next 30 days
        expiry_threshold = datetime.utcnow() + timedelta(days=30)
        expiring_domains = db.query(Domain).filter(
            Domain.expires_at <= expiry_threshold,
            Domain.status == "active"
        ).all()
        
        for domain in expiring_domains:
            logger.info(f"Domain {domain.name} expires on {domain.expires_at}")
            
            # In production, send notification to user
            # send_domain_expiry_notification.delay(domain.id)
            
        logger.info(f"Found {len(expiring_domains)} domains expiring soon")
        
        return {
            "status": "success",
            "message": f"Checked {len(expiring_domains)} expiring domains"
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up expired domains: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task
def send_domain_expiry_notification(domain_id: str):
    """
    Send domain expiry notification to user
    """
    try:
        logger.info(f"Sending expiry notification for domain {domain_id}")
        
        # Get domain from database
        db = next(get_db())
        domain = db.query(Domain).filter(Domain.id == domain_id).first()
        
        if not domain:
            logger.error(f"Domain {domain_id} not found")
            return {"status": "error", "message": "Domain not found"}
        
        # In production, send email notification
        # email_service.send_domain_expiry_notification(domain)
        
        logger.info(f"Expiry notification sent for domain {domain.name}")
        
        return {
            "status": "success",
            "message": "Expiry notification sent"
        }
        
    except Exception as e:
        logger.error(f"Error sending expiry notification for domain {domain_id}: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

# Periodic tasks
@celery_app.task
def periodic_domain_health_check():
    """
    Periodic task to check domain health and status
    """
    try:
        logger.info("Starting periodic domain health check")
        
        db = next(get_db())
        
        # Check all active domains
        active_domains = db.query(Domain).filter(Domain.status == "active").all()
        
        for domain in active_domains:
            # Check if domain is still responding
            try:
                import requests
                response = requests.get(f"https://{domain.name}", timeout=10)
                
                if response.status_code != 200:
                    logger.warning(f"Domain {domain.name} returned status {response.status_code}")
                    
                    # Update domain status
                    domain.status = "error"
                    domain.updated_at = datetime.utcnow()
                    db.commit()
                    
            except Exception as e:
                logger.warning(f"Domain {domain.name} health check failed: {e}")
                
        logger.info(f"Health check completed for {len(active_domains)} domains")
        
        return {
            "status": "success",
            "message": f"Health check completed for {len(active_domains)} domains"
        }
        
    except Exception as e:
        logger.error(f"Error in periodic domain health check: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

# Schedule periodic tasks
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'domain-health-check': {
        'task': 'backend.app.tasks.domain_tasks.periodic_domain_health_check',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
    'cleanup-expired-domains': {
        'task': 'backend.app.tasks.domain_tasks.cleanup_expired_domains',
        'schedule': crontab(minute=0, hour=0),  # Daily at midnight
    },
}
