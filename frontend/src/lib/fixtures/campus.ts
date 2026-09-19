/** Design fixtures for Phase 2 screens. Used when an API is missing or empty. */

import type { PostRead } from "@/types";

const author = { id: "seed-admin", full_name: "UCL Admin Office", role: "ADMIN" };

export const FIXTURE_POSTS: PostRead[] = [
  {
    id: "fix-ann-1",
    type: "ANNOUNCEMENT",
    title: "Semester registration deadline",
    body: "Registration for next semester closes on Friday. Complete your module choices in UniHive before 4:00 PM.",
    status: "PUBLISHED",
    pinned: true,
    faculty: "COMPUTING",
    year: 2,
    programme: "Software Engineering",
    starts_at: null,
    expires_at: null,
    location: null,
    event_at: null,
    deadline_at: "2026-09-25T10:30:00.000Z",
    apply_url: null,
    society_id: null,
    created_at: "2026-09-18T04:00:00.000Z",
    author,
  },
  {
    id: "fix-emg-1",
    type: "EMERGENCY",
    title: "Library level 2 closed this afternoon",
    body: "A water leak has closed Library level 2 until 6:00 PM. Level 1 remains open.",
    status: "PUBLISHED",
    pinned: true,
    faculty: null,
    year: null,
    programme: null,
    starts_at: null,
    expires_at: null,
    location: "Library",
    event_at: null,
    deadline_at: null,
    apply_url: null,
    society_id: null,
    created_at: "2026-09-19T03:00:00.000Z",
    author,
  },
  {
    id: "fix-evt-1",
    type: "EVENT",
    title: "Axiom Computing Club hack night",
    body: "Bring a laptop. Mentors from Year 3 will help with UniHive-style campus tools.",
    status: "PUBLISHED",
    pinned: false,
    faculty: "COMPUTING",
    year: null,
    programme: null,
    starts_at: null,
    expires_at: null,
    location: "Lab B2",
    event_at: "2026-09-22T13:30:00.000Z",
    deadline_at: null,
    apply_url: null,
    society_id: "soc-axiom",
    created_at: "2026-09-12T08:00:00.000Z",
    author: { id: "seed-rep", full_name: "Anuki Silva", role: "SOCIETY_REP" },
  },
  {
    id: "fix-evt-2",
    type: "EVENT",
    title: "UCL careers mixer",
    body: "Meet alumni from computing and business. Smart casual.",
    status: "PUBLISHED",
    pinned: false,
    faculty: null,
    year: null,
    programme: null,
    starts_at: null,
    expires_at: null,
    location: "Atrium",
    event_at: "2026-09-24T11:00:00.000Z",
    deadline_at: null,
    apply_url: null,
    society_id: null,
    created_at: "2026-09-10T08:00:00.000Z",
    author,
  },
  {
    id: "fix-lec-1",
    type: "GUEST_LECTURE",
    title: "Guest lecture: responsible AI on campus",
    body: "Dr Jayasuriya hosts a visiting speaker from the Colombo tech community.",
    status: "PUBLISHED",
    pinned: false,
    faculty: "COMPUTING",
    year: null,
    programme: null,
    starts_at: null,
    expires_at: null,
    location: "LT1",
    event_at: "2026-09-23T09:00:00.000Z",
    deadline_at: null,
    apply_url: null,
    society_id: null,
    created_at: "2026-09-11T08:00:00.000Z",
    author: { id: "seed-academic", full_name: "Dr Jayasuriya", role: "ACADEMIC" },
  },
  {
    id: "fix-cal-1",
    type: "CALENDAR_ENTRY",
    title: "Add/drop deadline",
    body: "Last day to add or drop a module without a fee.",
    status: "PUBLISHED",
    pinned: false,
    faculty: null,
    year: null,
    programme: null,
    starts_at: null,
    expires_at: null,
    location: null,
    event_at: null,
    deadline_at: "2026-09-26T10:30:00.000Z",
    apply_url: null,
    society_id: null,
    created_at: "2026-09-01T08:00:00.000Z",
    author,
  },
];

export const EVENT_INTEREST: Record<string, number> = {
  "fix-evt-1": 18,
  "fix-evt-2": 42,
  "fix-lec-1": 27,
};

export const EVENT_CATEGORY: Record<string, string> = {
  "fix-evt-1": "Society",
  "fix-evt-2": "University",
  "fix-lec-1": "Guest Lecture",
};

export type SocietyFixture = {
  id: string;
  slug: string;
  name: string;
  faculty: string;
  description: string;
  members: number;
};

export const SOCIETIES: SocietyFixture[] = [
  {
    id: "soc-axiom",
    slug: "axiom-computing-club",
    name: "Axiom Computing Club",
    faculty: "COMPUTING",
    description: "Hack nights, guest talks, and student-built campus tools.",
    members: 64,
  },
  {
    id: "soc-biz",
    slug: "ucl-business-society",
    name: "UCL Business Society",
    faculty: "BUSINESS",
    description: "Case competitions, alumni mixers, and professional skills workshops.",
    members: 51,
  },
];

export type RoomFixture = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  available: boolean;
  conflict: boolean;
};

export const ROOMS: RoomFixture[] = [
  { id: "room-302", name: "Room 302", floor: "Level 3", capacity: 12, available: true, conflict: false },
  { id: "room-204", name: "Room 204", floor: "Level 2", capacity: 20, available: true, conflict: false },
  { id: "room-301", name: "Room 301", floor: "Level 3", capacity: 8, available: false, conflict: true },
];

export type BookingFixture = {
  id: string;
  room: string;
  when: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const MY_BOOKINGS: BookingFixture[] = [
  {
    id: "RQ-104",
    room: "Room 302",
    when: "Today, 2:00 PM – 4:00 PM",
    purpose: "Group study",
    status: "Pending",
  },
];

export type SearchHit = {
  id: string;
  type: string;
  title: string;
  snippet: string;
  href: string;
};

export const SEARCH_HITS: SearchHit[] = [
  {
    id: "s1",
    type: "ANNOUNCEMENT",
    title: "Semester registration deadline",
    snippet: "Complete module choices before Friday 4:00 PM.",
    href: "/updates",
  },
  {
    id: "s2",
    type: "EVENT",
    title: "Axiom Computing Club hack night",
    snippet: "Lab B2 · Monday evening.",
    href: "/events/fix-evt-1",
  },
  {
    id: "s3",
    type: "ROOM",
    title: "Room 302",
    snippet: "Seats 12 · Level 3 · often free after 2:00 PM.",
    href: "/bookings",
  },
  {
    id: "s4",
    type: "FAQ",
    title: "How do I contact IT support?",
    snippet: "Use Campus Information or ask UniHive AI.",
    href: "/info",
  },
  {
    id: "s5",
    type: "SOCIETY",
    title: "Axiom Computing Club",
    snippet: "Hack nights and student-built campus tools.",
    href: "/societies/axiom-computing-club",
  },
];
