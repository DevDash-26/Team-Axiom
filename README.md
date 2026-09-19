<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E?logo=supabase&logoColor=white" />
</p>

# UniHive

**Everything campus. One place.** — Team Axiom, DevDash’26.

Universal College Lanka students currently get information from WhatsApp groups, notice boards, lecturers, and word of mouth. UniHive is **one official channel**: targeted announcements, events, societies, bookings, lost & found, campus services, and **UniHive AI** (English / Sinhala / Singlish) that cites sources and deep-links to the right action.

We did not build 33 separate apps. We built **five engines** (posts, info, bookings, requests, listings) plus users, notifications, audit, and the assistant. Design, ER, tests, and what we cut are in [REPORT.md](REPORT.md). Requirement status is in [REQUIREMENTS.md](REQUIREMENTS.md).

---

## Quick start

Needs Python 3.11+, Node 18+, and a Supabase project (Auth + Postgres). Disable public sign-ups; seed creates demo users.

```bash
cp .env.example .env                          # fill secrets
cp frontend/.env.example frontend/.env.local  # public keys + NEXT_PUBLIC_API_URL
make install
make seed
make dev
```

| Process | URL |
|---------|-----|
| App | http://localhost:3000 |
| API | http://localhost:8000 |
| OpenAPI | http://localhost:8000/docs |

`make seed` is idempotent. `make test` runs pytest (needs `DATABASE_URL`).

On Windows use `backend\.venv\Scripts\python` instead of `backend/.venv/bin/python`.

---

## Demo accounts

Password for every account: **`CampusHub!2026`**

| Role | Email | Notes |
|------|--------|-------|
| Student | `nimali.perera@student.ucl.lk` | Computing, year 2 |
| Student | `kasun.fernando@student.ucl.lk` | Business, year 1 |
| Academic | `dr.jayasuriya@ucl.lk` | Computing |
| Society rep | `anuki.silva@student.ucl.lk` | Axiom Computing Club |
| Finance | `finance.office@ucl.lk` | |
| Admin | `admin@ucl.lk` | Announcements and emergencies |
| Super admin | `superadmin@ucl.lk` | |

Sign in as Nimali, then Kasun, to show faculty targeting. Students cannot publish announcements (403). Invented names only.

Pitch script: [DEMO.md](DEMO.md).

---

## Features

| Feature | What it does |
|---------|----------------|
| Unified feed + search | One home. Anonymous users see campus-wide posts; students see faculty / year / programme targeting. |
| Post engine | One table, eleven types (announcements through society updates). |
| Bookings | Classrooms and sports. Overlap returns **409**. Admin approve / reject + in-app alert. |
| Lost & found / textbooks | Same listing engine. Contact is first name only — no emails or phones in the UI. |
| Requests | Academic support, facility issues, feedback. Role-specific handlers. |
| Campus info | FAQ (Singlish-aware), onboarding, directory, aid, dining, printing, wellbeing, IT, library, sports. |
| UniHive AI | Scope → intent → pgvector / keyword retrieve → grounded answer or search fallback → sources + actions. |
| Emergencies | Banner, in-app notification, optional SMTP (or log count if unset), browser toast. **No SMS.** |

Server-side RBAC (`PERMISSION_ROLES` + `require_permission()`) is the authority. The UI only hides buttons.

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind, zod | Official scaffold, typed forms, one web client |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2, Pydantic v2 | Thin routers; services own rules |
| Data + auth | Supabase Postgres + Auth | Hosted DB a small office can keep; FastAPI still owns roles |
| RAG | Markdown under `backend/knowledge/` + **pgvector** | Same database; no Qdrant |
| LLM | Optional OpenAI-compatible chat + embeddings | Search-only fallback if the key is missing |
| Mail | stdlib `smtplib` | Optional emergency email |

Documented deviation from written SQLite + custom JWT: hosted Postgres and managed auth. The demo needs a network path to Supabase (hotspot is the backup).

Two processes only: backend `:8000`, frontend `:3000`. No Redis, brokers, or extra vector DB.

---

## Project structure

```
Team-Axiom/
├── backend/app/            # factory, constants, security, models, schemas, routers, services, seed
├── backend/app/assistant/  # guard → intent → retrieve → answer → log
├── backend/knowledge/      # campus markdown → pgvector chunks
├── backend/tests/          # pytest (79 cases)
├── frontend/src/           # App Router, components, lib/api.ts, lib/auth.ts
├── Makefile                # install, seed, dev, test
├── start.sh                # Render entry: cd backend && uvicorn
├── .env.example
├── README.md  REQUIREMENTS.md  DISCLOSURES.md  DEMO.md  REPORT.md
```

---

## Environment variables

Copy [`.env.example`](.env.example) to `.env`. Copy public keys into `frontend/.env.local`. Never commit real values. Never put the service role in Next.js.

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | backend | Postgres URI (`postgresql+psycopg://…`) |
| `SECRET_KEY` | backend | App secret |
| `SUPABASE_URL` | backend | JWT JWKS and Auth Admin |
| `SUPABASE_JWT_SECRET` | backend | Optional HS256 verify |
| `SUPABASE_SERVICE_ROLE_KEY` | backend / seed | Create demo Auth users |
| `CORS_ORIGINS` | backend | Default `http://localhost:3000` |
| `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` | backend | Optional grounded answers |
| `EMBEDDING_MODEL` | backend | Optional RAG embeddings |
| `SMTP_HOST` / `SMTP_FROM` | backend | Optional emergency email (blank = log count) |
| `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_USE_TLS` | backend | Optional SMTP auth (TLS on by default) |
| `NEXT_PUBLIC_API_URL` | frontend | FastAPI base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | Auth client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `ANON_KEY` | frontend | Auth client only |

Enable the **pgvector** extension in the Supabase dashboard. After editing markdown, re-index:

```bash
cd backend && .venv/bin/python -m app.assistant.index_knowledge
```

---

## Tests

```bash
make test
```

Needs `DATABASE_URL`. Auth is overridden except for the invalid-JWT case. The LLM and Auth Admin APIs are not called. Inventory and evidence: [REPORT.md](REPORT.md) §6.

---

## Deploy

| Piece | Where |
|-------|--------|
| **Frontend** | Vercel (or any Node host). Root Directory `frontend`. `NEXT_PUBLIC_API_URL` + public Supabase keys. |
| **API** | Render from **repo root** (Root Directory empty). Build: `pip install -r requirements.txt`. Start: **`bash start.sh`**. If Settings still show `uvicorn app.main:app`, add env **`PYTHONPATH=backend`** (root `app/` shim also loads `backend/app`). Python 3.11.11. Health: `/health`. |
| **Database + Auth** | Supabase. Enable pgvector. |

Then set `CORS_ORIGINS` to the Vercel origin and redeploy the API.

---

## Documentation

| File | Purpose |
|------|---------|
| [REPORT.md](REPORT.md) | Design, architecture, ER, testing evidence, limitations |
| [REQUIREMENTS.md](REQUIREMENTS.md) | BR status, where implemented, what we cut and why |
| [DISCLOSURES.md](DISCLOSURES.md) | Libraries, APIs, AI use |
| [DEMO.md](DEMO.md) | 8-minute pitch script |

---

DevDash’26 submission for **Team Axiom**. Application code was written in the hackathon window. Demo data is invented. The UCL mark is used only in the demo UI.
