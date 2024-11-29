from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class TaskFrequency(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ONE_TIME = "one_time"

class TaskStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class RegularTask(Base):
    """定期タスクモデル"""
    __tablename__ = "regular_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    reward_amount = Column(Integer, nullable=False)
    frequency = Column(Enum(TaskFrequency), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # リレーションシップ
    user = relationship("User", back_populates="regular_tasks")
    completions = relationship("TaskCompletion", back_populates="task")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "reward_amount": self.reward_amount,
            "frequency": self.frequency.value,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class Quest(Base):
    """クエストモデル"""
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    reward_amount = Column(Integer, nullable=False)
    difficulty = Column(Integer, nullable=False)  # 1-5の難易度
    duration_days = Column(Integer, nullable=False)  # クエスト完了までの期間
    status = Column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # リレーションシップ
    user = relationship("User", back_populates="quests")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "reward_amount": self.reward_amount,
            "difficulty": self.difficulty,
            "duration_days": self.duration_days,
            "status": self.status.value,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class TaskCompletion(Base):
    """タスク完了記録モデル"""
    __tablename__ = "task_completions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("regular_tasks.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    verified = Column(Boolean, default=False)

    # リレーションシップ
    task = relationship("RegularTask", back_populates="completions")