from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...models.billing import BillingRecord, UsageRecord
from ...schemas.billing import BillingRecordResponse, UsageRecordResponse, CreateSubscriptionRequest
from ...services.billing_service import BillingService

router = APIRouter()

@router.get("/billing/records", response_model=List[BillingRecordResponse])
async def list_billing_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List billing records for the current user"""
    billing_service = BillingService(db)
    records = await billing_service.get_user_billing_records(current_user.id)
    return records

@router.get("/billing/usage", response_model=List[UsageRecordResponse])
async def list_usage_records(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List usage records for the current user"""
    billing_service = BillingService(db)
    records = await billing_service.get_user_usage_records(
        current_user.id, start_date, end_date
    )
    return records

@router.post("/billing/subscriptions")
async def create_subscription(
    subscription: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    billing_service = BillingService(db)
    result = await billing_service.create_subscription(subscription, current_user.id)
    return result

@router.get("/billing/subscriptions/{subscription_id}")
async def get_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get subscription details"""
    billing_service = BillingService(db)
    subscription = await billing_service.get_subscription(subscription_id, current_user.id)
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription

@router.post("/billing/subscriptions/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a subscription"""
    billing_service = BillingService(db)
    success = await billing_service.cancel_subscription(subscription_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return {"message": "Subscription cancelled successfully"}

@router.get("/billing/invoices")
async def list_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List invoices for the current user"""
    billing_service = BillingService(db)
    invoices = await billing_service.get_user_invoices(current_user.id)
    return invoices

@router.get("/billing/current-usage")
async def get_current_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current usage for the billing period"""
    billing_service = BillingService(db)
    usage = await billing_service.get_current_usage(current_user.id)
    return usage

@router.get("/billing/quotas")
async def get_quotas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current quotas and limits"""
    billing_service = BillingService(db)
    quotas = await billing_service.get_user_quotas(current_user.id)
    return quotas

@router.post("/billing/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks"""
    billing_service = BillingService(db)
    result = await billing_service.handle_stripe_webhook(request)
    return result

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass
