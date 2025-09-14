from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.agent import AgentType, TaskStatus

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    agent_type: AgentType
    system_prompt: str
    model: str = "gpt-4"
    temperature: str = "0.7"
    max_tokens: int = 4000

class AgentCreate(AgentBase):
    project_id: int

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[str] = None
    max_tokens: Optional[int] = None

class AgentResponse(AgentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    project_id: int
    total_tasks: int
    successful_tasks: int
    failed_tasks: int
    average_execution_time: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 1
    input_data: Optional[Dict[str, Any]] = None
    depends_on: Optional[List[int]] = None
    blocks: Optional[List[int]] = None

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    input_data: Optional[Dict[str, Any]] = None
    status: Optional[TaskStatus] = None

class TaskResponse(TaskBase):
    id: int
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    agent_id: int
    project_id: int
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class ExecutionResponse(BaseModel):
    id: int
    task_id: int
    agent_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    execution_time: Optional[int] = None
    status: TaskStatus
    input_tokens: int
    output_tokens: int
    cost: str

    class Config:
        from_attributes = True

class OrchestrationStatus(BaseModel):
    project_id: int
    agents_count: int
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    failed_tasks: int

class OrchestrationStart(BaseModel):
    project_id: int
    requirements: str
