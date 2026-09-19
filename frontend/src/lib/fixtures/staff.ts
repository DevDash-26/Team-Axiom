/** Design fixtures for staff and admin queues. Not an API contract. */

import { REQUEST_STATUS, REQUEST_TYPE, ROLES } from "@/lib/constants";

export type StaffBookingFixture = {
  id: string;
  student: string;
  programme: string;
  room: string;
  slot: string;
  purpose: string;
  groupSize: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
};

export const STAFF_BOOKINGS: StaffBookingFixture[] = [
  {
    id: "RQ-104",
    student: "Nimali Perera",
    programme: "Software Engineering · Y2",
    room: "Room 302",
    slot: "Today 14:00–16:00",
    purpose: "Group study",
    groupSize: 6,
    status: "PENDING",
    note: null,
  },
  {
    id: "RQ-101",
    student: "Kasun Fernando",
    programme: "Business Management · Y1",
    room: "Room 204",
    slot: "Fri 10:00–12:00",
    purpose: "Presentation practice",
    groupSize: 8,
    status: "PENDING",
    note: null,
  },
  {
    id: "RQ-091",
    student: "Ishara Jayawardena",
    programme: "Software Engineering · Y3",
    room: "Lab B2",
    slot: "Mon 13:00–15:00",
    purpose: "Club workshop",
    groupSize: 12,
    status: "APPROVED",
    note: "Room 302 was suggested; Lab B2 confirmed.",
  },
];

export type StaffSupportFixture = {
  id: string;
  student: string;
  programme: string;
  type: (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];
  title: string;
  body: string;
  status: (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];
  created_at: string;
  response: string | null;
};

export const STAFF_SUPPORT_QUEUE: StaffSupportFixture[] = [
  {
    id: "REQ-204",
    student: "Nimali Perera",
    programme: "Software Engineering · Y2",
    type: REQUEST_TYPE.ACADEMIC_SUPPORT,
    title: "Study group for algorithms",
    body: "Looking for a Year 2 Computing group that meets twice a week before the mid-term.",
    status: REQUEST_STATUS.IN_PROGRESS,
    created_at: "2026-09-17T04:12:00.000Z",
    response: "A shortlist of groups will be shared by Thursday.",
  },
  {
    id: "REQ-198",
    student: "Kasun Fernando",
    programme: "Business Management · Y1",
    type: REQUEST_TYPE.FACILITY_ISSUE,
    title: "Broken projector in LT1",
    body: "The projector flickers after 10 minutes. Happened in the 09:00 lecture.",
    status: REQUEST_STATUS.OPEN,
    created_at: "2026-09-18T03:40:00.000Z",
    response: null,
  },
  {
    id: "REQ-173",
    student: "Ishara Jayawardena",
    programme: "Software Engineering · Y3",
    type: REQUEST_TYPE.FEEDBACK,
    title: "Quiet hours in the cafeteria",
    body: "Revision week is noisy on the mezzanine. Could quiet hours be posted?",
    status: REQUEST_STATUS.RESOLVED,
    created_at: "2026-09-10T09:00:00.000Z",
    response: "Quiet hours 12:00–14:00 will be trialled from next week.",
  },
];

export type InterestPerson = {
  id: string;
  name: string;
  programme: string;
};

export const EVENT_INTEREST_LISTS: Record<string, InterestPerson[]> = {
  "fix-evt-1": [
    { id: "p1", name: "Nimali Perera", programme: "Software Engineering · Y2" },
    { id: "p2", name: "Ishara Jayawardena", programme: "Software Engineering · Y3" },
    { id: "p3", name: "Kasun Fernando", programme: "Business Management · Y1" },
  ],
  "fix-evt-2": [
    { id: "p4", name: "Anuki Silva", programme: "Computing · Society" },
    { id: "p5", name: "Nimali Perera", programme: "Software Engineering · Y2" },
  ],
  "fix-lec-1": [
    { id: "p6", name: "Ishara Jayawardena", programme: "Software Engineering · Y3" },
  ],
};

export const SOCIETY_INTEREST_LISTS: Record<string, InterestPerson[]> = {
  "axiom-computing-club": [
    { id: "s1", name: "Nimali Perera", programme: "Software Engineering · Y2" },
    { id: "s2", name: "Ishara Jayawardena", programme: "Software Engineering · Y3" },
  ],
  "ucl-business-society": [{ id: "s3", name: "Kasun Fernando", programme: "Business Management · Y1" }],
};

export type AssistantInsight = {
  id: string;
  question: string;
  count: number;
  lastAsked: string;
  fallback: boolean;
};

export const ASSISTANT_INSIGHTS: AssistantInsight[] = [
  {
    id: "ai-1",
    question: "How do I book Room 301 after 4pm?",
    count: 6,
    lastAsked: "Today 09:40",
    fallback: true,
  },
  {
    id: "ai-2",
    question: "When does scholarship applications close?",
    count: 4,
    lastAsked: "Yesterday",
    fallback: false,
  },
  {
    id: "ai-3",
    question: "Who marks lost ID cards as claimed?",
    count: 3,
    lastAsked: "2 days ago",
    fallback: true,
  },
];

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  programme: string | null;
  role: string;
  status: "Active" | "Disabled";
};

export const MANAGED_USERS: ManagedUser[] = [
  {
    id: "STU-1001",
    name: "Nimali Perera",
    email: "nimali@ucl.demo",
    programme: "Software Engineering",
    role: ROLES.STUDENT,
    status: "Active",
  },
  {
    id: "STU-1002",
    name: "Kasun Fernando",
    email: "kasun@ucl.demo",
    programme: "Business Management",
    role: ROLES.STUDENT,
    status: "Active",
  },
  {
    id: "STAFF-01",
    name: "Dr Jayasuriya",
    email: "academic@ucl.demo",
    programme: "Computing",
    role: ROLES.ACADEMIC,
    status: "Active",
  },
  {
    id: "STAFF-02",
    name: "Anuki Silva",
    email: "rep@ucl.demo",
    programme: "Axiom Computing Club",
    role: ROLES.SOCIETY_REP,
    status: "Active",
  },
  {
    id: "STAFF-03",
    name: "Ruvini de Silva",
    email: "finance@ucl.demo",
    programme: "Finance office",
    role: ROLES.FINANCE,
    status: "Active",
  },
  {
    id: "ADM-01",
    name: "Tharindu Wijesinghe",
    email: "admin@ucl.demo",
    programme: null,
    role: ROLES.ADMIN,
    status: "Active",
  },
  {
    id: "ADM-00",
    name: "Campus Super Admin",
    email: "super@ucl.demo",
    programme: null,
    role: ROLES.SUPER_ADMIN,
    status: "Active",
  },
];
