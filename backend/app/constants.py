"""Roles, enums, permission keys, and limits. No magic strings elsewhere."""

from enum import Enum


class Role(str, Enum):
    STUDENT = "STUDENT"
    ACADEMIC = "ACADEMIC"
    SOCIETY_REP = "SOCIETY_REP"
    FINANCE = "FINANCE"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class PostType(str, Enum):
    ANNOUNCEMENT = "ANNOUNCEMENT"
    EVENT = "EVENT"
    GUEST_LECTURE = "GUEST_LECTURE"
    EMERGENCY = "EMERGENCY"
    SCHEDULE_CHANGE = "SCHEDULE_CHANGE"
    CALENDAR_ENTRY = "CALENDAR_ENTRY"
    JOB = "JOB"
    VOLUNTEERING = "VOLUNTEERING"
    ALUMNI = "ALUMNI"
    HIGHLIGHT = "HIGHLIGHT"
    SOCIETY_UPDATE = "SOCIETY_UPDATE"


class PostStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class Faculty(str, Enum):
    COMPUTING = "COMPUTING"
    BUSINESS = "BUSINESS"
    ENGINEERING = "ENGINEERING"


class BookingStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class RequestStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class RequestType(str, Enum):
    ACADEMIC_SUPPORT = "ACADEMIC_SUPPORT"
    FACILITY_ISSUE = "FACILITY_ISSUE"
    FEEDBACK = "FEEDBACK"


class ListingType(str, Enum):
    LOST = "LOST"
    FOUND = "FOUND"
    TEXTBOOK = "TEXTBOOK"


class ListingStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    REMOVED = "REMOVED"


class ResourceKind(str, Enum):
    CLASSROOM = "CLASSROOM"
    SPORTS = "SPORTS"


class InterestTarget(str, Enum):
    EVENT = "EVENT"
    SOCIETY = "SOCIETY"
    LISTING = "LISTING"


class MembershipStatus(str, Enum):
    INTERESTED = "INTERESTED"
    MEMBER = "MEMBER"


class NotificationType(str, Enum):
    BOOKING_UPDATE = "BOOKING_UPDATE"
    POST_PUBLISHED = "POST_PUBLISHED"
    REQUEST_UPDATE = "REQUEST_UPDATE"
    LISTING_UPDATE = "LISTING_UPDATE"
    EMERGENCY = "EMERGENCY"
    SYSTEM = "SYSTEM"


class InfoCategory(str, Enum):
    FAQ = "FAQ"
    ONBOARDING = "ONBOARDING"
    DIRECTORY = "DIRECTORY"
    FINANCIAL_AID = "FINANCIAL_AID"
    DINING = "DINING"
    PRINTING = "PRINTING"
    WELLBEING = "WELLBEING"
    IT = "IT"
    LIBRARY = "LIBRARY"
    SPORTS = "SPORTS"


class Permission(str, Enum):
    POSTS_VIEW_PUBLISHED = "posts.view_published"
    POSTS_CREATE_ANNOUNCEMENT = "posts.create_announcement"
    POSTS_CREATE_CALENDAR = "posts.create_calendar"
    POSTS_CREATE_GUEST_LECTURE = "posts.create_guest_lecture"
    POSTS_CREATE_EVENT = "posts.create_event"
    POSTS_CREATE_SOCIETY_UPDATE = "posts.create_society_update"
    POSTS_CREATE_HIGHLIGHT = "posts.create_highlight"
    POSTS_CREATE_EMERGENCY = "posts.create_emergency"
    POSTS_CREATE_SCHEDULE_CHANGE = "posts.create_schedule_change"
    POSTS_CREATE_JOB = "posts.create_job"
    POSTS_CREATE_VOLUNTEERING = "posts.create_volunteering"
    POSTS_CREATE_ALUMNI = "posts.create_alumni"
    POSTS_EDIT = "posts.edit"
    INFO_MANAGE_FINANCE = "info.manage_finance"
    INFO_MANAGE = "info.manage"
    BOOKINGS_CREATE = "bookings.create"
    BOOKINGS_APPROVE = "bookings.approve"
    REQUESTS_CREATE = "requests.create"
    REQUESTS_HANDLE_ACADEMIC = "requests.handle_academic"
    REQUESTS_HANDLE_FACILITY = "requests.handle_facility"
    LISTINGS_CREATE = "listings.create"
    LISTINGS_MODERATE = "listings.moderate"
    USERS_MANAGE = "users.manage"
    ASSISTANT_INSIGHTS = "assistant.insights"


