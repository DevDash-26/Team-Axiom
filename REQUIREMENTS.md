# Requirements Traceability

> Single source of truth for what we were asked to build, what we built, and what we cut.

**Product:** UniHive — Everything campus. One place.  
**Problem statement (summary):** UCL students get campus info from WhatsApp, lecturers, notice boards, societies, and word of mouth. UniHive is one trusted channel for information, services, and an AI assistant.  
**Target users / roles:** STUDENT, ACADEMIC, SOCIETY_REP, FINANCE, ADMIN, SUPER_ADMIN (UI groups Staff / Admin)  
**Stack:** Next.js + TypeScript + Tailwind | FastAPI + SQLAlchemy | Supabase Postgres + Auth | FTS/LLM assistant (later)  
**UI/UX source:** `.cursor/UniHive_UI_UX_Plan.md`  
**Last updated:** 2026-09-19

---

## Priority key

- **P0:** Must work end to end for demo (UniHive UI/UX §13)
- **P1:** After P0 stable
- **P2:** Extra time only

## Status key

- **Done** / **Partial** / **Not done**

---

## A. Functional requirements (mapped to engines + UI)

| ID | Requirement | Source | Priority | Status | Notes |
|----|-------------|--------|----------|--------|-------|
| FR-01 | Auth + role redirect (student/staff/admin shells) | BR12 | P0 | Partial | Supabase Auth + `/api/auth/me`; UI shells in progress |
| FR-02 | Student dashboard (AI bar, feed, quick actions) | BR1, BR2, BR33 | P0 | Partial | Feed API exists; UniHive layout in progress |
| FR-03 | Targeted announcements (audience faculty/year/programme) | BR2, BR11 | P0 | Partial | Post engine + create announcement |
| FR-04 | Events + interest | BR3, BR4 | P0 | Partial | Post type EVENT; Interest model; UI pending |
| FR-05 | Classroom booking request + staff review | BR8 | P0 | Partial | Resource/Booking models enriched; APIs pending |
| FR-06 | AI assistant grounded answers + actions | BR33, BR10 | P0 | Not done | AssistantQuery model ready; service pending |
| FR-07 | Lost & Found | BR7 | P0 | Partial | Listing model enriched; APIs/UI pending |
| FR-08 | Staff content CRUD | BR11 | P0 | Partial | POST announcements; staff UI pending |
| FR-09 | Admin users / staff / roles matrix | BR12 | P0 | Partial | Models + seed; admin UI pending |
| FR-10 | Notifications | BR8 flow | P0 | Partial | `Notification` model added |
| FR-11 | Societies + sign-up | BR5, BR6 | P1 | Partial | Society + SocietyMembership |
| FR-12 | Calendar / jobs / campus info | BR13, BR20, … | P1 | Partial | Post types + Info engine; FAQ list/filter UI + `/api/info/faqs` done |
| FR-13 | Requests (support, facility, feedback) | BR9, BR17, BR21 | P1 | Partial | Request model |

## B. Non-functional

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| NFR-01 | Auth (Supabase) | Partial | |
| NFR-02 | RBAC server-side | Partial | `PERMISSION_ROLES` + deps |
| NFR-03 | Validation | Partial | Posts/auth |
| NFR-04 | Friendly errors | Partial | |
| NFR-05 | Pagination / search / filter | Partial | Posts list |
| NFR-06 | Loading / empty / error UI | In progress | UniHive shells |
| NFR-07 | Responsive | In progress | |
| NFR-08 | No secrets in repo | Done | `.env.example` |
| NFR-09 | pytest one command | Partial | `make test` |
| NFR-10 | Seed + README | Partial | |
| NFR-11 | Server logging | Partial | |

## C. Differentiator

| ID | Idea | Status |
|----|------|--------|
| INN-01 | UniHive AI with sources + deep-link actions (BR33) | Not done |

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
