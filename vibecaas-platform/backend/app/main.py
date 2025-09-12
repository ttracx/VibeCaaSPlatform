"""
VibeCaaS Backend API Service
Main FastAPI application for managing user apps and containers
"""

import os
import asyncio
import uuid
import json
import docker
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext
import jwt
import redis
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi.responses import Response

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://vibecaas_user:vibecaas_dev_password@localhost:5432/vibecaas")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis configuration
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

# Docker client
try:
    docker_client = docker.from_env()
except:
    docker_client = None
    logger.warning("Docker client not available")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Metrics
app_created_counter = Counter('vibecaas_apps_created_total', 'Total number of apps created')
app_action_histogram = Histogram('vibecaas_app_action_duration_seconds', 'App action duration')
active_apps_gauge = Gauge('vibecaas_active_apps', 'Number of active apps')

# ====================
# Database Models
# ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    tier = Column(String, default="free")
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    apps = relationship("App", back_populates="user", cascade="all, delete-orphan")

class App(Base):
    __tablename__ = "apps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    subdomain = Column(String, unique=True, nullable=False)
    framework = Column(String)
    runtime_version = Column(String)
    status = Column(String, default="creating")
    container_id = Column(String)
    port = Column(Integer, default=8000)
    url = Column(String)
    gpu_enabled = Column(Boolean, default=False)
    gpu_type = Column(String)
    cpu_limit = Column(Float, default=0.5)
    memory_limit = Column(String, default="512M")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_deployed = Column(DateTime)
    environment_vars = Column(JSON, default={})
    
    user = relationship("User", back_populates="apps")
    metrics = relationship("AppMetric", back_populates="app", cascade="all, delete-orphan")

class AppMetric(Base):
    __tablename__ = "app_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    app_id = Column(UUID(as_uuid=True), ForeignKey("apps.id"), nullable=False)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    requests_count = Column(Integer)
    error_count = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    app = relationship("App", back_populates="metrics")

# Create tables
Base.metadata.create_all(bind=engine)

# ====================
# Pydantic Schemas
# ====================

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    tier: str
    created_at: datetime

class AppCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    framework: str = "python"
    runtime_version: str = "3.11"
    gpu_enabled: bool = False
    gpu_type: Optional[str] = None
    environment_vars: Dict[str, str] = {}
    template: str = "blank"

class AppResponse(BaseModel):
    id: str
    name: str
    subdomain: str
    framework: str
    status: str
    url: Optional[str]
    gpu_enabled: bool
    created_at: datetime
    cpu_limit: float
    memory_limit: str

class AppAction(BaseModel):
    action: str  # start, stop, restart, delete

class ResourceUsage(BaseModel):
    cpu: Dict[str, float]
    memory: Dict[str, float]
    storage: Dict[str, float]
    gpu: Dict[str, int]
    apps: Dict[str, int]

# ====================
# Utility Functions
# ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# ====================
# Container Management
# ====================

