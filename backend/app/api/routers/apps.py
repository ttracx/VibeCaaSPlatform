from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...models.project import Project
from ...schemas.app import AppCreate, AppUpdate, AppResponse
from ...services.app_service import AppService

router = APIRouter()

@router.get("/apps", response_model=List[AppResponse])
async def list_apps(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all apps for the current user"""
    app_service = AppService(db)
    apps = await app_service.get_user_apps(current_user.id, skip=skip, limit=limit)
    return apps

@router.post("/apps", response_model=AppResponse)
async def create_app(
    app: AppCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new app"""
    app_service = AppService(db)
    return await app_service.create_app(app, current_user.id)

@router.get("/apps/{app_id}", response_model=AppResponse)
async def get_app(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific app"""
    app_service = AppService(db)
    app = await app_service.get_app(app_id, current_user.id)
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    return app

@router.put("/apps/{app_id}", response_model=AppResponse)
async def update_app(
    app_id: int,
    app: AppUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an app"""
    app_service = AppService(db)
    updated_app = await app_service.update_app(app_id, app, current_user.id)
    if not updated_app:
        raise HTTPException(status_code=404, detail="App not found")
    return updated_app

@router.delete("/apps/{app_id}")
async def delete_app(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an app"""
    app_service = AppService(db)
    success = await app_service.delete_app(app_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="App not found")
    return {"message": "App deleted successfully"}

@router.post("/apps/{app_id}/start")
async def start_app(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start an app"""
    app_service = AppService(db)
    success = await app_service.start_app(app_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="App not found")
    return {"message": "App started successfully"}

@router.post("/apps/{app_id}/stop")
async def stop_app(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop an app"""
    app_service = AppService(db)
    success = await app_service.stop_app(app_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="App not found")
    return {"message": "App stopped successfully"}

@router.post("/apps/{app_id}/restart")
async def restart_app(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restart an app"""
    app_service = AppService(db)
    success = await app_service.restart_app(app_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="App not found")
    return {"message": "App restarted successfully"}

@router.get("/apps/{app_id}/logs")
async def get_app_logs(
    app_id: int,
    lines: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get app logs"""
    app_service = AppService(db)
    logs = await app_service.get_app_logs(app_id, current_user.id, lines)
    if logs is None:
        raise HTTPException(status_code=404, detail="App not found")
    return {"logs": logs}

@router.get("/apps/{app_id}/metrics")
async def get_app_metrics(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get app metrics"""
    app_service = AppService(db)
    metrics = await app_service.get_app_metrics(app_id, current_user.id)
    if metrics is None:
        raise HTTPException(status_code=404, detail="App not found")
<<<<<<< Current (Your changes)
    stats = await container_service.get_stats(app)
    return stats

=======
    return metrics

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass
>>>>>>> Incoming (Background Agent changes)
