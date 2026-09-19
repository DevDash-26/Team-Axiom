# Requirements Traceability

> Single source of truth for what we were asked to build, what we built, and what we cut.

**Product:** UniHive — Everything campus. One place.  
**Problem statement (summary):** UCL students get campus info from WhatsApp, lecturers, notice boards, societies, and word of mouth. UniHive is one trusted channel for information, services, and an AI assistant.  
**Target users / roles:** STUDENT, ACADEMIC, SOCIETY_REP, FINANCE, ADMIN, SUPER_ADMIN (UI groups Staff / Admin)  
**Stack:** Next.js + TypeScript + Tailwind | FastAPI + SQLAlchemy | Supabase Postgres + Auth | markdown chunks + pgvector RAG (SQL fallback)  
**UI/UX source:** `.cursor/UniHive_UI_UX_Plan.md`  
**Last updated:** 2026-09-19 (Waves A–C + UniHive AI markdown/pgvector RAG)

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
| BR1 | Unified access (single home, search, feed) | 5 | Platform | 1 | Done | | `frontend/src/app/page.tsx`, `/search` | `test_posts.py` | Home feed + `GET /api/search` (posts plus FAQ, society, room on page 1). |
| BR2 | Targeted announcements by faculty/year/programme | 3 | E1 | 1 | Partial | | `PostEditor` audience fields, `post_service.apply_visibility` | `test_student_sees_only_targeted_posts` | API + feed. Staff form targets faculty/year/programme. |
| BR3 | Event visibility (university + student organiser) | 3 | E1 | 2 | Done | | `frontend/src/app/events`, seed EVENT posts | | Published EVENT + GUEST_LECTURE from posts API. Society vs university via `society_id`. |
| BR4 | Event interest (register interest, organiser sees count) | 1 | E5 | 2 | Done | | `POST/GET /api/posts/{id}/interest(s)`, EventCard, `/staff/events/[id]/interest` | `test_posts.py` | Students record interest. Staff see names + programmes only. |
| BR5 | Society visibility (society pages and updates) | 3 | E1 | 2 | Done | | `GET /api/societies`, `/societies` | `test_societies.py` | List/detail from API. Society updates/events filtered by `society_id`. |
| BR6 | Society sign-up / interest | 2 | E5 | 2 | Done | | `POST /api/societies/{slug}/interest`, SocietyMembership | `test_societies.py` | Interest CTA + staff sign-up list. |
| BR7 | Lost & found (report, search, resolve) | 3 | E5 | 3 | Done | | `/api/listings`, `/lost-found`, `/staff/lost-found` | `test_listings.py` | Create, list, resolve, in-app contact via Interest. Default list is LOST+FOUND only. |
| BR8 | Classroom booking (availability, request, no admin call) | 5 | E3 | 2 | Done | | `/api/resources`, `/api/bookings`, `/bookings`, `/staff/bookings` | `test_bookings.py` | Overlap 409, duration/hours/advance rules, staff approve/reject + in-app notification. |
| BR9 | Academic support requests (study group, tutoring, mentoring) | 3 | E4 | 3 | Done | | `/api/requests`, `/requests`, `/staff/requests` | `test_requests.py` | OPEN → IN_PROGRESS → RESOLVED\|CLOSED. Academic handles academic support. |
| BR10 | FAQ access | 2 | E2 | 3 | Done | | `GET/POST /api/info/faqs`, `/info`, `/student/services` | `test_info.py` | Paginated FAQ search (Singlish-aware), duplicate check on create, category pages. |
| BR11 | Content maintenance by authorised contributors | 4 | Platform | 1 | Partial | | `POST /api/posts`, `PostEditor`, `/staff/content` | `test_admin_can_create_announcement` | Posts can be created/edited/archived. Info pages are seed-only. |
| BR12 | Access levels (student view; academic, society, finance, admin manage) | 6 | Platform | 1 | Partial | | `security.py`, `PERMISSION_ROLES`, `/admin/roles`, RoleGate | `test_student_cannot_create_announcement` | Login + server permission map + hidden staff actions. Not every action has a UI. |
| BR13 | Academic calendar (exams, add/drop, milestones) | 3 | E1 | 3 | Done | | `CALENDAR_ENTRY` posts, `/calendar` | `test_academic_can_create_calendar_and_guest_lecture` | Same post table. `event_at` required. |
| BR14 | Student onboarding info | 2 | E2 | 4 | Partial | | `/info/onboarding`, `GET /api/info/pages` | | Read-only seeded page. No CMS. |
| BR15 | Emergency communication | 3 | E1 | 2 | Partial | | Emergency banner on AppShell | | Seed includes an emergency post. Banner wired from feed; also shows schedule changes. |
| BR16 | Schedule changes / closures | 1 | E1 | 3 | Done | | `SCHEDULE_CHANGE` posts, banner, `/updates` | `test_admin_can_create_job_and_schedule_change` | Admin-only publish. Same post table. |
| BR17 | Feedback loop | 1 | E4 | 4 | Done | | `/requests` type FEEDBACK, staff queue | `test_admin_handles_facility_and_feedback` | Same request engine. Admin handles feedback. |
| BR18 | Volunteering opportunities | 1 | E1 | 4 | Done | | `VOLUNTEERING` posts, PostEditor, `/opportunities`, seed | | Same post table. Seeded demo post. |
| BR19 | Alumni engagement | 1 | E1 | 4 | Done | | `ALUMNI` posts, PostEditor, `/opportunities`, seed | | Same post table. Seeded demo post. |
| BR20 | Job and internship visibility | 3 | E1 | 3 | Done | | `JOB` posts, `/opportunities`, PostEditor | `test_admin_can_create_job_and_schedule_change` | Deadline or apply link required. |
| BR21 | Facility issue reporting | 2 | E4 | 3 | Done | | `/api/requests`, `/requests/new`, `/staff/requests` | `test_academic_cannot_handle_facility` | Admin/super-admin handle facility issues. |
| BR22 | Staff directory | 2 | E2 | 4 | Partial | | `GET /api/info/contacts`, `/info/directory` | | Official office contacts only. Read-only seed. |
| BR23 | Financial support info | 3 | E2 | 3 | Done | | `GET /api/info/pages?category=FINANCIAL_AID` | `test_list_priority_faqs` | Seeded page + FAQs. No finance CMS. |
| BR24 | Sports and recreation (info + booking) | 2 | E2 + E3 | 4 | Done | | `/info/sports`, `ResourceKind.SPORTS`, `/bookings` sports filter | `test_bookings.py` | Seeded sports info page + sports resources on the same booking engine. |
| BR25 | Dining info (menu, hours) | 1 | E2 | 4 | Partial | | `/info/dining` | | Read-only seeded page. |
| BR26 | Printing services info | 1 | E2 | 4 | Partial | | `/info/printing` | | Read-only seeded page. |
| BR27 | Textbook exchange | 1 | E5 | 4 | Done | | `ListingType.TEXTBOOK`, `/textbooks` | `test_listings.py` | Same listing engine; list with `type=TEXTBOOK` so L&F stays LOST+FOUND. |
| BR28 | Guest lectures | 1 | E1 | 3 | Done | | `GUEST_LECTURE` posts, `/lectures` | `test_academic_can_create_calendar_and_guest_lecture` | Location + event date required. |
| BR29 | Wellbeing and counselling info | 3 | E2 | 3 | Done | | `/info/wellbeing` | `test_info_page_by_category` | Hours and how to book. Seeded. |
| BR30 | IT support info | 2 | E2 | 4 | Partial | | `/info/it` | | Read-only seeded page. |
| BR31 | Library resources and hours | 2 | E2 | 4 | Partial | | `/info/library` | | Read-only seeded page. |
| BR32 | Student life highlights | 1 | E1 | 4 | Done | | `HIGHLIGHT` posts, PostEditor, `/opportunities`, seed | | Same post table. Seeded demo post. |
| BR33 | AI assistant (natural language, guides through solution) | 9 | Platform | 2 | Partial | | `/assistant`, `POST /api/assistant/chat`, `GET /api/admin/assistant/insights`, `backend/knowledge/*.md` + pgvector chunks | `test_assistant*.py` | Markdown chunks → pgvector (or keyword) → grounded LLM / search fallback → sources + actions. Staff insights from the query log. |

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
| INN-01 | UniHive AI with sources + deep-link actions (BR33) | Partial (markdown/pgvector RAG + sources/actions; admin insights API) |

## D. Deliberately left out

| What | Why |
|------|-----|
| Full 33 BR as separate apps | Engine reuse + depth over breadth |
| Vector DB / Qdrant | Deliberate: Supabase **pgvector** on the same Postgres (markdown chunks). No external vector cluster. |
| Native mobile apps | Responsive web |
| Dark mode / advanced analytics | P2 in UI/UX plan |
| Info page CMS (staff editor for FAQ/pages) | Seed is the maintenance path for the demo. Avoid a second CMS when posts already have create/edit. |
| Chat threads / listing image upload / new tables | Contact is an Interest row with first name only. No phones, no extra schema. |

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

1. Fresh-clone `make test` with `.env` and demo rehearsal  
2. Enable pgvector in the Supabase project if embeddings are used; seed still indexes markdown with a keyword fallback  
3. Info-page CMS only if judges ask — seed remains the maintenance path  
