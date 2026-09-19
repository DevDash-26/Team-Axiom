"""Request create/list/get and OPEN → IN_PROGRESS → RESOLVED|CLOSED transitions."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.constants import (
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    REQUEST_TRANSITIONS,
    Permission,
    RequestStatus,
    RequestType,
    Role,
)
from app.errors import AppError
from app.models.request import Request
from app.models.user import User
from app.schemas.request import RequestCreate, RequestUpdate
from app.security import user_has_permission


def _role(user: User) -> Role:
    return Role(user.role)


def _is_admin(user: User) -> bool:
    return _role(user) in {Role.ADMIN, Role.SUPER_ADMIN}


def _can_handle_type(user: User, request_type: RequestType) -> bool:
    if _is_admin(user):
        return True
    if request_type == RequestType.ACADEMIC_SUPPORT:
        return user_has_permission(user.role, Permission.REQUESTS_HANDLE_ACADEMIC)
    return user_has_permission(user.role, Permission.REQUESTS_HANDLE_FACILITY)


def _apply_scope(query: Select[tuple[Request]], user: User) -> Select[tuple[Request]]:
    role = _role(user)
    if _is_admin(user):
        return query
    if role == Role.ACADEMIC:
        return query.where(
            or_(
                Request.type == RequestType.ACADEMIC_SUPPORT.value,
                Request.requester_id == user.id,
            )
        )
    return query.where(Request.requester_id == user.id)


def _with_people(query: Select[tuple[Request]]) -> Select[tuple[Request]]:
    return query.options(selectinload(Request.requester), selectinload(Request.handler))


def _page(query: Select[tuple[Request]], db: Session, page: int, page_size: int) -> tuple[list[Request], int]:
    size = min(page_size, PAGE_SIZE_MAX)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        _with_people(query.order_by(Request.created_at.desc())).offset((page - 1) * size).limit(size)
    ).all()
    return list(rows), total


def create_request(db: Session, user: User, payload: RequestCreate) -> Request:
    row = Request(
        type=payload.type.value,
        title=payload.title,
        body=payload.body,
        status=RequestStatus.OPEN.value,
        requester_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    _ = row.requester
    return row


def list_requests(
    db: Session,
    user: User,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    request_type: RequestType | None = None,
    status: RequestStatus | None = None,
) -> tuple[list[Request], int]:
    query = _apply_scope(select(Request), user)
    if request_type is not None:
        query = query.where(Request.type == request_type.value)
    if status is not None:
        query = query.where(Request.status == status.value)
    return _page(query, db, page, page_size)


def get_request(db: Session, user: User, request_id: UUID) -> Request:
    row = db.scalars(_with_people(select(Request).where(Request.id == request_id))).first()
    if row is None:
        raise AppError(404, "NOT_FOUND", "Request not found")
    visible = db.scalars(_apply_scope(select(Request).where(Request.id == request_id), user)).first()
    if visible is None:
        raise AppError(404, "NOT_FOUND", "Request not found")
    return row


def update_request(db: Session, user: User, request_id: UUID, payload: RequestUpdate) -> Request:
    row = get_request(db, user, request_id)
    current = RequestStatus(row.status)
    request_type = RequestType(row.type)
    if not _can_handle_type(user, request_type):
        raise AppError(403, "FORBIDDEN", "You do not have permission to handle this request")

    allowed = REQUEST_TRANSITIONS.get(current, frozenset())
    if payload.status not in allowed:
        raise AppError(409, "CONFLICT", "That status change is not allowed")

    if payload.status == RequestStatus.RESOLVED and not payload.response:
        raise AppError(422, "VALIDATION_ERROR", "A staff note is required to resolve a request")

    row.status = payload.status.value
    if payload.response is not None:
        row.response = payload.response
    if payload.status == RequestStatus.IN_PROGRESS:
        row.handler_id = user.id

    db.commit()
    db.refresh(row)
    _ = row.requester
    _ = row.handler
    return row
