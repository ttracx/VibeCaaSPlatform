from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_db
from ...models.app import App
from ...models.user import User
from ..routers.auth import get_current_user


router = APIRouter()


@router.get("/resources")
async def get_resources(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    # Simple rollup by user
    result = await db.execute(
        select(
            func.count(App.id),
            func.sum(App.cpu_limit),
            func.sum(App.memory_limit),
        ).where(App.user_id == current_user.id)
    )
    count, total_cpu, total_mem = result.first() or (0, 0, 0)
    return {
        "apps": int(count or 0),
        "cpu": float(total_cpu or 0),
        "memory": int(total_mem or 0),
        "tier": current_user.tier.value,
    }

