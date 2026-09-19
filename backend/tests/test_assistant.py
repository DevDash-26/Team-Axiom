"""Assistant chat happy path, RAG sources, refusal, and admin insights."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import InfoCategory
from app.models.info import Faq, InfoPage, StaffContact
from tests.conftest import bind_user


def test_out_of_scope_is_refused(computing_client: TestClient) -> None:
    response = computing_client.post(
        "/api/assistant/chat",
        json={"question": "How do I buy bitcoin and write my dating profile?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["escalated"] is True
    assert body["language"] == "en"
    assert "campus" in body["answer"].lower()


def test_singlish_question_sets_language_and_can_retrieve(
    db_session: Session,
    computing_client: TestClient,
) -> None:
    db_session.add(
        Faq(
            question="How do I reset my UCL Wi-Fi password?",
            answer="Visit the IT helpdesk on Level 2.",
            category=InfoCategory.IT.value,
        )
    )
    db_session.flush()

    response = computing_client.post(
        "/api/assistant/chat",
        json={"question": "WiFi password eka reset karanna puluwanda?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["language"] == "si_latn"
    assert body["intent"] in {"INFO", "OTHER"}
    assert body["answer"]
    assert body["sources"]
    assert body["sources"][0]["type"] == "FAQ"


def test_in_scope_question_returns_sources_and_actions(
    db_session: Session,
    computing_client: TestClient,
) -> None:
    db_session.add_all(
        [
            Faq(
                question="What are the library opening hours during term?",
                answer="Monday to Friday 08:00–20:00, Saturday 09:00–14:00.",
                category=InfoCategory.LIBRARY.value,
            ),
            InfoPage(
                category=InfoCategory.LIBRARY.value,
                title="Library services",
                body="Silent floors and seven-day loans are available at the main library.",
            ),
        ]
    )
    db_session.flush()

    response = computing_client.post(
        "/api/assistant/chat",
        json={"question": "What are the library opening hours?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["escalated"] is False
    assert len(body["sources"]) >= 1
    assert any(source["type"] in {"FAQ", "INFO"} for source in body["sources"])
    assert body["actions"]
    # Without an LLM key this is search-only fallback; with a key it is grounded text.
    assert body["answer"]


def test_lost_id_guides_to_lost_found_action(
    db_session: Session,
    computing_client: TestClient,
) -> None:
    db_session.add(
        Faq(
            question="I lost my student ID card. What should I do?",
            answer="Report it on UniHive Lost and Found, then visit Student Services.",
            category=InfoCategory.ONBOARDING.value,
        )
    )
    db_session.flush()

    response = computing_client.post(
        "/api/assistant/chat",
        json={"question": "I lost my ID card, what do I do?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["intent"] == "LOST_FOUND"
    hrefs = {action["href"] for action in body["actions"]}
    assert "/lost-found" in hrefs or "/student/lost-found/new" in hrefs
    assert body["sources"]


def test_no_results_escalates_without_inventing(
    computing_client: TestClient,
) -> None:
    response = computing_client.post(
        "/api/assistant/chat",
        json={"question": "Where is the subterranean quantum telescope lab?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["escalated"] is True
    assert body["sources"] == []
    assert "could not find" in body["answer"].lower() or "matching" in body["answer"].lower()


def test_staff_directory_is_retrievable(
    db_session: Session,
    computing_client: TestClient,
) -> None:
    db_session.add(
        StaffContact(
            name="Kasun Jayasuriya",
            role_title="IT Helpdesk Lead",
            department="IT",
            email="it.help@ucl.lk",
            office_hours="Mon–Fri 08:30–16:30",
        )
    )
    db_session.flush()

    response = computing_client.post(
        "/api/assistant/chat",
        json={"question": "Who is the IT helpdesk lead and what are their office hours?"},
    )
    assert response.status_code == 200
    body = response.json()
    types = {source["type"] for source in body["sources"]}
    blob = " ".join(f"{source['title']} {source['snippet']}" for source in body["sources"]).lower()
    assert types.intersection({"STAFF", "CHUNK", "FAQ", "INFO"})
    assert "helpdesk" in blob or "hours" in blob


def test_admin_insights_requires_admin(
    client: TestClient,
    computing_student,
    admin_user,
) -> None:
    bind_user(computing_student)
    forbidden = client.get("/api/admin/assistant/insights")
    assert forbidden.status_code == 403

    bind_user(admin_user)
    allowed = client.get("/api/admin/assistant/insights")
    assert allowed.status_code == 200
    payload = allowed.json()
    assert "unanswered" in payload
    assert "top_questions" in payload
