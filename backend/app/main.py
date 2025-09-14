from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .config import settings
from .api.routers import auth, apps, resources, tenants, projects, agents, billing, secrets, observability, microvm, domains

app = FastAPI(
    title="VibeCaaS API",
    description="Multi-Agent AI Development Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(apps.router, prefix="/api/v1", tags=["apps"])
app.include_router(resources.router, prefix="/api/v1", tags=["resources"])
app.include_router(tenants.router, prefix="/api/v1/tenants", tags=["tenants"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(secrets.router, prefix="/api/v1/secrets", tags=["secrets"])
app.include_router(observability.router, prefix="/api/v1/observability", tags=["observability"])
app.include_router(microvm.router, prefix="/api/v1", tags=["microvm"])
app.include_router(domains.router, prefix="/api/v1", tags=["domains"])

@app.get("/")
async def root():
    return {"message": "VibeCaaS API - Multi-Agent AI Development Platform", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vibecaas-api"}