class ContainerManager:
    def __init__(self):
        self.docker_client = docker_client
        self.network_name = "vibecaas-network"
        self.registry = os.getenv("DOCKER_REGISTRY", "localhost:5000")
        
        # Ensure network exists
        if self.docker_client:
            try:
                self.docker_client.networks.get(self.network_name)
            except docker.errors.NotFound:
                self.docker_client.networks.create(self.network_name, driver="bridge")
            except:
                pass
    
    def create_dockerfile(self, framework: str, template: str) -> str:
        """Generate Dockerfile based on framework and template"""
        dockerfiles = {
            "python": """
FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir flask gunicorn
COPY . .
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
""",
            "nodejs": """
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
""",
            "go": """
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8000
CMD ["./main"]
"""
        }
        return dockerfiles.get(framework, dockerfiles["python"])
    
    def create_starter_code(self, framework: str, template: str) -> Dict[str, str]:
        """Generate starter code files"""
        starters = {
            "python": {
                "app.py": """
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        "message": "Hello from VibeCaaS!",
        "framework": "Python/Flask"
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
"""
            },
            "nodejs": {
                "server.js": """
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.json({
        message: 'Hello from VibeCaaS!',
        framework: 'Node.js/Express'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
""",
                "package.json": """
{
    "name": "vibecaas-app",
    "version": "1.0.0",
    "main": "server.js",
    "dependencies": {
        "express": "^4.18.0"
    }
}
"""
            }
        }
        return starters.get(framework, starters["python"])
    
    async def build_and_run_container(self, app: App, user: User) -> str:
        """Build and run a container for the app"""
        if not self.docker_client:
            logger.warning("Docker client not available, skipping container creation")
            return "simulated-container-id"
            
        try:
            # Create unique container name
            container_name = f"vibecaas-{user.username}-{app.name}"
            image_name = f"{self.registry}/vibecaas/{app.id}:latest"
            
            # For local development, use a pre-built image
            # In production, you would build from user code
            base_images = {
                "python": "python:3.11-slim",
                "nodejs": "node:18-alpine",
                "go": "golang:1.21-alpine"
            }
            
            base_image = base_images.get(app.framework, "python:3.11-slim")
            
            # Run container
            container = self.docker_client.containers.run(
                base_image,
                name=container_name,
                detach=True,
                network=self.network_name,
                environment={
                    "APP_ID": str(app.id),
                    "PORT": str(app.port),
                    **app.environment_vars
                },
                labels={
                    "vibecaas.app.id": str(app.id),
                    "vibecaas.user.id": str(user.id),
                    "vibecaas.app.name": app.name
                },
                command="python -m http.server 8000" if app.framework == "python" else "node -e 'require(\"http\").createServer((req,res)=>res.end(\"Hello from VibeCaaS\")).listen(8000)'",
                ports={f"{app.port}/tcp": None},
                mem_limit=app.memory_limit,
                cpu_quota=int(app.cpu_limit * 100000),
                restart_policy={"Name": "unless-stopped"}
            )
            
            return container.id
            
        except Exception as e:
            logger.error(f"Failed to create container: {e}")
            return "simulated-container-id"
    
    async def stop_container(self, container_id: str):
        """Stop a container"""
        if not self.docker_client:
            return
            
        try:
            container = self.docker_client.containers.get(container_id)
            container.stop()
        except docker.errors.NotFound:
            logger.warning(f"Container {container_id} not found")
        except Exception as e:
            logger.error(f"Failed to stop container: {e}")
    
    async def start_container(self, container_id: str):
        """Start a stopped container"""
        if not self.docker_client:
            return
            
        try:
            container = self.docker_client.containers.get(container_id)
            container.start()
        except docker.errors.NotFound:
            logger.warning(f"Container {container_id} not found")
        except Exception as e:
            logger.error(f"Failed to start container: {e}")
    
    async def delete_container(self, container_id: str):
        """Delete a container"""
        if not self.docker_client:
            return
            
        try:
            container = self.docker_client.containers.get(container_id)
            container.remove(force=True)
        except docker.errors.NotFound:
            logger.warning(f"Container {container_id} not found")
        except Exception as e:
            logger.error(f"Failed to delete container: {e}")
    
    async def get_container_logs(self, container_id: str, lines: int = 100) -> str:
        """Get container logs"""
        if not self.docker_client:
            return "Container logs (simulated)"
            
        try:
            container = self.docker_client.containers.get(container_id)
            logs = container.logs(tail=lines, timestamps=True).decode('utf-8')
            return logs
        except docker.errors.NotFound:
            return "Container not found"
        except Exception as e:
            logger.error(f"Failed to get logs: {e}")
            return f"Error getting logs: {e}"
    
    async def get_container_stats(self, container_id: str) -> Dict:
        """Get container resource usage stats"""
        if not self.docker_client:
            return {
                "cpu_percent": 12.5,
                "memory_usage_mb": 256,
                "memory_limit_mb": 512,
                "network_rx_bytes": 1024000,
                "network_tx_bytes": 512000
            }
            
        try:
            container = self.docker_client.containers.get(container_id)
            stats = container.stats(stream=False)
            
            # Calculate CPU percentage
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
            cpu_percent = (cpu_delta / system_delta) * 100.0 if system_delta > 0 else 0
            
            # Calculate memory usage
            memory_usage = stats['memory_stats'].get('usage', 0) / (1024 * 1024)  # Convert to MB
            memory_limit = stats['memory_stats'].get('limit', 0) / (1024 * 1024)
            
            return {
                "cpu_percent": round(cpu_percent, 2),
                "memory_usage_mb": round(memory_usage, 2),
                "memory_limit_mb": round(memory_limit, 2),
                "network_rx_bytes": stats['networks']['eth0']['rx_bytes'] if 'networks' in stats else 0,
                "network_tx_bytes": stats['networks']['eth0']['tx_bytes'] if 'networks' in stats else 0
            }
        except Exception as e:
            logger.error(f"Failed to get container stats: {e}")
            return {}

