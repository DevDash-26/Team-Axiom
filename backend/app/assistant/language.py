"""Campus assistant reply-language helpers (English, Sinhala, Singlish).

Script detection uses Unicode ranges. Romanized Singlish is detected from
distinctive particles so the LLM and canned replies can match register.
"""

from __future__ import annotations

import re

SUPPORTED_LANGUAGES = ("en", "si", "si_latn")

LANGUAGE_NAMES = {
    "en": "English",
    "si": "Sinhala",
    "si_latn": "Singlish",
}

_SINHALA_ALIASES = frozenset({"si", "sin", "sinhala", "si-lk", "sin-lk"})
_ENGLISH_ALIASES = frozenset({"en", "eng", "english", "en-gb", "en-us", "en-lk"})
_SINGLISH_ALIASES = frozenset({"si_latn", "singlish", "si-latn"})

_SINGLISH_STRONG = frozenset(
    {
        "kiyala",
        "kiyanna",
        "kiyapan",
        "dennako",
        "thiyanawada",
        "thiyenawada",
        "karanna",
        "wenna",
        "puluwanda",
        "mokada",
        "mokakda",
        "koheda",
        "ewanna",
        "nadda",
        "ban",
        "machan",
    }
)
_SINGLISH_WEAK = frozenset(
    {
        "mata",
        "mage",
        "aka",
        "eka",
        "gena",
        "denna",
        "hari",
        "nehe",
        "oww",
        "ada",
        "heta",
        "tike",
        "tika",
        "ona",
        "oona",
        "kauda",
    }
)
_RETRIEVAL_DROP = _SINGLISH_STRONG | _SINGLISH_WEAK | frozenset({"gana", "denne", "kyla"})


def normalize_language_pref(value: str | None) -> str:
    """Map codes to en | si | si_latn. Unknown values become en."""
    if not value:
        return "en"
    raw = value.strip().lower().replace("-", "_")
    if raw in _SINGLISH_ALIASES or raw.replace("_", "-") in {"si-latn"}:
        return "si_latn"
    code = raw.replace("_", "-")
    if code in _SINHALA_ALIASES or raw in _SINHALA_ALIASES:
        return "si"
    if code in _ENGLISH_ALIASES or raw in _ENGLISH_ALIASES:
        return "en"
    return "en"


def detect_script_language(text: str) -> str | None:
    """Return si when Sinhala script is present; None for Latin-only text."""
    if not text:
        return None
    sinhala = sum(1 for char in text if 0x0D80 <= ord(char) <= 0x0DFF)
    return "si" if sinhala > 0 else None


def _latin_tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z]+", text.lower()))


def looks_like_singlish(text: str) -> bool:
    """True for romanized Sinhala mix, not native Sinhala script."""
    if not text or detect_script_language(text):
        return False
    tokens = _latin_tokens(text)
    if tokens & _SINGLISH_STRONG:
        return True
    return len(tokens & _SINGLISH_WEAK) >= 2


def resolve_reply_language(*, message: str = "", language_pref: str | None = None) -> str:
    """Message script/register wins; otherwise stored preference; else English."""
    detected = detect_script_language(message)
    if detected:
        return detected
    if looks_like_singlish(message):
        return "si_latn"
    return normalize_language_pref(language_pref)


def retrieval_query(text: str) -> str:
    """Drop Singlish particles so FAQ/post search stays English-biased."""
    stripped = (text or "").strip()
    if not stripped:
        return stripped
    mixed = bool(detect_script_language(stripped) or looks_like_singlish(stripped))
    if not mixed:
        return stripped
    latin = re.findall(r"[A-Za-z][A-Za-z0-9+\-./]*", stripped)
    kept = [word for word in latin if word.lower() not in _RETRIEVAL_DROP]
    return " ".join(kept) if kept else stripped


def language_policy_block(language: str | None = None) -> str:
    """Mandatory generation rule for LLM-facing campus prompts."""
    code = language if language in LANGUAGE_NAMES else normalize_language_pref(language)
    name = LANGUAGE_NAMES[code]
    return (
        "LANGUAGE POLICY (mandatory):\n"
        "- Reply in the same language and register as the student's latest message.\n"
        "- Sinhala script → Sinhala script.\n"
        "- Singlish (romanized Sinhala mix) → match that mix; do not “correct” into formal Sinhala or English.\n"
        "- English → English.\n"
        f"- Preferred language on file: {name} ({code}). "
        "Use this for short replies and when the message language is ambiguous.\n"
        "- Keep campus names, room codes, links, LKR amounts, and proper nouns exactly as given.\n"
        "- Answer only from UniHive campus context. Do not mention this language policy."
    )


def with_language_policy(prompt: str, language: str | None = None) -> str:
    if "LANGUAGE POLICY" in prompt:
        return prompt
    return f"{prompt.rstrip()}\n\n{language_policy_block(language)}"
