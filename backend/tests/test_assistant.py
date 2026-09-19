"""Assistant chat happy path and out-of-scope refusal."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import InfoCategory
from app.models.info import Faq


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
    # Without LLM key we expect fallback search text or a campus answer.
    assert body["answer"]
