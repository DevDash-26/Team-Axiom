"""Language detection and Singlish/Sinhala reply routing for UniHive AI."""

from app.assistant.language import (
    detect_script_language,
    looks_like_singlish,
    resolve_reply_language,
    retrieval_query,
)
from app.assistant.templates import canned


def test_detects_sinhala_script() -> None:
    assert detect_script_language("පුස්තකාලය කීයට විවෘතද?") == "si"
    assert resolve_reply_language(message="පුස්තකාලය කීයට විවෘතද?") == "si"


def test_detects_singlish_particles() -> None:
    assert looks_like_singlish("Library eka open wenna puluwanda?")
    assert resolve_reply_language(message="Library eka open wenna puluwanda?") == "si_latn"


def test_english_default() -> None:
    assert resolve_reply_language(message="What are the library hours?") == "en"
    assert not looks_like_singlish("What are the library hours?")


def test_retrieval_query_strips_singlish_noise() -> None:
    cleaned = retrieval_query("Library eka open wenna puluwanda?")
    assert "library" in cleaned.lower()
    assert "puluwanda" not in cleaned.lower()


def test_canned_templates_follow_language() -> None:
    assert "campus" in canned("out_of_scope", "en").lower()
    assert "කැම්පස්" in canned("out_of_scope", "si")
    assert "campus" in canned("out_of_scope", "si_latn").lower()
