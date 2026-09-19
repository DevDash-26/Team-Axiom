# Graph Report - Team-Axiom  (2026-09-19)

## Corpus Check
- 240 files · ~84,107 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1936 nodes · 5426 edges · 109 communities (94 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51cc2900`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- User
- security.py
- new/page.tsx
- Demo Script
- devDependencies
- Frontend Design
- DevDash'26 Project Report
- compilerOptions
- DevDash'26 Project Report
- 7. Student UI
- Base
- Color Palette
- Dashboard Designer
- conftest.py
- 3. Design System
- 8. Staff UI
- 9. Administrator UI
- Demo Script
- 11. Interaction and State Specifications
- Disclosures
- Requirements Traceability (pre-filled from the DevDash'26 Problem Statement)
- UniHive_UI_UX_Plan.md
- 14. Recommended Build Order
- 12. Responsive Behaviour
- 16. Final Judge-Demo Flow
- test_auth.py
- 10. Shared Components
- 4. User Roles and Permissions
- schemas/user.py
- 17. Judge-Facing Evidence Checklist
- 1. Product and UI Concept
- 13. P0 / P1 / P2 Priorities
- 2. Requirements and Marks Strategy
- 5. Navigation Structure
- 6. Complete Screen Inventory
- frontend/README.md
- app/__init__.py
- schemas/__init__.py
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- ListingReportDialog.tsx
- AppShell
- UniHive — Frontend Roadmap
- content/page.tsx
- ROUTES
- staff/dashboard/page.tsx
- main.py
- test_posts.py
- requests.py
- Display.tsx
- listing_service.py
- AppShell.tsx
- constants.ts
- useSessionUser
- legacy.tsx
- AuthGate.tsx
- info_service.py
- require_permission
- components.json
- student/dashboard/page.tsx
- listings.py
- dependencies
- request_service.py
- app/page.tsx
- edit/page.tsx
- search-results.tsx
- campus.ts
- cn
- ConfirmDialog.tsx
- bind_user
- apiGet
- UniHive product backlog
- constants.py
- test_bookings.py
- layout.tsx
- session-records.ts
- select.tsx
- Example 1: Button Component Full Specification
- package.json
- Requirements Traceability
- get_engine
- Example 2: Responsive Dashboard Layout Specification
- Disclosures
- popover.tsx
- Bookings, dining, and finance
- UniHive (Team Axiom)
- Example 1: SaaS Product Color Palette — FinTech App
- tabs.tsx
- 3. Architecture
- Example 2: Accessible Color Scheme Audit — Existing Palette
- Campus Wi-Fi and IT
- Student services and lost ID
- 6. Testing
- 1. Product and UI Concept
- 2. Design
- 4. Implementation highlights
- student/events/[id]/page.tsx
- Library
- cmdk
- cn
- AGENTS.md
- motion
- next
- react
- react-dom
- sonner
- @supabase/supabase-js

## God Nodes (most connected - your core abstractions)
1. `User` - 165 edges
2. `cn()` - 148 edges
3. `useSessionUser()` - 75 edges
4. `get_db()` - 53 edges
5. `ROUTES` - 51 edges
6. `Button()` - 48 edges
7. `AppShell()` - 43 edges
8. `AppError` - 41 edges
9. `bind_user()` - 35 edges
10. `PageHeader()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `SourceHit` --uses--> `PostStatus`  [INFERRED]
  backend/app/assistant/retrieval.py → backend/app/constants.py
- `SourceHit` --uses--> `Post`  [INFERRED]
  backend/app/assistant/retrieval.py → backend/app/models/post.py
- `SourceHit` --uses--> `User`  [INFERRED]
  backend/app/assistant/retrieval.py → backend/app/models/user.py
- `Booking` --uses--> `Base`  [INFERRED]
  backend/app/models/booking.py → backend/app/db.py
- `Faq` --uses--> `Base`  [INFERRED]
  backend/app/models/info.py → backend/app/db.py

## Import Cycles
- None detected.

## Communities (109 total, 15 thin omitted)

### Community 0 - "User"
Cohesion: 0.06
Nodes (88): Faculty, PostStatus, PostType, AppError, Post, add_event_interest(), create_post(), get_post() (+80 more)

### Community 1 - "security.py"
Cohesion: 0.11
Nodes (27): complete(), Thin LLM client behind a small interface. Missing keys fall back to None., Return model text, or None when the provider is unavailable., get_settings(), Settings loaded from the environment. Never hard-code secrets., Build a psycopg URL. Keep pooler usernames like postgres.<ref> intact., Settings, Depends (+19 more)

### Community 2 - "new/page.tsx"
Cohesion: 0.05
Nodes (76): InfoCategoryPage(), LostFoundDetailPage(), SocietiesPage(), StaffAssistantInsightsPage(), StaffSocietyInterestPage(), FieldErrors, PostEditorProps, postSchema (+68 more)

### Community 3 - "Demo Script"
Cohesion: 0.22
Nodes (9): 0. Pre-demo checklist (do this before the judges are ready), 1. Demo accounts, 2. Roles for the pitch, 3. Demo flow (happy path), 4. Show depth (pick 2-3 to highlight in the demo), 5. If something breaks, 6. Likely Q&A (prepare answers), 7. Slide outline (build in the 45-minute window after 3:30 PM) (+1 more)

### Community 4 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 5 - "Frontend Design"
Cohesion: 0.17
Nodes (10): Best Practices, Common Mistakes, Frontend Design, Instructions, Overview, Quick Reference, Related Skills, Tips & Tricks (+2 more)

### Community 6 - "DevDash'26 Project Report"
Cohesion: 0.07
Nodes (29): 10. Team contributions, 1.1 Problem understanding, 1.2 Our solution in brief, 1.3 Scope and priorities, 1. Introduction, 2.1 Users and roles, 2.2 Key user flows, 2.3 UI design decisions (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 8 - "DevDash'26 Project Report"
Cohesion: 0.20
Nodes (10): 10. Team contributions, 1.1 Problem understanding, 1.2 Our solution in brief, 1.3 Scope and priorities, 1. Introduction, 5. Non-functional quality, 7. Setup and running, 8. Limitations and future work (+2 more)

### Community 9 - "7. Student UI"
Cohesion: 0.07
Nodes (27): 7.1 Student Dashboard — P0, 7.2 AI Assistant — P0, 7.3 Campus Updates — P0, 7.4 Events Listing — P0, 7.5 Event Details — P0, 7.6 Classroom Availability and Booking — P0, 7.7 My Requests — P0, 7.8 Lost & Found — P0 (+19 more)

### Community 10 - "Base"
Cohesion: 0.08
Nodes (44): _apply_schema_patches(), Base, _enable_rls(), init_db(), Engine, session, table bootstrap, search index, and RLS (no anon policies)., Add columns create_all will not alter on existing Supabase tables (hackathon-saf, Enable Supabase pgvector and the markdown chunk table used by UniHive AI., _setup_pgvector() (+36 more)

### Community 11 - "Color Palette"
Cohesion: 0.20
Nodes (10): Best Practices, Color Palette, Common Mistakes, Instructions, Overview, Quick Reference, Related Skills, Tips & Tricks (+2 more)

### Community 12 - "Dashboard Designer"
Cohesion: 0.10
Nodes (20): Best Practices, Common Mistakes, Dashboard Designer, Example 1: Design a Sales Performance Dashboard, Example 2: Design an Engineering Metrics Dashboard, Examples, Instructions, Overview (+12 more)

### Community 13 - "conftest.py"
Cohesion: 0.07
Nodes (49): AssistantAction, is_greeting(), is_out_of_scope(), Scope checks for the campus assistant., Campus AI assistant package (pipeline + multilingual helpers)., detect_script_language(), language_policy_block(), _latin_tokens() (+41 more)

### Community 14 - "3. Design System"
Cohesion: 0.14
Nodes (14): 3.1 Brand Direction, 3.2 Color Palette, 3.3 Typography, 3.4 Spacing, 3.5 Shape and Elevation, 3.6 Buttons, 3.7 Inputs, 3.8 Tables (+6 more)

### Community 15 - "8. Staff UI"
Cohesion: 0.18
Nodes (11): 8.1 Staff Dashboard — P0, 8.2 Staff Content Management — P0, 8.3 Staff Request Management — P0, 8.4 Staff Lost & Found Management — P0/P1, 8.5 Staff Event Management — P1, 8. Staff UI, Create/Edit Announcement, Detail Drawer (+3 more)

### Community 16 - "9. Administrator UI"
Cohesion: 0.18
Nodes (11): 9.1 Admin Dashboard — P0, 9.2 User Management — P0, 9.3 Staff Management — P0, 9.4 Roles and Permissions — P0/P1, 9.5 Record and Content Management — P0, 9.6 Reports — P1, 9.7 Activity Log — P1, 9. Administrator UI (+3 more)

### Community 17 - "Demo Script"
Cohesion: 0.20
Nodes (9): 0. Pre-demo checklist (do this before the judges are ready), 1. Demo accounts, 2. Roles for the pitch, 3. Demo flow (happy path), 4. Show depth (pick 2-3 to highlight in the demo), 5. If something breaks, 6. Likely Q&A (prepare answers), 7. Slide outline (build in the 45-minute window after 3:30 PM) (+1 more)

### Community 18 - "11. Interaction and State Specifications"
Cohesion: 0.20
Nodes (10): 11.1 Navigation, 11.2 Buttons, 11.3 Cards, 11.4 Modals and Drawers, 11.5 Loading States, 11.6 Empty States, 11.7 Form Validation, 11.8 Toasts (+2 more)

### Community 19 - "Disclosures"
Cohesion: 0.22
Nodes (8): 1. Frameworks and libraries, 2. External APIs and services, 3. Datasets, fonts, icons, images, and other assets, 4. Development tooling, 5. AI usage statement, 6. Code adapted from public sources, 7. Declaration, Disclosures

### Community 21 - "UniHive_UI_UX_Plan.md"
Cohesion: 0.17
Nodes (11): 15. Suggested Four-Person Ownership, 18. Suggested Data Entities, 19. Out of Scope for the Hackathon MVP, 20. Final Recommendation, 5.1 Student Navigation, 5.2 Staff Navigation, 5.3 Administrator Navigation, 5. Navigation Structure (+3 more)

### Community 22 - "14. Recommended Build Order"
Cohesion: 0.25
Nodes (8): 14. Recommended Build Order, Phase 1 — Foundation, Phase 2 — Student Core, Phase 3 — Classroom Workflow, Phase 4 — Targeted Content Workflow, Phase 5 — Additional Coverage, Phase 6 — Administration, Phase 7 — Quality and Demo Polish

### Community 23 - "12. Responsive Behaviour"
Cohesion: 0.29
Nodes (7): 12. Responsive Behaviour, Accessibility Requirements, Desktop — 1024px and Above, Mobile — Below 768px, Staff/Admin, Student, Tablet — 768px to 1023px

### Community 24 - "16. Final Judge-Demo Flow"
Cohesion: 0.29
Nodes (7): 16. Final Judge-Demo Flow, Demo Preparation, Finish, Part 1 — Student, Part 2 — Staff, Part 3 — Student Again, Part 4 — Administrator

### Community 25 - "test_auth.py"
Cohesion: 0.43
Nodes (6): TestClient, Auth dependency tests. Unit tests do not call Supabase Auth., test_invalid_jwt_is_rejected(), test_me_requires_token(), test_me_returns_profile(), test_student_can_update_profile()

### Community 26 - "10. Shared Components"
Cohesion: 0.33
Nodes (6): 10.1 Layout, 10.2 Forms and Controls, 10.3 Data Display, 10.4 Feedback and Overlays, 10.5 Feature Components, 10. Shared Components

### Community 27 - "4. User Roles and Permissions"
Cohesion: 0.33
Nodes (6): 4.1 Student, 4.2 Staff, 4.3 Administrator, 4.4 Permission Matrix, 4.5 Authentication and Authorization Flow, 4. User Roles and Permissions

### Community 28 - "schemas/user.py"
Cohesion: 0.10
Nodes (34): chunk_markdown(), knowledge_dir(), load_markdown_chunks(), Simple markdown chunking for campus knowledge files.  Splits on ## headings firs, Turn one markdown file into overlapping text chunks., TextChunk, _window(), embed_query() (+26 more)

### Community 29 - "17. Judge-Facing Evidence Checklist"
Cohesion: 0.40
Nodes (5): 17. Judge-Facing Evidence Checklist, Code Quality, Live Demo, Report Evidence, Requirement Coverage

### Community 30 - "1. Product and UI Concept"
Cohesion: 0.15
Nodes (29): add_society_interest(), get_society(), list_societies(), list_society_interests(), Depends, get, post, REQUESTS_CREATE (+21 more)

### Community 31 - "13. P0 / P1 / P2 Priorities"
Cohesion: 0.50
Nodes (4): 13. P0 / P1 / P2 Priorities, P0 — Must Work End to End, P1 — After P0 Is Stable, P2 — Extra Time Only

### Community 32 - "2. Requirements and Marks Strategy"
Cohesion: 0.50
Nodes (4): 2.1 Highest-Priority Requirements, 2.2 Efficient Coverage of Smaller Requirements, 2.3 Non-Functional Requirements, 2. Requirements and Marks Strategy

### Community 33 - "5. Navigation Structure"
Cohesion: 0.14
Nodes (13): StudentTopNavProps, DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+5 more)

### Community 34 - "6. Complete Screen Inventory"
Cohesion: 0.50
Nodes (4): 6. Complete Screen Inventory, P0 — Must Build, P1 — Build After P0 Works, P2 — Only If Time Remains

### Community 36 - "app/__init__.py"
Cohesion: 0.10
Nodes (24): initials(), ProfilePage(), profileSchema, NewRequestPage(), requestSchema, TYPE_OPTIONS, StaffDashboardPage(), FormField() (+16 more)

### Community 41 - "ListingReportDialog.tsx"
Cohesion: 0.11
Nodes (21): ROLES, ASSISTANT_INSIGHTS, AssistantInsight, EVENT_INTEREST_LISTS, InterestPerson, ManagedUser, SOCIETY_INTEREST_LISTS, STAFF_BOOKINGS (+13 more)

### Community 42 - "AppShell"
Cohesion: 0.17
Nodes (22): CalendarPage(), EventDetailPage(), EventsPage(), LecturesPage(), OpportunitiesPage(), SocietyDetailPage(), StaffEventInterestPage(), StaffLostFoundPage() (+14 more)

### Community 43 - "UniHive — Frontend Roadmap"
Cohesion: 0.05
Nodes (39): 0. Scope split, 10. Definition of done (each screen), 11. Dependencies (disclose in `/DISCLOSURES.md` when added), 12. Known conflicts (do not “fix” in UI), 13. Progress log, 1. Design principles, 21st.dev / Magic UI (copied into repo), 2.1 Colour tokens (UCL red, confirmed against `UCL.png`) (+31 more)

### Community 44 - "content/page.tsx"
Cohesion: 0.13
Nodes (37): AdminRolesPage(), mark(), ROLE_ORDER, AdminStaffPage(), addUserSchema, AdminUsersPage(), audienceLabel(), StaffContentPage() (+29 more)

### Community 45 - "ROUTES"
Cohesion: 0.12
Nodes (28): BookingsPage(), KIND_FILTERS, toIso(), LostFoundPage(), SearchResults(), TextbooksPage(), RoomCard(), RoomCardProps (+20 more)

### Community 46 - "staff/dashboard/page.tsx"
Cohesion: 0.15
Nodes (18): AdminDashboardPage(), CATEGORY_ICONS, InfoHubPage(), loginSchema, AttentionTable(), EventCardProps, UpcomingPanelProps, Card() (+10 more)

### Community 47 - "main.py"
Cohesion: 0.06
Nodes (73): _ilike_any(), Session, Campus RAG: markdown chunks (pgvector) plus live FAQ/info/post keyword hits., Prefer markdown chunk vectors, then fill with live SQL campus rows., retrieve(), _score_text(), _snippet(), SourceHit (+65 more)

### Community 48 - "test_posts.py"
Cohesion: 0.15
Nodes (28): _add_post(), Session, TestClient, Audience targeting, permission denials, and validation for the post engine., test_academic_can_create_announcement(), test_academic_can_create_calendar_and_guest_lecture(), test_academic_cannot_create_emergency(), test_academic_cannot_publish_other_faculty() (+20 more)

### Community 49 - "requests.py"
Cohesion: 0.11
Nodes (46): InterestTarget, MembershipStatus, NotificationType, Permission, Enum, str, Roles, enums, permission keys, and limits. No magic strings elsewhere., RequestStatus (+38 more)

### Community 50 - "Display.tsx"
Cohesion: 0.20
Nodes (26): academic_client(), academic_user(), _add_user(), admin_client(), admin_user(), bind_user(), business_client(), business_student() (+18 more)

### Community 51 - "listing_service.py"
Cohesion: 0.14
Nodes (34): ListingStatus, ListingType, get_db(), Session, add_listing_interest(), create_listing(), get_listing(), list_listing_interests() (+26 more)

### Community 52 - "AppShell.tsx"
Cohesion: 0.11
Nodes (25): MyBookingsPage(), RequestsPage(), StaffBookingsPage(), StaffRequestsPage(), toneForStatus(), EmergencyBanner(), EmergencyBannerProps, LostItemCard() (+17 more)

### Community 53 - "constants.ts"
Cohesion: 0.03
Nodes (53): ForbiddenPage(), ErrorPage(), ErrorPageProps, GlobalErrorProps, NotFoundPage(), UnauthorizedPage(), StatusPage(), StatusPageProps (+45 more)

### Community 54 - "useSessionUser"
Cohesion: 0.29
Nodes (4): AssistantView(), ChatMessage, AI_SUGGESTED_PROMPTS, ASSISTANT_LANGUAGE_LABELS

### Community 55 - "legacy.tsx"
Cohesion: 0.16
Nodes (18): DashboardSidebarProps, NavGroup(), pathMatches(), pathMatches(), StudentTopNav(), Separator(), ADMIN_ROLES, ANNOUNCEMENT_ROLES (+10 more)

### Community 56 - "AuthGate.tsx"
Cohesion: 0.29
Nodes (23): Interest, Listing, User, add_interest(), annotate(), _assert_listing_type(), _can_manage(), _can_moderate() (+15 more)

### Community 57 - "info_service.py"
Cohesion: 0.17
Nodes (20): AssistantChatRequest, AssistantChatResponse, AssistantFeedbackRequest, AssistantInsightsResponse, AssistantSource, InsightQuestion, BaseModel, field_validator (+12 more)

### Community 58 - "require_permission"
Cohesion: 0.14
Nodes (15): BrandMark(), BrandMarkProps, DrawerLinks(), MobileNavigation(), MobileNavigationProps, pathMatches(), Sheet(), SheetContent() (+7 more)

### Community 59 - "components.json"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+11 more)

### Community 60 - "student/dashboard/page.tsx"
Cohesion: 0.12
Nodes (11): StatCard(), StatCardProps, FeedToolbar(), FeedToolbarProps, Checkbox(), Label(), NumberTicker(), NumberTickerProps (+3 more)

### Community 61 - "listings.py"
Cohesion: 0.33
Nodes (12): _payload(), Session, TestClient, Lost and found listings: create, resolve, and in-app contact., test_admin_can_resolve_other_listing(), test_interest_then_duplicate_is_409(), test_interests_hidden_from_non_owner(), test_list_filters_active_and_hides_removed() (+4 more)

### Community 62 - "dependencies"
Cohesion: 0.12
Nodes (17): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, lucide-react, next-themes, radix-ui (+9 more)

### Community 63 - "request_service.py"
Cohesion: 0.35
Nodes (11): _payload(), Session, TestClient, Request engine: create, visibility, handling permissions, and status transitions, test_academic_can_progress_academic_support(), test_academic_cannot_handle_facility(), test_academic_list_hides_facility_from_other_students(), test_admin_handles_facility_and_feedback() (+3 more)

### Community 64 - "app/page.tsx"
Cohesion: 0.39
Nodes (6): WelcomeHeader(), WelcomeHeaderProps, Badge(), badgeVariants, firstName(), greetingForNow()

### Community 65 - "edit/page.tsx"
Cohesion: 0.16
Nodes (22): HomePage(), NewPostPage(), StaffContentEditPage(), StaffContentNewPage(), FeedList(), AICommandBar(), ACTIONS, QuickActions() (+14 more)

### Community 66 - "search-results.tsx"
Cohesion: 0.22
Nodes (9): buttonVariants, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 67 - "campus.ts"
Cohesion: 0.15
Nodes (12): author, BookingFixture, EVENT_CATEGORY, EVENT_INTEREST, FIXTURE_POSTS, MY_BOOKINGS, RoomFixture, ROOMS (+4 more)

### Community 68 - "cn"
Cohesion: 0.25
Nodes (9): list_notifications(), Depends, get, Session, In-app notifications for booking outcomes. Assistant endpoints are unchanged., NotificationListResponse, NotificationRead, BaseModel (+1 more)

### Community 69 - "ConfirmDialog.tsx"
Cohesion: 0.21
Nodes (11): ConfirmDialogProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+3 more)

### Community 70 - "bind_user"
Cohesion: 0.18
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 71 - "apiGet"
Cohesion: 0.24
Nodes (9): _connect_kwargs_from_database_url(), get_engine(), Explicit connect args so pooler usernames (postgres.<ref>) are never mis-parsed., Lazy engine so .env changes apply without stale module-level URLs., health(), get, Liveness and readiness probes., ready() (+1 more)

### Community 72 - "UniHive product backlog"
Cohesion: 0.08
Nodes (24): 10. New Features (recommended), 1. Core Features, 1-minute pitch fill-in (keep in sync), 2. Student / User Features, 3. Staff Features, 4. Admin Features, 5. Authentication & Role-Based Access, 6. UI / UX (+16 more)

### Community 73 - "constants.py"
Cohesion: 0.12
Nodes (46): BookingStatus, ResourceKind, Booking, create_booking(), list_bookings(), list_resources(), BookingRead, datetime (+38 more)

### Community 74 - "test_bookings.py"
Cohesion: 0.53
Nodes (9): Session, TestClient, Booking create, overlap 409, and approve/reject., _room(), _slot(), test_admin_can_approve(), test_overlap_is_409(), test_student_can_create_booking() (+1 more)

### Community 75 - "layout.tsx"
Cohesion: 0.19
Nodes (6): inter, metadata, AppProviders(), Toaster(), TooltipContent(), TooltipProvider()

### Community 76 - "session-records.ts"
Cohesion: 0.42
Nodes (9): CampusRequestFixture, ListingFixture, listingsWithSession(), mergeById(), readJsonArray(), rememberListing(), rememberRequest(), requestsWithSession() (+1 more)

### Community 77 - "select.tsx"
Cohesion: 0.09
Nodes (32): BookingRequestDialog(), BookingRequestDialogProps, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+24 more)

