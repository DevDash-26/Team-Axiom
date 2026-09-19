# UniHive product backlog

Working backlog for the DevDash’26 build. Derived from the team pitching/Q&A guide, `REQUIREMENTS.md`, and the UniHive UI/UX plan.

**Product:** UniHive — one trusted campus platform.  
**Problem:** UCL students get information from WhatsApp, lecturers, notice boards, societies, and word of mouth.  
**Value:** Students spend less time searching; staff publish and handle requests in one place.  
**Pitch workflow to defend:** Student → System → Staff/Admin → System → Student  

Status here must stay honest: only items that work in the final build belong in the demo and in spoken answers.

| Key | Meaning |
|-----|---------|
| P0 | Must work end to end for the live demo |
| P1 | After P0 is stable |
| P2 | Extra time only / icebox |
| Status | Matches `REQUIREMENTS.md`: Done / Partial / Not done |

Personas in the pitch: **Student**, **Staff**, **Admin**. The system still has six roles (`STUDENT`, `ACADEMIC`, `SOCIETY_REP`, `FINANCE`, `ADMIN`, `SUPER_ADMIN`); Staff/Admin in the UI group the non-student roles.

---

## Epic 1 — One login, three experiences (RBAC)

**Pitch line:** User logs in; the system checks the role; the right dashboard opens.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-01 | As a campus user, I want to sign in with my university email so I can reach my dashboard. | P0 | Partial | FR-01, BR12 |
| US-02 | As a student, I want to land on the student shell so I only see student actions. | P0 | Partial | FR-01 |
| US-03 | As staff, I want to land on the staff shell so I can publish and review work. | P0 | Partial | FR-01, FR-08 |
| US-04 | As an admin, I want to land on the admin shell so I can manage people and the system. | P0 | Partial | FR-01, FR-09 |
| US-05 | As a student, I should be blocked from publishing announcements so official content stays trusted. | P0 | Partial | FR-01, NFR-02 |
| US-06 | As any user, I want a clear unauthorized page if I open a URL I cannot use. | P0 | Partial | FR-01 |

**Acceptance (demo):** Nimali cannot publish; admin can. Wrong-role routes do not leak data (API 403, not only hidden buttons).

---

## Epic 2 — Unified campus dashboard

**Pitch line:** One place for important information and services.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-07 | As a student, I want a home dashboard (feed, quick actions, AI bar) so I do not hunt across apps. | P0 | Partial | FR-02, BR1 |
| US-08 | As a student, I want announcements targeted by faculty, year, and programme so I see what applies to me. | P0 | Partial | FR-03, BR2 |
| US-09 | As a guest or logged-out user, I want campus-wide public posts only so private targeting is not leaked. | P0 | Partial | FR-03 |
| US-10 | As a student, I want to search campus content from one box so I can find a post or service quickly. | P0 | Partial | FR-02, NFR-05 |
| US-11 | As any user, I want loading, empty, and error states so the app never looks broken. | P0 | Partial | NFR-06 |

**Acceptance (demo):** Sign in as Nimali (Computing Y2) vs Kasun (Business Y1) and show different feeds.

---

## Epic 3 — Announcements and events

**Pitch line:** Staff publish; students see updates and can show interest in events.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-12 | As staff, I want to create, edit, publish, and archive announcements so the official channel stays current. | P0 | Partial | FR-08, BR11 |
| US-13 | As staff, I want to set audience (faculty / year / programme, or everyone) so the right students see it. | P0 | Partial | FR-03 |
| US-14 | As a student, I want an events list and event details so I know what is on campus. | P0 | Partial | FR-04, BR3 |
| US-15 | As a student, I want to mark interest in an event so organisers can see demand. | P0 | Partial | FR-04 |
| US-16 | As staff, I want validation and a friendly error if a title is missing so bad posts never go live. | P0 | Partial | NFR-03 |

---

## Epic 4 — Classroom booking / room requests

**Pitch line:** Student submits a request; staff review it; the student sees the updated status.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-17 | As a student, I want to see room availability and submit a booking request so I can reserve a classroom. | P0 | Partial | FR-05, BR8 |
| US-18 | As the system, I must reject overlapping bookings so two groups cannot take the same room. | P0 | Not done | FR-05 |
| US-19 | As staff/admin, I want to approve or reject a booking so rooms are allocated fairly. | P0 | Partial | FR-05 |
| US-20 | As a student, I want to track my request status (pending / approved / rejected) so I know the outcome. | P0 | Partial | FR-05, FR-10 |
| US-21 | As a student, I want a notification when staff decide so I do not keep checking. | P0 | Partial | FR-10 |

**Acceptance (demo):** One complete loop: request → staff decision → student sees new status.

---

## Epic 5 — AI assistant

**Pitch line:** Ask in natural language; get a short, sourced answer or a deep-link to the right action.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-22 | As a student, I want to ask the assistant from the dashboard bar or a full chat page. | P0 | Not done | FR-06, BR33, INN-01 |
| US-23 | As a student, I want answers grounded in UniHive content (with sources) so I can trust them. | P0 | Not done | FR-06 |
| US-24 | As a student, I want suggested actions (e.g. open booking) so I can act without searching. | P0 | Not done | FR-06 |
| US-25 | As the system, I must refuse off-topic or unsafe questions without inventing campus facts. | P0 | Not done | FR-06 |
| US-26 | As admin, I want to see unanswered questions so staff can fill knowledge gaps. | P1 | Not done | FR-06 |

