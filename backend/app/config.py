from __future__ import annotations

import os
from functools import lru_cache
from pydantic import AnyHttpUrl, BaseModel, Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@postgres:5432/vibecaas")
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    jwt_secret: str = os.getenv("JWT_SECRET", "devsecretdevsecretdevsecretdev")
    session_secret: str = os.getenv("SESSION_SECRET", "devsecretdevsecretdevsecretdev")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    enable_gpu_support: bool = os.getenv("ENABLE_GPU_SUPPORT", "false").lower() == "true"

    # AI Provider API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")

    # Stripe Configuration
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_publishable_key: str = os.getenv("VITE_STRIPE_PUBLIC_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    stripe_pro_annual_price_id: str = os.getenv("STRIPE_PRO_ANNUAL_PRICE_ID", "")
    stripe_pro_price_id: str = os.getenv("STRIPE_PRO_PRICE_ID", "")
    stripe_starter_annual_price_id: str = os.getenv("STRIPE_STARTER_ANNUAL_PRICE_ID", "")
    stripe_starter_price_id: str = os.getenv("STRIPE_STARTER_PRICE_ID", "")

    # Live Preview Configuration
    traefik_api_url: str = os.getenv("TRAEFIK_API_URL", "http://traefik:8080")
    base_domain: str = os.getenv("BASE_DOMAIN", "vibecaas.com")

    # Storage Configuration
    s3_endpoint: str = os.getenv("S3_ENDPOINT", "http://minio:9000")
    s3_access_key: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    s3_secret_key: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    s3_bucket: str = os.getenv("S3_BUCKET", "vibecaas")

    # Monitoring Configuration
    prometheus_url: str = os.getenv("PROMETHEUS_URL", "http://prometheus:9090")
    grafana_url: str = os.getenv("GRAFANA_URL", "http://grafana:3000")

    # Name.com Configuration
    namecom_username: str = os.getenv("DEV_NAMECOM_USERNAME", "")
    namecom_api_token: str = os.getenv("DEV_NAMECOM_API_TOKEN", "")
    namecom_base_url: str = os.getenv("DEV_NAMECOM_BASE_URL", "https://api.dev.name.com")
    namecom_prod_username: str = os.getenv("PROD_NAMECOM_USERNAME", "")
    namecom_prod_api_token: str = os.getenv("PROD_NAMECOM_API_TOKEN", "")
    namecom_prod_base_url: str = os.getenv("PROD_NAMECOM_BASE_URL", "https://api.name.com")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()