from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class WishlistConfig:
    """
    欲しいものリストの設定を管理するクラス
    """
    
    # デフォルトの並び順の種類
    SORT_BY_PRIORITY = "priority"
    SORT_BY_PRICE = "price"
    SORT_BY_DATE = "date"
    
    # ステータスの定義
    STATUS_ACTIVE = "active"
    STATUS_ACHIEVED = "achieved"
    STATUS_REMOVED = "removed"
    
    def __init__(self):
        self.max_items: int = 50  # 1ユーザーあたりの最大アイテム数
        self.min_price: int = 0   # 最小金額
        self.max_price: int = 1000000  # 最大金額
        self.default_sort: str = self.SORT_BY_PRIORITY
        self.allowed_image_types: List[str] = ["image/jpeg", "image/png", "image/gif"]
        self.max_image_size: int = 5 * 1024 * 1024  # 5MB
        
    @property
    def valid_sort_options(self) -> List[str]:
        """有効なソートオプションのリストを返す"""
        return [
            self.SORT_BY_PRIORITY,
            self.SORT_BY_PRICE,
            self.SORT_BY_DATE
        ]
    
    @property
    def valid_status_options(self) -> List[str]:
        """有効なステータスオプションのリストを返す"""
        return [
            self.STATUS_ACTIVE,
            self.STATUS_ACHIEVED,
            self.STATUS_REMOVED
        ]
    
    def validate_price(self, price: int) -> bool:
        """価格が有効範囲内かチェックする"""
        return self.min_price <= price <= self.max_price
    
    def validate_image_type(self, content_type: str) -> bool:
        """画像タイプが許可されているものかチェックする"""
        return content_type in self.allowed_image_types
    
    def validate_image_size(self, size: int) -> bool:
        """画像サイズが制限内かチェックする"""
        return size <= self.max_image_size

class WishlistItem(BaseModel):
    """
    欲しいものリストの各アイテムのデータモデル
    """
    id: Optional[int]
    user_id: int
    title: str
    price: int
    priority: int
    status: str
    image_url: Optional[str]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# グローバル設定インスタンスの作成
wishlist_config = WishlistConfig()