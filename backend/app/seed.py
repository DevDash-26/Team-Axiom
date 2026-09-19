"""Invented demo accounts and posts. Idempotent. Uses Supabase Auth Admin + SQLAlchemy."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from supabase import create_client

from app.config import get_settings
from app.constants import (
    DEMO_PASSWORD,
    SEED_MARKER,
    Faculty,
    InfoCategory,
    InterestTarget,
    ListingStatus,
    ListingType,
    PostStatus,
    PostType,
    RequestStatus,
    RequestType,
    Role,
)
from app import db as database
from app.models.info import Faq, InfoPage, StaffContact
from app.models.listing import Interest, Listing
from app.models.post import Post
from app.models.request import Request
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
    scheduled = Post(
        type=PostType.ANNOUNCEMENT.value,
        title="Scheduled: exam hall seating notice",
        body="Seating lists go live next week. Students should not see this until the start time.",
        status=PostStatus.PUBLISHED.value,
        starts_at=now + timedelta(days=7),
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    calendar_entry = Post(
        type=PostType.CALENDAR_ENTRY.value,
        title="Add/drop deadline — 26 September",
        body="Module add/drop closes at 16:00. Changes after this date need faculty approval.",
        status=PostStatus.PUBLISHED.value,
        event_at=now + timedelta(days=7),
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    guest_lecture = Post(
        type=PostType.GUEST_LECTURE.value,
        title="Guest lecture: responsible AI on campus",
        body="Open to Computing and Business students. No registration required.",
        status=PostStatus.PUBLISHED.value,
        location="Hall A",
        event_at=now + timedelta(days=5, hours=3),
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    job = Post(
        type=PostType.JOB.value,
        title="Junior analyst intern — campus finance office",
        body="Paid semester internship. Year 2+ Business or Computing. Apply with your student email.",
        status=PostStatus.PUBLISHED.value,
        deadline_at=now + timedelta(days=21),
        apply_url="https://unihive.ucl.lk/opportunities",
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    schedule_change = Post(
        type=PostType.SCHEDULE_CHANGE.value,
        title="Lab B closed Friday morning",
        body="Computing Lab B is closed 08:00–12:00 Friday for projector repair. Use Lab A.",
        status=PostStatus.PUBLISHED.value,
        author_id=admin.id,
        details={SEED_MARKER: True},
    )
    db.add_all(
        [
            campus,
            computing,
            business_year1,
            emergency,
            draft,
            expired,
            scheduled,
            calendar_entry,
            guest_lecture,
            job,
            schedule_change,
        ]
    )


def _replace_seed_requests(db, student: User, academic: User, admin: User) -> None:
    db.execute(delete(Request))
    db.flush()
    open_academic = Request(
        type=RequestType.ACADEMIC_SUPPORT.value,
        title="Study group for algorithms",
        body="Looking for a Year 2 Computing group that meets twice a week before the mid-term.",
        status=RequestStatus.OPEN.value,
        requester_id=student.id,
    )
    in_progress_facility = Request(
        type=RequestType.FACILITY_ISSUE.value,
        title="Broken projector in LT1",
        body="The projector flickers after 10 minutes. Happened in the 09:00 lecture.",
        status=RequestStatus.IN_PROGRESS.value,
        requester_id=student.id,
        handler_id=admin.id,
        response="Facilities have a ticket open. Spare bulb arriving tomorrow.",
    )
    resolved_feedback = Request(
        type=RequestType.FEEDBACK.value,
        title="Quiet hours in the cafeteria",
        body="Revision week is noisy on the mezzanine. Could quiet hours be posted?",
        status=RequestStatus.RESOLVED.value,
        requester_id=student.id,
        handler_id=admin.id,
        response="Quiet hours 12:00–14:00 will be trialled from next week.",
    )
    closed_academic = Request(
        type=RequestType.ACADEMIC_SUPPORT.value,
        title="Mentoring for first-year programming",
        body="I would like a mentor for Python labs. Available Thursday afternoons.",
        status=RequestStatus.CLOSED.value,
        requester_id=student.id,
        handler_id=academic.id,
        response="Matched with a Year 3 mentor. Closing this request.",
    )
    db.add_all([open_academic, in_progress_facility, resolved_feedback, closed_academic])


def _replace_seed_listings(db, student: User, admin: User) -> None:
    db.execute(delete(Interest).where(Interest.target_type == InterestTarget.LISTING.value))
    db.execute(delete(Listing).where(Listing.type.in_([ListingType.LOST.value, ListingType.FOUND.value])))
    db.flush()
    bottle = Listing(
        type=ListingType.LOST.value,
        title="Blue insulated water bottle",
        body=(
            "Navy bottle with a UCL sticker on the lid. Last seen near the silent study desks. "
            "Handover: Student Services desk, Level 1."
        ),
        category="Other",
        location="Library level 2",
        occurred_at=datetime.now(UTC) - timedelta(days=1),
        status=ListingStatus.ACTIVE.value,
        owner_id=student.id,
    )
    student_id = Listing(
        type=ListingType.FOUND.value,
        title="Student ID card (first name Nimali)",
        body=(
            "Plastic student card found under a cafeteria chair. Staff will match it internally. "
            "Handover: Student Services desk, Level 1."
        ),
        category="ID card",
        location="Cafeteria",
        occurred_at=datetime.now(UTC) - timedelta(hours=4),
        status=ListingStatus.ACTIVE.value,
        owner_id=admin.id,
    )
    umbrella = Listing(
        type=ListingType.LOST.value,
        title="Black compact umbrella",
        body="Folding umbrella left by the Block C lifts after the rain. Handover: Returned via Student Services.",
        category="Other",
        location="Block C",
        occurred_at=datetime.now(UTC) - timedelta(days=2),
        status=ListingStatus.RESOLVED.value,
        owner_id=student.id,
    )
    keys = Listing(
        type=ListingType.FOUND.value,
        title="Set of keys on a red lanyard",
        body="Three keys and a USB fob. No personal tags. Handed in this morning. Handover: IT helpdesk, Level 2.",
        category="Keys",
        location="Lab B2",
        occurred_at=datetime.now(UTC) - timedelta(hours=2),
        status=ListingStatus.ACTIVE.value,
        owner_id=admin.id,
    )
    db.add_all([bottle, student_id, umbrella, keys])


def _replace_seed_info(db, admin: User) -> None:
    db.execute(delete(Faq))
    db.execute(delete(InfoPage))
    db.execute(delete(StaffContact))
    db.flush()
    pages = (
        (
            InfoCategory.FAQ,
            "Frequently asked questions",
            "Start here for ID cards, Wi-Fi, and who to contact. Official answers are updated by the admin office.",
        ),
        (
            InfoCategory.ONBOARDING,
            "Getting started at UCL",
            "Collect your student ID from Student Services on Level 1, connect to UCL-WiFi with your university email, and complete module registration in UniHive before Friday 4:00 PM.",
        ),
        (
            InfoCategory.DIRECTORY,
            "Staff directory",
            "These are official office contacts. Student personal numbers are never listed here.",
        ),
        (
            InfoCategory.FINANCIAL_AID,
            "Financial support",
            "Scholarship windows open each semester. Instalment plans are arranged with the Finance office on Level 1, weekdays 09:30–15:30. Bring your student ID. The current window closes with the add/drop deadline on the academic calendar. Emergency grants: ask Finance, not lecturers.",
        ),
        (
            InfoCategory.DINING,
            "Dining",
            "Cafeteria: 08:00–16:30 weekdays. Vegetarian and halal counters are labelled. This week’s special is rice and curry on Wednesday.",
        ),
        (
            InfoCategory.PRINTING,
            "Printing services",
            "Printers are on Library level 1 and Block B lab. Top up print credit at the IT helpdesk. Colour prints are charged per side.",
        ),
        (
            InfoCategory.WELLBEING,
            "Wellbeing and counselling",
            "Book a confidential session with Campus Wellbeing. Drop-in hours are Tuesday and Thursday 13:00–15:00 in Room W2. Appointments are not shown on the public feed. In an emergency, go to Student Services on Level 1.",
        ),
        (
            InfoCategory.IT,
            "IT support",
            "Reset your password from the university email portal. Lab logins use the same account. The IT helpdesk is on Level 2, weekdays 09:00–16:00.",
        ),
        (
            InfoCategory.LIBRARY,
            "Library",
            "Open 08:00–20:00 weekdays and 09:00–14:00 Saturday. Level 2 is silent study. Loans are two weeks.",
        ),
        (
            InfoCategory.SPORTS,
            "Sports and recreation",
            "Indoor court and gym hours are posted at the sports desk. For the court, enquire with Sports on weekdays 10:00–15:00.",
        ),
    )
    db.add_all(
        [
            InfoPage(category=category.value, title=title, body=body, updated_by_id=admin.id)
            for category, title, body in pages
        ]
    )
    db.add_all(
        [
            Faq(
                category=InfoCategory.FAQ.value,
                question="How do I connect to campus Wi-Fi?",
                answer="Choose UCL-WiFi and sign in with your university email. If it fails, visit IT on Level 2.",
            ),
            Faq(
                category=InfoCategory.FAQ.value,
                question="Where do I collect my student ID?",
                answer="Student Services, Level 1, with a national ID or passport. Replacement cards take two working days.",
            ),
            Faq(
                category=InfoCategory.FINANCIAL_AID.value,
                question="When do scholarship applications close?",
                answer="The current window closes with the add/drop deadline. Finance will post a reminder on Campus Updates.",
            ),
            Faq(
                category=InfoCategory.FINANCIAL_AID.value,
                question="Can I pay tuition in instalments?",
                answer="Yes. Visit the Finance office on Level 1 with your student ID. Plans must be agreed before the add/drop deadline.",
            ),
            Faq(
                category=InfoCategory.WELLBEING.value,
                question="Is counselling confidential?",
                answer="Yes. Appointments are not shown on the public feed. Only Wellbeing staff see the booking.",
            ),
            Faq(
                category=InfoCategory.WELLBEING.value,
                question="How do I book a counselling session?",
                answer="Drop in Tuesday or Thursday 13:00–15:00 in Room W2, or ask Student Services to book a slot.",
            ),
            Faq(
                category=InfoCategory.IT.value,
                question="Who do I contact if a lab PC will not log in?",
                answer="Report a facility issue in UniHive, or go to the IT helpdesk on Level 2.",
            ),
        ]
    )
    db.add_all(
        [
            StaffContact(
                name="Dr Jayasuriya",
                role_title="Senior lecturer",
                department="Computing",
                email="academic@ucl.demo",
                office_hours="Wed 14:00–16:00, Room C12",
            ),
            StaffContact(
                name="Finance Office",
                role_title="Student finance",
                department="Finance",
                email="finance@ucl.demo",
                office_hours="Weekdays 09:30–15:30, Level 1",
            ),
            StaffContact(
                name="IT Helpdesk",
                role_title="Campus IT",
                department="IT",
                email="it@ucl.demo",
                office_hours="Weekdays 09:00–16:00, Level 2",
            ),
        ]
    )


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
        student = users_by_email["nimali.perera@student.ucl.lk"]
        academic = users_by_email["dr.jayasuriya@ucl.lk"]
        _replace_seed_posts(db, admin)
        _replace_seed_requests(db, student, academic, admin)
        _replace_seed_listings(db, student, admin)
        _replace_seed_info(db, admin)
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
