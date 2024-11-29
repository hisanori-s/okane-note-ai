"""
Models initialization file for the MoneyKids application.
This file imports and exports all database models to provide a single point of access.
"""

from .user import User
from .transaction import Transaction
from .balance import Balance
from .quest import Quest
from .job import Job
from .wishlist import WishlistItem
from .alert import Alert

# Export all models
__all__ = [
    'User',
    'Transaction',
    'Balance',
    'Quest',
    'Job',
    'WishlistItem',
    'Alert'
]
from app.models import User, Transaction  # 特定のモデルをインポート
# または
from app.models import *  # すべてのモデルをインポート