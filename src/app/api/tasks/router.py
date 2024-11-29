from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.task import (
    RegularTaskCreate,
    QuestTaskCreate,
    TaskComplete,
    TaskResponse,
)
from app.crud.task import (
    create_regular_task,
    create_quest_task,
    complete_task,
    get_user_tasks,
)
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/regular/create", response_model=TaskResponse)
async def create_regular_task_endpoint(
    task: RegularTaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    定期的なタスクを作成するエンドポイント
    """
    try:
        created_task = create_regular_task(
            db=db,
            task=task,
            user_id=current_user.id
        )
        return created_task
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"タスクの作成に失敗しました: {str(e)}"
        )

@router.post("/quest/create", response_model=TaskResponse)
async def create_quest_task_endpoint(
    task: QuestTaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    クエストタスクを作成するエンドポイント
    """
    try:
        created_task = create_quest_task(
            db=db,
            task=task,
            user_id=current_user.id
        )
        return created_task
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"クエストの作成に失敗しました: {str(e)}"
        )

@router.put("/complete", response_model=TaskResponse)
async def complete_task_endpoint(
    task_complete: TaskComplete,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    タスクを完了状態にするエンドポイント
    """
    try:
        updated_task = complete_task(
            db=db,
            task_id=task_complete.task_id,
            user_id=current_user.id
        )
        if not updated_task:
            raise HTTPException(
                status_code=404,
                detail="タスクが見つかりません"
            )
        return updated_task
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"タスクの完了処理に失敗しました: {str(e)}"
        )

@router.get("/list", response_model=List[TaskResponse])
async def list_tasks_endpoint(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    ユーザーのタスク一覧を取得するエンドポイント
    """
    try:
        tasks = get_user_tasks(
            db=db,
            user_id=current_user.id
        )
        return tasks
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"タスク一覧の取得に失敗しました: {str(e)}"
        )