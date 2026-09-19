"""Canned multilingual strings for campus assistant fallbacks and refusals."""

from __future__ import annotations

from app.assistant.language import LANGUAGE_NAMES, normalize_language_pref

_CATALOG: dict[str, dict[str, str]] = {
    "out_of_scope": {
        "en": "I can only help with Universal College Lanka campus topics — announcements, events, bookings, societies, lost and found, and campus services.",
        "si": "මට උදව් කළ හැක්කේ යුනිවර්සල් කොලේජ් ලංකා කැම්පස් මාතෘකා ගැන පමණි — නිවේදන, උත්සව, වෙන්කිරීම්, සමාජ, නැතිවූ දේ සහ කැම්පස් සේවා.",
        "si_latn": "Mata help karanna puluwan UCL campus topics gana witharai — announcements, events, bookings, societies, lost and found, saha campus services.",
    },
    "empty_question": {
        "en": "Ask a campus question and I will look it up in UniHive.",
        "si": "කැම්පස් ප්‍රශ්නයක් අසන්න, මම UniHive තුළ සොයා බලමි.",
        "si_latn": "Campus question ekak ahanne, mam UniHive eke balannam.",
    },
    "no_results": {
        "en": "I could not find a matching campus page yet. Try Campus Information or raise a support request.",
        "si": "ගැලපෙන කැම්පස් පිටුවක් තවම හමු නොවීය. Campus Information උත්සාහ කරන්න හෝ සහාය ඉල්ලීමක් යවන්න.",
        "si_latn": "Matching campus page ekak hambune na. Campus Information try karanna, nattam support request ekak yawanna.",
    },
    "fallback_prefix": {
        "en": "Search-only mode (AI unavailable). Here is what UniHive found:",
        "si": "සෙවුම්-පමණි ප්‍රකාරය (AI නොමැත). UniHive සොයාගත් දේ:",
        "si_latn": "Search-only mode (AI naha). UniHive eke hambune meya:",
    },
    "greeting": {
        "en": "Hi — ask about rooms, events, deadlines, IT, or other campus services.",
        "si": "ආයුබෝවන් — කාමර, උත්සව, අවසාන දින, IT හෝ අනෙකුත් කැම්පස් සේවා ගැන අසන්න.",
        "si_latn": "Ayubowan — rooms, events, deadlines, IT, nattam campus services gana ahanne.",
    },
}


def canned(key: str, language: str | None = None) -> str:
    """Look up a canned string; fall back to English."""
    code = language if language in LANGUAGE_NAMES else normalize_language_pref(language)
    row = _CATALOG.get(key, {})
    return row.get(code) or row.get("en") or key
