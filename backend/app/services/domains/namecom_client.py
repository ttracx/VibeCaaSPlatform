import httpx
import base64
import logging
from typing import Dict, Any, List, Optional
from ..config import settings
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class NameComClient:
    def __init__(self):
        self.base_url = settings.namecom_base_url
        self.username = settings.namecom_username
        self.api_token = settings.namecom_api_token
        self.timeout = 30.0
        
        # Create basic auth header
        credentials = f"{self.username}:{self.api_token}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        self.headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json",
            "User-Agent": "VibeCaaS-Domains/1.0"
        }

    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make authenticated request to Name.com API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    params=params
                )
                
                # Log request for debugging (without sensitive data)
                logger.info(f"Name.com API {method} {endpoint} -> {response.status_code}")
                
                if response.status_code == 429:
                    # Rate limit - implement exponential backoff
                    retry_after = int(response.headers.get("Retry-After", 60))
                    logger.warning(f"Rate limited, waiting {retry_after} seconds")
                    await asyncio.sleep(retry_after)
                    return await self._make_request(method, endpoint, data, params)
                
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Name.com API error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Name.com API error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Name.com API request error: {e}")
            raise Exception(f"Name.com API request failed: {e}")

    async def hello(self) -> Dict[str, Any]:
        """Test API connectivity"""
        return await self._make_request("GET", "/core/v1/hello")

    async def search_domains(
        self, 
        query: str, 
        tlds: List[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search for domain availability"""
        if tlds is None:
            tlds = ["com", "ai", "dev", "io", "co"]
        
        # Name.com search endpoint
        params = {
            "keyword": query,
            "tlds": ",".join(tlds),
            "limit": min(limit, 100)
        }
        
        response = await self._make_request("GET", "/core/v1/domains", params=params)
        return response.get("domains", [])

    async def get_domain_pricing(self, domain: str) -> Dict[str, Any]:
        """Get pricing for a specific domain"""
        endpoint = f"/core/v1/domains/{domain}:getPricing"
        return await self._make_request("GET", endpoint)

    async def register_domain(self, domain_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new domain"""
        return await self._make_request("POST", "/core/v1/domains", data=domain_data)

    async def get_domain(self, domain: str) -> Dict[str, Any]:
        """Get domain details"""
        endpoint = f"/core/v1/domains/{domain}"
        return await self._make_request("GET", endpoint)

    async def get_order(self, order_id: str) -> Dict[str, Any]:
        """Get order details"""
        endpoint = f"/core/v1/orders/{order_id}"
        return await self._make_request("GET", endpoint)

    async def get_dns_records(self, domain: str) -> List[Dict[str, Any]]:
        """Get DNS records for a domain"""
        endpoint = f"/core/v1/domains/{domain}/records"
        response = await self._make_request("GET", endpoint)
        return response.get("records", [])

    async def create_dns_record(self, domain: str, record_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a DNS record"""
        endpoint = f"/core/v1/domains/{domain}/records"
        return await self._make_request("POST", endpoint, data=record_data)

    async def update_dns_record(self, domain: str, record_id: str, record_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a DNS record"""
        endpoint = f"/core/v1/domains/{domain}/records/{record_id}"
        return await self._make_request("PUT", endpoint, data=record_data)

    async def delete_dns_record(self, domain: str, record_id: str) -> Dict[str, Any]:
        """Delete a DNS record"""
        endpoint = f"/core/v1/domains/{domain}/records/{record_id}"
        return await self._make_request("DELETE", endpoint)

    async def create_url_forwarding(self, domain: str, forwarding_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create URL forwarding"""
        endpoint = f"/core/v1/domains/{domain}/urlForwarding"
        return await self._make_request("POST", endpoint, data=forwarding_data)

    async def get_url_forwarding(self, domain: str) -> List[Dict[str, Any]]:
        """Get URL forwarding rules"""
        endpoint = f"/core/v1/domains/{domain}/urlForwarding"
        response = await self._make_request("GET", endpoint)
        return response.get("urlForwardings", [])

    async def update_url_forwarding(self, domain: str, forwarding_id: str, forwarding_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update URL forwarding"""
        endpoint = f"/core/v1/domains/{domain}/urlForwarding/{forwarding_id}"
        return await self._make_request("PUT", endpoint, data=forwarding_data)

    async def delete_url_forwarding(self, domain: str, forwarding_id: str) -> Dict[str, Any]:
        """Delete URL forwarding"""
        endpoint = f"/core/v1/domains/{domain}/urlForwarding/{forwarding_id}"
        return await self._make_request("DELETE", endpoint)

    async def create_webhook_subscription(self, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create webhook subscription"""
        return await self._make_request("POST", "/core/v1/webhooks", data=subscription_data)

    async def get_webhook_subscriptions(self) -> List[Dict[str, Any]]:
        """Get webhook subscriptions"""
        response = await self._make_request("GET", "/core/v1/webhooks")
        return response.get("webhooks", [])

    async def delete_webhook_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Delete webhook subscription"""
        endpoint = f"/core/v1/webhooks/{subscription_id}"
        return await self._make_request("DELETE", endpoint)

    def _normalize_contact(self, contact: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize contact information for Name.com API"""
        return {
            "firstName": contact["first_name"],
            "lastName": contact["last_name"],
            "organization": contact.get("organization", ""),
            "address1": contact["address1"],
            "address2": contact.get("address2", ""),
            "city": contact["city"],
            "state": contact.get("state", ""),
            "postalCode": contact["postal_code"],
            "country": contact["country"],
            "phone": contact["phone"],
            "email": contact["email"]
        }

    async def register_domain_with_contacts(
        self, 
        domain: str, 
        years: int,
        privacy: bool,
        registrant_contact: Dict[str, Any],
        admin_contact: Optional[Dict[str, Any]] = None,
        tech_contact: Optional[Dict[str, Any]] = None,
        billing_contact: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Register domain with contact information"""
        domain_data = {
            "domainName": domain,
            "years": years,
            "privacy": privacy,
            "registrantContact": self._normalize_contact(registrant_contact)
        }
        
        # Add optional contacts
        if admin_contact:
            domain_data["adminContact"] = self._normalize_contact(admin_contact)
        if tech_contact:
            domain_data["techContact"] = self._normalize_contact(tech_contact)
        if billing_contact:
            domain_data["billingContact"] = self._normalize_contact(billing_contact)
        
        return await self.register_domain(domain_data)

    async def create_dns_record_for_app(
        self, 
        domain: str, 
        app_slug: str, 
        mode: str = "CNAME",
        platform_ip: Optional[str] = None,
        platform_cname: str = "apps.vibecaas.com"
    ) -> Dict[str, Any]:
        """Create DNS record for app deployment"""
        if mode == "CNAME":
            record_data = {
                "type": "CNAME",
                "host": app_slug,
                "answer": f"{app_slug}.{platform_cname}",
                "ttl": 300
            }
        elif mode == "A":
            if not platform_ip:
                raise ValueError("Platform IP required for A record")
            record_data = {
                "type": "A",
                "host": "@",  # Apex domain
                "answer": platform_ip,
                "ttl": 300
            }
        elif mode == "AAAA":
            if not platform_ip:
                raise ValueError("Platform IPv6 required for AAAA record")
            record_data = {
                "type": "AAAA",
                "host": "@",  # Apex domain
                "answer": platform_ip,
                "ttl": 300
            }
        else:
            raise ValueError(f"Unsupported DNS mode: {mode}")
        
        return await self.create_dns_record(domain, record_data)