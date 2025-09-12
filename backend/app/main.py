import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session, sessionmaker
import jwt
from passlib.context import CryptContext


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vibecaas.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret-change-me")
JWT_ALG = "HS256"


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    tier: Mapped[str] = mapped_column(String(50), default="free")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    apps: Mapped[List["App"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class App(Base):
    __tablename__ = "apps"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(100))
    subdomain: Mapped[str] = mapped_column(String(100), unique=True)
    framework: Mapped[Optional[str]] = mapped_column(String(50), default="python")
    runtime_version: Mapped[Optional[str]] = mapped_column(String(20), default="3.11")
    status: Mapped[str] = mapped_column(String(50), default="creating")
    url: Mapped[Optional[str]] = mapped_column(String(500))
    gpu_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="apps")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def create_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_access_token(sub: str) -> str:
    payload = {"sub": sub, "exp": datetime.utcnow() + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    user = db.get(User, uuid.UUID(user_id)) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    tier: str
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AppCreateRequest(BaseModel):
    name: str
    framework: Optional[str] = "python"
    runtime_version: Optional[str] = "3.11"
    gpu_enabled: Optional[bool] = False


class AppResponse(BaseModel):
    id: str
    name: str
    subdomain: str
    framework: str
    status: str
    url: Optional[str]
    gpu_enabled: bool
    created_at: datetime


app = FastAPI(title="VibeCaaS API", version="0.1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db()


@app.get("/")
def root():
    return {"service": "vibecaas-api", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/v1/auth/register", response_model=UserResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.email == req.email) | (User.username == req.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(email=req.email, username=req.username, hashed_password=pwd_context.hash(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=str(user.id), email=user.email, username=user.username, tier=user.tier, created_at=user.created_at)


@app.post("/api/v1/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/v1/apps", response_model=AppResponse)
def create_app(req: AppCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subdomain = f"{req.name}-{current_user.username}"
    url = f"http://{subdomain}.localhost"
    app_row = App(
        user_id=current_user.id,
        name=req.name,
        subdomain=subdomain,
        framework=req.framework or "python",
        runtime_version=req.runtime_version or "3.11",
        status="running",
        url=url,
        gpu_enabled=bool(req.gpu_enabled),
    )
    db.add(app_row)
    db.commit()
    db.refresh(app_row)
    return AppResponse(
        id=str(app_row.id),
        name=app_row.name,
        subdomain=app_row.subdomain,
        framework=app_row.framework or "python",
        status=app_row.status,
        url=app_row.url,
        gpu_enabled=app_row.gpu_enabled,
        created_at=app_row.created_at,
    )


@app.get("/api/v1/apps", response_model=List[AppResponse])
def list_apps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(App).filter(App.user_id == current_user.id).order_by(App.created_at.desc()).all()
    return [
        AppResponse(
            id=str(r.id),
            name=r.name,
            subdomain=r.subdomain,
            framework=r.framework or "python",
            status=r.status,
            url=r.url,
            gpu_enabled=r.gpu_enabled,
            created_at=r.created_at,
        )
        for r in rows
    ]

