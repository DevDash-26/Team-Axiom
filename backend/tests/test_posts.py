"""Audience targeting, permission denials, and validation for the post engine."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import Faculty, PostStatus, PostType
from app.models.post import Post
from app.models.user import User
from tests.conftest import bind_user


def _add_post(db: Session, author: User, **kwargs) -> Post:
    post = Post(
        type=kwargs.pop("type", PostType.ANNOUNCEMENT.value),
        title=kwargs.pop("title"),
        body=kwargs.pop("body", "Body"),
        status=kwargs.pop("status", PostStatus.PUBLISHED.value),
        author_id=author.id,
        **kwargs,
    )
    db.add(post)
    db.flush()
    return post


def _titles(client: TestClient) -> set[str]:
    return {item["title"] for item in client.get("/api/posts").json()["items"]}


def test_student_sees_only_targeted_posts(
    db_session: Session,
    admin_user: User,
    computing_student: User,
    business_student: User,
    client: TestClient,
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
    _add_post(
        db_session,
        admin_user,
        title="Not started yet",
        starts_at=datetime.now(UTC) + timedelta(days=2),
    )
    _add_post(
        db_session,
        admin_user,
        title="Archived notice",
        status=PostStatus.ARCHIVED.value,
    )

    bind_user(computing_student)
    computing_titles = _titles(client)
    bind_user(business_student)
    business_titles = _titles(client)

    assert "Campus wide" in computing_titles
    assert "Computing only" in computing_titles
    assert "Business year 1" not in computing_titles
    assert "Hidden draft" not in computing_titles
    assert "Already expired" not in computing_titles
    assert "Not started yet" not in computing_titles
    assert "Archived notice" not in computing_titles

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


def test_finance_cannot_create_announcement(finance_client: TestClient) -> None:
    response = finance_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Budget", "body": "Finance cannot publish this."},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_society_rep_cannot_create_announcement(society_rep_client: TestClient) -> None:
    response = society_rep_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Club", "body": "Society reps cannot publish this."},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_academic_cannot_create_emergency(academic_client: TestClient) -> None:
    response = academic_client.post(
        "/api/posts",
        json={"type": "EMERGENCY", "title": "Alarm", "body": "Only admin may publish emergencies."},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_academic_cannot_publish_other_faculty(academic_client: TestClient) -> None:
    response = academic_client.post(
        "/api/posts",
        json={
            "type": "ANNOUNCEMENT",
            "title": "Wrong faculty",
            "body": "Computing academics cannot target Business.",
            "faculty": "BUSINESS",
        },
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_student_cannot_edit_someone_elses_post(
    db_session: Session, admin_user: User, computing_client: TestClient
) -> None:
    post = _add_post(db_session, admin_user, title="Staff owned")
    response = computing_client.patch(
        f"/api/posts/{post.id}",
        json={"title": "Hijacked"},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_unauthenticated_create_is_401(client: TestClient) -> None:
    response = client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Anon", "body": "Must sign in first."},
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"


def test_admin_create_missing_title_is_422(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "", "body": "Missing title"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_admin_create_unknown_faculty_is_422(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={
            "type": "ANNOUNCEMENT",
            "title": "Bad faculty",
            "body": "Faculty must be a known value.",
            "faculty": "MEDICINE",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_admin_create_expiry_before_start_is_422(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={
            "type": "ANNOUNCEMENT",
            "title": "Bad window",
            "body": "Expiry must be after start.",
            "starts_at": "2026-09-20T10:00:00Z",
            "expires_at": "2026-09-19T10:00:00Z",
        },
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_admin_cannot_create_archived_is_422(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={
            "type": "ANNOUNCEMENT",
            "title": "Archived create",
            "body": "Must start as draft or published.",
            "status": "ARCHIVED",
        },
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


def test_admin_can_create_emergency(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/posts",
        json={"type": "EMERGENCY", "title": "Water outage", "body": "Use Block A until 16:00.", "pinned": False},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["type"] == "EMERGENCY"
    assert body["pinned"] is True


def test_academic_can_create_announcement(academic_client: TestClient) -> None:
    response = academic_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Lab closed", "body": "Computing lab B is closed Friday."},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["faculty"] == Faculty.COMPUTING.value
    assert body["author"]["role"] == "ACADEMIC"


def test_academic_can_create_calendar_and_guest_lecture(academic_client: TestClient) -> None:
    calendar = academic_client.post(
        "/api/posts",
        json={
            "type": "CALENDAR_ENTRY",
            "title": "Add/drop deadline",
            "body": "Closes Friday at 16:00.",
            "event_at": "2026-09-26T10:30:00Z",
        },
    )
    assert calendar.status_code == 201
    lecture = academic_client.post(
        "/api/posts",
        json={
            "type": "GUEST_LECTURE",
            "title": "Responsible AI",
            "body": "Open to Computing students.",
            "event_at": "2026-09-24T09:00:00Z",
            "location": "Hall A",
        },
    )
    assert lecture.status_code == 201
    assert lecture.json()["location"] == "Hall A"


def test_student_can_mark_event_interest(academic_client: TestClient, computing_student, client: TestClient) -> None:
    created = academic_client.post(
        "/api/posts",
        json={
            "type": "EVENT",
            "title": "Club night",
            "body": "Games and snacks in the atrium.",
            "event_at": "2026-09-24T17:00:00Z",
            "location": "Atrium",
        },
    )
    assert created.status_code == 201
    from tests.conftest import bind_user

    bind_user(computing_student)
    interest = client.post(f"/api/posts/{created.json()['id']}/interest")
    assert interest.status_code == 201
    assert interest.json()["total"] == 1
    assert interest.json()["viewer_interested"] is True


def test_student_cannot_create_calendar(computing_client: TestClient) -> None:
    response = computing_client.post(
        "/api/posts",
        json={
            "type": "CALENDAR_ENTRY",
            "title": "Fake deadline",
            "body": "Students cannot publish calendar entries.",
            "event_at": "2026-09-26T10:30:00Z",
        },
    )
    assert response.status_code == 403


def test_admin_can_create_job_and_schedule_change(admin_client: TestClient) -> None:
    job = admin_client.post(
        "/api/posts",
        json={
            "type": "JOB",
            "title": "Campus intern",
            "body": "Finance office internship.",
            "deadline_at": "2026-10-10T10:00:00Z",
            "apply_url": "https://unihive.ucl.lk/opportunities",
        },
    )
    assert job.status_code == 201
    change = admin_client.post(
        "/api/posts",
        json={
            "type": "SCHEDULE_CHANGE",
            "title": "Lab B closed Friday",
            "body": "Use Lab A until noon.",
        },
    )
    assert change.status_code == 201


def test_calendar_missing_event_at_is_422(academic_client: TestClient) -> None:
    response = academic_client.post(
        "/api/posts",
        json={"type": "CALENDAR_ENTRY", "title": "Missing date", "body": "Needs an event date."},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_author_can_edit_and_archive(
    admin_user: User,
    computing_student: User,
    client: TestClient,
) -> None:
    bind_user(admin_user)
    created = client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Editable", "body": "Will be updated then archived."},
    )
    assert created.status_code == 201
    post_id = created.json()["id"]

    edited = client.patch(f"/api/posts/{post_id}", json={"title": "Updated title"})
    assert edited.status_code == 200
    assert edited.json()["title"] == "Updated title"

    archived = client.patch(f"/api/posts/{post_id}", json={"status": "ARCHIVED"})
    assert archived.status_code == 200
    assert archived.json()["status"] == "ARCHIVED"
    bind_user(computing_student)
    assert "Updated title" not in _titles(client)

    bind_user(admin_user)
    mine = client.get("/api/posts/mine")
    assert mine.status_code == 200
    mine_titles = {item["title"] for item in mine.json()["items"]}
    assert "Updated title" in mine_titles


def test_student_feed_does_not_include_drafts_from_mine(
    academic_user: User,
    computing_student: User,
    client: TestClient,
) -> None:
    bind_user(academic_user)
    created = client.post(
        "/api/posts",
        json={
            "type": "ANNOUNCEMENT",
            "title": "Staff draft",
            "body": "Still being written.",
            "status": "DRAFT",
        },
    )
    assert created.status_code == 201
    mine = client.get("/api/posts/mine?status=DRAFT")
    assert any(item["title"] == "Staff draft" for item in mine.json()["items"])
    bind_user(computing_student)
    assert "Staff draft" not in _titles(client)


def test_search_respects_audience_and_hides_drafts(
    db_session: Session,
    admin_user: User,
    computing_student: User,
    business_student: User,
    client: TestClient,
) -> None:
    token = "zxlabniner"
    _add_post(
        db_session,
        admin_user,
        title=f"Computing {token} booking",
        body=f"{token} opens Monday.",
        faculty=Faculty.COMPUTING.value,
    )
    _add_post(
        db_session,
        admin_user,
        title="Business induction",
        body="Hall A on Wednesday.",
        faculty=Faculty.BUSINESS.value,
        year=1,
    )
    _add_post(
        db_session,
        admin_user,
        title=f"Computing secret {token} draft",
        body=f"{token} draft only.",
        status=PostStatus.DRAFT.value,
    )

    bind_user(computing_student)
    computing = client.get("/api/search", params={"q": token, "type": "ANNOUNCEMENT"})
    assert computing.status_code == 200
    computing_titles = {item["title"] for item in computing.json()["items"]}
    assert f"Computing {token} booking" in computing_titles
    assert f"Computing secret {token} draft" not in computing_titles
    assert "Business induction" not in computing_titles

    bind_user(business_student)
    business = client.get("/api/search", params={"q": token, "type": "ANNOUNCEMENT"})
    assert business.json()["items"] == []
