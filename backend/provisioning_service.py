"""
VibeCaaS Provisioning Service
Handles automatic provisioning of user containers on NVIDIA Cloud
"""

import os
import asyncio
import uuid
import json
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

import aiohttp
import asyncpg
import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from kubernetes_asyncio import client, config
from kubernetes_asyncio.client.rest import ApiException
import jwt
import yaml
import boto3

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/vibecaas")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    NGC_API_KEY = os.getenv("NGC_API_KEY")
    NGC_ORG = os.getenv("NGC_ORG", "vibecaas")
    NGC_REGISTRY = os.getenv("NGC_REGISTRY", "nvcr.io")
    KUBERNETES_CONFIG = os.getenv("KUBERNETES_CONFIG", "~/.kube/config")
    JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_ALGORITHM = "HS256"
    S3_BUCKET = os.getenv("S3_BUCKET", "vibecaas-user-data")
    DOMAIN_SUFFIX = os.getenv("DOMAIN_SUFFIX", ".vibecaas.com")
    METRICS_ENABLED = os.getenv("METRICS_ENABLED", "true").lower() == "true"

# Enums
class AppStatus(str, Enum):
    CREATING = "creating"
    BUILDING = "building"
    DEPLOYING = "deploying"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"
    TERMINATED = "terminated"

class UserTier(str, Enum):
    FREE = "free"
    HOBBY = "hobby"
    PRO = "pro"
    TEAM = "team"
    ENTERPRISE = "enterprise"

class GPUType(str, Enum):
    NONE = "none"
    SHARED_T4 = "shared-t4"
    DEDICATED_T4 = "dedicated-t4"
    V100 = "v100"
    A100 = "a100"
    H100 = "h100"

# Data Models
@dataclass
class ResourceQuota:
    cpu_cores: float
    memory_gb: float
    gpu_type: GPUType
    gpu_hours_per_month: float
    storage_gb: int
    bandwidth_gb: int
    max_apps: int
    
    @classmethod
    def for_tier(cls, tier: UserTier) -> 'ResourceQuota':
        quotas = {
            UserTier.FREE: cls(0.5, 0.5, GPUType.NONE, 0, 1, 10, 3),
            UserTier.HOBBY: cls(1.0, 2.0, GPUType.SHARED_T4, 30, 5, 50, 5),
            UserTier.PRO: cls(2.0, 8.0, GPUType.DEDICATED_T4, 240, 20, 200, 20),
            UserTier.TEAM: cls(4.0, 16.0, GPUType.DEDICATED_T4, 720, 100, 1000, 50),
            UserTier.ENTERPRISE: cls(16.0, 64.0, GPUType.A100, 999999, 1000, 10000, 999),
        }
        return quotas.get(tier, quotas[UserTier.FREE])

class CreateAppRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    framework: str = Field(default="python")
    runtime_version: str = Field(default="3.11")
    gpu_enabled: bool = Field(default=False)
    environment_vars: Dict[str, str] = Field(default_factory=dict)
    template: Optional[str] = None

class AppResponse(BaseModel):
    id: str
    name: str
    status: AppStatus
    url: Optional[str]
    created_at: datetime
    framework: str
    runtime_version: str
    gpu_enabled: bool
    k8s_namespace: str
    container_image: str

class DeploymentConfig(BaseModel):
    app_id: str
    source_type: str  # "git", "upload", "template"
    source_url: Optional[str]
    build_command: Optional[str]
    start_command: str
    port: int = 8000
    health_check_path: str = "/health"

# FastAPI App
app = FastAPI(title="VibeCaaS Provisioning Service", version="1.0.0")
security = HTTPBearer()

# Global connections
db_pool: Optional[asyncpg.Pool] = None
redis_client: Optional[redis.Redis] = None
k8s_v1: Optional[client.CoreV1Api] = None
k8s_apps: Optional[client.AppsV1Api] = None
k8s_networking: Optional[client.NetworkingV1Api] = None

