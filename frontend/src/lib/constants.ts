/** Labels, roles, and routes. Keep role names in sync with backend/app/constants.py. */

export const APP_NAME = "UniHive";
export const APP_TAGLINE = "Everything campus. One place.";
export const DEMO_PASSWORD_HINT = "CampusHub!2026";

export const ROLES = {
  STUDENT: "STUDENT",
  ACADEMIC: "ACADEMIC",
  SOCIETY_REP: "SOCIETY_REP",
  FINANCE: "FINANCE",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const STAFF_ROLES: readonly RoleName[] = [
  ROLES.ACADEMIC,
  ROLES.SOCIETY_REP,
  ROLES.FINANCE,
];

export const FACULTIES = ["COMPUTING", "BUSINESS", "ENGINEERING"] as const;
export type FacultyName = (typeof FACULTIES)[number];

export const YEARS = [1, 2, 3, 4] as const;

export const ADMIN_ROLES: readonly RoleName[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const EMERGENCY_ROLES: readonly RoleName[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const CONTENT_STATUSES = [
  { id: "all", label: "All" },
  { id: "DRAFT", label: "Draft" },
  { id: "PUBLISHED", label: "Published" },
  { id: "ARCHIVED", label: "Archived" },
] as const;

export const WAVE1_POST_TYPES = [
  { id: "ANNOUNCEMENT", label: "Announcement" },
  { id: "EMERGENCY", label: "Emergency" },
] as const;

export const ANNOUNCEMENT_ROLES: readonly RoleName[] = [
  ROLES.ACADEMIC,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

export const STAFF_WORKSPACE_ROLES: readonly RoleName[] = [
  ROLES.ACADEMIC,
  ROLES.SOCIETY_REP,
  ROLES.FINANCE,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

export const POST_TYPE_LABELS: Record<string, string> = {
  ANNOUNCEMENT: "Announcement",
  EVENT: "Event",
  GUEST_LECTURE: "Guest lecture",
  EMERGENCY: "Emergency",
  SCHEDULE_CHANGE: "Schedule change",
  CALENDAR_ENTRY: "Calendar",
  JOB: "Job",
  VOLUNTEERING: "Volunteering",
  ALUMNI: "Alumni",
  HIGHLIGHT: "Highlight",
  SOCIETY_UPDATE: "Society update",
};

export const FAQ_CATEGORY_LABELS: Record<string, string> = {
  IT: "IT",
  LIBRARY: "Library",
  WELLBEING: "Wellbeing",
  DINING: "Dining",
  PRINTING: "Printing",
  FINANCIAL_AID: "Financial aid",
  SPORTS: "Sports",
  ONBOARDING: "Onboarding",
};

export const EMERGENCY_POST_TYPES = ["EMERGENCY", "SCHEDULE_CHANGE"] as const;

export const FEED_CHIPS = [
  { id: "all", label: "All", types: null },
  {
    id: "academic",
    label: "Academic",
    types: ["ANNOUNCEMENT", "GUEST_LECTURE", "CALENDAR_ENTRY", "SCHEDULE_CHANGE"],
  },
  { id: "events", label: "Events", types: ["EVENT", "HIGHLIGHT"] },
  { id: "societies", label: "Societies", types: ["SOCIETY_UPDATE"] },
  { id: "alerts", label: "Alerts", types: ["EMERGENCY", "SCHEDULE_CHANGE"] },
] as const;

export type FeedChipId = (typeof FEED_CHIPS)[number]["id"];

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forbidden: "/403",
  unauthorized: "/unauthorized",
  newPost: "/posts/new",
  search: "/search",
  updates: "/updates",
  events: "/events",
  societies: "/societies",
  opportunities: "/opportunities",
  bookings: "/bookings",
  myBookings: "/bookings/mine",
  lectures: "/lectures",
  lostFound: "/lost-found",
  textbooks: "/textbooks",
  requests: "/requests",
  newRequest: "/requests/new",
  info: "/info",
  calendar: "/calendar",
  assistant: "/assistant",
  profile: "/profile",
  studentDashboard: "/student/dashboard",
  studentAssistant: "/student/assistant",
  studentUpdates: "/student/updates",
  studentEvents: "/student/events",
  studentBookings: "/student/bookings",
  studentRequests: "/student/requests",
  studentLostFound: "/student/lost-found",
  studentLostFoundNew: "/student/lost-found/new",
  studentProfile: "/student/profile",
  studentCalendar: "/student/calendar",
  studentSocieties: "/student/societies",
  studentOpportunities: "/student/opportunities",
  studentServices: "/student/services",
  staffDashboard: "/staff/dashboard",
  staffContent: "/staff/content",
  staffContentNew: "/staff/content/new",
  staffBookings: "/staff/bookings",
  staffRequests: "/staff/requests",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminStaff: "/admin/staff",
  adminRoles: "/admin/roles",
} as const;

export const PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_QUERY_MIN = 2;
export const TIME_ZONE = "Asia/Colombo";

export function isStudent(role: string): boolean {
  return role === ROLES.STUDENT;
}

export function isStaffWorkspace(role: string): boolean {
  return STAFF_WORKSPACE_ROLES.includes(role as RoleName);
}

export function isAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role as RoleName);
}

export function canCreateAnnouncement(role: string): boolean {
  return ANNOUNCEMENT_ROLES.includes(role as RoleName);
}

export function canCreateEmergency(role: string): boolean {
  return EMERGENCY_ROLES.includes(role as RoleName);
}

export function canManageContent(role: string): boolean {
  return canCreateAnnouncement(role) || canCreateEmergency(role);
}

export function staffContentEditPath(id: string): string {
  return `${ROUTES.staffContent}/${id}/edit`;
}

export function dashboardPathForRole(role: string): string {
  if (isAdmin(role)) return ROUTES.adminDashboard;
  if (isStaffWorkspace(role)) return ROUTES.staffDashboard;
  return ROUTES.home;
}

export function eventPath(id: string): string {
  return `${ROUTES.events}/${id}`;
}

export function societyPath(slug: string): string {
  return `${ROUTES.societies}/${slug}`;
}

export function listingPath(id: string): string {
  return `${ROUTES.lostFound}/${id}`;
}

export function infoPath(category: string): string {
  return `${ROUTES.info}/${category.toLowerCase()}`;
}

export const EVENT_FILTERS = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic" },
  { id: "society", label: "Society" },
  { id: "workshop", label: "Workshop" },
  { id: "guest", label: "Guest Lecture" },
] as const;

export type EventFilterId = (typeof EVENT_FILTERS)[number]["id"];

export const SEARCH_TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "ANNOUNCEMENT", label: "Announcements" },
  { id: "EVENT", label: "Events" },
  { id: "SOCIETY", label: "Societies" },
  { id: "ROOM", label: "Rooms" },
  { id: "FAQ", label: "FAQ" },
] as const;

