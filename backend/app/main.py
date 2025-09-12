import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from passlib.context import CryptContext

from sqlalchemy import create_engine, String, DateTime, Boolean, Float, Integer, ForeignKey
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Mapped, mapped_column, relationship, Session

import docker


# Config
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://vibecaas_user:vibecaas_dev_password@localhost:5432/vibecaas")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALG = "HS256"
JWT_EXP_HOURS = 24


# DB setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    tier: Mapped[str] = mapped_column(String(20), default="free")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    apps: Mapped[List["App"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class App(Base):
    __tablename__ = "apps"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    subdomain: Mapped[Optional[str]] = mapped_column(String(100))
    framework: Mapped[Optional[str]] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="creating")
    container_id: Mapped[Optional[str]] = mapped_column(String(100))
    port: Mapped[int] = mapped_column(Integer, default=8000)
    url: Mapped[Optional[str]] = mapped_column(String(255))
    gpu_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    cpu_limit: Mapped[float] = mapped_column(Float, default=0.5)
    memory_limit: Mapped[str] = mapped_column(String(20), default="512M")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_deployed: Mapped[Optional[datetime]] = mapped_column(DateTime)
    user: Mapped[User] = relationship(back_populates="apps")


Base.metadata.create_all(bind=engine)


# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()


def create_access_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS)
    payload = {"sub": sub, "exp": exp}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    cred: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    token = cred.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user


# Docker client
docker_client = docker.from_env()


# Schemas
class RegisterIn(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    tier: str
    created_at: datetime


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AppCreateIn(BaseModel):
    name: str
    framework: str = "python"
    gpu_enabled: bool = False


class AppOut(BaseModel):
    id: str
    name: str
    framework: str
    status: str
    url: Optional[str]
    gpu_enabled: bool
    created_at: datetime


# App
app = FastAPI(title="VibeCaaS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=(os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/auth/register", response_model=UserOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter((User.email == data.email) | (User.username == data.username)).first():
        raise HTTPException(status_code=400, detail="User already exists")
    u = User(email=data.email, username=data.username, hashed_password=pwd_context.hash(data.password))
    db.add(u)
    db.commit()
    db.refresh(u)
    return UserOut(id=str(u.id), email=u.email, username=u.username, tier=u.tier, created_at=u.created_at)


@app.post("/api/v1/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == data.email).first()
    if not u or not pwd_context.verify(data.password, u.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(u.id))
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/v1/apps", response_model=List[AppOut])
def list_apps(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(App).filter(App.user_id == current.id).order_by(App.created_at.desc()).all()
    return [
        AppOut(
            id=str(a.id),
            name=a.name,
            framework=a.framework or "python",
            status=a.status,
            url=a.url,
            gpu_enabled=a.gpu_enabled,
            created_at=a.created_at,
        )
        for a in apps
    ]


def _exposed_port_to_url(bindings) -> Optional[str]:
    # Map container 8000/tcp to host URL
    b = bindings.get("8000/tcp") if bindings else None
    if not b:
        return None
    host_port = b[0]["HostPort"]
    return f"http://localhost:{host_port}"


@app.post("/api/v1/apps", response_model=AppOut)
def create_app(data: AppCreateIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = App(
        user_id=current.id,
        name=data.name,
        framework=data.framework,
        status="creating",
        gpu_enabled=data.gpu_enabled,
    )
    db.add(a)
    db.commit()
    db.refresh(a)

    # Run simple container per app (serve Hello World)
    image = "python:3.11-slim" if data.framework == "python" else "node:18-alpine"
    command = ["python", "-m", "http.server", "8000"] if data.framework == "python" else ["node", "-e", "require('http').createServer((r,s)=>s.end('Hello from VibeCaaS')).listen(8000)"]

    container = docker_client.containers.run(
        image,
        command,
        detach=True,
        labels={
            "vibecaas.user": str(current.id),
            "vibecaas.app": str(a.id),
        },
        ports={"8000/tcp": None},  # random host port
        mem_limit=a.memory_limit,
        nano_cpus=int(a.cpu_limit * 1e9),
        restart_policy={"Name": "unless-stopped"},
    )

    a.container_id = container.id
    a.status = "running"
    a.url = _exposed_port_to_url(container.attrs.get("HostConfig", {}).get("PortBindings")) or _exposed_port_to_url(container.ports)
    a.last_deployed = datetime.utcnow()
    db.commit()
    db.refresh(a)

    # Refresh inspect to get port binding reliably
    container.reload()
    bindings = container.attrs.get("NetworkSettings", {}).get("Ports", {})
    a.url = _exposed_port_to_url(bindings) or a.url
    db.commit()

    return AppOut(id=str(a.id), name=a.name, framework=a.framework or "python", status=a.status, url=a.url, gpu_enabled=a.gpu_enabled, created_at=a.created_at)


@app.post("/api/v1/apps/{app_id}/start")
def start_app(app_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.get(App, uuid.UUID(app_id))
    if not a or a.user_id != current.id:
        raise HTTPException(status_code=404, detail="App not found")
    if not a.container_id:
        raise HTTPException(status_code=400, detail="App has no container")
    c = docker_client.containers.get(a.container_id)
    c.start()
    c.reload()
    bindings = c.attrs.get("NetworkSettings", {}).get("Ports", {})
    a.status = "running"
    a.url = _exposed_port_to_url(bindings) or a.url
    db.commit()
    return {"status": "running", "url": a.url}


@app.post("/api/v1/apps/{app_id}/stop")
def stop_app(app_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.get(App, uuid.UUID(app_id))
    if not a or a.user_id != current.id:
        raise HTTPException(status_code=404, detail="App not found")
    if a.container_id:
        try:
            docker_client.containers.get(a.container_id).stop()
        except Exception:
            pass
    a.status = "stopped"
    db.commit()
    return {"status": "stopped"}


@app.post("/api/v1/apps/{app_id}/restart")
def restart_app(app_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.get(App, uuid.UUID(app_id))
    if not a or a.user_id != current.id:
        raise HTTPException(status_code=404, detail="App not found")
    if a.container_id:
        c = docker_client.containers.get(a.container_id)
        c.restart()
        c.reload()
        bindings = c.attrs.get("NetworkSettings", {}).get("Ports", {})
        a.status = "running"
        a.url = _exposed_port_to_url(bindings) or a.url
        db.commit()
    return {"status": "running", "url": a.url}


@app.delete("/api/v1/apps/{app_id}")
def delete_app(app_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.get(App, uuid.UUID(app_id))
    if not a or a.user_id != current.id:
        raise HTTPException(status_code=404, detail="App not found")
    if a.container_id:
        try:
            docker_client.containers.get(a.container_id).remove(force=True)
        except Exception:
            pass
    db.delete(a)
    db.commit()
    return {"status": "deleted"}

