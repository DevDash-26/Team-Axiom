"""Audience targeting, permission denials, and validation for the post engine."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import Faculty, PostStatus, PostType
from app.models.post import Post
from app.models.user import User


def _add_post(db: Session, author: User, **kwargs) -> Post:
    post = Post(
        type=PostType.ANNOUNCEMENT.value,
        title=kwargs.pop("title"),
        body=kwargs.pop("body", "Body"),
        status=kwargs.pop("status", PostStatus.PUBLISHED.value),
        author_id=author.id,
        **kwargs,
    )
    db.add(post)
    db.flush()
    return post


def test_student_sees_only_targeted_posts(
    db_session: Session,
    admin_user: User,
    computing_client: TestClient,
    business_client: TestClient,
) -> None:
    _add_post(db_session, admin_user, title="Campus wide")
    _add_post(
        db_session,
        admin_user,
        title="Computing only",
        faculty=Faculty.COMPUTING.value,
    )
    _add_post(
        db_session,
        admin_user,
        title="Business year 1",
        faculty=Faculty.BUSINESS.value,
        year=1,
    )
    _add_post(
        db_session,
        admin_user,
        title="Hidden draft",
        status=PostStatus.DRAFT.value,
    )
    _add_post(
        db_session,
        admin_user,
        title="Already expired",
        expires_at=datetime.now(UTC) - timedelta(hours=1),
    )

    computing_titles = {item["title"] for item in computing_client.get("/api/posts").json()["items"]}
    business_titles = {item["title"] for item in business_client.get("/api/posts").json()["items"]}

    assert "Campus wide" in computing_titles
    assert "Computing only" in computing_titles
    assert "Business year 1" not in computing_titles
    assert "Hidden draft" not in computing_titles
    assert "Already expired" not in computing_titles

    assert "Campus wide" in business_titles
    assert "Business year 1" in business_titles
    assert "Computing only" not in business_titles


def test_student_cannot_create_announcement(computing_client: TestClient) -> None:
    response = computing_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Nope", "body": "Students cannot publish this."},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_admin_create_missing_title_is_422(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "", "body": "Missing title"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_admin_can_create_announcement(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Staff notice", "body": "Published by admin."},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Staff notice"
    assert body["author"]["role"] == "ADMIN"
    assert "email" not in body["author"]
