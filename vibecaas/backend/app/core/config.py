"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "VibeCaaS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://vibecaas:vibecaas@localhost:5432/vibecaas"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://vibecaas.com",
        "https://app.vibecaas.com"
    ]
    
    # Kubernetes
    K8S_IN_CLUSTER: bool = os.getenv("K8S_IN_CLUSTER", "False").lower() == "true"
    K8S_NAMESPACE: str = os.getenv("K8S_NAMESPACE", "vibecaas")
    
    # Container Registry
    REGISTRY_URL: str = os.getenv("REGISTRY_URL", "localhost:5000")
    REGISTRY_USERNAME: Optional[str] = os.getenv("REGISTRY_USERNAME")
    REGISTRY_PASSWORD: Optional[str] = os.getenv("REGISTRY_PASSWORD")
    
    # Storage
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "http://localhost:9000")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "minioadmin")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "minioadmin")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "vibecaas")
    
    # Email
    SENDGRID_API_KEY: Optional[str] = os.getenv("SENDGRID_API_KEY")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@vibecaas.com")
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = True
    OPENTELEMETRY_ENABLED: bool = True
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # GPU Management
    GPU_ENABLED: bool = os.getenv("GPU_ENABLED", "True").lower() == "true"
    GPU_TYPES: List[str] = ["T4", "V100", "A100", "H100"]
    
    # User Tiers
    TIER_LIMITS = {
        "free": {"apps": 3, "cpu": 0.5, "memory": "512Mi", "storage": "1Gi", "gpu": False},
        "hobby": {"apps": 5, "cpu": 1, "memory": "2Gi", "storage": "5Gi", "gpu": "shared"},
        "pro": {"apps": 20, "cpu": 2, "memory": "8Gi", "storage": "20Gi", "gpu": "T4"},
        "team": {"apps": 50, "cpu": 4, "memory": "16Gi", "storage": "100Gi", "gpu": "pool"},
        "enterprise": {"apps": -1, "cpu": -1, "memory": "-1", "storage": "-1", "gpu": "dedicated"}
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()