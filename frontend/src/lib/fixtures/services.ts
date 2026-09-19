/** Design fixtures for listings, requests, and campus information. */

import { LISTING_KIND, LISTING_STATUS, REQUEST_STATUS, REQUEST_TYPE } from "@/lib/constants";

export type ListingFixture = {
  id: string;
  type: (typeof LISTING_KIND)[keyof typeof LISTING_KIND];
  title: string;
  body: string;
  category: string;
  location: string | null;
  occurred_at: string | null;
  status: (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];
  handover: string;
};

export const LOST_FOUND_ITEMS: ListingFixture[] = [
  {
    id: "lf-bottle",
    type: LISTING_KIND.LOST,
    title: "Blue insulated water bottle",
    body: "Navy bottle with a UCL sticker on the lid. Last seen near the silent study desks.",
    category: "Other",
    location: "Library level 2",
    occurred_at: "2026-09-18T04:30:00.000Z",
    status: LISTING_STATUS.ACTIVE,
    handover: "Student Services desk, Level 1",
  },
  {
    id: "lf-id",
    type: LISTING_KIND.FOUND,
    title: "Student ID card (first name Nimali)",
    body: "Plastic student card found under a cafeteria chair. Staff will match it internally.",
    category: "ID card",
    location: "Cafeteria",
    occurred_at: "2026-09-19T02:15:00.000Z",
    status: LISTING_STATUS.ACTIVE,
    handover: "Student Services desk, Level 1",
  },
  {
    id: "lf-umbrella",
    type: LISTING_KIND.LOST,
    title: "Black compact umbrella",
    body: "Folding umbrella left by the Block C lifts after the rain.",
    category: "Other",
    location: "Block C",
    occurred_at: "2026-09-17T11:00:00.000Z",
    status: LISTING_STATUS.RESOLVED,
    handover: "Returned via Student Services",
  },
  {
    id: "lf-keys",
    type: LISTING_KIND.FOUND,
    title: "Set of keys on a red lanyard",
    body: "Three keys and a USB fob. No personal tags. Handed in this morning.",
    category: "Keys",
    location: "Lab B2",
    occurred_at: "2026-09-19T03:40:00.000Z",
    status: LISTING_STATUS.ACTIVE,
    handover: "IT helpdesk, Level 2",
  },
];

export const TEXTBOOKS: ListingFixture[] = [
  {
    id: "tb-db",
    type: LISTING_KIND.TEXTBOOK,
    title: "Database System Concepts (7th ed.)",
    body: "Highlighted in chapters 1–6. Good condition. Looking to swap or sell at a student price.",
    category: "Computing",
    location: "Block A atrium",
    occurred_at: "2026-09-12T08:00:00.000Z",
    status: LISTING_STATUS.ACTIVE,
    handover: "Meet at the atrium after lectures. Arrange via UniHive — no phone numbers on the listing.",
  },
  {
    id: "tb-acc",
    type: LISTING_KIND.TEXTBOOK,
    title: "Introduction to Financial Accounting",
    body: "Like new. Notes on sticky tabs only. Year 1 Business module.",
    category: "Business",
    location: "Library entrance",
    occurred_at: "2026-09-10T08:00:00.000Z",
    status: LISTING_STATUS.ACTIVE,
    handover: "Library helpdesk can hold the book for collection.",
  },
];

export type CampusRequestFixture = {
  id: string;
  type: (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];
  title: string;
  body: string;
  status: (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];
  created_at: string;
  response: string | null;
};

export const MY_REQUESTS: CampusRequestFixture[] = [
  {
    id: "REQ-204",
    type: REQUEST_TYPE.ACADEMIC_SUPPORT,
    title: "Study group for algorithms",
    body: "Looking for a Year 2 Computing group that meets twice a week before the mid-term.",
    status: REQUEST_STATUS.IN_PROGRESS,
    created_at: "2026-09-17T04:12:00.000Z",
    response: "Dr Jayasuriya will share a group shortlist by Thursday.",
  },
  {
    id: "REQ-198",
    type: REQUEST_TYPE.FACILITY_ISSUE,
    title: "Broken projector in LT1",
    body: "The projector flickers after 10 minutes. Happened in the 09:00 lecture.",
    status: REQUEST_STATUS.OPEN,
    created_at: "2026-09-18T03:40:00.000Z",
    response: null,
  },
  {
    id: "REQ-173",
    type: REQUEST_TYPE.FEEDBACK,
    title: "Quiet hours in the cafeteria",
    body: "Revision week is noisy on the mezzanine. Could quiet hours be posted?",
    status: REQUEST_STATUS.RESOLVED,
    created_at: "2026-09-10T09:00:00.000Z",
    response: "Quiet hours 12:00–14:00 will be trialled from next week.",
  },
];

export type InfoPageFixture = {
  category: string;
  title: string;
  body: string;
  updated_at: string;
};

export const INFO_PAGES: InfoPageFixture[] = [
  {
    category: "FAQ",
    title: "Frequently asked questions",
    body: "Start here for ID cards, Wi-Fi, and who to contact. Official answers are updated by the admin office.",
    updated_at: "2026-09-18T06:00:00.000Z",
  },
  {
    category: "ONBOARDING",
    title: "Getting started at UCL",
    body: "Collect your student ID from Student Services on Level 1, connect to UCL-WiFi with your university email, and complete module registration in UniHive before Friday 4:00 PM.",
    updated_at: "2026-09-12T06:00:00.000Z",
  },
  {
    category: "DIRECTORY",
    title: "Staff directory",
    body: "These are official office contacts. Student personal numbers are never listed here.",
    updated_at: "2026-09-15T06:00:00.000Z",
  },
  {
    category: "FINANCIAL_AID",
    title: "Financial support",
    body: "Scholarship windows open each semester. Instalment plans are arranged with the Finance office. Bring your student ID. Deadlines are posted on the academic calendar.",
    updated_at: "2026-09-08T06:00:00.000Z",
  },
  {
    category: "DINING",
    title: "Dining",
    body: "Cafeteria: 08:00–16:30 weekdays. Vegetarian and halal counters are labelled. This week’s special is rice and curry on Wednesday.",
    updated_at: "2026-09-19T01:00:00.000Z",
  },
  {
    category: "PRINTING",
    title: "Printing services",
    body: "Printers are on Library level 1 and Block B lab. Top up print credit at the IT helpdesk. Colour prints are charged per side.",
    updated_at: "2026-09-05T06:00:00.000Z",
  },
  {
    category: "WELLBEING",
    title: "Wellbeing and counselling",
    body: "Book a confidential session with Campus Wellbeing. Drop-in hours are Tuesday and Thursday 13:00–15:00 in Room W2. In an emergency, go to Student Services.",
    updated_at: "2026-09-11T06:00:00.000Z",
  },
  {
    category: "IT",
    title: "IT support",
    body: "Reset your password from the university email portal. Lab logins use the same account. The IT helpdesk is on Level 2, weekdays 09:00–16:00.",
    updated_at: "2026-09-16T06:00:00.000Z",
  },
  {
    category: "LIBRARY",
    title: "Library",
    body: "Open 08:00–20:00 weekdays and 09:00–14:00 Saturday. Level 2 is silent study. Loans are two weeks. Level 2 is closed this afternoon because of a water leak.",
    updated_at: "2026-09-19T03:00:00.000Z",
  },
  {
    category: "SPORTS",
    title: "Sports and recreation",
    body: "Indoor court and gym hours are posted at the sports desk. Classroom-style bookings use Find a Classroom. For the court, enquire with Sports on weekdays 10:00–15:00.",
    updated_at: "2026-09-07T06:00:00.000Z",
  },
];

export type FaqFixture = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export const FAQS: FaqFixture[] = [
  {
    id: "faq-wifi",
    category: "FAQ",
    question: "How do I connect to campus Wi-Fi?",
    answer: "Choose UCL-WiFi and sign in with your university email. If it fails, visit IT on Level 2.",
  },
  {
    id: "faq-id",
    category: "FAQ",
    question: "Where do I collect my student ID?",
    answer: "Student Services, Level 1, with a national ID or passport. Replacement cards take two working days.",
  },
  {
    id: "faq-it-lab",
    category: "IT",
    question: "Who do I contact if a lab PC will not log in?",
    answer: "Use Academic Support to report a facility issue, or go to the IT helpdesk on Level 2.",
  },
  {
    id: "faq-aid",
    category: "FINANCIAL_AID",
    question: "When do scholarship applications close?",
    answer: "The current window closes with the add/drop deadline. Finance will post a reminder on Campus Updates.",
  },
  {
    id: "faq-well",
    category: "WELLBEING",
    question: "Is counselling confidential?",
    answer: "Yes. Appointments are not shown on the public feed. Only Wellbeing staff see the booking.",
  },
];

export type StaffContactFixture = {
  id: string;
  name: string;
  role_title: string;
  department: string;
  email: string;
  office_hours: string | null;
};

export const STAFF_CONTACTS: StaffContactFixture[] = [
  {
    id: "sc-1",
    name: "Dr Jayasuriya",
    role_title: "Senior lecturer",
    department: "Computing",
    email: "academic@ucl.demo",
    office_hours: "Wed 14:00–16:00, Room C12",
  },
  {
    id: "sc-2",
    name: "Finance Office",
    role_title: "Student finance",
    department: "Finance",
    email: "finance@ucl.demo",
    office_hours: "Weekdays 09:30–15:30, Level 1",
  },
  {
    id: "sc-3",
    name: "IT Helpdesk",
    role_title: "Campus IT",
    department: "IT",
    email: "it@ucl.demo",
    office_hours: "Weekdays 09:00–16:00, Level 2",
  },
];

export const PROFILE_ACTIVITY = [
  { id: "act-1", label: "Classroom request RQ-104 submitted", when: "Today, 10:12" },
  { id: "act-2", label: "Marked interest in Axiom hack night", when: "Yesterday" },
  { id: "act-3", label: "Signed in from campus Wi-Fi", when: "Yesterday" },
] as const;