export const UPDATES_FILTERS = [
  { id: "all", label: "All" },
  { id: "university", label: "University" },
  { id: "programme", label: "Programme" },
  { id: "academic", label: "Academic" },
  { id: "emergency", label: "Emergency" },
] as const;

export const LISTING_KIND = {
  LOST: "LOST",
  FOUND: "FOUND",
  TEXTBOOK: "TEXTBOOK",
} as const;

export const LISTING_STATUS = {
  ACTIVE: "ACTIVE",
  RESOLVED: "RESOLVED",
  REMOVED: "REMOVED",
} as const;

export const LISTING_KIND_FILTERS = [
  { id: "all", label: "All" },
  { id: "LOST", label: "Lost" },
  { id: "FOUND", label: "Found" },
] as const;

export const LISTING_STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "ACTIVE", label: "Active" },
  { id: "RESOLVED", label: "Resolved" },
] as const;

export const LISTING_CATEGORIES = [
  { id: "Electronics", label: "Electronics" },
  { id: "ID card", label: "ID card" },
  { id: "Clothing", label: "Clothing" },
  { id: "Keys", label: "Keys" },
  { id: "Other", label: "Other" },
] as const;

export const LISTING_HANDOVER_HINT =
  "Describe a campus handover point. Do not publish a personal phone number or private email.";

