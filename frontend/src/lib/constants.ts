/** Labels and role names. Keep in sync with backend/app/constants.py. */

export const APP_NAME = "UCL Campus Hub";

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

export const ROUTES = {
  home: "/",
  login: "/login",
  newPost: "/posts/new",
} as const;
