# UCL Campus Hub — Frontend Roadmap

> **Track:** user interface only.  
> **Product name:** UCL Campus Hub (not UniHive).  
> **Visual source of truth:** `.cursor/UniHive_UI_UX_Plan.md`  
> **Rules:** `.cursor/rules/frontend.mdc`, `project-context.mdc`, `devdash.mdc`  
> **Skills applied:** `dashboard-designer`, `frontend-designer`, `color-palette`  
> **Last updated:** 2026-09-19

This document is the frontend build map. Screens, tokens, navigation, and component names follow the UI plan. Existing routes and file names stay. Auth, permissions, targeting, booking conflicts, and API behaviour stay on the backend (or a later integration pass). The UI shows and hides chrome for convenience only.

---

## 0. Scope split

| This track (UI) | Not this track |
|---|---|
| Layout, tokens, components, states, responsive behaviour | Permission enforcement, audience targeting, conflict detection |
| Role-aware **menus and buttons** (hide what does not apply) | Trusting the UI for security — server returns 403 |
| Presentational pages with real data when an endpoint already exists | Inventing backend behaviour or response shapes |
| Loading / empty / error / success visuals | Business status transitions |
| Client form validation (zod) for required fields and length | Server-side rules beyond displaying the error message |
| Registration | Owned elsewhere (Supabase / seed) — do not build a sign-up flow |

Existing Hour 0 wiring is left in place (`signIn`, `GET /api/posts`, `POST /api/posts`, `GET /api/auth/me`). New screens in this track use **design fixtures** until an integrator points them at `src/lib/api/<area>.ts`.

---

## 1. Design principles

1. One trusted campus home — official content shows author, category, audience, and time.
2. AI first, not AI only — command bar on the student home; full navigation still works.
3. Three shells, six roles — Student / Staff / Admin chrome; backend roles stay `STUDENT`, `ACADEMIC`, `SOCIETY_REP`, `FINANCE`, `ADMIN`, `SUPER_ADMIN`.
4. Few clicks — frequent actions live on dashboards.
5. Status is text + colour, never colour alone.
6. UCL red is for actions, active nav, and alerts — not decoration.
7. White space ~15–20%; max 3–5 headline stats on staff/admin boards.
8. Mobile-first, 44px targets, visible focus ring, Inter typeface.

---

## 2. Design system

### 2.1 Colour tokens (UCL red, confirmed against `UCL.png`)

| Token | Hex | Role |
|---|---|---|
| `--color-brand-500` / `--primary` | `#E31B23` | Primary buttons, links, active nav |
| `--color-brand-600` | `#C9151C` | Hover |
| `--color-brand-700` | `#A80F16` | Pressed |
| `--color-brand-50` | `#FFF1F2` | Selected row / active nav fill |
| `--color-neutral-900` | `#171717` | Headings, staff/admin sidebar |
| `--color-neutral-700` | `#404040` | Body |
| `--color-neutral-500` | `#737373` | Metadata |
| `--color-bg` | `#F7F8FA` | App background |
| `--color-border` | `#E5E7EB` | Cards, inputs, tables |
| `--color-surface` | `#FFFFFF` | Cards |
| `--success` | `#15803D` | Approved / available |
| `--warning` | `#B45309` | Pending |
| `--danger` | `#DC2626` | Error / emergency |
| `--info` | `#2563EB` | Neutral information |

Soft backgrounds: success `#F0FDF4`, warning `#FFFBEB`, error `#FEF2F2`, info `#EFF6FF`.

Dashboard-designer colour language: green = on track, red = alert, amber = pending, blue = primary data, grey = context. Never red+green as the only distinction.

### 2.2 Type, space, shape

- Font: **Inter** (`next/font/google`), fallback `system-ui, sans-serif`.
- Scale: Display 36/44, H1 32/40, H2 24/32, H3 18/26, body 14/22, caption 12/16, button 14/20.
- Spacing: 4, 8, 12, 16, 24, 32, 40, 48, 64.
- Page padding: 32 desktop / 24 tablet / 16 mobile.
- Radius: buttons/inputs 8, cards 12, drawers 16, badges pill.
- Elevation: 1px border + very light shadow on cards; hover lift only on clickable cards.
- Focus: 2px brand ring, 2px offset.
- Motion: 150ms ease; honour `prefers-reduced-motion`.
- Icons: **Lucide**, 18–20px outline. Do not mix icon sets.
- Primitives: **shadcn/ui** in `src/components/ui/`.
- Accent motion (AI bar, stat reveal): **21st.dev / Magic UI** patterns copied into the repo via shadcn registry (no runtime lock-in).