# Initialize container manager
container_manager = ContainerManager()

# ====================
# FastAPI Application
# ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting VibeCaaS Backend API")
    yield
    # Shutdown
    logger.info("Shutting down VibeCaaS Backend API")

app = FastAPI(
    title="VibeCaaS API",
    description="Platform-as-a-Service API for deploying containerized applications",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================
# API Routes
# ====================

@app.get("/")
async def root():
    return {
        "name": "VibeCaaS API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")

# ====================
# Authentication Routes
# ====================

@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    hashed_password = pwd_context.hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        tier=user.tier,
        created_at=user.created_at
    )

@app.post("/api/v1/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            tier=user.tier,
            created_at=user.created_at
        )
    }

@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        tier=current_user.tier,
        created_at=current_user.created_at
    )

# ====================
# App Management Routes
# ====================

@app.post("/api/v1/apps", response_model=AppResponse)
async def create_app(
    app_data: AppCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check user's app limit based on tier
    tier_limits = {
        "free": 3,
        "hobby": 5,
        "pro": 20,
        "team": 50,
        "enterprise": 999
    }
    
    user_apps_count = db.query(App).filter(App.user_id == current_user.id).count()
    if user_apps_count >= tier_limits.get(current_user.tier, 3):
        raise HTTPException(status_code=403, detail="App limit reached for your tier")
    
    # Create app record
    subdomain = f"{app_data.name}-{current_user.username}"
    app = App(
        user_id=current_user.id,
        name=app_data.name,
        subdomain=subdomain,
        framework=app_data.framework,
        runtime_version=app_data.runtime_version,
        gpu_enabled=app_data.gpu_enabled,
        gpu_type=app_data.gpu_type,
        environment_vars=app_data.environment_vars,
        url=f"http://{subdomain}.localhost",
        cpu_limit=2.0 if app_data.gpu_enabled else 0.5,
        memory_limit="8G" if app_data.gpu_enabled else "512M"
    )
    
    db.add(app)
    db.commit()
    db.refresh(app)
    
    # Create container in background
    background_tasks.add_task(create_app_container, app, current_user, db)
    
    # Update metrics
    app_created_counter.inc()
    active_apps_gauge.inc()
    
    return AppResponse(
        id=str(app.id),
        name=app.name,
        subdomain=app.subdomain,
        framework=app.framework,
        status=app.status,
        url=app.url,
        gpu_enabled=app.gpu_enabled,
        created_at=app.created_at,
        cpu_limit=app.cpu_limit,
        memory_limit=app.memory_limit
    )

async def create_app_container(app: App, user: User, db: Session):
    """Background task to create container"""
    try:
        container_id = await container_manager.build_and_run_container(app, user)
        
        # Update app with container ID
        app.container_id = container_id
        app.status = "running"
        app.last_deployed = datetime.utcnow()
        db.commit()
        
        # Cache status in Redis
        redis_client.setex(f"app_status:{app.id}", 300, "running")
        
    except Exception as e:
        logger.error(f"Failed to create container for app {app.id}: {e}")
        app.status = "failed"
        db.commit()

@app.get("/api/v1/apps", response_model=List[AppResponse])
async def list_apps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(App).filter(App.user_id == current_user.id).all()
    
    return [
        AppResponse(
            id=str(app.id),
            name=app.name,
            subdomain=app.subdomain,
            framework=app.framework,
            status=app.status,
            url=app.url,
            gpu_enabled=app.gpu_enabled,
            created_at=app.created_at,
            cpu_limit=app.cpu_limit,
            memory_limit=app.memory_limit
        )
        for app in apps
    ]

@app.get("/api/v1/apps/{app_id}", response_model=AppResponse)
async def get_app(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(App).filter(
        App.id == app_id,
        App.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    return AppResponse(
        id=str(app.id),
        name=app.name,
        subdomain=app.subdomain,
        framework=app.framework,
        status=app.status,
        url=app.url,
        gpu_enabled=app.gpu_enabled,
        created_at=app.created_at,
        cpu_limit=app.cpu_limit,
        memory_limit=app.memory_limit
    )

@app.post("/api/v1/apps/{app_id}/action")
async def app_action(
    app_id: str,
    action: AppAction,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(App).filter(
        App.id == app_id,
        App.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    if action.action == "start":
        if app.status != "stopped":
            raise HTTPException(status_code=400, detail="App is not stopped")
        background_tasks.add_task(container_manager.start_container, app.container_id)
        app.status = "running"
        
    elif action.action == "stop":
        if app.status != "running":
            raise HTTPException(status_code=400, detail="App is not running")
        background_tasks.add_task(container_manager.stop_container, app.container_id)
        app.status = "stopped"
        
    elif action.action == "restart":
        background_tasks.add_task(restart_container, app, db)
        app.status = "restarting"
        
    elif action.action == "delete":
        background_tasks.add_task(container_manager.delete_container, app.container_id)
        db.delete(app)
        active_apps_gauge.dec()
    
    db.commit()
    
    return {"status": "success", "action": action.action}

async def restart_container(app: App, db: Session):
    """Restart container"""
    await container_manager.stop_container(app.container_id)
    await asyncio.sleep(2)
    await container_manager.start_container(app.container_id)
    app.status = "running"
    db.commit()

@app.get("/api/v1/apps/{app_id}/logs")
async def get_app_logs(
    app_id: str,
    lines: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(App).filter(
        App.id == app_id,
        App.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    logs = await container_manager.get_container_logs(app.container_id, lines)
    
    return {"logs": logs}

@app.get("/api/v1/apps/{app_id}/stats")
async def get_app_stats(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(App).filter(
        App.id == app_id,
        App.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    stats = await container_manager.get_container_stats(app.container_id)
    
    # Save metrics to database
    metric = AppMetric(
        app_id=app.id,
        cpu_usage=stats.get("cpu_percent", 0),
        memory_usage=stats.get("memory_usage_mb", 0)
    )
    db.add(metric)
    db.commit()
    
    return stats

# ====================
# Resource Management
# ====================

@app.get("/api/v1/resources", response_model=ResourceUsage)
async def get_resource_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's apps
    apps = db.query(App).filter(App.user_id == current_user.id).all()
    
    # Calculate resource usage
    total_cpu = sum(app.cpu_limit for app in apps)
    total_memory = sum(
        float(app.memory_limit.replace('G', '').replace('M', ''))
        for app in apps
    )
    
    # Get tier limits
    tier_limits = {
        "free": {"cpu": 1.5, "memory": 1.5, "storage": 1, "gpu": 0, "apps": 3},
        "hobby": {"cpu": 5, "memory": 10, "storage": 5, "gpu": 1, "apps": 5},
        "pro": {"cpu": 20, "memory": 40, "storage": 20, "gpu": 2, "apps": 20},
        "team": {"cpu": 50, "memory": 100, "storage": 100, "gpu": 5, "apps": 50},
        "enterprise": {"cpu": 200, "memory": 500, "storage": 1000, "gpu": 20, "apps": 999}
    }
    
    limits = tier_limits.get(current_user.tier, tier_limits["free"])
    
    return ResourceUsage(
        cpu={"used": total_cpu, "limit": limits["cpu"]},
        memory={"used": total_memory, "limit": limits["memory"]},
        storage={"used": 0, "limit": limits["storage"]},
        gpu={"used": sum(1 for app in apps if app.gpu_enabled), "limit": limits["gpu"]},
        apps={"used": len(apps), "limit": limits["apps"]}
    )

# ====================
# WebSocket for real-time updates
# ====================

@app.websocket("/ws/{app_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    app_id: str,
    db: Session = Depends(get_db)
):
    await websocket.accept()
    
    try:
        while True:
            # Send app stats every 5 seconds
            app = db.query(App).filter(App.id == app_id).first()
            if app and app.container_id:
                stats = await container_manager.get_container_stats(app.container_id)
                await websocket.send_json({
                    "type": "stats",
                    "data": stats
                })
            
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for app {app_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)