export const REQUEST_TYPE = {
  ACADEMIC_SUPPORT: "ACADEMIC_SUPPORT",
  FACILITY_ISSUE: "FACILITY_ISSUE",
  FEEDBACK: "FEEDBACK",
} as const;

export const REQUEST_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_SUPPORT: "Academic support",
  FACILITY_ISSUE: "Facility issue",
  FEEDBACK: "Feedback",
};

export const REQUEST_TYPE_FILTERS = [
  { id: "all", label: "All types" },
  { id: "ACADEMIC_SUPPORT", label: "Academic support" },
  { id: "FACILITY_ISSUE", label: "Facility issue" },
  { id: "FEEDBACK", label: "Feedback" },
] as const;

export const REQUEST_STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "OPEN", label: "Open" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "RESOLVED", label: "Resolved" },
] as const;

export const INFO_CATEGORIES = [
  { id: "FAQ", label: "FAQ", description: "Short answers to common campus questions." },
  { id: "ONBOARDING", label: "Getting started", description: "ID cards, Wi-Fi, and first-week steps." },
  { id: "DIRECTORY", label: "Staff directory", description: "Official office emails and hours." },
  { id: "FINANCIAL_AID", label: "Financial support", description: "Scholarships, instalments, and who to ask." },
  { id: "DINING", label: "Dining", description: "Cafeteria hours and this week’s menu notes." },
  { id: "PRINTING", label: "Printing", description: "Where to print, copy, and top up credit." },
  { id: "WELLBEING", label: "Wellbeing", description: "Counselling hours and how to book a session." },
  { id: "IT", label: "IT support", description: "Accounts, Wi-Fi, and lab access." },
  { id: "LIBRARY", label: "Library", description: "Opening hours, loans, and quiet floors." },
  { id: "SPORTS", label: "Sports & recreation", description: "Courts, gym hours, and how to enquire." },
] as const;

export type InfoCategoryId = (typeof INFO_CATEGORIES)[number]["id"];

export const OPPORTUNITY_TYPES = ["JOB", "VOLUNTEERING", "ALUMNI", "HIGHLIGHT"] as const;

export const OPPORTUNITY_FILTERS = [
  { id: "all", label: "All" },
  { id: "JOB", label: "Jobs" },
  { id: "VOLUNTEERING", label: "Volunteering" },
  { id: "ALUMNI", label: "Alumni" },
  { id: "HIGHLIGHT", label: "Highlights" },
] as const;

export const FACULTIES = [
  { id: "COMPUTING", label: "Computing" },
  { id: "BUSINESS", label: "Business" },
  { id: "ENGINEERING", label: "Engineering" },
] as const;

export const STUDY_YEARS = [
  { id: "1", label: "Year 1" },
  { id: "2", label: "Year 2" },
  { id: "3", label: "Year 3" },
  { id: "4", label: "Year 4" },
] as const;

export const TITLE_MAX = 200;
export const BODY_MAX = 10_000;

export const AI_SUGGESTED_PROMPTS = [
  "What events are happening this week?",
  "Find an available classroom this afternoon.",
  "When is the next academic deadline?",
  "How do I contact IT support?",
  "Library eka open wenna puluwanda?",
  "පුස්තකාලය කීයට විවෘතද?",
] as const;

export const ASSISTANT_LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  si: "Sinhala",
  si_latn: "Singlish",
};

export const ROLE_LABELS: Record<RoleName, string> = {
  STUDENT: "Student",
  ACADEMIC: "Academic staff",
  SOCIETY_REP: "Society representative",
  FINANCE: "Finance",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super admin",
};
