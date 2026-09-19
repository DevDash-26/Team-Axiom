# UCL Campus Hub (Team Axiom)

One trusted channel for Universal College Lanka students: announcements, events, societies, bookings, and campus services. Hour 0 ships auth, the full schema, and a targeted home feed.

## Tech stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, zod, supabase-js (Auth only)
- **Backend:** Python, FastAPI, SQLAlchemy 2, Pydantic v2
- **Data and auth:** Supabase Postgres + Supabase Auth. FastAPI is the only data path (no PostgREST for campus tables)
- **Tests:** pytest

This is a documented deviation from the written SQLite + custom-JWT stack: we use hosted Postgres and managed auth so a small admin office does not run a database. The demo needs a network path to Supabase (hotspot is the backup).

## Setup

1. Create a Supabase project. Disable public sign-ups (seed creates demo users).
2. Copy [`.env.example`](.env.example) to `.env` at the repo root and fill the values.
3. Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env.local` with the public keys and `NEXT_PUBLIC_API_URL`.
4. Install and run:

```bash
make install
make seed
make dev
```

- API: http://localhost:8000 (docs at `/docs`)
- App: http://localhost:3000

`make seed` is idempotent. `make test` runs pytest and needs `DATABASE_URL`.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | backend | Session-pooler or direct Postgres URI (`postgresql+psycopg://…`) |
| `SUPABASE_URL` | backend | Project URL for JWT JWKS and Auth Admin |
| `SUPABASE_JWT_SECRET` | backend | HS256 verify (optional if the project uses JWKS only) |
| `SUPABASE_SERVICE_ROLE_KEY` | backend / seed only | Create demo Auth users. Never put this in Next.js |
| `CORS_ORIGINS` | backend | Default `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | frontend | FastAPI base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | Auth client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `ANON_KEY` | frontend | Auth client only |

## Demo accounts

Password for every account: `CampusHub!2026`

| Role | Email | Notes |
|------|--------|-------|
| Student | `nimali.perera@student.ucl.lk` | Computing, year 2 |
| Student | `kasun.fernando@student.ucl.lk` | Business, year 1 |
| Academic | `dr.jayasuriya@ucl.lk` | Computing |
| Society rep | `anuki.silva@student.ucl.lk` | Axiom Computing Club |
| Finance | `finance.office@ucl.lk` | |
| Admin | `admin@ucl.lk` | Can publish announcements |
| Super admin | `superadmin@ucl.lk` | |

Sign in as Nimali, then Kasun, to show faculty targeting. Students cannot publish announcements (403).

## Project structure

```
backend/app/     FastAPI factory, models, services, routers
backend/tests/   pytest (targeting, 403, 422, invalid JWT)
frontend/src/   Next.js app, components, lib/api.ts, lib/auth.ts
```

## Documentation

- [REQUIREMENTS.md](REQUIREMENTS.md) — requirement status
- [DISCLOSURES.md](DISCLOSURES.md) — libraries and AI use
- [DEMO.md](DEMO.md) — pitch script
- [REPORT.md](REPORT.md) — design notes
