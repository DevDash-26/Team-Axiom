"""Society list and membership interest."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import Faculty, MembershipStatus
from app.models.society import Society
from app.models.user import User
from tests.conftest import bind_user


def _society(db_session: Session) -> Society:
    row = Society(
        name="Test Computing Club",
        slug="test-computing-club",
        description="Projects and talks.",
        faculty=Faculty.COMPUTING.value,
    )
    db_session.add(row)
    db_session.flush()
    return row


def test_list_societies(db_session: Session, computing_client: TestClient) -> None:
    _society(db_session)
    response = computing_client.get("/api/societies")
    assert response.status_code == 200
    names = {item["name"] for item in response.json()["items"]}
    assert "Test Computing Club" in names


def test_student_can_mark_society_interest(
    db_session: Session,
    computing_student: User,
    client: TestClient,
) -> None:
    society = _society(db_session)
    bind_user(computing_student)
    response = client.post(f"/api/societies/{society.slug}/interest")
    assert response.status_code == 201
    assert response.json()["viewer_interested"] is True
    assert response.json()["interest_count"] == 1
    duplicate = client.post(f"/api/societies/{society.slug}/interest")
    assert duplicate.status_code == 409
    assert MembershipStatus.INTERESTED.value == "INTERESTED"
