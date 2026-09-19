# Requirements Traceability

> Single source of truth for what we were asked to build, what we built, and what we cut.

**Product:** UniHive — Everything campus. One place.  
**Problem statement (summary):** UCL students get campus info from WhatsApp, lecturers, notice boards, societies, and word of mouth. UniHive is one trusted channel for information, services, and an AI assistant.  
**Target users / roles:** STUDENT, ACADEMIC, SOCIETY_REP, FINANCE, ADMIN, SUPER_ADMIN (UI groups Staff / Admin)  
**Stack:** Next.js + TypeScript + Tailwind | FastAPI + SQLAlchemy | Supabase Postgres + Auth | FTS/LLM assistant (later)  
**UI/UX source:** `.cursor/UniHive_UI_UX_Plan.md`  
**Last updated:** 2026-09-19 (frontend Phase 5 hardening)

---

## Priority key

- **P0:** Must work end to end for demo (UniHive UI/UX §13)
- **P1:** After P0 stable
- **P2:** Extra time only

## Status key

- **Done** / **Partial** / **Not done**

---

## A. Functional requirements (mapped to engines + UI)

| ID | Requirement | Marks | Engine | Build order | Status | Owner | Where implemented | Tests | Notes |
|----|-------------|-------|--------|-------------|--------|-------|-------------------|-------|-------|
| BR1 | Unified access (single home, search, feed) | 5 | Platform | 1 | Partial | | `frontend/src/app/page.tsx`, `/search` | `test_posts.py` | Home feed + search results UI. Search still uses fixtures (`GET /api/search` missing). |
| BR2 | Targeted announcements by faculty/year/programme | 3 | E1 | 1 | Partial | | `PostEditor` audience fields, `post_service.apply_visibility` | `test_student_sees_only_targeted_posts` | Staff form targets faculty/year/programme. |
| BR3 | Event visibility (university + student organiser) | 3 | E1 | 2 | Partial | | `frontend/src/app/events` | | Listing/detail UI. Uses posts API when available, otherwise fixtures. |
| BR4 | Event interest (register interest, organiser sees count) | 1 | E5 | 2 | Partial | | EventCard toggle, `/staff/events/[id]/interest` | | Student toggle + staff list (fixtures). |
| BR5 | Society visibility (society pages and updates) | 3 | E1 | 2 | Partial | | `frontend/src/app/societies` | | List/detail UI on fixtures. |
| BR6 | Society sign-up / interest | 2 | E5 | 2 | Partial | | Society detail CTA, `/staff/societies/[slug]/interest` | | Local toggle + staff list. |
| BR7 | Lost & found (report, search, resolve) | 3 | E5 | 3 | Partial | | `/lost-found`, `/staff/lost-found` | | Student report + staff moderate (ADMIN). |
| BR8 | Classroom booking (availability, request, no admin call) | 5 | E3 | 2 | Partial | | `/bookings`, `/staff/bookings` | | Student request UI + staff approve drawer. Fixture bookings. |
| BR9 | Academic support requests (study group, tutoring, mentoring) | 3 | E4 | 3 | Partial | | `/requests`, `/staff/requests` | | Student form + staff queue. |
| BR10 | FAQ access | 2 | E2 | 3 | Partial | | `frontend/src/app/info` | | FAQ category in Campus Information. |
| BR11 | Content maintenance by authorised contributors | 4 | Platform | 1 | Partial | | `PostEditor`, `/staff/content`, edit/archive | | Create, edit, draft, archive. |
| BR12 | Access levels (student view; academic, society, finance, admin manage) | 6 | Platform | 1 | Partial | | `security.py`, `/admin/roles`, RoleGate | | Six-role matrix + hidden actions. |
| BR13 | Academic calendar (exams, add/drop, milestones) | 3 | E1 | 3 | Partial | | `frontend/src/app/calendar` | | Calendar list UI. |
| BR14 | Student onboarding info | 2 | E2 | 4 | Partial | | `/info/onboarding` | | Info hub page. |
| BR15 | Emergency communication | 3 | E1 | 2 | Partial | | Emergency banner on AppShell | | Seed includes an emergency post. Banner wired from feed. |
| BR16 | Schedule changes / closures | 1 | E1 | 3 | Not done | | | | |
| BR17 | Feedback loop | 1 | E4 | 4 | Partial | | `/requests`, `/staff/requests` | | Student form + staff note. |
| BR18 | Volunteering opportunities | 1 | E1 | 4 | Partial | | `/opportunities` | | VOLUNTEERING chip + fixtures. |
| BR19 | Alumni engagement | 1 | E1 | 4 | Partial | | `/opportunities` | | ALUMNI chip + fixtures. |
| BR20 | Job and internship visibility | 3 | E1 | 3 | Partial | | `/opportunities` | | JOB chip; uses posts API when present. |
| BR21 | Facility issue reporting | 2 | E4 | 3 | Partial | | `/requests/new`, `/staff/requests` | | Student form + admin/staff queue. |
| BR22 | Staff directory | 2 | E2 | 4 | Partial | | `/info/directory` | | Official office contacts only. |
| BR23 | Financial support info | 3 | E2 | 3 | Partial | | `/info/financial_aid` | | Info page + FAQ. |
| BR24 | Sports and recreation (info + booking) | 2 | E2 + E3 | 4 | Partial | | `/info/sports` | | Info only. Court booking not a separate flow. |
| BR25 | Dining info (menu, hours) | 1 | E2 | 4 | Partial | | `/info/dining` | | Hours and menu note. |
| BR26 | Printing services info | 1 | E2 | 4 | Partial | | `/info/printing` | | Locations and credit. |
| BR27 | Textbook exchange | 1 | E5 | 4 | Partial | | `/textbooks` | | List, offer dialog, interest toggle. |
| BR28 | Guest lectures | 1 | E1 | 3 | Partial | | `frontend/src/app/lectures` | | Listing UI. |
| BR29 | Wellbeing and counselling info | 3 | E2 | 3 | Partial | | `/info/wellbeing` | | Hours and how to book. |
| BR30 | IT support info | 2 | E2 | 4 | Partial | | `/info/it` | | Helpdesk hours. |
| BR31 | Library resources and hours | 2 | E2 | 4 | Partial | | `/info/library` | | Hours and silent floor. |
| BR32 | Student life highlights | 1 | E1 | 4 | Partial | | `/opportunities` HIGHLIGHT | | Fixture highlight post. |
| BR33 | AI assistant (natural language, guides through solution) | 9 | Platform | 2 | Partial | | `/assistant`, `/staff/assistant` | | Chat chrome + unanswered-question insights. |

