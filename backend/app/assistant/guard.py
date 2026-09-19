"""Scope checks for the campus assistant."""

from __future__ import annotations

import re

from app.assistant.language import retrieval_query

_GREETING = re.compile(
    r"^\s*(hi|hello|hey|ayubowan|ආයුබෝවන්|good\s+(morning|evening|afternoon)|machan)\b",
    re.IGNORECASE,
)

_OFF_TOPIC = (
    "bitcoin",
    "crypto",
    "dating",
    "girlfriend",
    "boyfriend",
    "write my essay",
    "homework answers",
    "hack into",
    "porn",
)

_CAMPUS_HINTS = (
    "campus",
    "ucl",
    "unihive",
    "class",
    "room",
    "book",
    "event",
    "society",
    "lost",
    "found",
    "library",
    "wifi",
    "wellbeing",
    "deadline",
    "exam",
    "lectur",
    "financ",
    "print",
    "dining",
    "canteen",
    "it support",
    "helpdesk",
    "staff",
    "directory",
    "office hours",
    "faq",
    "කැම්පස්",
    "පුස්තකාල",
)


def is_greeting(question: str) -> bool:
    return bool(_GREETING.search(question or ""))


def is_out_of_scope(question: str) -> bool:
    lowered = (question or "").lower()
    if any(token in lowered for token in _OFF_TOPIC):
        return True
    search_text = retrieval_query(question).lower()
    if len(search_text.split()) <= 2 and is_greeting(question):
        return False
    if any(hint in lowered for hint in _CAMPUS_HINTS):
        return False
    # Short questions without campus hints still proceed so retrieval can try.
    if len(lowered.split()) <= 8:
        return False
    return not any(hint in search_text for hint in _CAMPUS_HINTS)