### Community 78 - "Example 1: Button Component Full Specification"
Cohesion: 0.20
Nodes (10): Accessibility Requirements, Design Tokens (establish these first), Example 1: Button Component Full Specification, Examples, Ghost Button, Interaction Spec, Primary Button, Secondary Button (+2 more)

### Community 79 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 80 - "Requirements Traceability"
Cohesion: 0.22
Nodes (9): A. Functional requirements (mapped to engines + UI), B. Non-functional, C. Differentiator, D. Deliberately left out, E. Model inventory (backend), F. Next build slices, Priority key, Requirements Traceability (+1 more)

### Community 81 - "get_engine"
Cohesion: 0.23
Nodes (10): Any, error_body(), FastAPI, Application errors and the stable API error shape., register_exception_handlers(), create_app(), lifespan(), FastAPI (+2 more)

### Community 82 - "Example 2: Responsive Dashboard Layout Specification"
Cohesion: 0.25
Nodes (8): Breakpoint Definitions, Card Component Minimum Spec, Card Grid Specification, CSS Custom Properties for Layout, Example 2: Responsive Dashboard Layout Specification, Focus Management (Sidebar), Layout Architecture, Sidebar Behavior

### Community 83 - "Disclosures"
Cohesion: 0.25
Nodes (8): 1. Frameworks and libraries, 2. External APIs and services, 3. Datasets, fonts, icons, images, and other assets, 4. Development tooling, 5. AI usage statement, 6. Code adapted from public sources, 7. Declaration, Disclosures

