"""FAQ list, category filter, pages, contacts, and permission checks."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import InfoCategory
from app.models.info import Faq, InfoPage
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


def test_faq_search_normalizes_singlish(
    db_session: Session,
    computing_client: TestClient,
) -> None:
    _add_faq(db_session, "How do I reset my UCL Wi-Fi password?", InfoCategory.IT.value)

    response = computing_client.get("/api/info/faqs", params={"q": "WiFi password eka reset karanna puluwanda?"})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1
    assert any("Wi-Fi" in item["question"] or "wifi" in item["question"].lower() for item in body["items"])


def test_faq_check_flags_similar_question(db_session: Session, client: TestClient) -> None:
    _add_faq(db_session, "How do I top up print credit?", InfoCategory.PRINTING.value)

    response = client.get(
        "/api/info/faqs/check",
        params={"question": "How do I top up my print credit balance?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["similar"] is True
    assert body["match"]["question"] == "How do I top up print credit?"


def test_admin_cannot_create_duplicate_faq(
    db_session: Session,
    admin_client: TestClient,
) -> None:
    _add_faq(db_session, "Where is the IT helpdesk?", InfoCategory.IT.value)

    response = admin_client.post(
        "/api/info/faqs",
        json={
            "question": "Where is the IT helpdesk?",
            "answer": "Duplicate row.",
            "category": InfoCategory.IT.value,
        },
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "DUPLICATE_FAQ"


def test_admin_can_create_faq(admin_client: TestClient, admin_user: User) -> None:
    assert admin_user.role == "ADMIN"
    response = admin_client.post(
        "/api/info/faqs",
        json={
            "question": "Where is the colour printer in Block B?",
            "answer": "Level 1, next to the lab entrance.",
            "category": InfoCategory.IT.value,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["question"] == "Where is the colour printer in Block B?"
    assert body["category"] == InfoCategory.IT.value


def test_list_priority_faqs(db_session: Session, client: TestClient) -> None:
    db_session.add_all(
        [
            Faq(
                category=InfoCategory.FAQ.value,
                question="How do I connect to campus Wi-Fi?",
                answer="Use UCL-WiFi and your university email.",
            ),
            Faq(
                category=InfoCategory.FINANCIAL_AID.value,
                question="When do scholarships close?",
                answer="With the add/drop deadline.",
            ),
            Faq(
                category=InfoCategory.WELLBEING.value,
                question="Is counselling confidential?",
                answer="Yes. Only Wellbeing staff see the booking.",
            ),
            Faq(
                category=InfoCategory.IT.value,
                question="Lab login failed",
                answer="Visit IT on Level 2.",
            ),
        ]
    )
    db_session.flush()

    wifi = client.get("/api/info/faqs", params={"category": "FAQ"})
    assert wifi.status_code == 200
    assert any(item["question"].startswith("How do I connect") for item in wifi.json()["items"])

    aid = client.get("/api/info/faqs", params={"category": "FINANCIAL_AID"})
    assert any("scholarships" in item["question"].lower() for item in aid.json()["items"])

    well = client.get("/api/info/faqs", params={"category": "WELLBEING"})
    assert any("confidential" in item["question"].lower() for item in well.json()["items"])


def test_unknown_info_category_is_422(client: TestClient) -> None:
    response = client.get("/api/info/faqs", params={"category": "PARKING"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_info_page_by_category(db_session: Session, client: TestClient) -> None:
    db_session.add(
        InfoPage(
            category=InfoCategory.WELLBEING.value,
            title="Wellbeing and counselling",
            body="Drop-in Tuesday and Thursday 13:00–15:00 in Room W2.",
        )
    )
    db_session.flush()
    response = client.get("/api/info/pages", params={"category": "WELLBEING"})
    assert response.status_code == 200
    assert response.json()["items"][0]["title"] == "Wellbeing and counselling"