### 2.3 Breakpoints

| Name | Width | Shell |
|---|---|---|
| Mobile | `< 768px` | Student bottom nav; staff/admin hamburger + drawer |
| Tablet | `768–1023px` | 2-column cards; sidebar as drawer |
| Desktop | `≥ 1024px` | Student top nav; staff/admin 240px sidebar |

---

## 3. Information architecture

Keep existing paths. Add routes; do not rename `/`, `/login`, `/posts/new`.

### 3.1 Role → shell

| Shell | Routes | Backend roles |
|---|---|---|
| Student (top nav) | `/` and student feature routes | `STUDENT`; also the default logged-out chrome |
| Staff (sidebar) | `/staff/*` | `ACADEMIC`, `SOCIETY_REP`, `FINANCE` |
| Admin (sidebar) | `/admin/*` | `ADMIN`, `SUPER_ADMIN` |

After login the current app still lands on `/`. Staff/admin reach their workspace from the header. Auto-redirect by role is an integration task, not UI.

### 3.2 Student navigation (desktop)

Logo + UCL Campus Hub · Home · Discover (Events, Societies, Opportunities, Campus Updates) · Services (Classroom Booking, Lost & Found, Academic Support, Campus Information) · Calendar · AI Assistant · search · notifications · profile menu (My Profile, My Activity, Settings, Sign out).

Mobile bottom nav: Home · Discover · AI · Services · Profile.

### 3.3 Staff navigation

Dashboard · Content (Announcements, Events, Societies, Campus Information) · Requests (Room Requests, Lost & Found, Student Requests) · People (Students, limited) · Tools (AI, Notifications) · Profile · Sign out.

Show only groups the role can use (e.g. Finance sees Campus Information; Society rep sees own Events).

### 3.4 Admin navigation

Dashboard · Management (Users, Staff, Roles) · Content · Operations · System (Reports, Activity Log, Settings). Super admin sees Users + Roles; admin sees content/operations.

---

## 4. Screen inventory

Status: **Designed** (this track) · **Placeholder** (route exists, sparse UI) · **Later** · **Out** (not UI).

### Phase 1 — Foundation

| Screen | Route | BR / NFR | UI notes |
|---|---|---|---|
| Login | `/login` | BR12, NFR1, NFR4 | One form, no role picker. Registration is out. |
| 403 | `/403` | BR12 | Friendly copy from the UI plan. |
| Student home | `/` | BR1, BR2, BR15 | Greeting, AI bar, alert, quick actions, For You, upcoming, activity. |
| Global search box | in header / home | BR1 | Box in Phase 1; results page in Phase 2. |
| Emergency banner | every shell | BR15, BR16 | `EMERGENCY` / `SCHEDULE_CHANGE` presentation. |
| New announcement | `/posts/new` | BR11 | Restyle existing form; targeting fields are Phase 4. |
| Staff workspace (visual) | `/staff/dashboard` | BR11, BR12 | Stat cards, Needs Attention table, quick actions. Fixture data. |
| Admin overview (visual) | `/admin/dashboard` | BR12 | Four counts, quick actions, activity. Fixture data. |

### Phase 2 — Core student

| Screen | Route | BR |
|---|---|---|
| Campus Updates | `/updates` | BR2, BR15, BR16 |
| Events list / detail | `/events`, `/events/[id]` | BR3, BR4 |
| Guest lectures | `/lectures` (or Events filter) | BR28 |
| Academic calendar | `/calendar` | BR13 |
| Societies list / detail | `/societies`, `/societies/[slug]` | BR5, BR6 |
| Find a classroom + request modal | `/bookings` | BR8 |
| My bookings | `/bookings/mine` | BR8 |
| Search results | `/search` | BR1 |
| AI Assistant | `/assistant` | BR33 |

### Phase 3 — Remaining student

