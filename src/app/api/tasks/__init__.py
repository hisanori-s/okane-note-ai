from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import Depends

from app.core.task_manager import TaskManager
from app.services.reward_service import RewardService

class TaskConfig(BaseModel):
    """タスク設定を管理するための設定クラス"""
    
    task_types: Dict[str, Dict[str, Any]] = {
        "daily": {
            "max_attempts": 1,
            "points": 100,
            "expiration_hours": 24
        },
        "weekly": {
            "max_attempts": 3,
            "points": 300,
            "expiration_hours": 168  # 7 days
        },
        "achievement": {
            "max_attempts": None,
            "points": 500,
            "expiration_hours": None
        }
    }
    
    reward_multiplier: float = 1.0
    min_completion_rate: float = 0.7
    notification_enabled: bool = True

    class Config:
        arbitrary_types_allowed = True

def get_task_manager(
    config: TaskConfig = Depends(TaskConfig),
    reward_service: RewardService = Depends(RewardService)
) -> TaskManager:
    """
    タスクマネージャーのインスタンスを取得する依存性注入関数
    
    Args:
        config: タスク設定
        reward_service: 報酬サービス
        
    Returns:
        TaskManager: 設定済みのタスクマネージャーインスタンス
    """
    return TaskManager(
        config=config,
        reward_service=reward_service
    )

# デフォルトのタスク設定インスタンス
default_task_config = TaskConfig()

# エクスポートする要素
__all__ = [
    'TaskConfig',
    'get_task_manager',
    'default_task_config'
]