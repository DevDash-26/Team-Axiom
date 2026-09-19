# Requirements Traceability (pre-filled from the DevDash'26 Problem Statement)

> Single source of truth. Update status every time a feature lands or is cut.
> Marks: 33 business requirements = 85, 6 non-functional = 15, total 100, scaled to the 45 Requirement Coverage marks.

**Problem (one line):** One trusted digital channel for UCL students to access campus information and services, replacing WhatsApp groups, notice boards and word of mouth.

**Roles:** Student, Academic staff, Society representative, Finance staff, Administrative staff, Super admin.

**Last updated:** 2026-09-19 (frontend Phase 1 UI)

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
| BR1 | Unified access (single home, search, feed) | 5 | Platform | 1 | Partial | | `frontend/src/app/page.tsx`, `/search` | `test_posts.py` | Home feed + search results UI. Search still uses fixtures (`GET /api/search` missing). |
| BR2 | Targeted announcements by faculty/year/programme | 3 | E1 | 1 | Partial | | `post_service.apply_visibility` | `test_student_sees_only_targeted_posts` | API + feed. Staff targeting UI is still a simple form. |
| BR3 | Event visibility (university + student organiser) | 3 | E1 | 2 | Partial | | `frontend/src/app/events` | | Listing/detail UI. Uses posts API when available, otherwise fixtures. |
| BR4 | Event interest (register interest, organiser sees count) | 1 | E5 | 2 | Partial | | EventCard toggle | | UI count only. No interest API yet. |
| BR5 | Society visibility (society pages and updates) | 3 | E1 | 2 | Partial | | `frontend/src/app/societies` | | List/detail UI on fixtures. |
| BR6 | Society sign-up / interest | 2 | E5 | 2 | Partial | | Society detail CTA | | Local toggle only. |
| BR7 | Lost & found (report, search, resolve) | 3 | E5 | 3 | Not done | | | | `listings` table exists. |
| BR8 | Classroom booking (availability, request, no admin call) | 5 | E3 | 2 | Partial | | `frontend/src/app/bookings` | | Search, request modal, 409 layout, my bookings. Fixture rooms. |
| BR9 | Academic support requests (study group, tutoring, mentoring) | 3 | E4 | 3 | Not done | | | | `requests` table exists. |
| BR10 | FAQ access | 2 | E2 | 3 | Not done | | | | `faqs` table exists. |
| BR11 | Content maintenance by authorised contributors | 4 | Platform | 1 | Partial | | `POST /api/posts`, `/posts/new` | `test_admin_can_create_announcement` | Create announcement only. No edit/archive/my-content list. |
| BR12 | Access levels (student view; academic, society, finance, admin manage) | 6 | Platform | 1 | Partial | | `security.py`, `PERMISSION_ROLES` | `test_student_cannot_create_announcement` | Login + server permission map. Not every action has a UI. |
| BR13 | Academic calendar (exams, add/drop, milestones) | 3 | E1 | 3 | Partial | | `frontend/src/app/calendar` | | Calendar list UI. |
| BR14 | Student onboarding info | 2 | E2 | 4 | Not done | | | | |
| BR15 | Emergency communication | 3 | E1 | 2 | Not done | | | | Seed includes an emergency post. No site-wide banner yet. |
| BR16 | Schedule changes / closures | 1 | E1 | 3 | Not done | | | | |
| BR17 | Feedback loop | 1 | E4 | 4 | Not done | | | | |
| BR18 | Volunteering opportunities | 1 | E1 | 4 | Not done | | | | |
| BR19 | Alumni engagement | 1 | E1 | 4 | Not done | | | | |
| BR20 | Job and internship visibility | 3 | E1 | 3 | Not done | | | | |
| BR21 | Facility issue reporting | 2 | E4 | 3 | Not done | | | | |
| BR22 | Staff directory | 2 | E2 | 4 | Not done | | | | |
| BR23 | Financial support info | 3 | E2 | 3 | Not done | | | | |
| BR24 | Sports and recreation (info + booking) | 2 | E2 + E3 | 4 | Not done | | | | |
| BR25 | Dining info (menu, hours) | 1 | E2 | 4 | Not done | | | | |
| BR26 | Printing services info | 1 | E2 | 4 | Not done | | | | |
| BR27 | Textbook exchange | 1 | E5 | 4 | Not done | | | | |
| BR28 | Guest lectures | 1 | E1 | 3 | Partial | | `frontend/src/app/lectures` | | Listing UI. |
| BR29 | Wellbeing and counselling info | 3 | E2 | 3 | Not done | | | | |
| BR30 | IT support info | 2 | E2 | 4 | Not done | | | | |
| BR31 | Library resources and hours | 2 | E2 | 4 | Not done | | | | |
| BR32 | Student life highlights | 1 | E1 | 4 | Not done | | | | |
| BR33 | AI assistant (natural language, guides through solution) | 9 | Platform | 2 | Partial | | `/assistant`, AI launcher | | Chat chrome, sources, actions, fallback notice, thumbs. Demo replies only. |