# Kubernetes Templates
class K8sTemplates:
    @staticmethod
    def namespace(name: str, user_id: str) -> dict:
        return {
            "apiVersion": "v1",
            "kind": "Namespace",
            "metadata": {
                "name": name,
                "labels": {
                    "vibecaas.com/user-id": user_id,
                    "vibecaas.com/managed": "true"
                }
            }
        }
    
    @staticmethod
    def resource_quota(namespace: str, quota: ResourceQuota) -> dict:
        return {
            "apiVersion": "v1",
            "kind": "ResourceQuota",
            "metadata": {
                "name": "user-quota",
                "namespace": namespace
            },
            "spec": {
                "hard": {
                    "requests.cpu": str(quota.cpu_cores),
                    "requests.memory": f"{quota.memory_gb}Gi",
                    "persistentvolumeclaims": "5",
                    "services.loadbalancers": "1",
                }
            }
        }
    
    @staticmethod
    def deployment(app_id: str, namespace: str, image: str, config: DeploymentConfig, 
                  gpu_enabled: bool = False) -> dict:
        deployment = {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {
                "name": f"app-{app_id}",
                "namespace": namespace,
                "labels": {
                    "vibecaas.com/app-id": app_id,
                    "app": f"app-{app_id}"
                }
            },
            "spec": {
                "replicas": 1,
                "selector": {
                    "matchLabels": {
                        "app": f"app-{app_id}"
                    }
                },
                "template": {
                    "metadata": {
                        "labels": {
                            "app": f"app-{app_id}",
                            "vibecaas.com/app-id": app_id
                        }
                    },
                    "spec": {
                        "containers": [{
                            "name": "app",
                            "image": image,
                            "ports": [{
                                "containerPort": config.port
                            }],
                            "env": [
                                {"name": "PORT", "value": str(config.port)},
                                {"name": "APP_ID", "value": app_id}
                            ],
                            "resources": {
                                "requests": {
                                    "memory": "256Mi",
                                    "cpu": "100m"
                                },
                                "limits": {
                                    "memory": "2Gi",
                                    "cpu": "1000m"
                                }
                            },
                            "livenessProbe": {
                                "httpGet": {
                                    "path": config.health_check_path,
                                    "port": config.port
                                },
                                "initialDelaySeconds": 30,
                                "periodSeconds": 10
                            },
                            "readinessProbe": {
                                "httpGet": {
                                    "path": config.health_check_path,
                                    "port": config.port
                                },
                                "initialDelaySeconds": 5,
                                "periodSeconds": 5
                            }
                        }],
                        "securityContext": {
                            "runAsNonRoot": True,
                            "runAsUser": 1000,
                            "fsGroup": 1000
                        }
                    }
                }
            }
        }
        
        # Add GPU resources if enabled
        if gpu_enabled:
            container = deployment["spec"]["template"]["spec"]["containers"][0]
            container["resources"]["limits"]["nvidia.com/gpu"] = "1"
            
        return deployment
    
    @staticmethod
    def service(app_id: str, namespace: str, port: int) -> dict:
        return {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
                "name": f"app-{app_id}-service",
                "namespace": namespace,
                "labels": {
                    "vibecaas.com/app-id": app_id
                }
            },
            "spec": {
                "type": "ClusterIP",
                "selector": {
                    "app": f"app-{app_id}"
                },
                "ports": [{
                    "port": 80,
                    "targetPort": port,
                    "protocol": "TCP"
                }]
            }
        }
    
    @staticmethod
    def ingress(app_id: str, namespace: str, subdomain: str) -> dict:
        return {
            "apiVersion": "networking.k8s.io/v1",
            "kind": "Ingress",
            "metadata": {
                "name": f"app-{app_id}-ingress",
                "namespace": namespace,
                "annotations": {
                    "kubernetes.io/ingress.class": "nginx",
                    "cert-manager.io/cluster-issuer": "letsencrypt-prod",
                    "nginx.ingress.kubernetes.io/proxy-body-size": "50m",
                    "nginx.ingress.kubernetes.io/proxy-read-timeout": "3600",
                    "nginx.ingress.kubernetes.io/proxy-send-timeout": "3600"
                },
                "labels": {
                    "vibecaas.com/app-id": app_id
                }
            },
            "spec": {
                "tls": [{
                    "hosts": [f"{subdomain}{Config.DOMAIN_SUFFIX}"],
                    "secretName": f"app-{app_id}-tls"
                }],
                "rules": [{
                    "host": f"{subdomain}{Config.DOMAIN_SUFFIX}",
                    "http": {
                        "paths": [{
                            "path": "/",
                            "pathType": "Prefix",
                            "backend": {
                                "service": {
                                    "name": f"app-{app_id}-service",
                                    "port": {
                                        "number": 80
                                    }
                                }
                            }
                        }]
                    }
                }]
            }
        }

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "provisioning"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)