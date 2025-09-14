from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db import Base

class AgentType(str, enum.Enum):
    PLANNING = "planning"
    FRONTEND = "frontend"
    BACKEND = "backend"
    INTEGRATION = "integration"
    TESTING = "testing"
    AI_FEATURE = "ai_feature"

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    agent_type = Column(Enum(AgentType), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Configuration
    system_prompt = Column(Text, nullable=False)
    model = Column(String, default="gpt-4")  # gpt-4, claude-3, gemini-pro
    temperature = Column(String, default="0.7")
    max_tokens = Column(Integer, default=4000)
    
    # Project association
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="agents")
    
    # Performance metrics
    total_tasks = Column(Integer, default=0)
    successful_tasks = Column(Integer, default=0)
    failed_tasks = Column(Integer, default=0)
    average_execution_time = Column(Integer, default=0)  # in seconds

class AgentTask(Base):
    __tablename__ = "agent_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(Integer, default=1)  # 1-10, higher is more important
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Task details
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    
    # Dependencies
    depends_on = Column(JSON)  # List of task IDs this task depends on
    blocks = Column(JSON)      # List of task IDs this task blocks
    
    # Agent assignment
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    agent = relationship("Agent")
    
    # Project context
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project")

class AgentExecution(Base):
    __tablename__ = "agent_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("agent_tasks.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    
    # Execution details
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    execution_time = Column(Integer)  # in seconds
    
    # Results
    status = Column(Enum(TaskStatus), nullable=False)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    cost = Column(String, default="0.00")  # Cost in USD
    
    # Relationships
    task = relationship("AgentTask")
    agent = relationship("Agent")