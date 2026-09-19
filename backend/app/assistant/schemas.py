"""Assistant request and response schemas."""

from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.constants import ASSISTANT_MAX_QUESTION_CHARS, ASSISTANT_SESSION_ID_MAX


class AssistantChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=ASSISTANT_MAX_QUESTION_CHARS)
    session_id: str | None = Field(default=None, max_length=ASSISTANT_SESSION_ID_MAX)
    language_pref: str | None = Field(default=None, max_length=16)

    @field_validator("question")
    @classmethod
    def strip_question(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned


class AssistantSource(BaseModel):
    type: str
    id: str
    title: str
    snippet: str
    url: str


class AssistantAction(BaseModel):
    label: str
    href: str


class AssistantChatResponse(BaseModel):
    answer: str
    sources: list[AssistantSource]
    actions: list[AssistantAction]
    intent: str
    language: str
    fallback: bool
    escalated: bool
    query_id: uuid.UUID | None = None


class AssistantFeedbackRequest(BaseModel):
    query_id: uuid.UUID
    rating: Literal[-1, 1]


class InsightQuestion(BaseModel):
    question: str
    intent: str | None = None
    answered: bool = False
    fallback: bool = False
    feedback: int | None = None
    created_at: str | None = None


class AssistantInsightsResponse(BaseModel):
    unanswered: list[InsightQuestion]
    top_questions: list[InsightQuestion]