This is the highest-mark item (BR33). Do not claim it in the pitch until it runs in the demo.

---

## Epic 6 — Lost & Found

**Pitch line:** Extra service that is only mentioned if it actually works.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-27 | As a student, I want to report a lost or found item so others can help. | P0 | Partial | FR-07, BR7 |
| US-28 | As a student, I want to search and open listing details so I can recognise my item. | P0 | Partial | FR-07 |
| US-29 | As staff/admin, I want to moderate listings (resolve/remove) so the board stays usable. | P0 | Partial | FR-07 |

---

## Epic 7 — Admin: users, staff, roles

**Pitch line:** Admins manage users, staff, roles, content, and the system.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-30 | As admin, I want a dashboard of users, pending work, and recent content. | P0 | Partial | FR-09 |
| US-31 | As super admin, I want to view and change user roles so access stays correct. | P0 | Partial | FR-09 |
| US-32 | As admin, I want to manage staff records without deleting history by accident. | P0 | Partial | FR-09 |
| US-33 | As admin, I want a read-only view of who can do what (permission matrix). | P0 | Partial | FR-09 |

---

## Epic 8 — P1 campus services (after the demo core)

Reuse the **info engine** and **post engine**. Do not split these into separate mini-apps.

| ID | User story | Priority | Status | Req |
|----|------------|----------|--------|-----|
| US-34 | As a student, I want to join a society from UniHive. | P1 | Partial | FR-11 |
| US-35 | As a student, I want academic calendar dates on home and a calendar page. | P1 | Partial | FR-12 |
| US-36 | As a student, I want jobs / volunteering in an opportunities view. | P1 | Partial | FR-12 |
| US-37 | As a student, I want searchable campus services (FAQ, dining, IT, wellbeing, financial aid). | P1 | Partial | FR-12 |
| US-38 | As admin, I want to publish emergency / schedule-change banners. | P1 | Partial | FR-03 |
| US-39 | As any user, I want to submit support, facility, or feedback requests. | P1 | Partial | FR-13 |
| US-40 | As staff/admin, I want to handle those requests by type. | P1 | Partial | FR-13 |
| US-41 | As a user, I want a notifications centre. | P1 | Partial | FR-10 |
| US-42 | As admin, I want reports and an activity log. | P1 | Not done | — |

---

## Epic 9 — Quality bar (non-functional, every P0 story)

These are not optional extras; judges score them.

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| NFR-US-01 | Login and mutating APIs require auth; permissions live on the server. | P0 | Partial |
| NFR-US-02 | Forms validate on client and server; 422 messages are readable. | P0 | Partial |
| NFR-US-03 | Lists paginate, filter, and search. | P0 | Partial |
| NFR-US-04 | Layout is mobile-first and labelled for accessibility. | P0 | Partial |
| NFR-US-05 | `make test` runs pytest (happy path + 403/422). | P0 | Partial |
| NFR-US-06 | Seed data fills every demo screen; README starts the app. | P0 | Partial |
| NFR-US-07 | Secrets stay in `.env` / `.env.local`, never in git. | P0 | Done |

---

## Icebox (P2 — say these as future work, not as built)

| ID | Item | Why parked |
|----|------|------------|
| US-43 | Native mobile apps | Responsive web is enough |
| US-44 | Vector database | SQL retrieval when assistant ships |
| US-45 | Textbook exchange, onboarding hub, advanced analytics | Depth over breadth |
| US-46 | Dark mode | Not needed for the demo |
| US-47 | Integration with existing UCL systems | Out of scope; invented demo data only |

---

## Sprint order (hackathon remaining time)

1. Finish P0 shells: student / staff / admin login routing and dashboards.  
2. Close the **booking loop** (API + staff review + student status) — best live-demo workflow.  
3. Finish announcement CRUD + two-student targeting.  
4. Lost & Found list + report if the loop above is solid.  
5. AI assistant (BR33) only after 1–3 work; it is the differentiator, not a substitute for a broken core.  
6. Freeze: tests, seed, README, DEMO.md, pitch answers for **only working features**.

---

## 1-minute pitch fill-in (keep in sync with this backlog)

| Know this | Current honest answer |
|-----------|------------------------|
| Problem | Campus information is fragmented. |
| Solution | UniHive — one trusted campus platform. |
| Users | Student / Staff / Admin (six roles under the hood). |
| Strongest feature to claim now | Targeted announcements + role-based access (booking/AI only if demo-ready). |
| Frontend | Next.js, TypeScript, Tailwind. |
| Backend | FastAPI, SQLAlchemy. |
| Database | Supabase Postgres. |
| Authentication | Supabase Auth; FastAPI checks JWT and roles. |
| Main workflow | Student request → UniHive → staff decision → student sees status. |
| Future improvement | Grounded AI assistant with sources and action links. |