## B. Non-functional requirements

| ID | Requirement | Marks | How we address it | Status | Where | Notes |
|----|-------------|-------|-------------------|--------|-------|-------|
| NFR1 | Usability (first-time students, mixed digital literacy) | 2 | Mobile-first, simple navigation, plain language, clear labels, empty-state guidance | Partial | `frontend/src` | Phase 1 shell: Inter + UCL red tokens, student top nav, staff/admin sidebar, empty/error/skeleton on the feed. |
| NFR2 | Performance and scalability (semester-start peaks) | 3 | Pagination, DB indexes, caching of feeds, lightweight pages, note on scaling path | Partial | `models/post.py`, list endpoint | Pagination and indexes. No feed cache. |
| NFR3 | Reliability and availability | 1 | Health check, graceful error pages, AI fallback to search, documented deploy | Partial | `/health`, `/ready` | Hosted Supabase is a single-network dependency; demo needs a hotspot. |
| NFR4 | Security and privacy | 2 | Managed Auth, server-side RBAC, only authorised publish, minimal personal data, audit log | Partial | `security.py`, RLS with no anon policies | No password hashes in our DB. Roles are in `users`, not JWT claims. |
| NFR5 | Maintainability | 4 | Clear layers, constants, seed, tests, README | Partial | `backend/app` | Admin UI is only “New announcement”. |
| NFR6 | Robustness (bad/incomplete input) | 3 | Server + client validation, sensible defaults | Partial | Pydantic + zod | 422 on empty title. |

## C. Deliberately left out (fill as we cut)

| What was cut | Why (marks, time, risk) | Next step |
|--------------|-------------------------|-----------|
| Integration with real student records / timetable | Not available per assumptions; out of scope | Adapter layer for SIS in future |
| SQLite / homemade JWT | Team chose Supabase Postgres + Auth | Disclose and keep hotspot ready |
| Local-only demo if Supabase is down | Hosted auth and DB | Pre-fill `.env`, hotspot |

## D. Assumptions (from the PS and ours)

| # | Assumption | Source |
|---|------------|--------|
| 1 | Demo data is invented by the team | PS section 7 |
| 2 | No integration with existing university systems | PS section 7 |
| 3 | University staff populate and maintain content | PS section 7 |
| 4 | Users have smartphone/tablet/computer access, so mobile-first web app | PS section 7 |
| 5 | Small admin office maintains it, so simple stack and admin UI, no complex infra | PS section 8 |
| 6 | Supabase project credentials are available in `.env` before `make seed` | Team |

## E. Progress summary (update before final push)

- BR done: 0 / 33 fully; Partial: BR1, BR2, BR11, BR12 (marks not claimed as Done)
- NFR done: 0 / 6 fully; Partial: NFR1–NFR6 started
