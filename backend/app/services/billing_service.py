from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.billing import BillingRecord, UsageRecord
from ..schemas.billing import CreateSubscriptionRequest
from ..config import settings
import stripe
from datetime import datetime, timedelta
import json

stripe.api_key = settings.stripe_secret_key

class BillingService:
    def __init__(self, db: Session):
        self.db = db

    async def get_user_billing_records(self, user_id: int) -> List[BillingRecord]:
        """Get billing records for a user"""
        return self.db.query(BillingRecord).filter(
            BillingRecord.user_id == user_id
        ).all()

    async def get_user_usage_records(
        self, 
        user_id: int, 
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[UsageRecord]:
        """Get usage records for a user"""
        query = self.db.query(UsageRecord).filter(UsageRecord.user_id == user_id)
        
        if start_date:
            query = query.filter(UsageRecord.period_start >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(UsageRecord.period_end <= datetime.fromisoformat(end_date))
            
        return query.all()

    async def create_subscription(
        self, 
        subscription_data: CreateSubscriptionRequest, 
        user_id: int
    ) -> dict:
        """Create a new subscription"""
        try:
            # Create Stripe customer if not exists
            customer = stripe.Customer.create(
                email=subscription_data.email,
                name=subscription_data.name
            )
            
            # Create subscription
            subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{"price": subscription_data.price_id}],
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"]
            )
            
            # Save to database
            billing_record = BillingRecord(
                user_id=user_id,
                stripe_customer_id=customer.id,
                stripe_subscription_id=subscription.id,
                stripe_price_id=subscription_data.price_id,
                plan_name=subscription_data.plan_name,
                plan_type=subscription_data.plan_type,
                status=subscription.status,
                amount=subscription.items.data[0].price.unit_amount,
                currency=subscription.currency,
                current_period_start=datetime.fromtimestamp(subscription.current_period_start),
                current_period_end=datetime.fromtimestamp(subscription.current_period_end)
            )
            
            self.db.add(billing_record)
            self.db.commit()
            
            return {
                "subscription_id": subscription.id,
                "client_secret": subscription.latest_invoice.payment_intent.client_secret,
                "status": subscription.status
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")

    async def get_subscription(self, subscription_id: str, user_id: int) -> Optional[dict]:
        """Get subscription details"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.stripe_subscription_id == subscription_id,
            BillingRecord.user_id == user_id
        ).first()
        
        if not billing_record:
            return None
            
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                "id": subscription.id,
                "status": subscription.status,
                "plan_name": billing_record.plan_name,
                "amount": billing_record.amount,
                "currency": billing_record.currency,
                "current_period_start": billing_record.current_period_start,
                "current_period_end": billing_record.current_period_end
            }
        except stripe.error.StripeError:
            return None

    async def cancel_subscription(self, subscription_id: str, user_id: int) -> bool:
        """Cancel a subscription"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.stripe_subscription_id == subscription_id,
            BillingRecord.user_id == user_id
        ).first()
        
        if not billing_record:
            return False
            
        try:
            stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)
            billing_record.cancel_at_period_end = True
            self.db.commit()
            return True
        except stripe.error.StripeError:
            return False

    async def get_user_invoices(self, user_id: int) -> List[dict]:
        """Get invoices for a user"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.user_id == user_id
        ).first()
        
        if not billing_record:
            return []
            
        try:
            invoices = stripe.Invoice.list(customer=billing_record.stripe_customer_id)
            return [
                {
                    "id": invoice.id,
                    "amount": invoice.amount_paid,
                    "currency": invoice.currency,
                    "status": invoice.status,
                    "created": datetime.fromtimestamp(invoice.created),
                    "invoice_pdf": invoice.invoice_pdf
                }
                for invoice in invoices.data
            ]
        except stripe.error.StripeError:
            return []

    async def get_current_usage(self, user_id: int) -> dict:
        """Get current usage for the billing period"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.user_id == user_id,
            BillingRecord.status == "active"
        ).first()
        
        if not billing_record:
            return {"usage": 0, "limit": 0}
            
        # Calculate usage from records
        period_start = billing_record.current_period_start
        period_end = billing_record.current_period_end
        
        usage_records = self.db.query(UsageRecord).filter(
            UsageRecord.user_id == user_id,
            UsageRecord.period_start >= period_start,
            UsageRecord.period_end <= period_end
        ).all()
        
        total_usage = sum(float(record.amount) for record in usage_records)
        
        # Get plan limits
        limits = self._get_plan_limits(billing_record.plan_name)
        
        return {
            "usage": total_usage,
            "limit": limits.get("monthly_limit", 0),
            "period_start": period_start,
            "period_end": period_end
        }

    async def get_user_quotas(self, user_id: int) -> dict:
        """Get user quotas and limits"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.user_id == user_id,
            BillingRecord.status == "active"
        ).first()
        
        if not billing_record:
            return self._get_plan_limits("starter")
            
        return self._get_plan_limits(billing_record.plan_name)

    def _get_plan_limits(self, plan_name: str) -> dict:
        """Get limits for a plan"""
        limits = {
            "starter": {
                "projects": 10,
                "compute_hours": 50,
                "storage_gb": 5,
                "monthly_limit": 900  # $9.00
            },
            "pro": {
                "projects": 50,
                "compute_hours": 200,
                "storage_gb": 50,
                "monthly_limit": 2900  # $29.00
            },
            "team": {
                "projects": -1,  # Unlimited
                "compute_hours": 1000,
                "storage_gb": 500,
                "monthly_limit": 9900  # $99.00
            }
        }
        
        return limits.get(plan_name, limits["starter"])

    async def record_usage(
        self,
        user_id: int,
        resource_type: str,
        quantity: float,
        unit: str,
        project_id: Optional[int] = None
    ) -> UsageRecord:
        """Record usage for billing"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.user_id == user_id,
            BillingRecord.status == "active"
        ).first()
        
        if not billing_record:
            raise Exception("No active subscription found")
            
        # Calculate cost based on resource type
        rate = self._get_resource_rate(resource_type)
        amount = quantity * rate
        
        usage_record = UsageRecord(
            billing_record_id=billing_record.id,
            user_id=user_id,
            project_id=project_id,
            resource_type=resource_type,
            quantity=quantity,
            unit=unit,
            rate=rate,
            amount=amount,
            period_start=billing_record.current_period_start,
            period_end=billing_record.current_period_end
        )
        
        self.db.add(usage_record)
        self.db.commit()
        self.db.refresh(usage_record)
        
        return usage_record

    def _get_resource_rate(self, resource_type: str) -> float:
        """Get rate for a resource type"""
        rates = {
            "compute": 0.10,  # $0.10 per hour
            "storage": 0.05,  # $0.05 per GB
            "api_calls": 0.001,  # $0.001 per call
            "agent_time": 0.20  # $0.20 per hour
        }
        
        return rates.get(resource_type, 0.01)

    async def handle_stripe_webhook(self, request) -> dict:
        """Handle Stripe webhooks"""
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        except ValueError:
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise Exception("Invalid signature")
            
        # Handle different event types
        if event["type"] == "invoice.payment_succeeded":
            await self._handle_payment_succeeded(event["data"]["object"])
        elif event["type"] == "customer.subscription.updated":
            await self._handle_subscription_updated(event["data"]["object"])
        elif event["type"] == "customer.subscription.deleted":
            await self._handle_subscription_deleted(event["data"]["object"])
            
        return {"status": "success"}

    async def _handle_payment_succeeded(self, invoice):
        """Handle successful payment"""
        # Update billing record
        pass

    async def _handle_subscription_updated(self, subscription):
        """Handle subscription update"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.stripe_subscription_id == subscription["id"]
        ).first()
        
        if billing_record:
            billing_record.status = subscription["status"]
            self.db.commit()

    async def _handle_subscription_deleted(self, subscription):
        """Handle subscription deletion"""
        billing_record = self.db.query(BillingRecord).filter(
            BillingRecord.stripe_subscription_id == subscription["id"]
        ).first()
        
        if billing_record:
            billing_record.status = "cancelled"
            self.db.commit()
