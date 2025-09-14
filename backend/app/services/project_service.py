from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.project import Project
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectUpdate
from ..config import settings
import docker
import uuid
import os
from datetime import datetime

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.docker_client = docker.from_env()

    async def get_user_projects(
        self, 
        user_id: int, 
        tenant_id: Optional[int] = None
    ) -> List[Project]:
        """Get projects for a user"""
        query = self.db.query(Project).filter(
            Project.owner_id == user_id,
            Project.is_active == True
        )
        
        if tenant_id:
            query = query.filter(Project.tenant_id == tenant_id)
            
        return query.all()

    async def create_project(self, project_data: ProjectCreate, user_id: int) -> Project:
        """Create a new project"""
        # Generate unique project identifier
        project_id = str(uuid.uuid4())[:8]
        
        project = Project(
            name=project_data.name,
            description=project_data.description,
            framework=project_data.framework,
            runtime=project_data.runtime,
            language=project_data.language,
            owner_id=user_id,
            tenant_id=project_data.tenant_id or user_id,
            project_id=project_id,
            status="creating",
            container_config={
                "image": f"node:18-alpine",
                "ports": ["3000:3000"],
                "environment": {
                    "NODE_ENV": "development"
                },
                "volumes": {
                    f"/workspace/projects/{project_id}": "/app"
                }
            }
        )
        
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        
        # Create project directory
        project_dir = f"/workspace/projects/{project_id}"
        os.makedirs(project_dir, exist_ok=True)
        
        # Initialize project files
        await self._initialize_project_files(project)
        
        return project

    async def get_project(self, project_id: int, user_id: int) -> Optional[Project]:
        """Get a specific project"""
        return self.db.query(Project).filter(
            Project.id == project_id,
            Project.owner_id == user_id,
            Project.is_active == True
        ).first()

    async def update_project(
        self, 
        project_id: int, 
        project_data: ProjectUpdate, 
        user_id: int
    ) -> Optional[Project]:
        """Update a project"""
        project = await self.get_project(project_id, user_id)
        if not project:
            return None
            
        for field, value in project_data.dict(exclude_unset=True).items():
            setattr(project, field, value)
            
        self.db.commit()
        self.db.refresh(project)
        return project

    async def delete_project(self, project_id: int, user_id: int) -> bool:
        """Delete a project"""
        project = await self.get_project(project_id, user_id)
        if not project:
            return False
            
        # Stop and remove container if running
        try:
            container = self.docker_client.containers.get(f"vibecaas-project-{project.project_id}")
            container.stop()
            container.remove()
        except Exception as e:
            print(f"Error removing container for project {project_id}: {e}")
        
        # Remove project directory
        project_dir = f"/workspace/projects/{project.project_id}"
        if os.path.exists(project_dir):
            import shutil
            shutil.rmtree(project_dir)
        
        # Soft delete project
        project.is_active = False
        self.db.commit()
        return True

    async def deploy_project(self, project_id: int, user_id: int) -> bool:
        """Deploy a project"""
        project = await self.get_project(project_id, user_id)
        if not project:
            return False
            
        try:
            # Update project status
            project.status = "deploying"
            self.db.commit()
            
            # Create or update container
            container_name = f"vibecaas-project-{project.project_id}"
            
            try:
                # Stop existing container
                existing_container = self.docker_client.containers.get(container_name)
                existing_container.stop()
                existing_container.remove()
            except:
                pass  # Container doesn't exist
            
            # Build and run new container
            project_dir = f"/workspace/projects/{project.project_id}"
            
            # Create Dockerfile if it doesn't exist
            dockerfile_path = os.path.join(project_dir, "Dockerfile")
            if not os.path.exists(dockerfile_path):
                await self._create_dockerfile(project, dockerfile_path)
            
            # Build image
            image_tag = f"vibecaas-project-{project.project_id}:latest"
            image, build_logs = self.docker_client.images.build(
                path=project_dir,
                tag=image_tag,
                rm=True
            )
            
            # Run container
            container = self.docker_client.containers.run(
                image=image_tag,
                name=container_name,
                ports={3000: None},  # Random port
                volumes={
                    project_dir: {"bind": "/app", "mode": "rw"}
                },
                environment=project.container_config.get("environment", {}),
                detach=True,
                restart_policy={"Name": "unless-stopped"}
            )
            
            # Update project with container info
            project.status = "running"
            project.container_id = container.id
            project.container_image = image_tag
            
            # Get assigned port
            container.reload()
            port_info = container.ports.get('3000/tcp')
            if port_info:
                project.preview_url = f"http://localhost:{port_info[0]['HostPort']}"
            
            self.db.commit()
            return True
            
        except Exception as e:
            print(f"Error deploying project {project_id}: {e}")
            project.status = "failed"
            self.db.commit()
            return False

    async def get_project_status(self, project_id: int, user_id: int) -> Optional[dict]:
        """Get project deployment status"""
        project = await self.get_project(project_id, user_id)
        if not project:
            return None
            
        status_info = {
            "project_id": project_id,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at
        }
        
        if project.container_id:
            try:
                container = self.docker_client.containers.get(project.container_id)
                status_info.update({
                    "container_status": container.status,
                    "container_id": container.id,
                    "preview_url": project.preview_url,
                    "uptime": container.attrs.get("State", {}).get("StartedAt")
                })
            except Exception as e:
                print(f"Error getting container status: {e}")
                status_info["container_status"] = "unknown"
        
        return status_info

    async def _initialize_project_files(self, project: Project):
        """Initialize project files based on framework"""
        project_dir = f"/workspace/projects/{project.project_id}"
        
        if project.framework == "react":
            await self._create_react_project(project_dir)
        elif project.framework == "nextjs":
            await self._create_nextjs_project(project_dir)
        elif project.framework == "vue":
            await self._create_vue_project(project_dir)
        elif project.framework == "angular":
            await self._create_angular_project(project_dir)
        else:
            await self._create_basic_project(project_dir)

    async def _create_react_project(self, project_dir: str):
        """Create a React project"""
        package_json = {
            "name": "vibecaas-project",
            "version": "1.0.0",
            "scripts": {
                "start": "react-scripts start",
                "build": "react-scripts build",
                "test": "react-scripts test"
            },
            "dependencies": {
                "react": "^18.0.0",
                "react-dom": "^18.0.0",
                "react-scripts": "5.0.1"
            }
        }
        
        with open(os.path.join(project_dir, "package.json"), "w") as f:
            import json
            json.dump(package_json, f, indent=2)
        
        # Create basic React app
        src_dir = os.path.join(project_dir, "src")
        os.makedirs(src_dir, exist_ok=True)
        
        with open(os.path.join(src_dir, "App.js"), "w") as f:
            f.write("""import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to VibeCaaS</h1>
        <p>Your React app is running!</p>
      </header>
    </div>
  );
}

export default App;
""")
        
        with open(os.path.join(src_dir, "index.js"), "w") as f:
            f.write("""import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
""")

    async def _create_nextjs_project(self, project_dir: str):
        """Create a Next.js project"""
        package_json = {
            "name": "vibecaas-project",
            "version": "1.0.0",
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start"
            },
            "dependencies": {
                "next": "^13.0.0",
                "react": "^18.0.0",
                "react-dom": "^18.0.0"
            }
        }
        
        with open(os.path.join(project_dir, "package.json"), "w") as f:
            import json
            json.dump(package_json, f, indent=2)
        
        # Create pages directory
        pages_dir = os.path.join(project_dir, "pages")
        os.makedirs(pages_dir, exist_ok=True)
        
        with open(os.path.join(pages_dir, "index.js"), "w") as f:
            f.write("""export default function Home() {
  return (
    <div>
      <h1>Welcome to VibeCaaS</h1>
      <p>Your Next.js app is running!</p>
    </div>
  );
}
""")

    async def _create_vue_project(self, project_dir: str):
        """Create a Vue project"""
        package_json = {
            "name": "vibecaas-project",
            "version": "1.0.0",
            "scripts": {
                "serve": "vue-cli-service serve",
                "build": "vue-cli-service build"
            },
            "dependencies": {
                "vue": "^3.0.0",
                "@vue/cli-service": "^5.0.0"
            }
        }
        
        with open(os.path.join(project_dir, "package.json"), "w") as f:
            import json
            json.dump(package_json, f, indent=2)

    async def _create_angular_project(self, project_dir: str):
        """Create an Angular project"""
        package_json = {
            "name": "vibecaas-project",
            "version": "1.0.0",
            "scripts": {
                "ng": "ng",
                "start": "ng serve",
                "build": "ng build"
            },
            "dependencies": {
                "@angular/core": "^15.0.0",
                "@angular/cli": "^15.0.0"
            }
        }
        
        with open(os.path.join(project_dir, "package.json"), "w") as f:
            import json
            json.dump(package_json, f, indent=2)

    async def _create_basic_project(self, project_dir: str):
        """Create a basic project"""
        with open(os.path.join(project_dir, "index.html"), "w") as f:
            f.write("""<!DOCTYPE html>
<html>
<head>
    <title>VibeCaaS Project</title>
</head>
<body>
    <h1>Welcome to VibeCaaS</h1>
    <p>Your project is ready!</p>
</body>
</html>
""")

    async def _create_dockerfile(self, project: Project, dockerfile_path: str):
        """Create a Dockerfile for the project"""
        if project.framework in ["react", "nextjs", "vue", "angular"]:
            dockerfile_content = f"""FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
"""
        else:
            dockerfile_content = """FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""
        
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_content)