| Screen | Route | BR |
|---|---|---|
| Lost & Found | `/lost-found` | BR7 |
| Textbook exchange | `/textbooks` | BR27 |
| Support / issues / feedback | `/requests/new`, `/requests` | BR9, BR17, BR21 |
| Info hub + category pages | `/info`, `/info/[category]` | BR10, BR14, BR22–26, BR29–31 |
| Jobs / volunteering / alumni / highlights | `/opportunities` (+ post type) | BR18–20, BR32 |
| Profile | `/profile` | BR1, BR2 |

### Phase 4 — Staff / admin (full)

| Screen | Route | BR |
|---|---|---|
| My content table + type forms | `/staff/content`, `/staff/content/new` | BR11, BR2 |
| Booking approvals | `/staff/bookings` | BR8 |
| Request queue | `/staff/requests` | BR9, BR17, BR21 |
| Event interest / society sign-up lists | `/staff/events/[id]/interest` | BR4, BR6 |
| Assistant insights | `/staff/assistant` | BR33 |
| Users / staff / roles matrix | `/admin/users`, `/admin/roles` | BR12 |

### Phase 5 — Hardening

404 page, error boundary, 360 / 768 / 1280 pass, keyboard and contrast, dead-code pass, lint.

---

## 5. Component inventory

### Layout

`AppShell` · `StudentTopNav` · `DashboardSidebar` · `MobileNavigation` · `TopUtilityBar` · `PageHeader` · `AppFooter` · `BrandMark` · `EmergencyBanner`

Existing files **kept and restyled:** `AppHeader.tsx`, `FeedList.tsx`, `PostCard.tsx`.

### shadcn primitives (`src/components/ui/`)

Button · Input · Textarea · Select · Label · Checkbox · RadioGroup · Dialog · AlertDialog · Sheet · DropdownMenu · Popover · Command · Tabs · Badge · Card · Avatar · Separator · Skeleton · Table · Pagination · Tooltip · ScrollArea · Sonner (toast)

### Product components

`FormField` · `EmptyState` · `ErrorState` · `ConfirmDialog` · `StatCard` · `QuickActionCard` · `AnnouncementCard` (PostCard) · `EventCard` · `RoomCard` · `LostItemCard` · `DataTable` · `FilterBar` · `SearchBar` · `AICommandBar` · `AIChat` · `AISourceCard` · `NotificationDropdown` · `AudienceSelector` · `RequestStatusTracker` · `RoleGate` (visibility only)

### 21st.dev / Magic UI (copied into repo)

Use sparingly on the student AI bar and staff/admin headline stats. Do not sprinkle animation on static tables.

---

## 6. Dashboard layouts (dashboard-designer)

### Student home — F-pattern

1. Top nav  
2. Time-aware greeting + programme/year chip  
3. Ask Campus Hub command bar + suggested prompts  
4. Emergency / schedule-change banner (if present)  
5. Quick actions: Find a Room · Explore Events · Lost & Found · Campus Services  
6. For You feed — chips All / Academic / Events / Societies  
7. Upcoming events + academic dates  
8. Recent activity  

Headline “KPIs” are **actions**, not vanity charts.

### Staff workspace — operational

3–4 actionable counts (pending rooms, open requests, drafts, upcoming owned events) → click filters a table. Needs Attention table. Quick actions. Role badge. Finance / society / academic see different cards (UI hide only).

### Admin overview — control

Active users · Staff accounts · Pending requests · Draft content. Quick actions: Add User, Add Staff, Create Announcement, Manage Roles. Attention list. Recent activity. Status: Operational. No fake productivity percentages.

---

## 7. Phase plan (UI)

Finish and review one phase before starting the next. After each slice: files changed, how to click through, BR/NFR, real vs fixture data, proposed commit message.

### Phase 1 — Foundation (current)

1. Tokens, Inter, logo, shadcn, Lucide, 21st/Magic accent components.  
2. `AppShell` (student top nav + staff/admin sidebar + mobile + footer).  
3. Shared primitives and feedback components.  
4. Restyle login, home feed (chips, pinned treatment, search box), new-post form.  
5. Emergency banner on shells.  
6. Visual staff and admin dashboards with fixtures.  
7. 403 page.

