"""Info engine request and response schemas (pages, FAQs, directory)."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import BODY_MAX, EMAIL_MAX, NAME_MAX, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX, InfoCategory


class InfoPageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    title: str = Field(max_length=TITLE_MAX)
    body: str
    updated_at: datetime | None = None


class InfoPageListResponse(BaseModel):
    items: list[InfoPageRead]


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
    category: str
    question: str = Field(max_length=TITLE_MAX)
    answer: str
    created_at: datetime | None = None


class FaqListResponse(BaseModel):
    items: list[FaqRead]
    page: int
    page_size: int
    total: int
    categories: list[str]


class FaqCheckResponse(BaseModel):
    similar: bool
    match: FaqRead | None = None


class StaffContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str = Field(max_length=NAME_MAX)
    role_title: str = Field(max_length=NAME_MAX)
    department: str = Field(max_length=NAME_MAX)
    email: str = Field(max_length=EMAIL_MAX)
    office_hours: str | None = None


class StaffContactListResponse(BaseModel):
    items: list[StaffContactRead]
