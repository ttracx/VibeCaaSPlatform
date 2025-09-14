from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.agent import Agent, AgentTask, AgentExecution, AgentType, TaskStatus
from ..schemas.agent import AgentCreate, AgentUpdate, TaskCreate
from ..config import settings
import asyncio
import json
from datetime import datetime

class AgentService:
    def __init__(self, db: Session):
        self.db = db

    async def get_agents(
        self, 
        user_id: int, 
        project_id: Optional[int] = None,
        agent_type: Optional[AgentType] = None
    ) -> List[Agent]:
        """Get agents for a user"""
        query = self.db.query(Agent).filter(Agent.is_active == True)
        
        if project_id:
            query = query.filter(Agent.project_id == project_id)
        if agent_type:
            query = query.filter(Agent.agent_type == agent_type)
            
        return query.all()

    async def create_agent(self, agent_data: AgentCreate, user_id: int) -> Agent:
        """Create a new agent"""
        agent = Agent(
            name=agent_data.name,
            agent_type=agent_data.agent_type,
            description=agent_data.description,
            system_prompt=agent_data.system_prompt,
            model=agent_data.model,
            temperature=agent_data.temperature,
            max_tokens=agent_data.max_tokens,
            project_id=agent_data.project_id
        )
        
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent

    async def get_agent(self, agent_id: int, user_id: int) -> Optional[Agent]:
        """Get a specific agent"""
        return self.db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.is_active == True
        ).first()

    async def update_agent(
        self, 
        agent_id: int, 
        agent_data: AgentUpdate, 
        user_id: int
    ) -> Optional[Agent]:
        """Update an agent"""
        agent = await self.get_agent(agent_id, user_id)
        if not agent:
            return None
            
        for field, value in agent_data.dict(exclude_unset=True).items():
            setattr(agent, field, value)
            
        self.db.commit()
        self.db.refresh(agent)
        return agent

    async def delete_agent(self, agent_id: int, user_id: int) -> bool:
        """Delete an agent"""
        agent = await self.get_agent(agent_id, user_id)
        if not agent:
            return False
            
        agent.is_active = False
        self.db.commit()
        return True

    async def create_task(
        self, 
        agent_id: int, 
        task_data: TaskCreate, 
        user_id: int
    ) -> AgentTask:
        """Create a new task for an agent"""
        task = AgentTask(
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            input_data=task_data.input_data,
            agent_id=agent_id,
            project_id=task_data.project_id,
            depends_on=task_data.depends_on,
            blocks=task_data.blocks
        )
        
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    async def get_agent_tasks(
        self, 
        agent_id: int, 
        user_id: int,
        status: Optional[TaskStatus] = None
    ) -> List[AgentTask]:
        """Get tasks for an agent"""
        query = self.db.query(AgentTask).filter(AgentTask.agent_id == agent_id)
        
        if status:
            query = query.filter(AgentTask.status == status)
            
        return query.all()

    async def execute_task(
        self, 
        agent_id: int, 
        task_id: int, 
        user_id: int
    ) -> Optional[AgentExecution]:
        """Execute a task with an agent"""
        agent = await self.get_agent(agent_id, user_id)
        task = self.db.query(AgentTask).filter(AgentTask.id == task_id).first()
        
        if not agent or not task:
            return None
            
        # Create execution record
        execution = AgentExecution(
            task_id=task_id,
            agent_id=agent_id,
            status=TaskStatus.IN_PROGRESS
        )
        
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)
        
        # Update task status
        task.status = TaskStatus.IN_PROGRESS
        self.db.commit()
        
        # Start async execution
        asyncio.create_task(self._execute_task_async(execution.id, agent, task))
        
        return execution

    async def _execute_task_async(self, execution_id: int, agent: Agent, task: AgentTask):
        """Execute task asynchronously"""
        try:
            # This would integrate with AI providers
            result = await self._call_ai_provider(agent, task)
            
            # Update execution
            execution = self.db.query(AgentExecution).filter(
                AgentExecution.id == execution_id
            ).first()
            
            if execution:
                execution.status = TaskStatus.COMPLETED
                execution.completed_at = datetime.utcnow()
                execution.output_tokens = result.get("tokens", 0)
                execution.cost = result.get("cost", "0.00")
                
                # Update task
                task.status = TaskStatus.COMPLETED
                task.output_data = result.get("output")
                
                self.db.commit()
                
        except Exception as e:
            # Handle errors
            execution = self.db.query(AgentExecution).filter(
                AgentExecution.id == execution_id
            ).first()
            
            if execution:
                execution.status = TaskStatus.FAILED
                execution.completed_at = datetime.utcnow()
                
                task.status = TaskStatus.FAILED
                task.error_message = str(e)
                
                self.db.commit()

    async def _call_ai_provider(self, agent: Agent, task: AgentTask) -> dict:
        """Call AI provider (OpenAI, Anthropic, etc.)"""
        # This would implement actual AI provider calls
        # For now, return mock data
        return {
            "output": f"Mock output for task: {task.title}",
            "tokens": 100,
            "cost": "0.01"
        }

    async def get_agent_executions(
        self, 
        agent_id: int, 
        user_id: int, 
        limit: int = 50
    ) -> List[AgentExecution]:
        """Get executions for an agent"""
        return self.db.query(AgentExecution).filter(
            AgentExecution.agent_id == agent_id
        ).order_by(AgentExecution.started_at.desc()).limit(limit).all()

    async def get_orchestration_status(self, project_id: int, user_id: int) -> dict:
        """Get orchestration status for a project"""
        agents = await self.get_agents(user_id, project_id)
        tasks = self.db.query(AgentTask).filter(AgentTask.project_id == project_id).all()
        
        return {
            "project_id": project_id,
            "agents_count": len(agents),
            "total_tasks": len(tasks),
            "pending_tasks": len([t for t in tasks if t.status == TaskStatus.PENDING]),
            "in_progress_tasks": len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS]),
            "completed_tasks": len([t for t in tasks if t.status == TaskStatus.COMPLETED]),
            "failed_tasks": len([t for t in tasks if t.status == TaskStatus.FAILED])
        }

    async def start_orchestration(
        self, 
        project_id: int, 
        requirements: str, 
        user_id: int
    ) -> dict:
        """Start orchestration for a project"""
        # Create planning task
        planning_task = AgentTask(
            title="Analyze Requirements",
            description=f"Analyze project requirements: {requirements}",
            priority=10,
            input_data={"requirements": requirements},
            agent_id=1,  # Planning agent
            project_id=project_id
        )
        
        self.db.add(planning_task)
        self.db.commit()
        
        return {"orchestration_id": planning_task.id}
