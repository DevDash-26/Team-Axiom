# Demo Script

> Time budget: 8 min total (yellow card at 6:00, red at 8:00), then about 5 min Q&A.
> Target: finish by 7:30. The live demo should take about 3-4 minutes.
> Rehearse this at least twice with a timer. Every step below must work with seeded data.

## 0. Pre-demo checklist (do this before the judges are ready)

- [ ] App running locally from the final commit (`make dev`)
- [ ] `make seed` already run; demo accounts verified
- [ ] `.env` and `frontend/.env.local` filled (do not open these on the projector)
- [ ] Browser zoom set for the projector, unrelated tabs and notifications closed
- [ ] Hotspot on as backup — this app needs Supabase over the network
- [ ] Second browser/profile ready for the other student account
- [ ] Slides open, backup PDF on the desktop
- [ ] Screen recording of the targeting path saved as fallback
- [ ] Timer ready

## 1. Demo accounts

Password for all: `CampusHub!2026`

| Role | Email | Notes |
|------|--------|-------|
| Student (Computing, year 2) | nimali.perera@student.ucl.lk | Sees campus + Computing posts |
| Student (Business, year 1) | kasun.fernando@student.ucl.lk | Sees campus + Business year 1 posts |
| Academic | dr.jayasuriya@ucl.lk | Computing faculty |
| Society rep | anuki.silva@student.ucl.lk | Axiom Computing Club |
| Finance | finance.office@ucl.lk | |
| Admin | admin@ucl.lk | Can publish announcements |
| Super admin | superadmin@ucl.lk | |

## 2. Roles for the pitch

| Segment | Presenter | Time |
|---------|-----------|------|
| Problem and our understanding | | 1:00 |
| What we built, priorities, what we cut and why | | 2:00 |
| Live demo | | 3:30 |
| Architecture and key technical decisions | | 1:00 |
| Wrap-up and future work | | 0:30 |

**Q&A lead (technical):** TODO
**Q&A backup (frontend / data / tests):** TODO
**Rule:** anyone may answer, but each person answers questions about the parts they built.

## 3. Demo flow (happy path)

| # | Action | What to say (one line) | Expected result | Requirement ID | Time |
|---|--------|------------------------|-----------------|----------------|------|
| 1 | Open `/`, no login | Campus-wide posts only | Welcome post + emergency; no faculty-only items | BR1 | 0:20 |
| 2 | Sign in as Nimali | Feed is personalised by faculty and year | Computing lab booking appears | BR2 | 0:40 |
| 3 | Sign out, sign in as Kasun | Same app, different audience | Business year 1 briefing; no Computing lab post | BR2 / BR12 | 0:40 |
| 4 | Stay as Kasun, try New announcement or POST as student | Students cannot publish | No button, or 403 from API | BR12 | 0:20 |
| 5 | Sign in as admin, publish a short announcement | Staff update the official channel | Post appears on the feed | BR11 | 0:30 |
| 6 | As Nimali, submit academic support, then as academic Start it | One request engine, role-based handling | Status OPEN → IN_PROGRESS with staff note | BR9 | 0:40 |
| 7 | Report a lost item, contact as the other student | In-app contact, no phone numbers | Interest list shows first name only | BR7 | 0:30 |
| 8 | Open Calendar, Opportunities, FAQ/Wellbeing | Extra post types and info are seeded | Dates, job, counselling hours visible | BR13 / BR20 / BR10 / BR29 | 0:20 |

## 4. Show depth (pick 2-3 to highlight in the demo)

- [ ] Validation error shown gracefully (empty title on New announcement)
- [ ] Role-based access (student vs admin)
- [ ] Audience targeting (two students)
- [ ] UniHive AI: ask “library hours” or “lost my ID” — answer cites markdown/FAQ chunks (pgvector or keyword fallback)
- [ ] Tests passing (`make test` in a terminal, needs `DATABASE_URL`)
- [ ] Emergency: admin publishes `EMERGENCY` → student banner + Profile activity (email logs if SMTP unset)
- [ ] Lost & found contact shows first names only (no email)
- [ ] Academic cannot handle a facility issue (403)
- [ ] Calendar / job / guest lecture created from staff PostEditor

## 5. If something breaks

| Failure | Recovery |
|---------|----------|
| App will not start | Switch to the backup laptop with a pre-verified clone |
| Network drops | Switch to hotspot; Supabase must still be reachable |
| A feature errors mid-demo | Say what it should do, move on, show the screen recording |
| Demo data missing | Re-run `make seed` |
| Auth rejects login | Confirm public sign-ups are off but seed users exist; retry seed |

## 6. Likely Q&A (prepare answers)

**Why Supabase instead of SQLite?** Small admin office, managed auth and backups. FastAPI still owns roles and campus data. We disclose the hosted dependency and the offline risk.

**How does targeting work?** A student sees a post if every non-null audience field (`faculty`, `year`, `programme`) matches their profile. Null means everyone for that field.

**How is authorisation enforced?** `PERMISSION_ROLES` in `constants.py` plus `require_permission`. The UI hides buttons; the API is the authority.

**How does the AI assistant find answers?** Campus markdown in `backend/knowledge/` is split into chunks and stored in Postgres with Supabase **pgvector**. The question is embedded, nearest chunks are retrieved, then the LLM answers only from that context. If embeddings/pgvector are unavailable, keyword search over the same chunks (and live FAQs) is used.

## 7. Slide outline (build in the 45-minute window after 3:30 PM)

1. Title, team, problem statement in one sentence
2. Our understanding of the problem and the users
3. What we built (priority order) and what we left out, with reasons
4. Live demo (switch to the app)
5. Architecture and data model (one diagram)
6. Quality: validation, security, tests
7. Innovation / differentiator
8. Limitations and next steps
