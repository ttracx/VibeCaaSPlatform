from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.project import Project
from ..schemas.app import AppCreate, AppUpdate
from ..config import settings
import docker
import uuid
from datetime import datetime

class AppService:
    def __init__(self, db: Session):
        self.db = db
        self.docker_client = docker.from_env()

    async def get_user_apps(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        """Get apps for a user"""
        return self.db.query(Project).filter(
            Project.owner_id == user_id,
            Project.is_active == True
        ).offset(skip).limit(limit).all()

    async def create_app(self, app_data: AppCreate, user_id: int) -> Project:
        """Create a new app"""
        # Generate unique subdomain
        subdomain = f"{app_data.name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:8]}"
        
        app = Project(
            name=app_data.name,
            description=app_data.description,
            framework=app_data.framework,
            runtime=app_data.runtime,
            language=app_data.language,
            owner_id=user_id,
            tenant_id=app_data.tenant_id or user_id,  # Default to user as tenant
            subdomain=subdomain,
            status="creating",
            container_config={
                "image": f"node:18-alpine",
                "ports": ["3000:3000"],
                "environment": {
                    "NODE_ENV": "production"
                }
            }
        )
        
        self.db.add(app)
        self.db.commit()
        self.db.refresh(app)
        
        # Start container creation process
        asyncio.create_task(self._create_container(app.id))
        
        return app

    async def get_app(self, app_id: int, user_id: int) -> Optional[Project]:
        """Get a specific app"""
        return self.db.query(Project).filter(
            Project.id == app_id,
            Project.owner_id == user_id,
            Project.is_active == True
        ).first()

    async def update_app(self, app_id: int, app_data: AppUpdate, user_id: int) -> Optional[Project]:
        """Update an app"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return None
            
        for field, value in app_data.dict(exclude_unset=True).items():
            setattr(app, field, value)
            
        self.db.commit()
        self.db.refresh(app)
        return app

    async def delete_app(self, app_id: int, user_id: int) -> bool:
        """Delete an app"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return False
            
        # Stop and remove container
        await self._stop_container(app.container_image)
        
        app.is_active = False
        self.db.commit()
        return True

    async def start_app(self, app_id: int, user_id: int) -> bool:
        """Start an app"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return False
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{app_id}")
            container.start()
            app.status = "running"
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error starting app {app_id}: {e}")
            return False

    async def stop_app(self, app_id: int, user_id: int) -> bool:
        """Stop an app"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return False
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{app_id}")
            container.stop()
            app.status = "stopped"
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error stopping app {app_id}: {e}")
            return False

    async def restart_app(self, app_id: int, user_id: int) -> bool:
        """Restart an app"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return False
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{app_id}")
            container.restart()
            app.status = "running"
            self.db.commit()
            return True
        except Exception as e:
            print(f"Error restarting app {app_id}: {e}")
            return False

    async def get_app_logs(self, app_id: int, user_id: int, lines: int = 100) -> Optional[str]:
        """Get app logs"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return None
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{app_id}")
            logs = container.logs(tail=lines, timestamps=True).decode('utf-8')
            return logs
        except Exception as e:
            print(f"Error getting logs for app {app_id}: {e}")
            return None

    async def get_app_metrics(self, app_id: int, user_id: int) -> Optional[dict]:
        """Get app metrics"""
        app = await self.get_app(app_id, user_id)
        if not app:
            return None
            
        try:
            container = self.docker_client.containers.get(f"vibecaas-{app_id}")
            stats = container.stats(stream=False)
            
            # Calculate CPU usage
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
            cpu_percent = (cpu_delta / system_delta) * len(stats['cpu_stats']['cpu_usage']['percpu_usage']) * 100.0
            
            # Calculate memory usage
            memory_usage = stats['memory_stats']['usage']
            memory_limit = stats['memory_stats']['limit']
            memory_percent = (memory_usage / memory_limit) * 100.0
            
            return {
                "cpu_usage": round(cpu_percent, 2),
                "memory_usage": memory_usage,
                "memory_limit": memory_limit,
                "memory_percent": round(memory_percent, 2),
                "status": app.status,
                "uptime": stats.get('uptime', 0)
            }
        except Exception as e:
            print(f"Error getting metrics for app {app_id}: {e}")
            return None

    async def _create_container(self, app_id: int):
        """Create Docker container for app"""
        try:
            app = self.db.query(Project).filter(Project.id == app_id).first()
            if not app:
                return
                
            # Create container
            container = self.docker_client.containers.run(
                image=app.container_config.get("image", "node:18-alpine"),
                name=f"vibecaas-{app_id}",
                ports={app.container_config.get("ports", ["3000:3000"])[0].split(":")[0]: int(app.container_config.get("ports", ["3000:3000"])[0].split(":")[1])},
                environment=app.container_config.get("environment", {}),
                detach=True,
                restart_policy={"Name": "unless-stopped"}
            )
            
            app.status = "running"
            app.container_image = container.image.tags[0] if container.image.tags else "unknown"
            self.db.commit()
            
        except Exception as e:
            print(f"Error creating container for app {app_id}: {e}")
            app = self.db.query(Project).filter(Project.id == app_id).first()
            if app:
                app.status = "failed"
                self.db.commit()

    async def _stop_container(self, container_name: str):
        """Stop and remove container"""
        try:
            container = self.docker_client.containers.get(container_name)
            container.stop()
            container.remove()
        except Exception as e:
            print(f"Error stopping container {container_name}: {e}")