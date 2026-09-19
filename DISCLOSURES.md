# Disclosures

> Required by the DevDash'26 rules. Update whenever a dependency, API, asset, or AI use is added.

## 1. Frameworks and libraries

| Name | Version | Purpose | Layer | Link |
|------|---------|---------|-------|------|
| FastAPI | 0.141.1 | HTTP API | backend | https://fastapi.tiangolo.com |
| Uvicorn | 0.53.0 | ASGI server | backend | https://www.uvicorn.org |
| SQLAlchemy | 2.0.54 | ORM | backend | https://www.sqlalchemy.org |
| psycopg | 3.3.6 | Postgres driver | backend | https://www.psycopg.org |
| Pydantic | 2.13.5 | Request/response validation | backend | https://docs.pydantic.dev |
| pydantic-settings | 2.15.0 | Environment config | backend | https://docs.pydantic.dev/latest/concepts/pydantic-settings |
| PyJWT | 2.14.0 | Verify Supabase access tokens | backend | https://pyjwt.readthedocs.io |
| httpx | 0.28.1 | HTTP client (Supabase SDK / tests) | backend | https://www.python-httpx.org |
| supabase (Python) | 2.31.0 | Auth Admin for seed only | backend | https://github.com/supabase/supabase-py |
| pytest | 9.1.1 | Tests | backend / dev | https://pytest.org |
| Next.js | 16.3.5 | Web app | frontend | https://nextjs.org |
| React | 19.2.8 | UI | frontend | https://react.dev |
| Tailwind CSS | 4 | Styling | frontend | https://tailwindcss.com |
| zod | 4.6.5 | Login and form validation | frontend | https://zod.dev |
| @supabase/supabase-js | 2.116.0 | Browser Auth (`signInWithPassword`) | frontend | https://supabase.com/docs |
| lucide-react | 1.47.0 | Outline icons for UniHive UI | frontend | https://lucide.dev |
| shadcn/ui | copied source (CLI 4.21.0) | UI primitives (button, dialog, table, …) | frontend | https://ui.shadcn.com |
| radix-ui | 1.6.7 | Accessible primitive behaviours used by shadcn | frontend | https://www.radix-ui.com |
| class-variance-authority | 0.7.1 | Component variants | frontend | https://cva.style |
| clsx | 2.1.1 | Conditional class names | frontend | https://github.com/lukeed/clsx |
| tailwind-merge | 3.7.0 | Merge Tailwind classes | frontend | https://github.com/dcastil/tailwind-merge |
| cn | 0.3.0 | shadcn `cn()` helper | frontend | https://www.npmjs.com/package/cn |
| sonner | 2.0.8 | Toast notifications | frontend | https://sonner.emilkowal.ski |
| cmdk | 1.1.1 | Command palette primitive | frontend | https://cmdk.paco.me |
| next-themes | 0.4.6 | Theme hook used by the toast host | frontend | https://github.com/pacocoursey/next-themes |
| tw-animate-css | 1.4.0 | Enter/leave animations for dialogs (CSS copied to `frontend/src/styles/tw-animate.css` because Tailwind v4 cannot resolve the package `style` export) | frontend | https://github.com/Wombosvideo/tw-animate-css |
| Magic UI (via 21st.dev / shadcn registry) | copied `shine-border`, `number-ticker` | AI bar border and dashboard count animation | frontend | https://magicui.design · https://21st.dev |
| motion | 13.4.0 | Number ticker animation | frontend | https://motion.dev |

Exact frontend patch versions are in `frontend/package-lock.json` after `npm install`.

## 2. External APIs and services

| Service / API | Purpose | Auth needed? | Fallback if unavailable | Link |
|---------------|---------|--------------|-------------------------|------|
| Supabase Auth | Email/password login, JWT issue | Publishable key (browser); service role (seed) | None — demo needs network | https://supabase.com/docs/guides/auth |
| Supabase Postgres | Application database | `DATABASE_URL` | None — demo needs network | https://supabase.com/docs/guides/database |

Campus data is **not** read through the Supabase Data API / PostgREST. FastAPI + SQLAlchemy are the only data path.

## 3. Datasets, fonts, icons, images, and other assets

| Asset | Source | Licence | Where used |
|-------|--------|---------|------------|
| Inter font | Google Fonts via `next/font` | SIL OFL | UniHive UI (`frontend/src/app/layout.tsx`) |
| lucide icons | lucide-react | ISC | Navigation and actions |
| UCL logo | Team asset (`.cursor/UCL.png`) | Institutional mark for the demo UI | `frontend/public/ucl-logo.png` |

No real student data. Seed names are invented.

## 4. Development tooling

| Tool | Purpose |
|------|---------|
| Git / GitHub | Version control and submission |
| Cursor (Pro) | AI-assisted editor |
| ESLint | Frontend lint |
| create-next-app | Official Next.js scaffold |
| graphify | Local codebase knowledge graph |

## 5. AI usage statement

**Tools used:** Cursor (Pro), underlying models as provided by Cursor.

**How AI was used:**
- Scaffolding boilerplate (routes, components, config)
- Suggesting implementations that the team reviewed, edited, and tested
- Drafting tests and documentation that the team reviewed
- Debugging assistance

**How the team stayed in control:**
- Requirements, data model, architecture, and priorities were decided by the team.
- Every AI-generated change was reviewed by a team member before commit.
- Every team member can explain the code they and the team committed.

**Parts written or designed primarily by humans:** permission matrix, audience rule, engine data model, Hour 0 scope.

## 6. Code adapted from public sources

None.

## 7. Declaration

All application code in this repository was written during the DevDash'26 hackathon window.
No pre-built project or private template was used. Official scaffolding tools and public
libraries listed above were used as permitted.

**Team:** Team Axiom
**Team leader:** TODO