## B. Non-functional

| ID | Requirement | Marks | How we address it | Status | Where | Notes |
|----|-------------|-------|-------------------|--------|-------|-------|
| NFR1 | Usability (first-time students, mixed digital literacy) | 2 | Mobile-first, simple navigation, plain language, clear labels, empty-state guidance | Partial | `frontend/src` | Skip link, 44px mobile targets, 404/403/error pages, focus rings on filter chips. |
| NFR2 | Performance and scalability (semester-start peaks) | 3 | Pagination, DB indexes, caching of feeds, lightweight pages, note on scaling path | Partial | `models/post.py`, list endpoint | Pagination and indexes. No feed cache. |
| NFR3 | Reliability and availability | 1 | Health check, graceful error pages, AI fallback to search, documented deploy | Partial | `/health`, `/ready`, `not-found.tsx`, `error.tsx` | Frontend error boundary + 404. Hosted Supabase is a single-network dependency; demo needs a hotspot. |
| NFR4 | Security and privacy | 2 | Managed Auth, server-side RBAC, only authorised publish, minimal personal data, audit log | Partial | `security.py`, RLS with no anon policies | No password hashes in our DB. Roles are in `users`, not JWT claims. |
| NFR5 | Maintainability | 4 | Clear layers, constants, seed, tests, README | Partial | `backend/app` | Admin UI is only “New announcement”. |
| NFR6 | Robustness (bad/incomplete input) | 3 | Server + client validation, sensible defaults | Partial | Pydantic + zod | 422 on empty title. |
| NFR-08 | No secrets in repo | — | `.env.example` | Done | | |
| NFR-09 | pytest one command | — | `make test` | Partial | | |

## C. Differentiator

| ID | Idea | Status |
|----|------|--------|
| INN-01 | UniHive AI with sources + deep-link actions (BR33) | Partial (chrome only) |

## D. Deliberately left out

| What | Why |
|------|-----|
| Full 33 BR as separate apps | Engine reuse + depth over breadth |
| Vector DB | FTS5 / SQL retrieval when assistant ships |
| Native mobile apps | Responsive web |
| Dark mode / advanced analytics | P2 in UI/UX plan |

## E. Model inventory (backend)

| Model | Status |
|-------|--------|
| User, Society, Post | Done |
| Resource, Booking (+ purpose, group_size, floor) | Done |
| Listing (+ category, location, occurred_at, image_url), Interest, SocietyMembership | Done |
| Request, InfoPage, Faq, StaffContact | Done |
| AssistantQuery (+ session_id, source_ids), AuditLog | Done |
| **Notification** | **Added** |

## F. Next build slices

1. Finish UniHive P0 frontend shells (student / staff / admin) per UI/UX doc  
2. Booking + listing + notification API routers/services  
3. Assistant pipeline (`assistant.mdc`)  
4. Harden NFRs, DEMO.md, seed rooms/lost&found/notifications  
