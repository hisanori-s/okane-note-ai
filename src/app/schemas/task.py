from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """
    タスク作成のためのスキーマ
    
    Attributes:
        title (str): タスクのタイトル
        description (str): タスクの詳細説明
        reward_amount (int): タスク完了時の報酬額
        deadline (Optional[datetime]): タスクの締め切り日時（オプション）
        parent_id (Optional[int]): 親ユーザー（保護者）のID
        child_id (int): 子ユーザーのID
    """
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    reward_amount: int = Field(..., ge=0)
    deadline: Optional[datetime] = None
    parent_id: Optional[int] = Field(None)
    child_id: int = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "title": "部屋の掃除",
                "description": "自分の部屋を掃除して、ベッドメイキングをする",
                "reward_amount": 500,
                "deadline": "2024-12-31T23:59:59",
                "child_id": 1
            }
        }

class TaskComplete(BaseModel):
    """
    タスク完了のためのスキーマ
    
    Attributes:
        task_id (int): 完了するタスクのID
        completed_at (datetime): タスクが完了した日時
        proof_image_url (Optional[str]): タスク完了の証明画像URL（オプション）
        parent_verification (bool): 親による確認が必要かどうか
    """
    task_id: int = Field(...)
    completed_at: datetime = Field(default_factory=datetime.now)
    proof_image_url: Optional[str] = Field(None)
    parent_verification: bool = Field(default=True)

    class Config:
        schema_extra = {
            "example": {
                "task_id": 1,
                "completed_at": "2024-11-29T10:00:00",
                "proof_image_url": "https://storage.example.com/proof/123.jpg",
                "parent_verification": True
            }
        }

    @property
    def requires_verification(self) -> bool:
        """
        タスクが親の確認を必要とするかどうかを返す
        """
        return self.parent_verification