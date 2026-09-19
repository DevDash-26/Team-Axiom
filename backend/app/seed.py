"""Invented demo accounts and posts. Idempotent. Uses Supabase Auth Admin + SQLAlchemy."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from supabase import create_client

from app.config import get_settings
from app.constants import DEMO_PASSWORD, SEED_MARKER, Faculty, InfoCategory, PostStatus, PostType, Role
from app import db as database
from app.models.info import Faq
from app.models.post import Post
from app.models.society import Society
from app.models.user import User

logger = logging.getLogger(__name__)

SOCIETIES = (
    {
        "slug": "axiom-computing-club",
        "name": "Axiom Computing Club",
        "description": "Student society for computing projects, hackathons, and guest talks.",
        "faculty": Faculty.COMPUTING.value,
    },
    {
        "slug": "ucl-business-society",
        "name": "UCL Business Society",
        "description": "Networking and case competitions for business students.",
        "faculty": Faculty.BUSINESS.value,
    },
)

# Password is the documented demo password, not a real-user secret.
USERS = (
    {
        "email": "nimali.perera@student.ucl.lk",
        "full_name": "Nimali Perera",
        "role": Role.STUDENT,
        "faculty": Faculty.COMPUTING.value,
        "year": 2,
        "programme": "Software Engineering",
        "society_slug": None,
    },
    {
        "email": "kasun.fernando@student.ucl.lk",
        "full_name": "Kasun Fernando",
        "role": Role.STUDENT,
        "faculty": Faculty.BUSINESS.value,
        "year": 1,
        "programme": "Business Management",
        "society_slug": None,
    },
    {
        "email": "dr.jayasuriya@ucl.lk",
        "full_name": "Dr. Amaya Jayasuriya",
        "role": Role.ACADEMIC,
        "faculty": Faculty.COMPUTING.value,
        "year": None,
        "programme": None,
        "society_slug": None,
    },
    {
        "email": "anuki.silva@student.ucl.lk",
        "full_name": "Anuki Silva",
        "role": Role.SOCIETY_REP,
        "faculty": Faculty.COMPUTING.value,
        "year": 3,
        "programme": "Software Engineering",
        "society_slug": "axiom-computing-club",
    },
    {
        "email": "finance.office@ucl.lk",
        "full_name": "Ruvini de Silva",
        "role": Role.FINANCE,
        "faculty": None,
        "year": None,
        "programme": None,
        "society_slug": None,
    },
    {
        "email": "admin@ucl.lk",
        "full_name": "Tharindu Wijesinghe",
        "role": Role.ADMIN,
        "faculty": None,
        "year": None,
        "programme": None,
        "society_slug": None,
    },
    {
        "email": "superadmin@ucl.lk",
        "full_name": "Ishara Gunasekara",
        "role": Role.SUPER_ADMIN,
        "faculty": None,
        "year": None,
        "programme": None,
        "society_slug": None,
    },
)


def _auth_users(result) -> list:
    if result is None:
        return []
    if isinstance(result, list):
        return result
    users = getattr(result, "users", None)
    return list(users) if users is not None else []


def _get_or_create_auth_user(client, email: str, password: str) -> uuid.UUID:
    for existing in _auth_users(client.auth.admin.list_users()):
        if getattr(existing, "email", None) == email:
            return uuid.UUID(str(existing.id))
    try:
        created = client.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
            }
        )
        user = created.user
        if user is None:
            raise RuntimeError(f"Auth create_user returned no user for {email}")
        return uuid.UUID(str(user.id))
    except Exception:
        for existing in _auth_users(client.auth.admin.list_users()):
            if getattr(existing, "email", None) == email:
                return uuid.UUID(str(existing.id))
        raise


def _upsert_society(db, spec: dict) -> Society:
    society = db.scalar(select(Society).where(Society.slug == spec["slug"]))
    if society is None:
        society = Society(id=uuid.uuid4(), **spec)
        db.add(society)
        db.flush()
        return society
    society.name = spec["name"]
    society.description = spec["description"]
    society.faculty = spec["faculty"]
    return society


def _upsert_user(db, spec: dict, auth_id: uuid.UUID, society_id: uuid.UUID | None) -> User:
    user = db.get(User, auth_id)
    if user is None:
        user = User(id=auth_id, email=spec["email"])
        db.add(user)
    user.email = spec["email"]
    user.full_name = spec["full_name"]
    user.role = spec["role"].value
    user.faculty = spec["faculty"]
    user.year = spec["year"]
    user.programme = spec["programme"]
    user.society_id = society_id
    user.is_active = True
    db.flush()
    return user


def _replace_seed_posts(db, admin: User) -> None:
    existing = db.scalars(select(Post).where(Post.details.contains({SEED_MARKER: True}))).all()
    for post in existing:
        db.delete(post)
    db.flush()

    now = datetime.now(UTC)
    campus = Post(
        type=PostType.ANNOUNCEMENT.value,
        title="Welcome to the UCL Campus Hub",
        body="This is the official channel for campus announcements, events, and services.",
        status=PostStatus.PUBLISHED.value,
        pinned=True,
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    computing = Post(
        type=PostType.ANNOUNCEMENT.value,
        title="Computing lab booking window opens Monday",
        body="Year 2 Software Engineering students can book Lab B from Monday 9:00.",
        status=PostStatus.PUBLISHED.value,
        faculty=Faculty.COMPUTING.value,
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    business_year1 = Post(
        type=PostType.ANNOUNCEMENT.value,
        title="Business year 1 induction briefing",
        body="First-year Business Management students: meet in Hall A on Wednesday at 10:00.",
        status=PostStatus.PUBLISHED.value,
        faculty=Faculty.BUSINESS.value,
        year=1,
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    emergency = Post(
        type=PostType.EMERGENCY.value,
        title="Water outage in Block C this afternoon",
        body="Facilities are repairing a pipe. Use Block A washrooms until 16:00.",
        status=PostStatus.PUBLISHED.value,
        pinned=True,
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    draft = Post(
        type=PostType.ANNOUNCEMENT.value,
        title="Draft only — students must not see this",
        body="Internal draft for staff review.",
        status=PostStatus.DRAFT.value,
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    expired = Post(
        type=PostType.ANNOUNCEMENT.value,
        title="Expired library Saturday hours",
        body="This notice expired and should be hidden from students.",
        status=PostStatus.PUBLISHED.value,
        expires_at=now - timedelta(days=1),
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    db.add_all([campus, computing, business_year1, emergency, draft, expired])


SEED_FAQS: tuple[dict[str, str], ...] = (
    {
        "question": "How do I reset my UCL Wi‑Fi password?",
        "answer": "Visit the IT helpdesk on Level 2 or use the self-service portal linked from Campus Services. Bring your student ID.",
        "category": InfoCategory.IT.value,
    },
    {
        "question": "What are the library opening hours during term?",
        "answer": "Monday to Friday 08:00–20:00, Saturday 09:00–14:00. Sunday closed except exam weeks.",
        "category": InfoCategory.LIBRARY.value,
    },
    {
        "question": "Where can I get wellbeing support?",
        "answer": "Book a confidential session with Student Wellbeing via the services desk, or email wellbeing@ucl.lk. Walk-ins are available weekdays 10:00–15:00.",
        "category": InfoCategory.WELLBEING.value,
    },
    {
        "question": "Which canteen accepts student meal cards?",
        "answer": "The main cafeteria and Block B café accept meal cards. The rooftop kiosk is cash or card only.",
        "category": InfoCategory.DINING.value,
    },
    {
        "question": "How much does campus printing cost?",
        "answer": "Black-and-white A4 is Rs. 8 per page; colour A4 is Rs. 40. Top up your print balance at the library desk.",
        "category": InfoCategory.PRINTING.value,
    },
    {
        "question": "How do I apply for financial aid?",
        "answer": "Submit the finance aid form with income documents before the published deadline. Finance Office reviews applications within ten working days.",
        "category": InfoCategory.FINANCIAL_AID.value,
    },
    {
        "question": "How do I book the indoor courts?",
        "answer": "Use UniHive room booking, choose a sports facility resource, and wait for admin approval. Same-day bookings close at 12:00.",
        "category": InfoCategory.SPORTS.value,
    },
    {
        "question": "What should new students complete in week one?",
        "answer": "Activate your campus account, update your UniHive profile (faculty, year, programme), and join at least one society interest list.",
        "category": InfoCategory.ONBOARDING.value,
    },
)


def _replace_seed_faqs(db) -> None:
    seed_questions = {item["question"] for item in SEED_FAQS}
    existing = db.scalars(select(Faq).where(Faq.question.in_(seed_questions))).all()
    for faq in existing:
        db.delete(faq)
    db.flush()
    db.add_all(
        [
            Faq(question=item["question"], answer=item["answer"], category=item["category"])
            for item in SEED_FAQS
        ]
    )


def seed() -> None:
    logging.basicConfig(level=logging.INFO)
    get_settings.cache_clear()
    settings = get_settings()
    if not settings.database_url or not settings.supabase_url or not settings.supabase_service_role_key:
        raise SystemExit(
            "Set DATABASE_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY before seeding."
        )

    database.init_db()
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    assert database.SessionLocal is not None
    db = database.SessionLocal()
    try:
        societies = {spec["slug"]: _upsert_society(db, spec) for spec in SOCIETIES}
        users_by_email: dict[str, User] = {}
        for spec in USERS:
            auth_id = _get_or_create_auth_user(client, spec["email"], DEMO_PASSWORD)
            slug = spec["society_slug"]
            society_id = societies[slug].id if slug else None
            users_by_email[spec["email"]] = _upsert_user(db, spec, auth_id, society_id)
        admin = users_by_email["admin@ucl.lk"]
        _replace_seed_posts(db, admin)
        _replace_seed_faqs(db)
        db.commit()
        logger.info("Seed complete. Demo password is documented in README.md.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
