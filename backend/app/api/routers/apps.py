from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_db
from ...models.app import App, AppStatus
from ...models.user import User
from ...schemas.apps import AppActionRequest, AppCreateRequest, AppOut
from ..routers.auth import get_current_user
from ...services.containers import container_service


router = APIRouter()


@router.get("/apps", response_model=List[AppOut])
async def list_apps(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> List[AppOut]:
    result = await db.execute(select(App).where(App.user_id == current_user.id))
    apps = result.scalars().all()
    return [AppOut.from_orm(a) for a in apps]


@router.post("/apps", response_model=AppOut)
async def create_app(
    payload: AppCreateRequest,
    background: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AppOut:
    app = App(
        user_id=current_user.id,
        name=payload.name,
        framework=payload.framework,
        gpu_enabled=payload.gpu_enabled or False,
        cpu_limit=payload.cpu_limit,
        memory_limit=payload.memory_limit,
    )
    app.subdomain = f"{app.name}-{current_user.username}.localhost".lower()
    app.status = AppStatus.CREATING
    db.add(app)
    await db.commit()
    await db.refresh(app)

    background.add_task(container_service.create_container_for_app, app.id)

    return AppOut.from_orm(app)


@router.get("/apps/{app_id}", response_model=AppOut)
async def get_app(app_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> AppOut:
    result = await db.execute(select(App).where(App.id == app_id, App.user_id == current_user.id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    return AppOut.from_orm(app)


@router.post("/apps/{app_id}/action")
async def app_action(
    app_id: uuid.UUID,
    payload: AppActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(select(App).where(App.id == app_id, App.user_id == current_user.id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    action = payload.action.lower()
    if action == "start":
        await container_service.start_container(app)
    elif action == "stop":
        await container_service.stop_container(app)
    elif action == "restart":
        await container_service.restart_container(app)
    elif action == "delete":
        await container_service.delete_container(app)
    else:
        raise HTTPException(status_code=400, detail="Unknown action")
    return {"status": "ok"}


@router.get("/apps/{app_id}/logs")
async def app_logs(app_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    result = await db.execute(select(App).where(App.id == app_id, App.user_id == current_user.id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    logs = await container_service.get_logs(app)
    return {"logs": logs}


@router.get("/apps/{app_id}/stats")
async def app_stats(app_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    result = await db.execute(select(App).where(App.id == app_id, App.user_id == current_user.id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    stats = await container_service.get_stats(app)
    return stats

