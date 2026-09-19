"""Orchestrate the campus assistant pipeline (scope, retrieve, answer, log)."""

from __future__ import annotations

import time
import uuid
from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.assistant import guard, llm, memory, prompts, retrieval
from app.assistant.language import LANGUAGE_NAMES, resolve_reply_language
from app.assistant.router import AssistantIntent, route_intent
from app.assistant.schemas import (
    AssistantAction,
    AssistantChatResponse,
    AssistantInsightsResponse,
    AssistantSource,
    InsightQuestion,
)
from app.assistant.templates import canned
from app.constants import ASSISTANT_INSIGHTS_LIMIT, ASSISTANT_MAX_CONTEXT_CHARS
from app.models.platform import AssistantQuery
from app.models.user import User


def _actions_for(intent: AssistantIntent, *, escalated: bool = False) -> list[AssistantAction]:
    actions: list[AssistantAction] = []
    if intent == AssistantIntent.BOOKING:
        actions = [
            AssistantAction(label="Book a room", href="/bookings"),
            AssistantAction(label="My bookings", href="/bookings/mine"),
        ]
    elif intent == AssistantIntent.EVENT:
        actions = [AssistantAction(label="Browse events", href="/events")]
    elif intent == AssistantIntent.LOST_FOUND:
        actions = [
            AssistantAction(label="Lost and Found", href="/lost-found"),
            AssistantAction(label="Report an item", href="/student/lost-found/new"),
        ]
    elif intent == AssistantIntent.SOCIETY:
        actions = [AssistantAction(label="Societies", href="/societies")]
    elif intent == AssistantIntent.SUPPORT:
        actions = [
            AssistantAction(label="Raise a request", href="/requests/new"),
            AssistantAction(label="My requests", href="/requests"),
        ]
    elif intent == AssistantIntent.INFO:
        actions = [AssistantAction(label="Campus Information", href="/info")]
    else:
        actions = [
            AssistantAction(label="Campus Information", href="/info"),
            AssistantAction(label="Search", href="/search"),
        ]

    if escalated:
        extras = [
            AssistantAction(label="Staff directory", href="/info/directory"),
            AssistantAction(label="Raise a request", href="/requests/new"),
        ]
        seen = {item.href for item in actions}
        for extra in extras:
            if extra.href not in seen:
                actions.append(extra)
                seen.add(extra.href)
    return actions


def _format_context(hits: list[retrieval.SourceHit]) -> str:
    blocks: list[str] = []
    used = 0
    for index, hit in enumerate(hits, start=1):
        block = f"[{index}] ({hit.type}) {hit.title}\n{hit.snippet}\nURL: {hit.url}"
        if used + len(block) > ASSISTANT_MAX_CONTEXT_CHARS:
            break
        blocks.append(block)
        used += len(block) + 2
    return "\n\n".join(blocks)


def ask(
    db: Session,
    user: User | None,
    *,
    question: str,
    session_id: str | None = None,
    language_pref: str | None = None,
) -> AssistantChatResponse:
    started = time.perf_counter()
    language = resolve_reply_language(message=question, language_pref=language_pref)
    intent = route_intent(question)

    if guard.is_greeting(question) and len(question.split()) <= 4:
        answer = canned("greeting", language)
        query = _log(db, user, question, intent, True, False, [], started, session_id)
        memory.append_turn(session_id, "user", question)
        memory.append_turn(session_id, "assistant", answer)
        return AssistantChatResponse(
            answer=answer,
            sources=[],
            actions=_actions_for(AssistantIntent.OTHER),
            intent=intent.value,
            language=language,
            fallback=False,
            escalated=False,
            query_id=query.id if query else None,
        )

    if guard.is_out_of_scope(question):
        answer = canned("out_of_scope", language)
        query = _log(db, user, question, intent, False, False, [], started, session_id)
        return AssistantChatResponse(
            answer=answer,
            sources=[],
            actions=_actions_for(AssistantIntent.OTHER, escalated=True),
            intent=intent.value,
            language=language,
            fallback=False,
            escalated=True,
            query_id=query.id if query else None,
        )

    hits = retrieval.retrieve(db, user, question)
    sources = [
        AssistantSource(
            type=hit.type,
            id=hit.id,
            title=hit.title,
            snippet=hit.snippet,
            url=hit.url,
        )
        for hit in hits
    ]

    # No evidence → honest escalation (do not call the LLM with empty context).
    if not hits:
        answer = canned("no_results", language)
        query = _log(db, user, question, intent, False, False, [], started, session_id)
        memory.append_turn(session_id, "user", question)
        memory.append_turn(session_id, "assistant", answer)
        return AssistantChatResponse(
            answer=answer,
            sources=[],
            actions=_actions_for(intent, escalated=True),
            intent=intent.value,
            language=language,
            fallback=False,
            escalated=True,
            query_id=query.id if query else None,
        )

    context = _format_context(hits)
    history_block = memory.format_history(session_id)
    messages = [
        {"role": "system", "content": prompts.system_prompt(language)},
        {
            "role": "user",
            "content": prompts.answer_user_prompt(
                question=question,
                context_blocks=context,
                history_block=history_block,
            ),
        },
    ]
    model_answer = llm.complete(messages)
    fallback = model_answer is None
    if model_answer:
        answer = model_answer
        answered = True
    else:
        bullets = "\n".join(f"- {hit.title}: {hit.snippet}" for hit in hits[:3])
        answer = f"{canned('fallback_prefix', language)}\n{bullets}"
        answered = True

    query = _log(
        db,
        user,
        question,
        intent,
        answered,
        fallback,
        [hit.id for hit in hits],
        started,
        session_id,
    )
    memory.append_turn(session_id, "user", question)
    memory.append_turn(session_id, "assistant", answer)

    return AssistantChatResponse(
        answer=answer,
        sources=sources,
        actions=_actions_for(intent),
        intent=intent.value,
        language=language,
        fallback=fallback,
        escalated=False,
        query_id=query.id if query else None,
    )


def insights(db: Session, *, limit: int = ASSISTANT_INSIGHTS_LIMIT) -> AssistantInsightsResponse:
    """Content-gap view for admins: unanswered and low-rated questions."""
    rows = db.scalars(
        select(AssistantQuery).order_by(AssistantQuery.created_at.desc()).limit(max(limit * 5, 50))
    ).all()

    unanswered = [
        InsightQuestion(
            question=row.question,
            intent=row.intent,
            answered=row.answered,
            fallback=row.fallback,
            feedback=row.feedback,
            created_at=row.created_at.isoformat() if row.created_at else None,
        )
        for row in rows
        if (not row.answered) or (row.feedback is not None and row.feedback < 0)
    ][:limit]

    counter: Counter[str] = Counter(row.question.strip() for row in rows if row.question)
    top_questions = [
        InsightQuestion(question=text, intent=None, answered=True, fallback=False, feedback=None)
        for text, _count in counter.most_common(limit)
    ]
    return AssistantInsightsResponse(unanswered=unanswered, top_questions=top_questions)


def _log(
    db: Session,
    user: User | None,
    question: str,
    intent: AssistantIntent,
    answered: bool,
    fallback: bool,
    source_ids: list[str],
    started: float,
    session_id: str | None,
) -> AssistantQuery | None:
    try:
        row = AssistantQuery(
            id=uuid.uuid4(),
            user_id=user.id if user else None,
            session_id=session_id,
            question=question,
            intent=intent.value,
            answered=answered,
            fallback=fallback,
            source_ids=source_ids or None,
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row
    except Exception:
        db.rollback()
        return None


def language_label(code: str) -> str:
    return LANGUAGE_NAMES.get(code, code)
