"""User response schemas. Never include Auth internals."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import EMAIL_MAX, NAME_MAX, PROGRAMME_MAX, YEAR_MAX, YEAR_MIN, Faculty


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str = Field(max_length=EMAIL_MAX)
    full_name: str = Field(max_length=NAME_MAX)
    role: str
    faculty: str | None
    year: int | None
    programme: str | None
    society_id: uuid.UUID | None
    is_active: bool


class UserUpdate(BaseModel):
    faculty: str | None = None
    year: int | None = Field(default=None, ge=YEAR_MIN, le=YEAR_MAX)
    programme: str | None = Field(default=None, max_length=PROGRAMME_MAX)

    @field_validator("faculty", "programme")
    @classmethod
    def strip_optional(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("faculty")
    @classmethod
    def known_faculty(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            return Faculty(value.upper()).value
        except ValueError as exc:
            raise ValueError("must be a known faculty") from exc


class AuthorPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    role: str
