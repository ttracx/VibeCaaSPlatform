"""
Application management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.application import Application, AppStatus
from app.api.auth import get_current_user
from app.services.container_service import ContainerService
from app.services.kubernetes_service import KubernetesService
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse

router = APIRouter()

@router.get("/", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all applications for current user"""
    apps = db.query(Application).filter(Application.owner_id == current_user.id).all()
    return apps

@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application details"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.owner_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return app

@router.post("/", response_model=ApplicationResponse)
async def create_application(
    app_data: ApplicationCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new application"""
    # Check user quota
    app_count = db.query(Application).filter(Application.owner_id == current_user.id).count()
    if app_count >= current_user.max_apps:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Application limit reached. Maximum {current_user.max_apps} apps allowed for {current_user.tier} tier"
        )
    
    # Create application
    app_id = str(uuid.uuid4())
    namespace = f"user-{current_user.username}"
    subdomain = f"{app_data.name}-{current_user.username}"
    
    app = Application(
        id=app_id,
        name=app_data.name,
        description=app_data.description,
        framework=app_data.framework,
        owner_id=current_user.id,
        subdomain=subdomain,
        namespace=namespace,
        deployment_name=f"app-{app_id}",
        service_name=f"svc-{app_id}",
        ingress_name=f"ing-{app_id}",
        cpu_limit=min(app_data.cpu_limit or 500, current_user.max_cpu),
        memory_limit=min(app_data.memory_limit or 512, current_user.max_memory),
        storage_limit=min(app_data.storage_limit or 1024, current_user.max_storage),
        environment_variables=app_data.environment_variables or {},
        port=app_data.port or 8000,
        github_repo=app_data.github_repo,
        branch=app_data.branch or "main",
        build_command=app_data.build_command,
        start_command=app_data.start_command
    )
    
    db.add(app)
    db.commit()
    db.refresh(app)
    
    # Trigger deployment in background
    background_tasks.add_task(deploy_application, app_id, db)
    
    return app

@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    app_data: ApplicationUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.owner_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Update fields
    for field, value in app_data.dict(exclude_unset=True).items():
        setattr(app, field, value)
    
    db.commit()
    db.refresh(app)
    
    # Trigger redeployment if needed
    if app_data.requires_redeploy:
        background_tasks.add_task(deploy_application, app_id, db)
    
    return app

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.owner_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Mark as deleted and trigger cleanup
    app.status = AppStatus.DELETED
    db.commit()
    
    # Cleanup in background
    background_tasks.add_task(cleanup_application, app_id, db)
    
    return {"message": "Application deletion initiated"}

@router.post("/{app_id}/start")
async def start_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.owner_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    k8s_service = KubernetesService()
    success = k8s_service.scale_deployment(app.namespace, app.deployment_name, 1)
    
    if success:
        app.status = AppStatus.RUNNING
        db.commit()
        return {"message": "Application started"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start application"
        )

@router.post("/{app_id}/stop")
async def stop_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop application"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.owner_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    k8s_service = KubernetesService()
    success = k8s_service.scale_deployment(app.namespace, app.deployment_name, 0)
    
    if success:
        app.status = AppStatus.STOPPED
        db.commit()
        return {"message": "Application stopped"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop application"
        )

@router.get("/{app_id}/logs")
async def get_application_logs(
    app_id: str,
    lines: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application logs"""
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.owner_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    k8s_service = KubernetesService()
    logs = k8s_service.get_pod_logs(app.namespace, app.deployment_name, lines)
    
    return {"logs": logs}

# Background tasks
async def deploy_application(app_id: str, db: Session):
    """Deploy application to Kubernetes"""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        return
    
    try:
        app.status = AppStatus.BUILDING
        db.commit()
        
        # Build container
        container_service = ContainerService()
        image = container_service.build_image(app)
        app.image = image
        
        app.status = AppStatus.DEPLOYING
        db.commit()
        
        # Deploy to Kubernetes
        k8s_service = KubernetesService()
        k8s_service.deploy_application(app)
        
        app.status = AppStatus.RUNNING
        db.commit()
    except Exception as e:
        app.status = AppStatus.FAILED
        db.commit()
        print(f"Deployment failed: {e}")

async def cleanup_application(app_id: str, db: Session):
    """Cleanup application resources"""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        return
    
    try:
        k8s_service = KubernetesService()
        k8s_service.delete_application(app)
        
        # Delete from database
        db.delete(app)
        db.commit()
    except Exception as e:
        print(f"Cleanup failed: {e}")