STAFF_ROLES: frozenset[Role] = frozenset(
    {
        Role.ACADEMIC,
        Role.SOCIETY_REP,
        Role.FINANCE,
        Role.ADMIN,
        Role.SUPER_ADMIN,
    }
)

_ADMINS = frozenset({Role.ADMIN, Role.SUPER_ADMIN})
_ANY_LOGGED_IN = frozenset(Role)

PERMISSION_ROLES: dict[Permission, frozenset[Role]] = {
    Permission.POSTS_VIEW_PUBLISHED: _ANY_LOGGED_IN,
    Permission.POSTS_CREATE_ANNOUNCEMENT: frozenset({Role.ACADEMIC, Role.ADMIN, Role.SUPER_ADMIN}),
    Permission.POSTS_CREATE_CALENDAR: frozenset({Role.ACADEMIC, Role.ADMIN, Role.SUPER_ADMIN}),
    Permission.POSTS_CREATE_GUEST_LECTURE: frozenset({Role.ACADEMIC, Role.ADMIN, Role.SUPER_ADMIN}),
    Permission.POSTS_CREATE_EVENT: frozenset({Role.ACADEMIC, Role.SOCIETY_REP, Role.ADMIN, Role.SUPER_ADMIN}),
    Permission.POSTS_CREATE_SOCIETY_UPDATE: frozenset({Role.SOCIETY_REP, Role.ADMIN, Role.SUPER_ADMIN}),
    Permission.POSTS_CREATE_HIGHLIGHT: frozenset({Role.SOCIETY_REP, Role.ADMIN, Role.SUPER_ADMIN}),
    Permission.POSTS_CREATE_EMERGENCY: _ADMINS,
    Permission.POSTS_CREATE_SCHEDULE_CHANGE: _ADMINS,
    Permission.POSTS_CREATE_JOB: _ADMINS,
    Permission.POSTS_CREATE_VOLUNTEERING: _ADMINS,
    Permission.POSTS_CREATE_ALUMNI: _ADMINS,
    Permission.POSTS_EDIT: _ANY_LOGGED_IN,
    Permission.INFO_MANAGE_FINANCE: frozenset({Role.FINANCE, Role.ADMIN}),
    Permission.INFO_MANAGE: _ADMINS,
    Permission.BOOKINGS_CREATE: _ANY_LOGGED_IN,
    Permission.BOOKINGS_APPROVE: _ADMINS,
    Permission.REQUESTS_CREATE: _ANY_LOGGED_IN,
    Permission.REQUESTS_HANDLE_ACADEMIC: frozenset({Role.ACADEMIC, Role.ADMIN}),
    Permission.REQUESTS_HANDLE_FACILITY: _ADMINS,
    Permission.LISTINGS_CREATE: _ANY_LOGGED_IN,
    Permission.LISTINGS_MODERATE: frozenset({Role.ADMIN}),
    Permission.USERS_MANAGE: frozenset({Role.SUPER_ADMIN}),
    Permission.ASSISTANT_INSIGHTS: _ADMINS,
}

