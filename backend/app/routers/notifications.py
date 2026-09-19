"""In-app notifications for booking outcomes. Assistant endpoints are unchanged."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.platform import NotificationListResponse, NotificationRead
from app.security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> NotificationListResponse:
    rows = list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user.id)
            .order_by(Notification.created_at.desc())
            .limit(20)
        ).all()
    )
    return NotificationListResponse(
        items=[NotificationRead.model_validate(row) for row in rows],
        total=len(rows),
    )