### Community 84 - "popover.tsx"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 85 - "Bookings, dining, and finance"
Cohesion: 0.40
Nodes (4): Book a classroom or sports facility, Bookings, dining, and finance, Dining, Financial aid

### Community 86 - "UniHive (Team Axiom)"
Cohesion: 0.29
Nodes (7): Demo accounts, Documentation, Environment variables, Project structure, Setup, Tech stack, UniHive (Team Axiom)

### Community 87 - "Example 1: SaaS Product Color Palette — FinTech App"
Cohesion: 0.33
Nodes (6): Accessibility Validation, Brand Strategy, Example 1: SaaS Product Color Palette — FinTech App, Neutral Scale — Cool Gray, Primary Palette — Vault Blue, Semantic Colors

### Community 88 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 89 - "3. Architecture"
Cohesion: 0.33
Nodes (6): 3.1 System overview, 3.2 Technology stack and why, 3.3 Data model, 3.4 API design, 3.5 Project structure, 3. Architecture

### Community 90 - "Example 2: Accessible Color Scheme Audit — Existing Palette"
Cohesion: 0.40
Nodes (5): Audit Results, Example 2: Accessible Color Scheme Audit — Existing Palette, Examples, Fixes, Updated Palette Summary

### Community 91 - "Campus Wi-Fi and IT"
Cohesion: 0.40
Nodes (4): Campus Wi-Fi and IT, Helpdesk hours, Print and copy, Reset Wi-Fi password

