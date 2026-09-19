/** Role-aware menu config. Visibility only — the server still enforces permissions. */

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  Home,
  Info,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ADMIN_ROLES,
  ANNOUNCEMENT_ROLES,
  ROLE_LABELS,
  ROLES,
  ROUTES,
  STAFF_ROLES,
  type RoleName,
} from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string }[];
};

export function isRoleName(value: string): value is RoleName {
  return Object.values(ROLES).includes(value as RoleName);
}

export function isStaffRole(role: string): boolean {
  return isRoleName(role) && STAFF_ROLES.includes(role);
}

export function isAdminRole(role: string): boolean {
  return isRoleName(role) && ADMIN_ROLES.includes(role);
}

export function canCreateAnnouncement(role: string): boolean {
  return isRoleName(role) && ANNOUNCEMENT_ROLES.includes(role);
}

export function roleLabel(role: string): string {
  if (!isRoleName(role)) {
    return role;
  }
  return ROLE_LABELS[role];
}

export const STUDENT_NAV: NavItem[] = [
  { href: ROUTES.home, label: "Home", icon: Home },
  {
    href: ROUTES.updates,
    label: "Discover",
    icon: Sparkles,
    children: [
      { href: ROUTES.events, label: "Events" },
      { href: ROUTES.lectures, label: "Guest lectures" },
      { href: ROUTES.societies, label: "Societies" },
      { href: ROUTES.opportunities, label: "Opportunities" },
      { href: ROUTES.updates, label: "Campus Updates" },
    ],
  },
  {
    href: ROUTES.info,
    label: "Services",
    icon: LifeBuoy,
    children: [
      { href: ROUTES.bookings, label: "Classroom Booking" },
      { href: ROUTES.myBookings, label: "My Bookings" },
      { href: ROUTES.lostFound, label: "Lost & Found" },
      { href: ROUTES.requests, label: "Academic Support" },
      { href: ROUTES.info, label: "Campus Information" },
    ],
  },
  { href: ROUTES.calendar, label: "Calendar", icon: CalendarDays },
  { href: ROUTES.assistant, label: "AI Assistant", icon: MessageCircle },
];

export const STUDENT_MOBILE_NAV: NavItem[] = [
  { href: ROUTES.home, label: "Home", icon: Home },
  { href: ROUTES.events, label: "Discover", icon: Sparkles },
  { href: ROUTES.assistant, label: "AI", icon: MessageCircle },
  { href: ROUTES.info, label: "Services", icon: LifeBuoy },
  { href: ROUTES.profile, label: "Profile", icon: Users },
];

export const STAFF_NAV: NavItem[] = [
  { href: ROUTES.staffDashboard, label: "Dashboard", icon: LayoutDashboard },
  {
    href: ROUTES.staffContent,
    label: "Content",
    icon: BookOpen,
    children: [
      { href: ROUTES.staffContent, label: "Announcements" },
      { href: ROUTES.events, label: "Events" },
      { href: ROUTES.societies, label: "Societies" },
      { href: ROUTES.info, label: "Campus Information" },
    ],
  },
  {
    href: ROUTES.staffRequests,
    label: "Requests",
    icon: ClipboardList,
    children: [
      { href: ROUTES.staffBookings, label: "Room Requests" },
      { href: ROUTES.lostFound, label: "Lost & Found" },
      { href: ROUTES.staffRequests, label: "Student Requests" },
    ],
  },
  { href: ROUTES.assistant, label: "AI Assistant", icon: MessageCircle },
];

export const ADMIN_NAV: NavItem[] = [
  { href: ROUTES.adminDashboard, label: "Dashboard", icon: LayoutDashboard },
  {
    href: ROUTES.adminUsers,
    label: "Management",
    icon: Users,
    children: [
      { href: ROUTES.adminUsers, label: "Users" },
      { href: ROUTES.adminRoles, label: "Roles & Permissions" },
    ],
  },
  {
    href: ROUTES.staffContent,
    label: "Content",
    icon: BookOpen,
    children: [
      { href: ROUTES.staffContent, label: "Announcements" },
      { href: ROUTES.events, label: "Events" },
      { href: ROUTES.info, label: "Campus Information" },
      { href: ROUTES.calendar, label: "Academic Calendar" },
    ],
  },
  {
    href: ROUTES.staffRequests,
    label: "Operations",
    icon: Building2,
    children: [
      { href: ROUTES.staffBookings, label: "Room Requests" },
      { href: ROUTES.lostFound, label: "Lost & Found" },
      { href: ROUTES.staffRequests, label: "Support Requests" },
    ],
  },
  { href: ROUTES.adminRoles, label: "System", icon: Shield },
];

export const UTILITY_ICONS = {
  search: Search,
  notifications: Bell,
  info: Info,
} as const;
