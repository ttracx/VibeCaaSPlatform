from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db import get_db
from ...models.user import User
from ...models.agent import Agent, AgentTask, AgentExecution, AgentType, TaskStatus
from ...schemas.agent import AgentCreate, AgentUpdate, AgentResponse, TaskCreate, TaskResponse
from ...services.agent_service import AgentService

router = APIRouter()

@router.get("/agents", response_model=List[AgentResponse])
async def list_agents(
    project_id: Optional[int] = None,
    agent_type: Optional[AgentType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all agents"""
    agent_service = AgentService(db)
    agents = await agent_service.get_agents(
        user_id=current_user.id,
        project_id=project_id,
        agent_type=agent_type
    )
    return agents

@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new agent"""
    agent_service = AgentService(db)
    return await agent_service.create_agent(agent, current_user.id)

@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific agent"""
    agent_service = AgentService(db)
    agent = await agent_service.get_agent(agent_id, current_user.id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    agent: AgentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an agent"""
    agent_service = AgentService(db)
    updated_agent = await agent_service.update_agent(agent_id, agent, current_user.id)
    if not updated_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return updated_agent

@router.delete("/agents/{agent_id}")
async def delete_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an agent"""
    agent_service = AgentService(db)
    success = await agent_service.delete_agent(agent_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

@router.post("/agents/{agent_id}/tasks", response_model=TaskResponse)
async def create_task(
    agent_id: int,
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task for an agent"""
    agent_service = AgentService(db)
    return await agent_service.create_task(agent_id, task, current_user.id)

@router.get("/agents/{agent_id}/tasks", response_model=List[TaskResponse])
async def list_agent_tasks(
    agent_id: int,
    status: Optional[TaskStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List tasks for an agent"""
    agent_service = AgentService(db)
    tasks = await agent_service.get_agent_tasks(agent_id, current_user.id, status)
    return tasks

@router.post("/agents/{agent_id}/execute")
async def execute_agent(
    agent_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute an agent task"""
    agent_service = AgentService(db)
    execution = await agent_service.execute_task(agent_id, task_id, current_user.id)
    if not execution:
        raise HTTPException(status_code=404, detail="Agent or task not found")
    return {"message": "Task execution started", "execution_id": execution.id}

@router.get("/agents/{agent_id}/executions")
async def list_agent_executions(
    agent_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List executions for an agent"""
    agent_service = AgentService(db)
    executions = await agent_service.get_agent_executions(agent_id, current_user.id, limit)
    return executions

@router.get("/orchestration/status")
async def get_orchestration_status(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get orchestration status for a project"""
    agent_service = AgentService(db)
    status = await agent_service.get_orchestration_status(project_id, current_user.id)
    if not status:
        raise HTTPException(status_code=404, detail="Project not found")
    return status

@router.post("/orchestration/start")
async def start_orchestration(
    project_id: int,
    requirements: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start orchestration for a project"""
    agent_service = AgentService(db)
    orchestration = await agent_service.start_orchestration(project_id, requirements, current_user.id)
    if not orchestration:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Orchestration started", "orchestration_id": orchestration.id}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # This would be imported from auth router
    pass
