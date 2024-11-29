from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.database import Base

class TransactionType(PyEnum):
    """取引タイプを定義する列挙型"""
    DEPOSIT = "deposit"      # 入金
    WITHDRAWAL = "withdrawal"  # 出金
    REWARD = "reward"        # ご褒美
    QUEST = "quest"         # クエスト報酬
    JOB = "job"            # お手伝い報酬

class Balance(Base):
    """残高モデル"""
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_amount = Column(Float, nullable=False, default=0.0)
    savings_goal = Column(Float, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    transactions = relationship("Transaction", back_populates="balance")
    user = relationship("User", back_populates="balance")

    def update_balance(self, amount: float, transaction_type: TransactionType) -> float:
        """残高を更新する"""
        if transaction_type in [TransactionType.DEPOSIT, TransactionType.REWARD, 
                              TransactionType.QUEST, TransactionType.JOB]:
            self.current_amount += amount
        elif transaction_type == TransactionType.WITHDRAWAL:
            if self.current_amount >= amount:
                self.current_amount -= amount
            else:
                raise ValueError("残高が不足しています")
        
        self.last_updated = datetime.utcnow()
        return self.current_amount

class Transaction(Base):
    """取引モデル"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    balance_id = Column(Integer, ForeignKey("balances.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーションシップ
    balance = relationship("Balance", back_populates="transactions")

    @property
    def is_positive(self) -> bool:
        """取引が入金かどうかを判定"""
        return self.transaction_type in [
            TransactionType.DEPOSIT,
            TransactionType.REWARD,
            TransactionType.QUEST,
            TransactionType.JOB
        ]

    def validate_transaction(self) -> bool:
        """取引の妥当性を検証"""
        if self.amount <= 0:
            raise ValueError("取引金額は0より大きい必要があります")
        if self.transaction_type == TransactionType.WITHDRAWAL:
            if self.balance.current_amount < self.amount:
                raise ValueError("残高が不足しています")
        return True