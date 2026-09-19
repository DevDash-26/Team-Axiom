"""FAQ list, category filter, and permission checks for the info engine."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import InfoCategory
from app.models.info import Faq
from app.models.user import User


def _add_faq(db: Session, question: str, category: str = InfoCategory.IT.value) -> Faq:
    faq = Faq(question=question, answer=f"Answer for {question}", category=category)
    db.add(faq)
    db.flush()
    return faq


def test_student_can_list_and_filter_faqs(
    db_session: Session,
    computing_client: TestClient,
) -> None:
    _add_faq(db_session, "Reset Wi-Fi?", InfoCategory.IT.value)
    _add_faq(db_session, "Library hours?", InfoCategory.LIBRARY.value)

    all_items = computing_client.get("/api/info/faqs").json()
    assert all_items["total"] >= 2
    assert InfoCategory.IT.value in all_items["categories"]

    filtered = computing_client.get("/api/info/faqs", params={"category": InfoCategory.IT.value}).json()
    assert filtered["total"] >= 1
    assert all(item["category"] == InfoCategory.IT.value for item in filtered["items"])

    searched = computing_client.get("/api/info/faqs", params={"q": "Library"}).json()
    assert any("Library" in item["question"] for item in searched["items"])


def test_student_cannot_create_faq(computing_client: TestClient) -> None:
    response = computing_client.post(
        "/api/info/faqs",
        json={
            "question": "Can students publish FAQs?",
            "answer": "No.",
            "category": InfoCategory.IT.value,
        },
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_admin_can_create_faq(admin_client: TestClient, admin_user: User) -> None:
    assert admin_user.role == "ADMIN"
    response = admin_client.post(
        "/api/info/faqs",
        json={
            "question": "Where is the IT helpdesk?",
            "answer": "Level 2, opposite the library entrance.",
            "category": InfoCategory.IT.value,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["question"] == "Where is the IT helpdesk?"
    assert body["category"] == InfoCategory.IT.value