**Gate:** three roles can *see* three different shells; student home matches the UI plan on desktop; login has no role picker.

### Phase 2 — Core student screens

Events, updates, calendar, societies, booking UI (availability grid, request modal, 409 banner layout), search results, full AI chat chrome (typing, sources, actions, fallback notice). Fixture or real posts `type=` where it already works.

### Phase 3 — Remaining student screens

Listings, requests, info hub, opportunities, profile layout (faculty / year / programme fields).

### Phase 4 — Staff / admin depth

Content table, audience selector UI, drawers, role matrix (read-only), confirm-delete modal. Hide actions the role cannot use.

### Phase 5 — Hardening

States on every list/form, responsive, a11y, lint, no dead code.

---

## 8. File map (extend, do not rename)

```
frontend/
├── ROADMAP.md                 ← this file
├── src/
│   ├── app/
│   │   ├── globals.css        tokens
│   │   ├── layout.tsx         font, toaster
│   │   ├── page.tsx           student home
│   │   ├── login/page.tsx
│   │   ├── 403/page.tsx
│   │   ├── posts/new/page.tsx
│   │   ├── staff/dashboard/
│   │   └── admin/dashboard/
│   ├── components/
│   │   ├── ui/                shadcn + 21st copies
│   │   ├── layout/
│   │   ├── home/
│   │   ├── AppHeader.tsx      kept
│   │   ├── FeedList.tsx       kept
│   │   └── PostCard.tsx       kept
│   ├── lib/
│   │   ├── constants.ts       routes, roles, labels, page size
│   │   ├── nav.ts             role → menu (UI only)
│   │   ├── utils.ts           cn()
│   │   ├── api.ts             do not change in this track
│   │   ├── auth.ts            do not change in this track
│   │   └── fixtures/          staff/admin preview data
│   └── types/
```

Later integration (not this track): `src/lib/api/<area>.ts`, `src/lib/mocks/`, `docs/API_STATUS.md`, `NEXT_PUBLIC_USE_MOCKS`.

---

## 9. Cross-cutting UI rules

- Every list: skeleton, empty with guidance, error + retry, pagination control (even if one page).  
- Every form: labels, zod, disabled submit, keep values on error, toast on success.  
- Dates displayed in Asia/Colombo; treat API timestamps as UTC (formatting only).  
- Never show another student’s email or phone.  
- Debounce search inputs (300ms).  
- No `any`. No magic strings — routes, roles, labels, page size live in `constants.ts`.

---

## 10. Definition of done (each screen)

- [ ] Matches the UI plan  
- [ ] Uses shared components  
- [ ] Loading / empty / error / success handled  
- [ ] Responsive at 360 / 768 / 1280  
- [ ] Keyboard + labelled controls  
- [ ] Role chrome correct (visibility only)  
- [ ] Requirement IDs noted in this file or `REQUIREMENTS.md`

---

## 11. Dependencies (disclose in `/DISCLOSURES.md` when added)

| Name | Purpose |
|---|---|
| shadcn/ui (copied source) | Primitives |
| lucide-react | Icons |
| 21st.dev / Magic UI registry items | AI bar and stat motion |
| Inter (Google Fonts via `next/font`) | Type |
| class-variance-authority, clsx, tailwind-merge | Component variants |
| radix-ui / sonner | Dialogs, toasts |

Do not add another library without updating DISCLOSURES.md.

---

## 12. Known conflicts (do not “fix” in UI)

1. Booking approve is `ADMIN` / `SUPER_ADMIN` on the server — academic staff must not see an Approve control that will 403.  
2. `GET /api/posts` has no `q=` — search results stay fixture until search exists.  
3. Listing/booking models lack UI-plan fields (photos, purpose, group size) — do not fake them as API fields.  
4. No notifications table — bell is visual (badge optional, empty dropdown).  
5. Assistant response shape is unspecified — chat chrome only until the integrator confirms `{ answer, sources, actions, fallback }`.

---

## 13. Progress log

| Date | Phase | What landed |
|---|---|---|
| 2026-09-19 | 1 | Tokens, shadcn + Lucide + Magic UI, student/staff/admin shells, restyled home/login, 403, visual dashboards, nav placeholders |
