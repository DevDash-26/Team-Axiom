"""Info engine business logic: FAQs and related campus knowledge."""

from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, InfoCategory
from app.errors import AppError
from app.models.info import Faq
from app.schemas.info import FaqCreate


# Categories students browse on Campus Services (FAQ rows use these labels).
FAQ_BROWSE_CATEGORIES: tuple[InfoCategory, ...] = (
    InfoCategory.IT,
    InfoCategory.LIBRARY,
    InfoCategory.WELLBEING,
    InfoCategory.DINING,
    InfoCategory.PRINTING,
    InfoCategory.FINANCIAL_AID,
    InfoCategory.SPORTS,
    InfoCategory.ONBOARDING,
)


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

    if category:
        query = query.where(Faq.category == category)
        count_query = count_query.where(Faq.category == category)

    search = (q or "").strip()
    if search:
        pattern = f"%{search}%"
        filter_clause = or_(Faq.question.ilike(pattern), Faq.answer.ilike(pattern))
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


def create_faq(db: Session, payload: FaqCreate) -> Faq:
    if payload.category not in FAQ_BROWSE_CATEGORIES:
        raise AppError(422, "INVALID_CATEGORY", "FAQ category is not supported")
    faq = Faq(
        question=payload.question,
        answer=payload.answer,
        category=payload.category.value,
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq
