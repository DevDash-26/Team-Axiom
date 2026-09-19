/** Visual preview data for staff and admin shells. Not an API contract. */

export type AttentionRow = {
  id: string;
  title: string;
  meta: string;
  status: "Pending" | "Open" | "Draft";
};

export type ActivityRow = {
  id: string;
  actor: string;
  action: string;
  time: string;
};

export const STAFF_PREVIEW = {
  stats: [
    { id: "rooms", label: "Pending room requests", value: 4, href: "/staff/bookings" },
    { id: "lost", label: "Open lost-item reports", value: 7, href: "/lost-found" },
    { id: "drafts", label: "Draft announcements", value: 2, href: "/staff/content" },
    { id: "events", label: "Upcoming events", value: 3, href: "/events" },
  ],
  attention: [
    {
      id: "RQ-104",
      title: "Room 302 — group study",
      meta: "Nimali Perera · Computing Year 2",
      status: "Pending",
    },
    {
      id: "LF-18",
      title: "Found: navy water bottle",
      meta: "Library level 2 · today",
      status: "Open",
    },
    {
      id: "AN-22",
      title: "Guest lecture draft",
      meta: "Computing · not published",
      status: "Draft",
    },
  ] satisfies AttentionRow[],
  activity: [
    { id: "a1", actor: "You", action: "saved a draft announcement", time: "10 min ago" },
    { id: "a2", actor: "Admin office", action: "published a schedule change", time: "1 hour ago" },
  ] satisfies ActivityRow[],
};

export const ADMIN_PREVIEW = {
  stats: [
    { id: "users", label: "Active users", value: 128, href: "/admin/users" },
    { id: "staff", label: "Staff accounts", value: 14, href: "/admin/users" },
    { id: "pending", label: "Pending requests", value: 9, href: "/staff/requests" },
    { id: "drafts", label: "Unpublished content", value: 5, href: "/staff/content" },
  ],
  attention: [
    {
      id: "U-41",
      title: "Role change requested",
      meta: "Society representative · Axiom Computing Club",
      status: "Pending",
    },
    {
      id: "RQ-104",
      title: "Room request waiting",
      meta: "Room 302 · this afternoon",
      status: "Pending",
    },
  ] satisfies AttentionRow[],
  activity: [
    { id: "b1", actor: "Sarah", action: "published “Semester Registration Deadline.”", time: "Yesterday" },
    { id: "b2", actor: "Admin", action: "updated a staff role", time: "2 days ago" },
  ] satisfies ActivityRow[],
};
