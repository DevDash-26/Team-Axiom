# Requirements Traceability (pre-filled from the DevDash'26 Problem Statement)

> Single source of truth. Update status every time a feature lands or is cut.
> Marks: 33 business requirements = 85, 6 non-functional = 15, total 100, scaled to the 45 Requirement Coverage marks.

**Problem (one line):** One trusted digital channel for UCL students to access campus information and services, replacing WhatsApp groups, notice boards and word of mouth.

**Roles:** Student, Academic staff, Society representative, Finance staff, Administrative staff, Super admin.

**Last updated:** TODO

## Status key
Done = works end to end, validated, tested. Partial = state what is missing. Not done = state why.

## Build engines (why we can cover all 33 requirements)

| Engine | Idea | Requirements covered |
|--------|------|----------------------|
| E1 Content/Post engine | One model with a type, audience targeting (faculty / year / programme), scheduling, expiry, pinning, author and role permission per type | BR2, BR3, BR5, BR13, BR15, BR16, BR18, BR19, BR20, BR28, BR32, plus info pages |
| E2 Knowledge/Info engine | Categorised info pages and FAQ entries, editable by staff | BR10, BR14, BR22, BR23, BR25, BR26, BR29, BR30, BR31, BR24 (info part) |
| E3 Booking engine | Resources (rooms, sports facilities) with availability, conflict detection, request and approval | BR8, BR24 (booking part) |
| E4 Request/ticket engine | Typed requests with status workflow and staff response | BR9, BR17, BR21 |
| E5 Listing and sign-up engine | Listings with status, and join/interest records | BR4, BR6, BR7, BR27 |
| Platform | Auth, RBAC, unified search and home feed, AI assistant, audit, admin UI | BR1, BR11, BR12, BR33 |

## A. Business requirements

| ID | Requirement | Marks | Engine | Build order | Status | Owner | Where implemented | Tests | Notes |
|----|-------------|-------|--------|-------------|--------|-------|-------------------|-------|-------|
| BR1 | Unified access (single home, search, feed) | 5 | Platform | 1 | Not done | | | | Home feed + global search across all content |
| BR2 | Targeted announcements by faculty/year/programme | 3 | E1 | 1 | Not done | | | | Audience filter on student profile |
| BR3 | Event visibility (university + student organiser) | 3 | E1 | 2 | Not done | | | | Event type with organiser and source label |
| BR4 | Event interest (register interest, organiser sees count) | 1 | E5 | 2 | Not done | | | | Interested toggle + count for organiser |
| BR5 | Society visibility (society pages and updates) | 3 | E1 | 2 | Not done | | | | Society profile + posts by reps |
| BR6 | Society sign-up / interest | 2 | E5 | 2 | Not done | | | | Reps view member interest list |
| BR7 | Lost & found (report, search, resolve) | 3 | E5 | 3 | Not done | | | | Lost/Found, status, contact via app |
| BR8 | Classroom booking (availability, request, no admin call) | 5 | E3 | 2 | Not done | | | | Conflict detection, approval flow, calendar view |
| BR9 | Academic support requests (study group, tutoring, mentoring) | 3 | E4 | 3 | Not done | | | | Academic staff respond / match |
| BR10 | FAQ access | 2 | E2 | 3 | Not done | | | | Also feeds AI assistant |
| BR11 | Content maintenance by authorised contributors | 4 | Platform | 1 | Not done | | | | Staff dashboard: create/edit/expire/archive, "my content" |
| BR12 | Access levels (student view; academic, society, finance, admin manage) | 6 | Platform | 1 | Not done | | | | Permission matrix enforced server-side |
| BR13 | Academic calendar (exams, add/drop, milestones) | 3 | E1 | 3 | Not done | | | | Calendar view, upcoming deadlines |
| BR14 | Student onboarding info | 2 | E2 | 4 | Not done | | | | First-year guide, targeted to year 1 |
| BR15 | Emergency communication | 3 | E1 | 2 | Not done | | | | Top-of-screen banner, admin only, highest priority |
| BR16 | Schedule changes / closures | 1 | E1 | 3 | Not done | | | | Type with effective date |
| BR17 | Feedback loop | 1 | E4 | 4 | Not done | | | | Feedback/question form, staff triage |
| BR18 | Volunteering opportunities | 1 | E1 | 4 | Not done | | | | |
| BR19 | Alumni engagement | 1 | E1 | 4 | Not done | | | | |
| BR20 | Job and internship visibility | 3 | E1 | 3 | Not done | | | | Filters: type, deadline, faculty |
| BR21 | Facility issue reporting | 2 | E4 | 3 | Not done | | | | Status tracking, admin staff resolve |
| BR22 | Staff directory | 2 | E2 | 4 | Not done | | | | Searchable by department/name |
| BR23 | Financial support info | 3 | E2 | 3 | Not done | | | | Finance role manages |
| BR24 | Sports and recreation (info + booking) | 2 | E2 + E3 | 4 | Not done | | | | Reuse booking engine |
| BR25 | Dining info (menu, hours) | 1 | E2 | 4 | Not done | | | | |
| BR26 | Printing services info | 1 | E2 | 4 | Not done | | | | |
| BR27 | Textbook exchange | 1 | E5 | 4 | Not done | | | | Listings + status |
| BR28 | Guest lectures | 1 | E1 | 3 | Not done | | | | Distinct type from events |
| BR29 | Wellbeing and counselling info | 3 | E2 | 3 | Not done | | | | Appropriate, sensitive wording |
| BR30 | IT support info | 2 | E2 | 4 | Not done | | | | |
| BR31 | Library resources and hours | 2 | E2 | 4 | Not done | | | | |
| BR32 | Student life highlights | 1 | E1 | 4 | Not done | | | | |
| BR33 | AI assistant (natural language, guides through solution) | 9 | Platform | 2 | Not done | | | | Grounded in our own content, cites sources, deep-links to actions, fallback to search |

