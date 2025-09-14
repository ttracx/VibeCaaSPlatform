from __future__ import annotations

import asyncio
import os
from typing import Any, Dict

import docker
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..db import AsyncSessionLocal
from ..models.app import App, AppStatus


class ContainerService:
    def __init__(self) -> None:
        # Local docker socket; in compose we can mount it if needed
        docker_host = os.getenv("DOCKER_HOST")
        self.client = docker.from_env() if not docker_host else docker.DockerClient(base_url=docker_host)

    async def _get_app(self, app_id) -> App | None:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(App).where(App.id == app_id))
            return result.scalar_one_or_none()

    async def create_container_for_app(self, app_id) -> None:
        app = await self._get_app(app_id)
        if not app:
            return
        async with AsyncSessionLocal() as db:
            try:
                image = self._resolve_image(app.framework, app.gpu_enabled)
                ports = {"3000/tcp": None, "8000/tcp": None}
                mem_limit = f"{int(app.memory_limit)}m"
                cpu_quota = int(app.cpu_limit) * 100000

                kwargs: Dict[str, Any] = {
                    "image": image,
                    "detach": True,
                    "environment": {"PORT": "8000"},
                    "ports": {"8000/tcp": None},
                    "name": f"vibecaas-{app.id}",
                    "host_config": self.client.api.create_host_config(
                        mem_limit=mem_limit,
                        cpu_quota=cpu_quota,
                    ),
                }

                if app.gpu_enabled and settings.enable_gpu_support:
                    # Request all GPUs or 1 GPU depending on tier; simplified
                    kwargs["device_requests"] = [docker.types.DeviceRequest(count=-1, capabilities=[["gpu"]])]

                container = self.client.containers.run(**kwargs)
                # Update
                app.container_id = container.id
                app.status = AppStatus.RUNNING
                app.url = f"http://{app.subdomain}"
                db.add(app)
                await db.merge(app)
                await db.commit()
            except Exception:
                app.status = AppStatus.ERROR
                db.add(app)
                await db.merge(app)
                await db.commit()

    async def start_container(self, app: App) -> None:
        if not app.container_id:
            await self.create_container_for_app(app.id)
            return
        try:
            container = self.client.containers.get(app.container_id)
            container.start()
        except Exception:
            pass

    async def stop_container(self, app: App) -> None:
        if not app.container_id:
            return
        try:
            container = self.client.containers.get(app.container_id)
            container.stop()
        except Exception:
            pass

    async def restart_container(self, app: App) -> None:
        if not app.container_id:
            return
        try:
            container = self.client.containers.get(app.container_id)
            container.restart()
        except Exception:
            pass

    async def delete_container(self, app: App) -> None:
        if not app.container_id:
            return
        try:
            container = self.client.containers.get(app.container_id)
            container.remove(force=True)
            app.status = AppStatus.DELETED
        except Exception:
            pass

    async def get_logs(self, app: App) -> str:
        if not app.container_id:
            return ""
        try:
            container = self.client.containers.get(app.container_id)
            return container.logs(tail=500).decode("utf-8", errors="ignore")
        except Exception:
            return ""

    async def get_stats(self, app: App) -> dict:
        if not app.container_id:
            return {"cpu": 0, "memory": 0}
        try:
            container = self.client.containers.get(app.container_id)
            stats = container.stats(stream=False)
            cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
            system_delta = stats["cpu_stats"]["system_cpu_usage"] - stats["precpu_stats"]["system_cpu_usage"]
            cpu_percent = (cpu_delta / system_delta) * len(stats["cpu_stats"]["cpu_usage"].get("percpu_usage", []) or [1]) * 100 if system_delta else 0
            mem_usage = stats["memory_stats"].get("usage", 0)
            mem_limit = stats["memory_stats"].get("limit", 1)
            mem_percent = (mem_usage / mem_limit) * 100
            return {"cpu": round(cpu_percent, 2), "memory": round(mem_percent, 2)}
        except Exception:
            return {"cpu": 0, "memory": 0}

    def _resolve_image(self, framework: str, gpu: bool) -> str:
        # Simplified templates
        if framework.lower() in {"python", "fastapi"}:
            return "tiangolo/uvicorn-gunicorn-fastapi:python3.11"
        if framework.lower() in {"node", "nodejs", "next"}:
            return "node:20-alpine"
        if framework.lower() == "go":
            return "golang:1.22-alpine"
        if gpu:
            # Generic CUDA base
            return "nvidia/cuda:12.3.2-runtime-ubuntu22.04"
        return "busybox"


container_service = ContainerService()

