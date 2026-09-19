"""Info engine request and response schemas (FAQs, pages, directory)."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import BODY_MAX, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX, InfoCategory


class FaqCreate(BaseModel):
    question: str = Field(min_length=1, max_length=TITLE_MAX)
    answer: str = Field(min_length=1, max_length=BODY_MAX)
    category: InfoCategory

    @field_validator("question", "answer")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned


class FaqRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question: str
    answer: str
    category: str
    created_at: datetime


class FaqListResponse(BaseModel):
    items: list[FaqRead]
    page: int
    page_size: int
    total: int
    categories: list[str]
