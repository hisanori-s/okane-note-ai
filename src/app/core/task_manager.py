from typing import Dict, List, Optional
from datetime import datetime
import asyncio
from enum import Enum
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Task:
    def __init__(self, task_id: str, name: str, func, args=None, kwargs=None):
        self.task_id = task_id
        self.name = name
        self.func = func
        self.args = args or []
        self.kwargs = kwargs or {}
        self.status = TaskStatus.PENDING
        self.result = None
        self.error = None
        self.created_at = datetime.now()
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None

class TaskManager:
    def __init__(self, max_workers: int = 5):
        """
        タスク管理システムの初期化
        
        Args:
            max_workers (int): 同時実行可能な最大タスク数
        """
        self.tasks: Dict[str, Task] = {}
        self.max_workers = max_workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self._lock = asyncio.Lock()

    async def add_task(self, task_id: str, name: str, func, *args, **kwargs) -> Task:
        """
        新しいタスクを追加
        
        Args:
            task_id (str): タスクの一意識別子
            name (str): タスクの名前
            func: 実行する関数
            *args: 関数の位置引数
            **kwargs: 関数のキーワード引数
        
        Returns:
            Task: 作成されたタスクオブジェクト
        """
        async with self._lock:
            if task_id in self.tasks:
                raise ValueError(f"Task with ID {task_id} already exists")
            
            task = Task(task_id, name, func, args, kwargs)
            self.tasks[task_id] = task
            return task

    async def execute_task(self, task_id: str) -> None:
        """
        タスクを実行
        
        Args:
            task_id (str): 実行するタスクのID
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")

        task.status = TaskStatus.RUNNING
        task.started_at = datetime.now()

        try:
            loop = asyncio.get_event_loop()
            task.result = await loop.run_in_executor(
                self.executor,
                task.func,
                *task.args,
                **task.kwargs
            )
            task.status = TaskStatus.COMPLETED
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            logger.error(f"Task {task_id} failed: {e}")
        finally:
            task.completed_at = datetime.now()

    async def cancel_task(self, task_id: str) -> None:
        """
        タスクをキャンセル
        
        Args:
            task_id (str): キャンセルするタスクのID
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")
        
        if task.status == TaskStatus.RUNNING:
            # 実行中のタスクの場合は適切なキャンセル処理を実装
            # この実装は環境に応じて調整が必要
            task.status = TaskStatus.CANCELLED
            logger.info(f"Task {task_id} cancelled")

    def get_task(self, task_id: str) -> Optional[Task]:
        """
        タスクの取得
        
        Args:
            task_id (str): 取得するタスクのID
        
        Returns:
            Optional[Task]: タスクオブジェクト（存在しない場合はNone）
        """
        return self.tasks.get(task_id)

    def get_all_tasks(self) -> List[Task]:
        """
        全タスクの取得
        
        Returns:
            List[Task]: 全タスクのリスト
        """
        return list(self.tasks.values())

    def cleanup_completed_tasks(self, max_age_hours: int = 24) -> None:
        """
        完了済みタスクのクリーンアップ
        
        Args:
            max_age_hours (int): 保持する最大期間（時間）
        """
        current_time = datetime.now()
        tasks_to_remove = []
        
        for task_id, task in self.tasks.items():
            if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
                if task.completed_at:
                    age = (current_time - task.completed_at).total_seconds() / 3600
                    if age > max_age_hours:
                        tasks_to_remove.append(task_id)
        
        for task_id in tasks_to_remove:
            del self.tasks[task_id]

    async def shutdown(self):
        """
        タスクマネージャーのシャットダウン処理
        """
        self.executor.shutdown(wait=True)
async def example_usage():
    # タスクマネージャーの初期化
    task_manager = TaskManager(max_workers=3)
    
    # タスクの追加
    def sample_task(x, y):
        return x + y
    
    task = await task_manager.add_task(
        "task1",
        "Addition Task",
        sample_task,
        5,
        3
    )
    
    # タスクの実行
    await task_manager.execute_task("task1")
    
    # 結果の取得
    result = task_manager.get_task("task1").result
    print(f"Task result: {result}")
    
    # クリーンアップとシャットダウン
    task_manager.cleanup_completed_tasks()
    await task_manager.shutdown()