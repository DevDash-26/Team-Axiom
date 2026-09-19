/** Labels, roles, and routes. Keep role names in sync with backend/app/constants.py. */

export const APP_NAME = "UniHive";
export const APP_TAGLINE = "Everything campus. One place.";

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

export const ADMIN_ROLES: readonly RoleName[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const ANNOUNCEMENT_ROLES: readonly RoleName[] = [
  ROLES.ACADEMIC,
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
] as const;

export type FeedChipId = (typeof FEED_CHIPS)[number]["id"];

export const ROUTES = {
  home: "/",
  login: "/login",
  forbidden: "/403",
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
  requests: "/requests",
  info: "/info",
  calendar: "/calendar",
  assistant: "/assistant",
  profile: "/profile",
  staffDashboard: "/staff/dashboard",
  staffContent: "/staff/content",
  staffBookings: "/staff/bookings",
  staffRequests: "/staff/requests",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminRoles: "/admin/roles",
} as const;

export const PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 300;
export const TIME_ZONE = "Asia/Colombo";

export function eventPath(id: string): string {
  return `${ROUTES.events}/${id}`;
}

export function societyPath(slug: string): string {
  return `${ROUTES.societies}/${slug}`;
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

export const AI_SUGGESTED_PROMPTS = [
  "What events are happening this week?",
  "Find an available classroom this afternoon.",
  "When is the next academic deadline?",
  "How do I contact IT support?",
] as const;

export const ROLE_LABELS: Record<RoleName, string> = {
  STUDENT: "Student",
  ACADEMIC: "Academic staff",
  SOCIETY_REP: "Society representative",
  FINANCE: "Finance",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super admin",
};
