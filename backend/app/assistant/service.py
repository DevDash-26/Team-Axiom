"""Orchestrate the campus assistant pipeline (scope, retrieve, answer, log)."""

from __future__ import annotations

import time
import uuid

from sqlalchemy.orm import Session

from app.assistant import guard, llm, memory, prompts, retrieval
from app.assistant.language import LANGUAGE_NAMES, resolve_reply_language
from app.assistant.router import AssistantIntent, route_intent
from app.assistant.schemas import AssistantAction, AssistantChatResponse, AssistantSource
from app.assistant.templates import canned
from app.models.platform import AssistantQuery
from app.models.user import User


def _actions_for(intent: AssistantIntent) -> list[AssistantAction]:
    if intent == AssistantIntent.BOOKING:
        return [
            AssistantAction(label="Find a classroom", href="/bookings"),
            AssistantAction(label="My bookings", href="/bookings/mine"),
        ]
    if intent == AssistantIntent.EVENT:
        return [AssistantAction(label="Browse events", href="/events")]
    if intent == AssistantIntent.LOST_FOUND:
        return [AssistantAction(label="Lost and Found", href="/lost-found")]
    if intent == AssistantIntent.SOCIETY:
        return [AssistantAction(label="Societies", href="/societies")]
    if intent == AssistantIntent.SUPPORT:
        return [AssistantAction(label="My requests", href="/requests")]
    if intent == AssistantIntent.INFO:
        return [AssistantAction(label="Campus Information", href="/info")]
    return [
        AssistantAction(label="Campus Information", href="/info"),
        AssistantAction(label="Search", href="/search"),
    ]


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
            actions=_actions_for(AssistantIntent.OTHER),
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
    context = "\n\n".join(f"[{hit.type}] {hit.title}\n{hit.snippet}" for hit in hits)
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
    elif hits:
        bullets = "\n".join(f"- {hit.title}: {hit.snippet}" for hit in hits[:3])
        answer = f"{canned('fallback_prefix', language)}\n{bullets}"
        answered = True
    else:
        answer = canned("no_results", language)
        answered = False

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
        escalated=not answered,
        query_id=query.id if query else None,
    )


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
