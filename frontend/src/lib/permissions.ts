/** UI visibility map. Mirrors backend PERMISSION_ROLES — the server still enforces. */

import { ROLES, type RoleName } from "@/lib/constants";

const ALL_ROLES = Object.values(ROLES) as RoleName[];
const ADMINS: RoleName[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export type UiPermission = {
  id: string;
  label: string;
  roles: readonly RoleName[];
};

export const UI_PERMISSIONS: readonly UiPermission[] = [
  { id: "posts.view_published", label: "View published content", roles: ALL_ROLES },
  { id: "posts.create_announcement", label: "Publish announcements", roles: [ROLES.ACADEMIC, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  { id: "posts.create_event", label: "Publish events", roles: [ROLES.ACADEMIC, ROLES.SOCIETY_REP, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  { id: "posts.create_society_update", label: "Publish society updates", roles: [ROLES.SOCIETY_REP, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
  { id: "posts.create_emergency", label: "Publish emergencies", roles: ADMINS },
  { id: "info.manage_finance", label: "Manage financial aid info", roles: [ROLES.FINANCE, ROLES.ADMIN] },
  { id: "info.manage", label: "Manage campus information", roles: ADMINS },
  { id: "bookings.create", label: "Request a classroom", roles: ALL_ROLES },
  { id: "bookings.approve", label: "Approve classroom bookings", roles: ADMINS },
  { id: "requests.create", label: "Submit support requests", roles: ALL_ROLES },
  { id: "requests.handle_academic", label: "Handle academic support", roles: [ROLES.ACADEMIC, ROLES.ADMIN] },
  { id: "requests.handle_facility", label: "Handle facility issues and feedback", roles: ADMINS },
  { id: "listings.moderate", label: "Moderate lost & found", roles: [ROLES.ADMIN] },
  { id: "users.manage", label: "Manage users and roles", roles: [ROLES.SUPER_ADMIN] },
  { id: "assistant.insights", label: "View assistant insights", roles: ADMINS },
];

export function roleHas(permissionId: string, role: string): boolean {
  const row = UI_PERMISSIONS.find((item) => item.id === permissionId);
  return Boolean(row?.roles.includes(role as RoleName));
}

export function canApproveBookings(role: string): boolean {
  return roleHas("bookings.approve", role);
}

export function canHandleAcademicRequests(role: string): boolean {
  return roleHas("requests.handle_academic", role);
}

export function canHandleFacilityRequests(role: string): boolean {
  return roleHas("requests.handle_facility", role);
}

export function canModerateListings(role: string): boolean {
  return roleHas("listings.moderate", role);
}

export function canManageUsers(role: string): boolean {
  return roleHas("users.manage", role);
}

export function canViewAssistantInsights(role: string): boolean {
  return roleHas("assistant.insights", role);
}
