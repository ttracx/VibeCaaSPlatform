"""
Billing service for subscription and payment management
"""

import stripe
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User, UserTier
from app.models.billing import BillingHistory, Subscription, Invoice

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class BillingService:
    """Service for handling billing operations"""
    
    # Pricing configuration
    TIER_PRICES = {
        UserTier.FREE: {
            "price": 0,
            "stripe_price_id": None,
            "features": {
                "apps": 3,
                "cpu": 0.5,
                "memory": 512,
                "storage": 1024,
                "gpu": False
            }
        },
        UserTier.HOBBY: {
            "price": 10,
            "stripe_price_id": "price_hobby_monthly",
            "features": {
                "apps": 5,
                "cpu": 1,
                "memory": 2048,
                "storage": 5120,
                "gpu": "shared"
            }
        },
        UserTier.PRO: {
            "price": 50,
            "stripe_price_id": "price_pro_monthly",
            "features": {
                "apps": 20,
                "cpu": 2,
                "memory": 8192,
                "storage": 20480,
                "gpu": "T4"
            }
        },
        UserTier.TEAM: {
            "price": 200,
            "stripe_price_id": "price_team_monthly",
            "features": {
                "apps": 50,
                "cpu": 4,
                "memory": 16384,
                "storage": 102400,
                "gpu": "pool"
            }
        },
        UserTier.ENTERPRISE: {
            "price": None,  # Custom pricing
            "stripe_price_id": None,
            "features": {
                "apps": -1,  # Unlimited
                "cpu": -1,
                "memory": -1,
                "storage": -1,
                "gpu": "dedicated"
            }
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_customer(self, user: User) -> str:
        """Create Stripe customer for user"""
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.full_name,
                metadata={
                    "user_id": user.id,
                    "username": user.username
                }
            )
            
            # Update user with Stripe customer ID
            user.stripe_customer_id = customer.id
            self.db.commit()
            
            return customer.id
        except stripe.error.StripeError as e:
            print(f"Stripe error creating customer: {e}")
            raise Exception("Failed to create customer")
    
    def create_subscription(self, user: User, tier: UserTier) -> Dict:
        """Create or update subscription for user"""
        try:
            # Get or create Stripe customer
            if not user.stripe_customer_id:
                customer_id = self.create_customer(user)
            else:
                customer_id = user.stripe_customer_id
            
            # Get price ID for tier
            price_id = self.TIER_PRICES[tier]["stripe_price_id"]
            
            if not price_id:
                # Free tier, cancel any existing subscription
                if user.stripe_subscription_id:
                    self.cancel_subscription(user)
                
                # Update user tier
                user.tier = tier
                self._update_user_quotas(user, tier)
                self.db.commit()
                
                return {"status": "success", "tier": tier.value}
            
            # Check for existing subscription
            if user.stripe_subscription_id:
                # Update existing subscription
                subscription = stripe.Subscription.modify(
                    user.stripe_subscription_id,
                    items=[{
                        "price": price_id
                    }]
                )
            else:
                # Create new subscription
                subscription = stripe.Subscription.create(
                    customer=customer_id,
                    items=[{
                        "price": price_id
                    }],
                    metadata={
                        "user_id": user.id,
                        "tier": tier.value
                    }
                )
                user.stripe_subscription_id = subscription.id
            
            # Update user tier and quotas
            user.tier = tier
            self._update_user_quotas(user, tier)
            
            # Create subscription record
            sub_record = Subscription(
                user_id=user.id,
                stripe_subscription_id=subscription.id,
                tier=tier,
                status=subscription.status,
                current_period_start=datetime.fromtimestamp(subscription.current_period_start),
                current_period_end=datetime.fromtimestamp(subscription.current_period_end)
            )
            self.db.add(sub_record)
            
            # Create billing history entry
            billing_entry = BillingHistory(
                user_id=user.id,
                type="subscription",
                amount=self.TIER_PRICES[tier]["price"],
                description=f"Subscription to {tier.value} tier",
                status="success"
            )
            self.db.add(billing_entry)
            
            self.db.commit()
            
            return {
                "status": "success",
                "subscription_id": subscription.id,
                "tier": tier.value
            }
            
        except stripe.error.StripeError as e:
            print(f"Stripe error creating subscription: {e}")
            raise Exception("Failed to create subscription")
    
    def cancel_subscription(self, user: User) -> bool:
        """Cancel user's subscription"""
        try:
            if not user.stripe_subscription_id:
                return True
            
            # Cancel subscription at period end
            subscription = stripe.Subscription.modify(
                user.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            # Update subscription record
            sub_record = self.db.query(Subscription).filter(
                Subscription.stripe_subscription_id == user.stripe_subscription_id
            ).first()
            
            if sub_record:
                sub_record.status = "canceling"
                sub_record.cancel_at = datetime.fromtimestamp(subscription.cancel_at)
            
            # Create billing history entry
            billing_entry = BillingHistory(
                user_id=user.id,
                type="cancellation",
                amount=0,
                description="Subscription cancellation requested",
                status="success"
            )
            self.db.add(billing_entry)
            
            self.db.commit()
            return True
            
        except stripe.error.StripeError as e:
            print(f"Stripe error canceling subscription: {e}")
            return False
    
    def get_usage(self, user: User) -> Dict:
        """Get current usage statistics for user"""
        from app.models.application import Application
        
        # Get application count
        app_count = self.db.query(Application).filter(
            Application.owner_id == user.id,
            Application.status != "deleted"
        ).count()
        
        # Calculate resource usage
        apps = self.db.query(Application).filter(
            Application.owner_id == user.id,
            Application.status != "deleted"
        ).all()
        
        total_cpu = sum(app.cpu_limit for app in apps)
        total_memory = sum(app.memory_limit for app in apps)
        total_storage = sum(app.storage_limit for app in apps)
        gpu_count = sum(1 for app in apps if app.gpu_enabled)
        
        # Get tier limits
        tier_features = self.TIER_PRICES[user.tier]["features"]
        
        return {
            "tier": user.tier.value,
            "usage": {
                "apps": {
                    "used": app_count,
                    "limit": tier_features["apps"],
                    "percentage": (app_count / tier_features["apps"] * 100) if tier_features["apps"] > 0 else 0
                },
                "cpu": {
                    "used": total_cpu / 1000,  # Convert to cores
                    "limit": tier_features["cpu"],
                    "percentage": (total_cpu / 1000 / tier_features["cpu"] * 100) if tier_features["cpu"] > 0 else 0
                },
                "memory": {
                    "used": total_memory,
                    "limit": tier_features["memory"],
                    "percentage": (total_memory / tier_features["memory"] * 100) if tier_features["memory"] > 0 else 0
                },
                "storage": {
                    "used": total_storage,
                    "limit": tier_features["storage"],
                    "percentage": (total_storage / tier_features["storage"] * 100) if tier_features["storage"] > 0 else 0
                },
                "gpu": {
                    "used": gpu_count,
                    "available": tier_features["gpu"]
                }
            }
        }
    
    def get_invoices(self, user: User, limit: int = 10) -> List[Dict]:
        """Get user's invoice history"""
        try:
            if not user.stripe_customer_id:
                return []
            
            invoices = stripe.Invoice.list(
                customer=user.stripe_customer_id,
                limit=limit
            )
            
            return [
                {
                    "id": invoice.id,
                    "amount": invoice.amount_paid / 100,  # Convert from cents
                    "currency": invoice.currency,
                    "status": invoice.status,
                    "date": datetime.fromtimestamp(invoice.created).isoformat(),
                    "pdf_url": invoice.invoice_pdf,
                    "description": invoice.description or f"{user.tier.value} tier subscription"
                }
                for invoice in invoices
            ]
        except stripe.error.StripeError as e:
            print(f"Stripe error fetching invoices: {e}")
            return []
    
    def process_webhook(self, payload: Dict, signature: str) -> bool:
        """Process Stripe webhook events"""
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            
            # Handle different event types
            if event.type == "customer.subscription.updated":
                self._handle_subscription_updated(event.data.object)
            elif event.type == "customer.subscription.deleted":
                self._handle_subscription_deleted(event.data.object)
            elif event.type == "invoice.payment_succeeded":
                self._handle_payment_succeeded(event.data.object)
            elif event.type == "invoice.payment_failed":
                self._handle_payment_failed(event.data.object)
            
            return True
            
        except stripe.error.SignatureVerificationError:
            print("Invalid webhook signature")
            return False
        except Exception as e:
            print(f"Error processing webhook: {e}")
            return False
    
    def _update_user_quotas(self, user: User, tier: UserTier):
        """Update user resource quotas based on tier"""
        features = self.TIER_PRICES[tier]["features"]
        
        user.max_apps = features["apps"] if features["apps"] != -1 else 999999
        user.max_cpu = features["cpu"] * 1000 if features["cpu"] != -1 else 999999  # Convert to millicores
        user.max_memory = features["memory"] if features["memory"] != -1 else 999999
        user.max_storage = features["storage"] if features["storage"] != -1 else 999999
        user.gpu_enabled = bool(features["gpu"])
        user.gpu_type = features["gpu"] if isinstance(features["gpu"], str) else None
    
    def _handle_subscription_updated(self, subscription):
        """Handle subscription update webhook"""
        user_id = subscription.metadata.get("user_id")
        if not user_id:
            return
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        # Update subscription record
        sub_record = self.db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription.id
        ).first()
        
        if sub_record:
            sub_record.status = subscription.status
            sub_record.current_period_start = datetime.fromtimestamp(subscription.current_period_start)
            sub_record.current_period_end = datetime.fromtimestamp(subscription.current_period_end)
            self.db.commit()
    
    def _handle_subscription_deleted(self, subscription):
        """Handle subscription deletion webhook"""
        user_id = subscription.metadata.get("user_id")
        if not user_id:
            return
        
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        # Downgrade to free tier
        user.tier = UserTier.FREE
        user.stripe_subscription_id = None
        self._update_user_quotas(user, UserTier.FREE)
        
        # Update subscription record
        sub_record = self.db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription.id
        ).first()
        
        if sub_record:
            sub_record.status = "canceled"
            sub_record.ended_at = datetime.utcnow()
        
        self.db.commit()
    
    def _handle_payment_succeeded(self, invoice):
        """Handle successful payment webhook"""
        customer_id = invoice.customer
        
        user = self.db.query(User).filter(
            User.stripe_customer_id == customer_id
        ).first()
        
        if not user:
            return
        
        # Create invoice record
        invoice_record = Invoice(
            user_id=user.id,
            stripe_invoice_id=invoice.id,
            amount=invoice.amount_paid / 100,
            currency=invoice.currency,
            status="paid",
            paid_at=datetime.fromtimestamp(invoice.status_transitions.paid_at)
        )
        self.db.add(invoice_record)
        
        # Create billing history entry
        billing_entry = BillingHistory(
            user_id=user.id,
            type="payment",
            amount=invoice.amount_paid / 100,
            description=f"Payment for {user.tier.value} tier subscription",
            status="success"
        )
        self.db.add(billing_entry)
        
        self.db.commit()
    
    def _handle_payment_failed(self, invoice):
        """Handle failed payment webhook"""
        customer_id = invoice.customer
        
        user = self.db.query(User).filter(
            User.stripe_customer_id == customer_id
        ).first()
        
        if not user:
            return
        
        # Create billing history entry
        billing_entry = BillingHistory(
            user_id=user.id,
            type="payment",
            amount=invoice.amount_due / 100,
            description=f"Failed payment for {user.tier.value} tier subscription",
            status="failed"
        )
        self.db.add(billing_entry)
        
        self.db.commit()
        
        # TODO: Send notification email to user