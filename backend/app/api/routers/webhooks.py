"""
Webhook handlers for external services
Handles Name.com webhooks and other external notifications
"""

import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from ...db import get_db
from ...models.domain import Domain, DomainOrder, WebhookSubscription
from ...config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

def verify_namecom_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify Name.com webhook signature
    """
    try:
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logger.error(f"Error verifying Name.com signature: {e}")
        return False

@router.post("/namecom")
async def handle_namecom_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Handle Name.com webhook notifications
    """
    try:
        # Get raw body
        body = await request.body()
        
        # Get signature from headers
        signature = request.headers.get("X-Namecom-Signature")
        if not signature:
            logger.warning("Missing Name.com signature in webhook")
            raise HTTPException(status_code=400, detail="Missing signature")
        
        # Verify signature
        if not verify_namecom_signature(body, signature, settings.namecom_api_token):
            logger.warning("Invalid Name.com webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook data
        webhook_data = await request.json()
        
        logger.info(f"Received Name.com webhook: {webhook_data.get('type', 'unknown')}")
        
        # Process webhook based on type
        webhook_type = webhook_data.get("type")
        
        if webhook_type == "order.completed":
            await process_order_completed(webhook_data, db, background_tasks)
        elif webhook_type == "order.failed":
            await process_order_failed(webhook_data, db, background_tasks)
        elif webhook_type == "domain.transferred":
            await process_domain_transferred(webhook_data, db, background_tasks)
        elif webhook_type == "domain.expired":
            await process_domain_expired(webhook_data, db, background_tasks)
        elif webhook_type == "dns.updated":
            await process_dns_updated(webhook_data, db, background_tasks)
        else:
            logger.info(f"Unhandled webhook type: {webhook_type}")
        
        # Store webhook for audit
        webhook_subscription = WebhookSubscription(
            provider="namecom",
            subscription_id=webhook_data.get("subscription_id", "unknown"),
            topic=webhook_type,
            payload=webhook_data,
            created_at=datetime.utcnow()
        )
        db.add(webhook_subscription)
        db.commit()
        
        return {"status": "success", "message": "Webhook processed"}
        
    except Exception as e:
        logger.error(f"Error processing Name.com webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def process_order_completed(webhook_data: Dict[str, Any], db: Session, background_tasks: BackgroundTasks):
    """Process order completion webhook"""
    try:
        order_id = webhook_data.get("order_id")
        domain_name = webhook_data.get("domain")
        
        if not order_id or not domain_name:
            logger.error("Missing order_id or domain in order completed webhook")
            return
        
        # Find domain order
        order = db.query(DomainOrder).filter(DomainOrder.order_id == order_id).first()
        
        if not order:
            logger.warning(f"Order {order_id} not found in database")
            return
        
        # Update order status
        order.status = "completed"
        order.raw_response = webhook_data
        order.updated_at = datetime.utcnow()
        
        # Update domain status
        domain = order.domain
        if domain:
            domain.status = "purchased"
            domain.updated_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Order {order_id} marked as completed for domain {domain_name}")
        
        # Trigger domain setup tasks
        from ...tasks.domain_tasks import verify_dns_propagation, issue_tls_certificate
        
        if domain:
            # If domain has DNS records, verify propagation
            dns_records = db.query(DNSRecord).filter(DNSRecord.domain_id == domain.id).all()
            if dns_records:
                for record in dns_records:
                    background_tasks.add_task(
                        verify_dns_propagation.delay,
                        domain.id,
                        record.type,
                        record.answer
                    )
            else:
                # No DNS records, just issue certificate
                background_tasks.add_task(issue_tls_certificate.delay, domain.id)
        
    except Exception as e:
        logger.error(f"Error processing order completed webhook: {e}")

async def process_order_failed(webhook_data: Dict[str, Any], db: Session, background_tasks: BackgroundTasks):
    """Process order failure webhook"""
    try:
        order_id = webhook_data.get("order_id")
        error_message = webhook_data.get("error", "Unknown error")
        
        if not order_id:
            logger.error("Missing order_id in order failed webhook")
            return
        
        # Find domain order
        order = db.query(DomainOrder).filter(DomainOrder.order_id == order_id).first()
        
        if not order:
            logger.warning(f"Order {order_id} not found in database")
            return
        
        # Update order status
        order.status = "failed"
        order.raw_response = webhook_data
        order.updated_at = datetime.utcnow()
        
        # Update domain status
        domain = order.domain
        if domain:
            domain.status = "error"
            domain.updated_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Order {order_id} marked as failed: {error_message}")
        
        # In production, notify user of failure
        # notification_service.send_order_failure_notification(domain.user_id, error_message)
        
    except Exception as e:
        logger.error(f"Error processing order failed webhook: {e}")

async def process_domain_transferred(webhook_data: Dict[str, Any], db: Session, background_tasks: BackgroundTasks):
    """Process domain transfer webhook"""
    try:
        domain_name = webhook_data.get("domain")
        transfer_status = webhook_data.get("status")
        
        if not domain_name:
            logger.error("Missing domain in transfer webhook")
            return
        
        # Find domain
        domain = db.query(Domain).filter(Domain.name == domain_name).first()
        
        if not domain:
            logger.warning(f"Domain {domain_name} not found in database")
            return
        
        # Update domain status based on transfer status
        if transfer_status == "completed":
            domain.status = "active"
        elif transfer_status == "failed":
            domain.status = "error"
        
        domain.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Domain {domain_name} transfer status updated to {transfer_status}")
        
    except Exception as e:
        logger.error(f"Error processing domain transfer webhook: {e}")

async def process_domain_expired(webhook_data: Dict[str, Any], db: Session, background_tasks: BackgroundTasks):
    """Process domain expiry webhook"""
    try:
        domain_name = webhook_data.get("domain")
        expiry_date = webhook_data.get("expiry_date")
        
        if not domain_name:
            logger.error("Missing domain in expiry webhook")
            return
        
        # Find domain
        domain = db.query(Domain).filter(Domain.name == domain_name).first()
        
        if not domain:
            logger.warning(f"Domain {domain_name} not found in database")
            return
        
        # Update domain status
        domain.status = "expired"
        if expiry_date:
            domain.expires_at = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
        domain.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Domain {domain_name} marked as expired")
        
        # In production, notify user of expiry
        # notification_service.send_domain_expiry_notification(domain.user_id, domain_name)
        
    except Exception as e:
        logger.error(f"Error processing domain expiry webhook: {e}")

async def process_dns_updated(webhook_data: Dict[str, Any], db: Session, background_tasks: BackgroundTasks):
    """Process DNS update webhook"""
    try:
        domain_name = webhook_data.get("domain")
        record_type = webhook_data.get("record_type")
        record_value = webhook_data.get("record_value")
        
        if not domain_name:
            logger.error("Missing domain in DNS update webhook")
            return
        
        # Find domain
        domain = db.query(Domain).filter(Domain.name == domain_name).first()
        
        if not domain:
            logger.warning(f"Domain {domain_name} not found in database")
            return
        
        # Update or create DNS record
        dns_record = db.query(DNSRecord).filter(
            DNSRecord.domain_id == domain.id,
            DNSRecord.type == record_type
        ).first()
        
        if dns_record:
            dns_record.answer = record_value
            dns_record.updated_at = datetime.utcnow()
        else:
            dns_record = DNSRecord(
                domain_id=domain.id,
                type=record_type,
                host="@",
                answer=record_value,
                ttl=300,
                record_id=webhook_data.get("record_id"),
                created_at=datetime.utcnow()
            )
            db.add(dns_record)
        
        db.commit()
        
        logger.info(f"DNS record updated for domain {domain_name}: {record_type} = {record_value}")
        
        # Trigger DNS propagation verification
        from ...tasks.domain_tasks import verify_dns_propagation
        
        background_tasks.add_task(
            verify_dns_propagation.delay,
            domain.id,
            record_type,
            record_value
        )
        
    except Exception as e:
        logger.error(f"Error processing DNS update webhook: {e}")

@router.get("/namecom/subscriptions")
async def list_namecom_subscriptions(db: Session = Depends(get_db)):
    """List Name.com webhook subscriptions"""
    try:
        subscriptions = db.query(WebhookSubscription).filter(
            WebhookSubscription.provider == "namecom"
        ).order_by(WebhookSubscription.created_at.desc()).limit(100).all()
        
        return {
            "subscriptions": [
                {
                    "id": sub.id,
                    "subscription_id": sub.subscription_id,
                    "topic": sub.topic,
                    "created_at": sub.created_at.isoformat(),
                    "payload": sub.payload
                }
                for sub in subscriptions
            ]
        }
        
    except Exception as e:
        logger.error(f"Error listing Name.com subscriptions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/namecom/test")
async def test_namecom_webhook(
    webhook_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Test webhook processing (for development)"""
    try:
        logger.info(f"Processing test webhook: {webhook_data}")
        
        # Process as if it were a real webhook
        webhook_type = webhook_data.get("type", "test")
        
        if webhook_type == "order.completed":
            await process_order_completed(webhook_data, db, background_tasks)
        elif webhook_type == "order.failed":
            await process_order_failed(webhook_data, db, background_tasks)
        elif webhook_type == "domain.transferred":
            await process_domain_transferred(webhook_data, db, background_tasks)
        elif webhook_type == "domain.expired":
            await process_domain_expired(webhook_data, db, background_tasks)
        elif webhook_type == "dns.updated":
            await process_dns_updated(webhook_data, db, background_tasks)
        
        return {"status": "success", "message": "Test webhook processed"}
        
    except Exception as e:
        logger.error(f"Error processing test webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
