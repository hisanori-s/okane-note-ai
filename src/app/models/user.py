from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional

from app.db.base_class import Base
from app.core.security import get_password_hash, verify_password

class User(Base):
    """ユーザーモデル"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    
    # リレーションシップ
    settings = relationship("Settings", back_populates="user", uselist=False)
    balance = Column(Float, default=0.0)
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            if key == "password":
                self.hashed_password = get_password_hash(value)
            else:
                setattr(self, key, value)

    def verify_password(self, password: str) -> bool:
        """パスワードを検証する"""
        return verify_password(password, self.hashed_password)

    def update_balance(self, amount: float) -> None:
        """残高を更新する"""
        self.balance += amount

    @property
    def dict(self):
        """ユーザー情報を辞書形式で返す"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "balance": self.balance,
            "created_at": self.created_at
        }

class Settings(Base):
    """ユーザー設定モデル"""
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # 通知設定
    email_notifications = Column(Boolean, default=True)
    balance_alerts = Column(Boolean, default=True)
    balance_threshold = Column(Float, default=1000.0)
    
    # テーマ設定
    dark_mode = Column(Boolean, default=False)
    
    # 目標設定
    savings_goal = Column(Float, default=0.0)
    monthly_budget = Column(Float, default=0.0)
    
    # リレーションシップ
    user = relationship("User", back_populates="settings")

    @property
    def dict(self):
        """設定情報を辞書形式で返す"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "email_notifications": self.email_notifications,
            "balance_alerts": self.balance_alerts,
            "balance_threshold": self.balance_threshold,
            "dark_mode": self.dark_mode,
            "savings_goal": self.savings_goal,
            "monthly_budget": self.monthly_budget
        }