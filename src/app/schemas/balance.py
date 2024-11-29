from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    """取引タイプを定義する列挙型"""
    DEPOSIT = "deposit"      # 入金
    WITHDRAWAL = "withdrawal"  # 出金
    WORK = "work"           # お仕事報酬
    QUEST = "quest"         # クエスト報酬

class TransactionCreate(BaseModel):
    """取引作成のためのスキーマ"""
    amount: float = Field(
        ...,  # 必須フィールド
        gt=0,  # 金額は0より大きい必要がある
        description="取引金額"
    )
    transaction_type: TransactionType = Field(
        ...,
        description="取引タイプ"
    )
    description: Optional[str] = Field(
        None,
        max_length=200,
        description="取引の説明"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "amount": 1000.0,
                "transaction_type": "deposit",
                "description": "お小遣い"
            }
        }

class BalanceResponse(BaseModel):
    """残高情報のレスポンススキーマ"""
    current_balance: float = Field(
        ...,
        description="現在の残高"
    )
    last_transaction_amount: Optional[float] = Field(
        None,
        description="最後の取引金額"
    )
    last_transaction_type: Optional[TransactionType] = Field(
        None,
        description="最後の取引タイプ"
    )
    last_transaction_date: Optional[datetime] = Field(
        None,
        description="最後の取引日時"
    )
    savings_goal: Optional[float] = Field(
        None,
        description="貯金目標額"
    )
    achievement_rate: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="目標達成率（パーセント）"
    )

    class Config:
        schema_extra = {
            "example": {
                "current_balance": 5000.0,
                "last_transaction_amount": 1000.0,
                "last_transaction_type": "deposit",
                "last_transaction_date": "2024-01-01T10:00:00",
                "savings_goal": 10000.0,
                "achievement_rate": 50.0
            }
        }