## B. Non-functional requirements

| ID | Requirement | Marks | How we address it | Status | Where | Notes |
|----|-------------|-------|-------------------|--------|-------|-------|
| NFR1 | Usability (first-time students, mixed digital literacy) | 2 | Mobile-first, simple navigation, plain language, clear labels, empty-state guidance | Not done | | |
| NFR2 | Performance and scalability (semester-start peaks) | 3 | Pagination, DB indexes, caching of feeds, lightweight pages, note on scaling path | Not done | | |
| NFR3 | Reliability and availability | 1 | Health check, graceful error pages, AI fallback to search, documented deploy | Not done | | |
| NFR4 | Security and privacy | 2 | Hashed passwords, server-side RBAC, only authorised publish, minimal personal data, audit log | Not done | | |
| NFR5 | Maintainability | 4 | Clear layers, admin UI so non-developers update content, docs, seed, tests, constants, README | Not done | | |
| NFR6 | Robustness (bad/incomplete input) | 3 | Server + client validation, sensible defaults, no crashes on missing fields, error boundaries | Not done | | |

## C. Deliberately left out (fill as we cut)

| What was cut | Why (marks, time, risk) | Next step |
|--------------|-------------------------|-----------|
| Integration with real student records / timetable | Not available per assumptions; out of scope | Adapter layer for SIS in future |
| | | |

## D. Assumptions (from the PS and ours)

| # | Assumption | Source |
|---|------------|--------|
| 1 | Demo data is invented by the team | PS section 7 |
| 2 | No integration with existing university systems | PS section 7 |
| 3 | University staff populate and maintain content | PS section 7 |
| 4 | Users have smartphone/tablet/computer access, so mobile-first web app | PS section 7 |
| 5 | Small admin office maintains it, so simple stack and admin UI, no complex infra | PS section 8 |
| 6 | | |

## E. Progress summary (update before final push)

- BR done: __ / 33 (marks earned: __ / 85)
- NFR done: __ / 6 (marks earned: __ / 15)