### Community 92 - "Student services and lost ID"
Cohesion: 0.40
Nodes (4): Lost student ID card, Onboarding week one, Student services and lost ID, Wellbeing

### Community 93 - "6. Testing"
Cohesion: 0.40
Nodes (5): 6.1 Strategy, 6.2 Test cases, 6.3 Evidence, 6.4 Known issues, 6. Testing

### Community 94 - "1. Product and UI Concept"
Cohesion: 0.40
Nodes (5): 1.1 Product Vision, 1.2 Core Experience by Role, 1.3 Core UX Principles, 1.4 Primary Student Landing Experience, 1. Product and UI Concept

### Community 95 - "2. Design"
Cohesion: 0.50
Nodes (4): 2.1 Users and roles, 2.2 Key user flows, 2.3 UI design decisions, 2. Design

### Community 96 - "4. Implementation highlights"
Cohesion: 0.50
Nodes (4): 4.1 Audience targeting, 4.2 Permission map, 4.3 Supabase boundary, 4. Implementation highlights

### Community 97 - "student/events/[id]/page.tsx"
Cohesion: 0.67
Nodes (3): StudentEventRedirect(), StudentEventRedirectProps, eventPath()

### Community 98 - "Library"
Cohesion: 0.50
Nodes (3): Library, Loans and silent floors, Opening hours

