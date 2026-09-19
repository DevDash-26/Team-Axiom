"""Intent routing for campus assistant questions."""

from __future__ import annotations

from enum import Enum


class AssistantIntent(str, Enum):
    INFO = "INFO"
    EVENT = "EVENT"
    BOOKING = "BOOKING"
    LOST_FOUND = "LOST_FOUND"
    SUPPORT = "SUPPORT"
    SOCIETY = "SOCIETY"
    OTHER = "OTHER"


_RULES: tuple[tuple[AssistantIntent, tuple[str, ...]], ...] = (
    (AssistantIntent.BOOKING, ("book", "room", "classroom", "lab", "facility", "කාමර")),
    (AssistantIntent.EVENT, ("event", "guest lecture", "workshop", "උත්සව")),
    (AssistantIntent.LOST_FOUND, ("lost", "found", "missing", "id card", "නැති")),
    (AssistantIntent.SOCIETY, ("society", "club", "join society", "සමාජ")),
    (AssistantIntent.SUPPORT, ("support", "tutoring", "mentor", "feedback", "issue", "සහාය")),
    (AssistantIntent.INFO, ("faq", "wifi", "library", "wellbeing", "print", "dining", "it ", "hours")),
)


def route_intent(question: str) -> AssistantIntent:
    lowered = (question or "").lower()
    for intent, tokens in _RULES:
        if any(token in lowered for token in tokens):
            return intent
    return AssistantIntent.OTHER
