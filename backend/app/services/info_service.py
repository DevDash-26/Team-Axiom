"""Read-only campus information: pages, FAQs, and official staff contacts."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constants import InfoCategory
from app.errors import AppError
from app.models.info import Faq, InfoPage, StaffContact


def _category(value: str | None) -> InfoCategory | None:
    if value is None:
        return None
    try:
        return InfoCategory(value.upper())
    except ValueError as exc:
        raise AppError(422, "VALIDATION_ERROR", "Unknown information category") from exc


def list_pages(db: Session, category: str | None = None) -> list[InfoPage]:
    parsed = _category(category)
    query = select(InfoPage).order_by(InfoPage.title)
    if parsed is not None:
        query = query.where(InfoPage.category == parsed.value)
    return list(db.scalars(query).all())


def list_faqs(db: Session, category: str | None = None) -> list[Faq]:
    parsed = _category(category)
    query = select(Faq).order_by(Faq.question)
    if parsed is not None:
        query = query.where(Faq.category == parsed.value)
    return list(db.scalars(query).all())


def list_contacts(db: Session) -> list[StaffContact]:
    return list(db.scalars(select(StaffContact).order_by(StaffContact.department, StaffContact.name)).all())
