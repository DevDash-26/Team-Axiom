/** Labels, routes, and role helpers. Keep roles in sync with backend/app/constants.py. */

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

export const ADMIN_ROLES: readonly RoleName[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

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

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  unauthorized: "/unauthorized",
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
  staffRequests: "/staff/requests",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminStaff: "/admin/staff",
  adminRoles: "/admin/roles",
  newPost: "/posts/new",
} as const;

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

export function dashboardPathForRole(role: string): string {
  if (isAdmin(role)) return ROUTES.adminDashboard;
  if (isStaffWorkspace(role)) return ROUTES.staffDashboard;
  return ROUTES.studentDashboard;
}

export const DEMO_PASSWORD_HINT = "CampusHub!2026";
