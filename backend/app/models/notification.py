"""In-app notifications for booking outcomes, published content, and system events."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.constants import TITLE_MAX
from app.db import Base


class Notification(Base):
    """One row per user-facing notification (UniHive UI/UX entity)."""

    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    type: Mapped[str] = mapped_column(String(64), index=True)
    title: Mapped[str] = mapped_column(String(TITLE_MAX))
    message: Mapped[str] = mapped_column(Text)
    link_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
