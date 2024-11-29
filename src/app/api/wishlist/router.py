from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.wishlist import WishlistItem
from app.schemas.wishlist import (
    WishlistItemCreate,
    WishlistItemResponse,
    WishlistReorderRequest
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/wishlist",
    tags=["wishlist"]
)

@router.post("/add", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_wishlist_item(
    item: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    新しい欲しいものリストアイテムを追加する
    """
    try:
        # 現在の最大順序を取得
        max_order = db.query(WishlistItem).filter(
            WishlistItem.user_id == current_user.id
        ).count()

        new_item = WishlistItem(
            user_id=current_user.id,
            name=item.name,
            price=item.price,
            priority=item.priority,
            url=item.url,
            order=max_order + 1
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="アイテムの追加に失敗しました"
        )

@router.put("/reorder", status_code=status.HTTP_200_OK)
async def reorder_wishlist(
    reorder_request: WishlistReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    欲しいものリストの順序を更新する
    """
    try:
        for item_order in reorder_request.items:
            db_item = db.query(WishlistItem).filter(
                WishlistItem.id == item_order.item_id,
                WishlistItem.user_id == current_user.id
            ).first()
            
            if not db_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"アイテムID {item_order.item_id} が見つかりません"
                )
            
            db_item.order = item_order.new_order
        
        db.commit()
        return {"message": "順序を更新しました"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="順序の更新に失敗しました"
        )

@router.get("/items", response_model=List[WishlistItemResponse])
async def get_wishlist_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    ユーザーの欲しいものリストを取得する
    """
    try:
        items = db.query(WishlistItem).filter(
            WishlistItem.user_id == current_user.id
        ).order_by(WishlistItem.order).all()
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="アイテムの取得に失敗しました"
        )