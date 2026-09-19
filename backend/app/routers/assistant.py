"""Thin HTTP layer for the campus AI assistant."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.assistant import service as assistant_service
from app.assistant.schemas import AssistantChatRequest, AssistantChatResponse, AssistantFeedbackRequest
from app.db import get_db
from app.errors import AppError
from app.models.platform import AssistantQuery
from app.models.user import User
from app.security import get_current_user

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/chat", response_model=AssistantChatResponse)
def chat(
    payload: AssistantChatRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> AssistantChatResponse:
    return assistant_service.ask(
        db,
        user,
        question=payload.question,
        session_id=payload.session_id,
        language_pref=payload.language_pref,
    )


@router.post("/feedback")
def feedback(
    payload: AssistantFeedbackRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    row = db.get(AssistantQuery, payload.query_id)
    if row is None or (row.user_id and row.user_id != user.id):
        raise AppError(404, "NOT_FOUND", "Assistant query not found")
    row.feedback = payload.rating
    db.commit()
    return {"status": "ok"}
