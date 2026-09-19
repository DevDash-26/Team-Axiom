"""Info engine business logic: pages, FAQs, and official staff contacts."""

from __future__ import annotations

import re

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.assistant.language import retrieval_query
from app.constants import PAGE_SIZE_DEFAULT, InfoCategory
from app.errors import AppError
from app.models.info import Faq, InfoPage, StaffContact
from app.schemas.info import FaqCreate


def _search_tokens(text: str) -> list[str]:
    normalized = retrieval_query(text).strip().lower()
    if not normalized:
        return []
    return [token.replace("-", "") for token in normalized.split() if len(token.replace("-", "")) >= 3]


def _question_tokens(text: str) -> set[str]:
    normalized = retrieval_query(text).lower()
    return {token for token in re.findall(r"[a-z0-9]+", normalized) if len(token) >= 4}


def _text_matches_tokens(column, tokens: list[str]):
    normalized_column = func.replace(func.lower(column), "-", "")
    return or_(*[normalized_column.ilike(f"%{token}%") for token in tokens])


FAQ_BROWSE_CATEGORIES: tuple[InfoCategory, ...] = (
    InfoCategory.FAQ,
    InfoCategory.IT,
    InfoCategory.LIBRARY,
    InfoCategory.WELLBEING,
    InfoCategory.DINING,
    InfoCategory.PRINTING,
    InfoCategory.FINANCIAL_AID,
    InfoCategory.SPORTS,
    InfoCategory.ONBOARDING,
)


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


def list_faqs(
    db: Session,
    *,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    category: str | None = None,
    q: str | None = None,
) -> tuple[list[Faq], int, list[str]]:
    query = select(Faq)
    count_query = select(func.count()).select_from(Faq)

    parsed = _category(category)
    if parsed is not None:
        query = query.where(Faq.category == parsed.value)
        count_query = count_query.where(Faq.category == parsed.value)

    tokens = _search_tokens(q or "")
    if tokens:
        filter_clause = or_(_text_matches_tokens(Faq.question, tokens), _text_matches_tokens(Faq.answer, tokens))
        query = query.where(filter_clause)
        count_query = count_query.where(filter_clause)

    total = int(db.scalar(count_query) or 0)
    items = list(
        db.scalars(
            query.order_by(Faq.category.asc(), Faq.question.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    categories = [item.value for item in FAQ_BROWSE_CATEGORIES]
    return items, total, categories


def list_contacts(db: Session) -> list[StaffContact]:
    return list(db.scalars(select(StaffContact).order_by(StaffContact.department, StaffContact.name)).all())


def find_similar_faq(db: Session, question: str) -> Faq | None:
    """Return an existing FAQ when normalized question tokens overlap (intelligence check)."""
    incoming = _question_tokens(question)
    if not incoming:
        return None
    for faq in db.scalars(select(Faq)).all():
        existing = _question_tokens(faq.question)
        overlap = incoming & existing
        if len(overlap) >= 2:
            return faq
        if len(overlap) == 1 and len(incoming) == 1:
            return faq
    return None


def create_faq(db: Session, payload: FaqCreate) -> Faq:
    if payload.category not in FAQ_BROWSE_CATEGORIES:
        raise AppError(422, "INVALID_CATEGORY", "FAQ category is not supported")
    duplicate = find_similar_faq(db, payload.question)
    if duplicate is not None:
        raise AppError(409, "DUPLICATE_FAQ", "A similar FAQ already exists")
    faq = Faq(
        question=payload.question,
        answer=payload.answer,
        category=payload.category.value,
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq
