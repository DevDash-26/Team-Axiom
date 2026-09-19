# UniHive — Product Backlog

Working backlog from a full codebase audit (frontend, backend, models, APIs, auth, RBAC, dashboards, UI).  
**Last audited:** 2026-09-19 · Branch target: `dev`

**Product:** UniHive — Everything campus. One place.  
**Problem:** UCL students get campus info from WhatsApp, lecturers, notice boards, societies, and word of mouth.  
**Value:** One trusted channel; less searching; staff publish and handle work in one place.  
**Pitch workflow:** Student → System → Staff/Admin → System → Student  

Status must stay honest: only items that work end to end belong in the live demo.

| Status | Meaning |
|--------|---------|
| DONE | Fully implemented and working (API + UI where relevant) |
| PARTIALLY DONE | Implemented but incomplete |
| NOT DONE | Not implemented yet |
| NEEDS FIX | Implemented but has bugs / inconsistency |
| NEW FEATURE | Suggested addition (see § New Features) |

| Priority | Meaning |
|----------|---------|
| HIGH | Demo / marks / P0 |
| MEDIUM | Important after P0 |
| LOW | Nice-to-have / icebox |

Personas: **Student**, **Staff**, **Admin**. Six roles under the hood: `STUDENT`, `ACADEMIC`, `SOCIETY_REP`, `FINANCE`, `ADMIN`, `SUPER_ADMIN`.

---

## UI-only vs backend (critical)

| Feature | UI | Backend / DB |
|---------|----|--------------|
| Home feed, updates, targeted posts | Wired | Wired |
| Staff content create / edit / archive / publish | Wired | Wired |
| Global search | Wired | Wired (`ILIKE`; GIN index unused) |
| Emergency banner | Wired | Wired (from posts) |
| Events / lectures / calendar | UI + API with fixture fallback | Posts API; interest **not** persisted |
| Societies + join | Fixture / local toggle | Model only |
| Classroom booking + my bookings | Fixture / local | Models only |
| Lost & found | Fixture / local submit | Model only |
| Student / staff requests | Fixture / local approve | Model only |
| AI assistant | Demo replies | **No** `assistant/` package |
| Staff / admin dashboards | Hardcoded stats | No stats API |
| Admin users / staff / roles | Hardcoded tables | No users API |
| Notifications bell | Button, no page | Model only |
| Campus info / FAQ / directory | Placeholders | Models only |

**Live API surface today:** `GET /health`, `GET /ready`, `GET /api/auth/me`, posts list/mine/get/create/patch, `GET /api/search`.

---

## 1. Core Features

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Unified campus home + feed | PARTIALLY DONE | HIGH | `/` loads `GET /api/posts`; chips; emergency banner | Unify student home vs `/student/dashboard`; drop fixture fallbacks where API works |
| Global search | PARTIALLY DONE | HIGH | `GET /api/search` + `/search` UI; audience-aware | Use GIN/tsvector; search societies/FAQ/listings; debounce; all type filters |
| Targeted announcements | DONE | HIGH | Visibility by faculty/year/programme; tests | Richer targeting UI polish only |
| Content create / edit / archive | PARTIALLY DONE | HIGH | Create + PATCH + staff content list/edit/archive | Broader post types in editor; schedule-change publishing UX |
| Events listing / detail | PARTIALLY DONE | HIGH | Pages + API/fixture mix | Persist event posts in seed; remove fixture dependence |
| Event interest | PARTIALLY DONE | HIGH | Local toggle + count UI | Interest API + organiser counts |
| Classroom booking | PARTIALLY DONE | HIGH | Full booking UI on fixtures | Resource/booking APIs, conflict 409, staff approve, seed rooms |
| Lost & found | PARTIALLY DONE | HIGH | Student list/report UI (local) | Listing API, search/resolve, staff moderate |
| AI assistant | PARTIALLY DONE | HIGH | Chat chrome, sources UI, thumbs, canned replies | Retrieve → answer → log `AssistantQuery`; real fallback to search |
| Societies | PARTIALLY DONE | MEDIUM | Fixture list/detail | Societies API + memberships |
| Academic calendar | PARTIALLY DONE | MEDIUM | Calendar page from posts/fixtures | Seed `CALENDAR_ENTRY`; student calendar route |
| Guest lectures | PARTIALLY DONE | LOW | Lectures page | Seed `GUEST_LECTURE` posts |
| Campus services / FAQ / info | NOT DONE | MEDIUM | Models + placeholder routes | Info engine APIs + one searchable services hub |
| Jobs / volunteering / alumni / highlights | NOT DONE | LOW | Post types in constants | Seed + filter in feed/opportunities |
| Textbook exchange | NOT DONE | LOW | Listing model | Listing type + UI |
| Feedback / facility / academic requests | NOT DONE | MEDIUM | Request model; staff UI local | Request APIs + wire UIs |

---

## 2. Student / User Features

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Student dashboard | PARTIALLY DONE | HIGH | `/student/dashboard` + posts API; AI suggestions hardcoded | Live stats; remove “coming soon”; single home path |
| Campus updates | DONE | HIGH | `/student/updates` + `/updates` on API | Align duplicate routes |
| Profile (view) | PARTIALLY DONE | MEDIUM | Read-only from `/api/auth/me` | Optional edit; wire `/profile` placeholder |
| My bookings | PARTIALLY DONE | HIGH | Fixture “mine” + cancel local | Persist bookings + status tracking |
| My requests / status | PARTIALLY DONE | HIGH | Demo list / placeholder | Real requests + notifications on status change |
| Lost & found report | PARTIALLY DONE | HIGH | Form sets local `done` | POST listing API |
| Societies browse / join | PARTIALLY DONE | MEDIUM | Fixtures; student societies empty | API + join |
| Opportunities | NOT DONE | MEDIUM | EmptyState / placeholder | Jobs/volunteer from posts |
| Services hub | NOT DONE | MEDIUM | EmptyState | FAQ/info pages |
| Registration | NOT DONE (intentional) | LOW | “Disabled” static page | Keep seed-only unless judges need self-serve |

---

## 3. Staff Features

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Staff dashboard | PARTIALLY DONE | HIGH | Hardcoded `STAFF_PREVIEW` | Real counts (pending bookings, drafts, open requests) |
| Content management | DONE | HIGH | List/filter, create, edit, archive, publish via API | Cover more post types; confirmation polish |
| Request queue | PARTIALLY DONE | HIGH | Approve/reject local + toast | Booking/request APIs + RBAC |
| Booking approval | NOT DONE | HIGH | `/staff/bookings` PlaceholderScreen | Approve/reject + conflict rules |
| Lost & found moderate | NOT DONE | MEDIUM | No staff L&F UI | Moderate/resolve listings |
| Finance info manage | NOT DONE | LOW | Permission mapped only | Info pages for FINANCE |

---

## 4. Admin Features

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Admin dashboard | PARTIALLY DONE | MEDIUM | Hardcoded `ADMIN_PREVIEW` | Live summary cards |
| User management | PARTIALLY DONE | MEDIUM | Hardcoded users + local delete dialog | List/disable/role change API (`users.manage`) |
| Staff management | PARTIALLY DONE | MEDIUM | Hardcoded staff table | Real staff directory / role assignment |
| Roles & permissions view | PARTIALLY DONE | LOW | Static matrix page | Optionally sync from `PERMISSION_ROLES` |
| Emergency / schedule publish | PARTIALLY DONE | HIGH | Emergency create works (API + tests) | Schedule-change type UX; banner already works |
| Audit / activity view | NOT DONE | LOW | `AuditLog` written on post publish/edit | Admin activity screen |

---

## 5. Authentication & Role-Based Access

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Login (Supabase) | DONE | HIGH | Email/password → JWT → `/api/auth/me` | — |
| Role redirect after login | PARTIALLY DONE | HIGH | Admin → admin dash; staff → staff; student → `/` | Consistent landing (`/student/dashboard` vs `/`) |
| Protected routes | PARTIALLY DONE | HIGH | `AuthGate` on student + one admin page; content editors gated | Protect all staff/admin routes; use `mode="staff"` |
| Server RBAC | PARTIALLY DONE | HIGH | Post create/edit/search permissions + tests | Enforce bookings/listings/requests/users maps |
| Dual shells / deny pages | NEEDS FIX | HIGH | AppShell vs AuthGate shells; `/403` vs `/unauthorized` | One shell system; one unauthorized path |
| Inactive user handling | DONE | MEDIUM | 401 if inactive/missing profile | — |

---

## 6. UI / UX

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Design system (UCL red, Inter, Lucide) | DONE | HIGH | Tokens, shells, nav | Keep consistent |
| Loading / empty / error states | PARTIALLY DONE | HIGH | Skeletons, EmptyState, ErrorState on many pages | Cover all fixture pages after wiring |
| Toasts / confirm dialogs | PARTIALLY DONE | MEDIUM | Sonner + ConfirmDialog (archive, cancel, delete) | Use before all destructive actions |
| Form validation (client) | PARTIALLY DONE | HIGH | Zod on login + PostEditor only | Zod on booking, L&F, requests |
| Mobile nav / responsiveness | PARTIALLY DONE | HIGH | Student mobile nav, sidebars | Stress-test booking/staff tables |
| Notifications UI | NOT DONE | MEDIUM | Bell with no handler | Inbox / dropdown + badge |
| Sorting | NOT DONE | LOW | Filters only | Newest / priority sort |
| Duplicate route trees | NEEDS FIX | MEDIUM | `/events` vs `/student/events`, etc. | Consolidate or clearly role-route |

---

## 7. Database & Backend

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Engine models (all tables) | DONE | HIGH | 15 models including Notification | — |
| Posts API | DONE | HIGH | List, mine, get, create, patch, search | Optional delete if needed |
| Auth me API | DONE | HIGH | JWT → profile | — |
| Booking engine API | NOT DONE | HIGH | Models only | CRUD + conflict + approve |
| Listing / interest / membership APIs | NOT DONE | HIGH | Models only | Wire L&F, interest, societies |
| Request engine API | NOT DONE | HIGH | Model only | Create + handle |
| Info engine API | NOT DONE | MEDIUM | Models only | FAQ / pages / directory |
| Notification API | NOT DONE | MEDIUM | Model only | List/mark-read + emit on status change |
| Assistant pipeline | NOT DONE | HIGH | Model + LLM config only | Service + router per `assistant.mdc` |
| Seed depth | PARTIALLY DONE | HIGH | Users, societies, announcement/emergency posts | Rooms, bookings, L&F, FAQ, events, calendar |
| Search index usage | NEEDS FIX | LOW | GIN created; query uses ILIKE | Switch to `tsvector` / FTS |
| RLS | PARTIALLY DONE | LOW | ENABLE without policies (owner bypass) | Document; optional policies later |

---

## 8. Security & Validation

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Managed Auth (no local passwords) | DONE | HIGH | Supabase Auth | — |
| JWT verify + Bearer | DONE | HIGH | HS256 / JWKS | — |
| Server permission map | PARTIALLY DONE | HIGH | Full map; enforced for posts | Enforce for other engines |
| Pydantic validation | PARTIALLY DONE | HIGH | Posts create/update | Schemas for other engines |
| Secrets hygiene | DONE | HIGH | `.env.example`; gitignored secrets | Ensure `.venv` never committed (staging risk) |
| CORS | DONE | MEDIUM | Configured origins | — |
| Audit log | PARTIALLY DONE | MEDIUM | Written on post mutations | Surface in admin; log booking/request actions |

---

## 9. Testing & Error Handling

| Feature | Status | Priority | What Exists Now | What Still Needs to Be Done |
|---------|--------|----------|-----------------|-----------------------------|
| Auth tests | DONE | HIGH | 401 / profile | — |
| Post targeting + RBAC + validation tests | DONE | HIGH | ~18 post tests + search audience | — |
| Booking / L&F / request / AI tests | NOT DONE | HIGH | — | Happy path + 403/409/422 |
| Frontend tests | NOT DONE | LOW | None | Optional smoke later |
| Health / ready | DONE | MEDIUM | `/health`, `/ready` | — |
| API error shape → UI | PARTIALLY DONE | MEDIUM | Some pages use ErrorState | Consistent mapping everywhere |
| `make test` | PARTIALLY DONE | MEDIUM | pytest present | Verify fresh-clone + env |

---

## 10. New Features (recommended)

Only features that fit UniHive’s purpose: one trusted campus channel, clear demo, realistic hackathon scope.

| New Feature | Purpose | User Role | Priority | Difficulty | Demo Value |
|-------------|---------|-----------|----------|------------|------------|
| Live staff/admin summary cards | Show pending bookings, open L&F, drafts from real counts | Staff / Admin | HIGH | Medium | High |
| Booking conflict detection (409) | Prove no double-booking without calling admin | Student / Admin | HIGH | Medium | High |
| Interest + “X interested” | Real engagement on events | Student / Society | HIGH | Easy | High |
| Notification on booking/request status | Close the loop when staff approve/reject | Student | HIGH | Medium | High |
| Grounded AI with source links | BR33 differentiator; guides to book/search/L&F | Student | HIGH | Hard | Very high |
| Unanswered-questions admin view | Show AI gaps from `AssistantQuery` | Admin | MEDIUM | Easy | Medium |
| Campus Services hub (one page) | Cover FAQ/finance/wellbeing/IT/library with one engine | Student | MEDIUM | Medium | Medium |
| Global search across engines | One box for posts + FAQ + L&F + rooms | Everyone | MEDIUM | Medium | High |
| Audience preview (“who will see this?”) | Safer publish for staff | Staff | MEDIUM | Easy | Medium |
| Confirm + toast on all mutations | Trust and polish | All | MEDIUM | Easy | Medium |
| Activity / audit feed | “Who published what” | Admin | LOW | Easy | Low–Medium |
| Simple reports (counts by faculty/type) | Maintainability story | Admin | LOW | Medium | Low |
| Export CSV of bookings/requests | Ops convenience | Admin | LOW | Easy | Low |
| Charts / analytics dashboards | Visual ops | Admin | LOW | Hard | Low — skip if short on time |
| Dynamic permission editor | Edit RBAC in UI | Super admin | LOW | Hard | Low — static matrix enough |
| Dark mode | Preference | All | LOW | Medium | Low — out of pitch scope |

---

## Final summary

### Completed Features
- Supabase login + `/api/auth/me`
- Targeted post visibility (faculty/year/programme)
- Posts list / get / create / edit / archive / mine
- Global post search API + search UI
- Emergency banner from live posts
- Staff content management (wired)
- Permission map + strong post RBAC tests
- Design system shells, nav, empty/error/skeleton patterns
- Seed demo accounts (7 roles) + sample posts
- Health / ready endpoints

### Partially Completed Features
- Home / student dashboard (split routes; some hardcoded)
- Events, lectures, calendar (API + fixtures)
- Event interest, society join (UI only)
- Booking + my bookings (UI only)
- Lost & found (UI only)
- Staff/admin dashboards (fixture stats)
- Admin users/staff/roles (static)
- Staff request queue (local state)
- AI assistant (chrome only)
- Auth protection (inconsistent gates/shells)
- Client validation (login + posts only)
- Seed (no rooms/L&F/FAQ/events depth)
- Notifications (model + dead bell)
- Audit log (write-only)
- NFRs (pagination yes; caching/AI fallback no)

### Not Completed Features
- Booking / listing / request / info / notification / assistant APIs
- Societies API + memberships
- Campus services / FAQ / directory / finance / wellbeing / IT / library / dining / printing
- Jobs, volunteering, alumni, textbook exchange, facility issues, feedback (as real flows)
- User/staff management APIs
- Frontend tests; engine tests beyond posts
- Real AI retrieval pipeline

### Features That Need Fixing
- Dual navigation systems (AppShell vs AuthGate / `/` vs `/student/*`)
- Staff/admin routes mostly unprotected by `AuthGate`
- Fixture fallback can hide empty/broken API in demos
- Search GIN index unused (ILIKE only)
- Notification bell does nothing
- Lost & found search input not wired to list
- `REQUIREMENTS.md` outdated vs code (search/edit may still be marked missing)
- Risk: `.venv` / `.env` appearing in git staging

### Recommended New Features (best ROI)
1. Wire booking E2E + conflicts  
2. Wire L&F E2E  
3. Interest API for events  
4. Status notifications  
5. Grounded AI + admin unanswered insights  
6. Live dashboard counts  
7. One Campus Services hub  

---

## Implementation priority

### DO FIRST
1. **Booking API + wire UI + seed rooms + staff approve** (BR8)  
2. **Lost & found API + wire UI + seed items** (BR7)  
3. **Event interest API** (cheap, visible)  
4. **Harden auth gates** on all staff/admin pages; pick one student home  
5. **Deepen seed** (events, rooms, L&F) so demo never looks empty  
6. **AI: retrieval over posts/FAQ + fallback to search + log queries** (BR33)  

### DO NEXT
1. Request create + staff handle  
2. Notifications on status change + bell inbox  
3. Live staff/admin dashboard stats  
4. Societies list from DB + join  
5. Campus Services / FAQ single hub  
6. Expand zod validation; booking/L&F tests  
7. Refresh `REQUIREMENTS.md` / `DEMO.md`  

### IF TIME ALLOWS
1. Admin user disable / role change  
2. Audit activity page  
3. Search across listings + FAQ (tsvector)  
4. Audience preview on publish  
5. Unanswered AI questions for admin  
6. Opportunities filter (jobs)  
7. Skip: charts export, dark mode, dynamic permission editor, textbook exchange unless spare hour  

---

## Icebox (say as future work, not as built)

| Item | Why parked |
|------|------------|
| Native mobile apps | Responsive web is enough |
| Vector database | SQL retrieval when assistant ships |
| Textbook exchange, onboarding hub, advanced analytics | Depth over breadth |
| Dark mode | Not needed for the demo |
| Integration with existing UCL systems | Out of scope; invented demo data only |

---

## 1-minute pitch fill-in (keep in sync)

| Know this | Current honest answer |
|-----------|------------------------|
| Problem | Campus information is fragmented. |
| Solution | UniHive — one trusted campus platform. |
| Users | Student / Staff / Admin (six roles under the hood). |
| Strongest feature to claim now | Targeted announcements, search, staff content publishing, role-based access. Claim booking/L&F/AI only when demo-ready. |
| Frontend | Next.js, TypeScript, Tailwind. |
| Backend | FastAPI, SQLAlchemy. |
| Database | Supabase Postgres. |
| Authentication | Supabase Auth; FastAPI checks JWT and roles. |
| Main workflow to finish | Student booking/L&F request → UniHive → staff decision → student sees status. |
| Differentiator (when ready) | Grounded AI assistant with sources and action links. |
