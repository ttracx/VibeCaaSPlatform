from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...models.project import Project
from ...schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from ...services.project_service import ProjectService

router = APIRouter()

@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    tenant_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List projects for the current user"""
    project_service = ProjectService(db)
    projects = await project_service.get_user_projects(current_user.id, tenant_id)
    return projects

@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    project_service = ProjectService(db)
    return await project_service.create_project(project, current_user.id)

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project"""
    project_service = ProjectService(db)
    project = await project_service.get_project(project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project"""
    project_service = ProjectService(db)
    updated_project = await project_service.update_project(project_id, project, current_user.id)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project"""
    project_service = ProjectService(db)
    success = await project_service.delete_project(project_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

@router.post("/projects/{project_id}/deploy")
async def deploy_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deploy a project"""
    project_service = ProjectService(db)
    success = await project_service.deploy_project(project_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deployment started"}

@router.get("/projects/{project_id}/status")
async def get_project_status(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project deployment status"""
    project_service = ProjectService(db)
    status = await project_service.get_project_status(project_id, current_user.id)
    if not status:
        raise HTTPException(status_code=404, detail="Project not found")
    return status

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass