"""SQLAlchemy models. Importing this module registers every table on Base."""

from app.models.booking import Booking, Resource
from app.models.info import Faq, InfoPage, StaffContact
from app.models.listing import Interest, Listing, SocietyMembership
from app.models.notification import Notification
from app.models.platform import AssistantQuery, AuditLog
from app.models.post import Post
from app.models.request import Request
from app.models.society import Society
from app.models.user import User

__all__ = [
    "AssistantQuery",
    "AuditLog",
    "Booking",
    "Faq",
    "InfoPage",
    "Interest",
    "Listing",
    "Notification",
    "Post",
    "Request",
    "Resource",
    "Society",
    "SocietyMembership",
    "StaffContact",
    "User",
]
