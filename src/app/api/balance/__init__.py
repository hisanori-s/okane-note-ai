from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, validator

from app.core.db_manager import DatabaseManager
from app.core.compound_calculator import CompoundCalculator

# APIルーターの初期化
router = APIRouter()

class BalanceConfig(BaseModel):
    """残高設定を管理するための設定クラス"""
    min_balance: Decimal
    max_balance: Decimal
    alert_threshold: Decimal
    compound_frequency: str  # daily, weekly, monthly, yearly
    interest_rate: Decimal

    @validator('interest_rate')
    def validate_interest_rate(cls, v):
        """金利が適切な範囲内かを検証"""
        if v < 0 or v > 100:
            raise ValueError('Interest rate must be between 0 and 100')
        return v

    @validator('compound_frequency')
    def validate_compound_frequency(cls, v):
        """複利計算の頻度が有効か検証"""
        valid_frequencies = ['daily', 'weekly', 'monthly', 'yearly']
        if v not in valid_frequencies:
            raise ValueError(f'Compound frequency must be one of {valid_frequencies}')
        return v

async def calculate_compound(
    principal: Decimal,
    config: BalanceConfig,
    duration_months: int
) -> Dict[str, Any]:
    """
    複利計算を実行する関数
    
    Args:
        principal: 元金
        config: 残高設定
        duration_months: 計算期間（月数）
    
    Returns:
        Dict containing:
            - final_amount: 最終金額
            - interest_earned: 獲得利息
            - monthly_breakdown: 月ごとの残高推移
    """
    calculator = CompoundCalculator()
    result = await calculator.calculate(
        principal=principal,
        interest_rate=config.interest_rate,
        frequency=config.compound_frequency,
        duration_months=duration_months
    )
    return result

async def validate_transaction(
    amount: Decimal,
    transaction_type: str,
    current_balance: Decimal,
    config: BalanceConfig
) -> bool:
    """
    取引が有効かどうかを検証する関数
    
    Args:
        amount: 取引金額
        transaction_type: 取引種類（deposit/withdrawal）
        current_balance: 現在の残高
        config: 残高設定
    
    Returns:
        bool: 取引が有効かどうか
    
    Raises:
        HTTPException: 取引が無効な場合
    """
    if transaction_type == 'withdrawal':
        if current_balance - amount < config.min_balance:
            raise HTTPException(
                status_code=400,
                detail="Transaction would result in balance below minimum allowed"
            )
    elif transaction_type == 'deposit':
        if current_balance + amount > config.max_balance:
            raise HTTPException(
                status_code=400,
                detail="Transaction would exceed maximum allowed balance"
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid transaction type"
        )
    
    return True

# データベースマネージャーのインスタンス作成用の依存関数
async def get_db():
    db = DatabaseManager()
    try:
        yield db
    finally:
        await db.close()

# 必要なエンドポイントをここにインポート
from .routes import *