from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.balance import Balance, Transaction
from app.schemas.balance import (
    BalanceResponse,
    TransactionCreate,
    TransactionResponse,
    BalanceForecast
)
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/balance",
    tags=["balance"]
)

@router.get("/current", response_model=BalanceResponse)
async def get_current_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """現在の残高を取得する"""
    balance = db.query(Balance).filter(Balance.user_id == current_user.id).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Balance not found")
    return balance

@router.post("/deposit", response_model=BalanceResponse)
async def deposit_money(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """お金を預ける"""
    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    balance = db.query(Balance).filter(Balance.user_id == current_user.id).first()
    if not balance:
        balance = Balance(user_id=current_user.id, amount=0)
        db.add(balance)
    
    balance.amount += transaction.amount
    
    # トランザクション記録
    new_transaction = Transaction(
        user_id=current_user.id,
        amount=transaction.amount,
        type="deposit",
        description=transaction.description
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(balance)
    
    return balance

@router.post("/withdraw", response_model=BalanceResponse)
async def withdraw_money(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """お金を引き出す"""
    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    balance = db.query(Balance).filter(Balance.user_id == current_user.id).first()
    if not balance or balance.amount < transaction.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    balance.amount -= transaction.amount
    
    # トランザクション記録
    new_transaction = Transaction(
        user_id=current_user.id,
        amount=transaction.amount,
        type="withdraw",
        description=transaction.description
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(balance)
    
    return balance

@router.get("/history", response_model=List[TransactionResponse])
async def get_transaction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """取引履歴を取得する"""
    transactions = db.query(Transaction)\
        .filter(Transaction.user_id == current_user.id)\
        .order_by(Transaction.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return transactions

@router.get("/forecast", response_model=List[BalanceForecast])
async def get_balance_forecast(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30
):
    """残高予測を取得する"""
    # 過去の取引パターンを分析して将来の残高を予測
    current_balance = db.query(Balance)\
        .filter(Balance.user_id == current_user.id)\
        .first()
    
    # 過去30日間の平均取引額を計算
    last_month = datetime.now() - timedelta(days=30)
    transactions = db.query(Transaction)\
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.created_at >= last_month
        ).all()
    
    # 簡単な予測計算（実際のアプリケーションではより複雑なロジックが必要）
    daily_average = sum([t.amount for t in transactions]) / 30
    forecasts = []
    
    for day in range(days):
        forecast_date = datetime.now() + timedelta(days=day)
        predicted_amount = current_balance.amount + (daily_average * day)
        forecasts.append(BalanceForecast(
            date=forecast_date,
            predicted_amount=predicted_amount
        ))
    
    return forecasts