POST_TYPE_PERMISSION: dict[PostType, Permission] = {
    PostType.ANNOUNCEMENT: Permission.POSTS_CREATE_ANNOUNCEMENT,
    PostType.CALENDAR_ENTRY: Permission.POSTS_CREATE_CALENDAR,
    PostType.GUEST_LECTURE: Permission.POSTS_CREATE_GUEST_LECTURE,
    PostType.EVENT: Permission.POSTS_CREATE_EVENT,
    PostType.SOCIETY_UPDATE: Permission.POSTS_CREATE_SOCIETY_UPDATE,
    PostType.HIGHLIGHT: Permission.POSTS_CREATE_HIGHLIGHT,
    PostType.EMERGENCY: Permission.POSTS_CREATE_EMERGENCY,
    PostType.SCHEDULE_CHANGE: Permission.POSTS_CREATE_SCHEDULE_CHANGE,
    PostType.JOB: Permission.POSTS_CREATE_JOB,
    PostType.VOLUNTEERING: Permission.POSTS_CREATE_VOLUNTEERING,
    PostType.ALUMNI: Permission.POSTS_CREATE_ALUMNI,
}

ACADEMIC_OWN_FACULTY_TYPES: frozenset[PostType] = frozenset(
    {PostType.ANNOUNCEMENT, PostType.CALENDAR_ENTRY, PostType.GUEST_LECTURE}
)
SOCIETY_OWN_TYPES: frozenset[PostType] = frozenset(
    {PostType.EVENT, PostType.SOCIETY_UPDATE, PostType.HIGHLIGHT}
)

LOST_FOUND_TYPES: frozenset[ListingType] = frozenset({ListingType.LOST, ListingType.FOUND})

REQUEST_TRANSITIONS: dict[RequestStatus, frozenset[RequestStatus]] = {
    RequestStatus.OPEN: frozenset({RequestStatus.IN_PROGRESS}),
    RequestStatus.IN_PROGRESS: frozenset({RequestStatus.RESOLVED, RequestStatus.CLOSED}),
}

PAGE_SIZE_DEFAULT = 20
PAGE_SIZE_MAX = 50
TITLE_MAX = 200
BODY_MAX = 10_000
NAME_MAX = 120
EMAIL_MAX = 255
YEAR_MIN = 1
YEAR_MAX = 4
JWT_ALG_HS256 = "HS256"
AUDIT_PUBLISH = "post.publish"
AUDIT_EDIT = "post.edit"
AUDIT_ARCHIVE = "post.archive"
SEED_MARKER = "seed"
DEMO_PASSWORD = "CampusHub!2026"

BOOKING_MIN_MINUTES = 30
BOOKING_MAX_MINUTES = 240
BOOKING_MAX_ADVANCE_DAYS = 14
BOOKING_OPEN_HOUR = 8
BOOKING_CLOSE_HOUR = 20

# Assistant (BR33)
ASSISTANT_TOP_K = 5
ASSISTANT_MAX_HISTORY_TURNS = 6
ASSISTANT_MAX_QUESTION_CHARS = 1000
ASSISTANT_TIMEOUT_SECONDS = 20
ASSISTANT_MAX_RETRIES = 1
ASSISTANT_SESSION_ID_MAX = 64
ASSISTANT_MAX_CONTEXT_CHARS = 4000
ASSISTANT_SNIPPET_MAX = 240
ASSISTANT_INSIGHTS_LIMIT = 20
KNOWLEDGE_CHUNK_SIZE = 700
KNOWLEDGE_CHUNK_OVERLAP = 100
EMBEDDING_DIMENSIONS = 1536
QUERY_MIN_LEN = 2
SEARCH_SNIPPET_MAX = 180
PROGRAMME_MAX = 120
SMTP_TIMEOUT_SECONDS = 8
SMTP_PORT_DEFAULT = 587
EMAIL_BODY_PREVIEW_MAX = 400
EMERGENCY_EMAIL_SUBJECT_PREFIX = "[UniHive] Emergency: "
EMERGENCY_LINK_PATH = "/updates"