## Knowledge Gaps
- **508 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+503 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `AuthGate.tsx` to `User`, `security.py`, `cn`, `constants.py`, `Base`, `test_bookings.py`, `conftest.py`, `main.py`, `test_posts.py`, `requests.py`, `Display.tsx`, `listing_service.py`, `info_service.py`, `listings.py`, `1. Product and UI Concept`, `request_service.py`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `cn()` connect `select.tsx` to `app/page.tsx`, `5. Navigation Structure`, `search-results.tsx`, `app/__init__.py`, `ConfirmDialog.tsx`, `bind_user`, `AppShell`, `layout.tsx`, `content/page.tsx`, `ROUTES`, `staff/dashboard/page.tsx`, `popover.tsx`, `constants.ts`, `legacy.tsx`, `tabs.tsx`, `require_permission`, `student/dashboard/page.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `AppError` connect `User` to `security.py`, `apiGet`, `constants.py`, `main.py`, `get_engine`, `requests.py`, `AuthGate.tsx`, `info_service.py`, `1. Product and UI Concept`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `User` (e.g. with `SourceHit` and `Interest`) actually correct?**
  _`User` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _508 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.055345911949685536 - nodes in this community are weakly interconnected._
- **Should `security.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10984848484848485 - nodes in this community are weakly interconnected._