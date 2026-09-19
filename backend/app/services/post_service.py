"""Post create/list/get/edit/archive with audience targeting and ownership checks."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import Select, case, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.constants import (
    ACADEMIC_OWN_FACULTY_TYPES,
    AUDIT_ARCHIVE,
    AUDIT_EDIT,
    AUDIT_PUBLISH,
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    POST_TYPE_PERMISSION,
    QUERY_MIN_LEN,
    SEARCH_SNIPPET_MAX,
    SEED_MARKER,
    SOCIETY_OWN_TYPES,
    PostStatus,
    PostType,
    Role,
)
from app.errors import AppError
from app.models.platform import AuditLog
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, SearchHit
from app.security import user_has_permission


def _now() -> datetime:
    return datetime.now(UTC)


def _role(user: User) -> Role:
    return Role(user.role)


def _is_admin(user: User) -> bool:
    return _role(user) in {Role.ADMIN, Role.SUPER_ADMIN}


def can_manage_post(user: User, post: Post) -> bool:
    return post.author_id == user.id or _is_admin(user)


def apply_visibility(query: Select[tuple[Post]], user: User | None) -> Select[tuple[Post]]:
    """Published, live posts. Students also match every non-null audience field."""
    now = _now()
    query = query.where(
        Post.status == PostStatus.PUBLISHED.value,
        or_(Post.expires_at.is_(None), Post.expires_at > now),
        or_(Post.starts_at.is_(None), Post.starts_at <= now),
    )
    if user is None:
        return query.where(
            Post.faculty.is_(None),
            Post.year.is_(None),
            Post.programme.is_(None),
        )
    if _role(user) == Role.STUDENT:
        return query.where(
            or_(Post.faculty.is_(None), Post.faculty == user.faculty),
            or_(Post.year.is_(None), Post.year == user.year),
            or_(Post.programme.is_(None), Post.programme == user.programme),
        )
    return query


def _sorted(query: Select[tuple[Post]]) -> Select[tuple[Post]]:
    emergency_first = case((Post.type == PostType.EMERGENCY.value, 0), else_=1)
    return query.order_by(emergency_first, Post.pinned.desc(), Post.created_at.desc())


def _page(query: Select[tuple[Post]], db: Session, page: int, page_size: int) -> tuple[list[Post], int]:
    size = min(page_size, PAGE_SIZE_MAX)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        _sorted(query.options(selectinload(Post.author))).offset((page - 1) * size).limit(size)
    ).all()
    return list(rows), total


def list_posts(
    db: Session,
    user: User | None,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    post_type: PostType | None = None,
) -> tuple[list[Post], int]:
    query = apply_visibility(select(Post), user)
    if post_type is not None:
        query = query.where(Post.type == post_type.value)
    return _page(query, db, page, page_size)


def list_mine(
    db: Session,
    user: User,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    post_type: PostType | None = None,
    status: PostStatus | None = None,
    q: str | None = None,
) -> tuple[list[Post], int]:
    query = select(Post).where(Post.author_id == user.id)
    if post_type is not None:
        query = query.where(Post.type == post_type.value)
    if status is not None:
        query = query.where(Post.status == status.value)
    needle = (q or "").strip()
    if needle:
        pattern = _ilike_pattern(needle)
        query = query.where(
            or_(
                Post.title.ilike(pattern, escape="\\"),
                Post.body.ilike(pattern, escape="\\"),
            )
        )
    return _page(query, db, page, page_size)


def get_visible_post(db: Session, post_id: UUID, user: User | None) -> Post:
    post = db.scalars(select(Post).where(Post.id == post_id).options(selectinload(Post.author))).first()
    if post is None:
        raise AppError(404, "NOT_FOUND", "Post not found")
    if user is not None and can_manage_post(user, post):
        return post
    visible = db.scalars(apply_visibility(select(Post).where(Post.id == post_id), user)).first()
    if visible is None:
        raise AppError(404, "NOT_FOUND", "Post not found")
    return post


def _apply_ownership(user: User, post_type: PostType, faculty: str | None, society_id: UUID | None) -> tuple[str | None, UUID | None]:
    role = _role(user)

    if role == Role.ACADEMIC and post_type in ACADEMIC_OWN_FACULTY_TYPES:
        if faculty and user.faculty and faculty != user.faculty:
            raise AppError(403, "FORBIDDEN", "Academics can only publish for their own faculty")
        faculty = faculty or user.faculty

    if role == Role.SOCIETY_REP and post_type in SOCIETY_OWN_TYPES:
        if user.society_id is None:
            raise AppError(403, "FORBIDDEN", "Society representatives must be linked to a society")
        if society_id and society_id != user.society_id:
            raise AppError(403, "FORBIDDEN", "You can only publish for your own society")
        society_id = user.society_id

    return faculty, society_id


def _assert_can_publish_type(user: User, post_type: PostType) -> None:
    permission = POST_TYPE_PERMISSION[post_type]
    if not user_has_permission(user.role, permission):
        raise AppError(403, "FORBIDDEN", "You do not have permission to publish this type")


def _validate_window(starts_at: datetime | None, expires_at: datetime | None) -> None:
    if expires_at and starts_at and expires_at <= starts_at:
        raise AppError(422, "VALIDATION_ERROR", "Expiry must be after the start time")


def _pin_for_type(post_type: PostType, pinned: bool) -> bool:
    if post_type == PostType.EMERGENCY:
        return True
    return pinned


def _audit(db: Session, user: User, action: str, post: Post, extra: dict | None = None) -> None:
    meta = {"type": post.type, SEED_MARKER: False}
    if extra:
        meta.update(extra)
    db.add(
        AuditLog(
            actor_id=user.id,
            action=action,
            entity_type="post",
            entity_id=str(post.id),
            meta=meta,
        )
    )


def create_post(db: Session, user: User, payload: PostCreate) -> Post:
    _assert_can_publish_type(user, payload.type)
    _validate_window(payload.starts_at, payload.expires_at)

    faculty, society_id = _apply_ownership(user, payload.type, payload.faculty, payload.society_id)
    post = Post(
        type=payload.type.value,
        title=payload.title,
        body=payload.body,
        status=payload.status.value,
        pinned=_pin_for_type(payload.type, payload.pinned),
        faculty=faculty,
        year=payload.year,
        programme=payload.programme,
        starts_at=payload.starts_at,
        expires_at=payload.expires_at,
        location=payload.location,
        event_at=payload.event_at,
        deadline_at=payload.deadline_at,
        apply_url=payload.apply_url,
        society_id=society_id,
        details=payload.details,
        author_id=user.id,
    )
    db.add(post)
    db.flush()
    if payload.status == PostStatus.PUBLISHED:
        _audit(db, user, AUDIT_PUBLISH, post)
    db.commit()
    db.refresh(post)
    _ = post.author
    return post


def update_post(db: Session, user: User, post_id: UUID, payload: PostUpdate) -> Post:
    post = db.scalars(select(Post).where(Post.id == post_id).options(selectinload(Post.author))).first()
    if post is None:
        raise AppError(404, "NOT_FOUND", "Post not found")
    if not can_manage_post(user, post):
        raise AppError(403, "FORBIDDEN", "You can only edit your own content")

    data = payload.model_dump(exclude_unset=True)
    next_type = data["type"] if "type" in data else PostType(post.type)
    if isinstance(next_type, str):
        next_type = PostType(next_type)
    if "type" in data:
        _assert_can_publish_type(user, next_type)

    next_faculty = data["faculty"] if "faculty" in data else post.faculty
    next_society = data["society_id"] if "society_id" in data else post.society_id
    next_faculty, next_society = _apply_ownership(user, next_type, next_faculty, next_society)

    next_starts = data["starts_at"] if "starts_at" in data else post.starts_at
    next_expires = data["expires_at"] if "expires_at" in data else post.expires_at
    _validate_window(next_starts, next_expires)

    previous_status = post.status
    for key, value in data.items():
        if key in {"type", "status"} and hasattr(value, "value"):
            value = value.value
        setattr(post, key, value)

    post.type = next_type.value
    post.faculty = next_faculty
    post.society_id = next_society
    post.pinned = _pin_for_type(next_type, post.pinned)

    db.flush()
    if post.status == PostStatus.ARCHIVED.value and previous_status != PostStatus.ARCHIVED.value:
        _audit(db, user, AUDIT_ARCHIVE, post)
    elif post.status == PostStatus.PUBLISHED.value and previous_status != PostStatus.PUBLISHED.value:
        _audit(db, user, AUDIT_PUBLISH, post)
    else:
        _audit(db, user, AUDIT_EDIT, post)
    db.commit()
    db.refresh(post)
    _ = post.author
    return post


def _ilike_pattern(query: str) -> str:
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def _snippet(body: str, query: str) -> str:
    text = " ".join(body.split())
    if not text:
        return ""
    needle = query.lower()
    lowered = text.lower()
    index = lowered.find(needle)
    if index == -1:
        clipped = text[:SEARCH_SNIPPET_MAX]
        return clipped + ("…" if len(text) > SEARCH_SNIPPET_MAX else "")
    start = max(0, index - 40)
    chunk = text[start : start + SEARCH_SNIPPET_MAX]
    prefix = "…" if start else ""
    suffix = "…" if start + SEARCH_SNIPPET_MAX < len(text) else ""
    return f"{prefix}{chunk}{suffix}"


def _href(post: Post) -> str:
    if post.type == PostType.EVENT.value:
        return f"/events/{post.id}"
    if post.type == PostType.GUEST_LECTURE.value:
        return "/lectures"
    return "/"


def search_posts(
    db: Session,
    user: User | None,
    q: str,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    post_type: PostType | None = None,
) -> tuple[list[SearchHit], int, str]:
    needle = q.strip()
    if len(needle) < QUERY_MIN_LEN:
        return [], 0, needle

    query = apply_visibility(select(Post), user)
    if post_type is not None:
        query = query.where(Post.type == post_type.value)

    pattern = _ilike_pattern(needle)
    query = query.where(
        or_(
            Post.title.ilike(pattern, escape="\\"),
            Post.body.ilike(pattern, escape="\\"),
        )
    )
    rows, total = _page(query, db, page, page_size)
    hits = [
        SearchHit(
            id=row.id,
            type=row.type,
            title=row.title,
            snippet=_snippet(row.body, needle),
            href=_href(row),
        )
        for row in rows
    ]
    return hits, total, needle
