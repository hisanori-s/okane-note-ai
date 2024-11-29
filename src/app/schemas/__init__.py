"""
Schema initialization file for the MoneyKids API.
This file serves as the entry point for all Pydantic models and schema definitions.
"""

from .user import *
from .balance import *
from .transaction import *
from .work import *
from .quest import *
from .wishlist import *
from .settings import *

# Version information
__version__ = "1.0.0"

# All models that should be exported
__all__ = [
    # User related schemas
    'UserCreate',
    'UserUpdate',
    'UserInDB',
    'UserResponse',
    
    # Balance related schemas
    'BalanceCreate',
    'BalanceUpdate',
    'BalanceInDB',
    'BalanceResponse',
    
    # Transaction related schemas
    'TransactionCreate',
    'TransactionUpdate',
    'TransactionInDB',
    'TransactionResponse',
    
    # Work related schemas
    'WorkCreate',
    'WorkUpdate',
    'WorkInDB',
    'WorkResponse',
    
    # Quest related schemas
    'QuestCreate',
    'QuestUpdate',
    'QuestInDB',
    'QuestResponse',
    
    # Wishlist related schemas
    'WishlistItemCreate',
    'WishlistItemUpdate',
    'WishlistItemInDB',
    'WishlistItemResponse',
    
    # Settings related schemas
    'SettingsCreate',
    'SettingsUpdate',
    'SettingsInDB',
    'SettingsResponse',
]