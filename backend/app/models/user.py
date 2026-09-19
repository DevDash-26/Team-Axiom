"""Campus user profile. id matches Supabase auth.users.id; no password column."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import EMAIL_MAX, NAME_MAX
from app.db import Base

if TYPE_CHECKING:
    from app.models.society import Society


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(EMAIL_MAX), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(NAME_MAX))
    role: Mapped[str] = mapped_column(String(32), index=True)
    faculty: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    programme: Mapped[str | None] = mapped_column(String(NAME_MAX), nullable=True)
    society_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("societies.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    society: Mapped[Society | None] = relationship("Society", back_populates="members")
