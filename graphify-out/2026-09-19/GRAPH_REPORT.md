# Graph Report - Team-Axiom  (2026-09-19)

## Corpus Check
- 60 files · ~28,078 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 653 nodes · 1057 edges · 41 communities (36 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3406a63`
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

## God Nodes (most connected - your core abstractions)
1. `User` - 39 edges
2. `Base` - 24 edges
3. `Post` - 17 edges
4. `compilerOptions` - 16 edges
5. `get_current_user()` - 15 edges
6. `PostType` - 14 edges
7. `get_optional_user()` - 14 edges
8. `get_settings()` - 13 edges
9. `AppError` - 13 edges
10. `Settings` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AuditLog` --uses--> `Base`  [INFERRED]
  backend/app/models/platform.py → backend/app/db.py
- `Post` --uses--> `Base`  [INFERRED]
  backend/app/models/post.py → backend/app/db.py
- `Society` --uses--> `Base`  [INFERRED]
  backend/app/models/society.py → backend/app/db.py
- `User` --uses--> `Base`  [INFERRED]
  backend/app/models/user.py → backend/app/db.py
- `seed()` --calls--> `get_settings()`  [EXTRACTED]
  backend/app/seed.py → backend/app/config.py

## Import Cycles
- None detected.

## Communities (41 total, 5 thin omitted)

### Community 0 - "User"
Cohesion: 0.08
Nodes (64): BookingStatus, Faculty, InterestTarget, ListingStatus, ListingType, MembershipStatus, Permission, PostStatus (+56 more)

### Community 1 - "security.py"
Cohesion: 0.06
Nodes (51): Any, get_settings(), Settings loaded from the environment. Never hard-code secrets., Settings, _enable_rls(), get_db(), init_db(), Session (+43 more)

### Community 2 - "new/page.tsx"
Cohesion: 0.10
Nodes (34): geistSans, metadata, loginSchema, HomePage(), NewPostPage(), postSchema, AppHeader(), AppHeaderProps (+26 more)

### Community 3 - "Demo Script"
Cohesion: 0.06
Nodes (32): 0. Pre-demo checklist (do this before the judges are ready), 1. Demo accounts, 2. Roles for the pitch, 3. Demo flow (happy path), 4. Show depth (pick 2-3 to highlight in the demo), 5. If something breaks, 6. Likely Q&A (prepare answers), 7. Slide outline (build in the 45-minute window after 3:30 PM) (+24 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (36): eslint, eslint-config-next, dependencies, next, react, react-dom, @supabase/supabase-js, zod (+28 more)

### Community 5 - "Frontend Design"
Cohesion: 0.07
Nodes (28): Accessibility Requirements, Best Practices, Breakpoint Definitions, Card Component Minimum Spec, Card Grid Specification, Common Mistakes, CSS Custom Properties for Layout, Design Tokens (establish these first) (+20 more)

### Community 6 - "DevDash'26 Project Report"
Cohesion: 0.07
Nodes (29): 10. Team contributions, 1.1 Problem understanding, 1.2 Our solution in brief, 1.3 Scope and priorities, 1. Introduction, 2.1 Users and roles, 2.2 Key user flows, 2.3 UI design decisions (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 8 - "DevDash'26 Project Report"
Cohesion: 0.07
Nodes (29): 10. Team contributions, 1.1 Problem understanding, 1.2 Our solution in brief, 1.3 Scope and priorities, 1. Introduction, 2.1 Users and roles, 2.2 Key user flows, 2.3 UI design decisions (+21 more)

### Community 9 - "7. Student UI"
Cohesion: 0.07
Nodes (27): 7.1 Student Dashboard — P0, 7.2 AI Assistant — P0, 7.3 Campus Updates — P0, 7.4 Events Listing — P0, 7.5 Event Details — P0, 7.6 Classroom Availability and Booking — P0, 7.7 My Requests — P0, 7.8 Lost & Found — P0 (+19 more)

### Community 10 - "Base"
Cohesion: 0.17
Nodes (18): Base, Booking, Booking engine: bookable resources and booking requests., Resource, Faq, InfoPage, Info engine tables: pages, FAQs, and staff directory., StaffContact (+10 more)

### Community 11 - "Color Palette"
Cohesion: 0.10
Nodes (21): Accessibility Validation, Audit Results, Best Practices, Brand Strategy, Color Palette, Common Mistakes, Example 1: SaaS Product Color Palette — FinTech App, Example 2: Accessible Color Scheme Audit — Existing Palette (+13 more)

### Community 12 - "Dashboard Designer"
Cohesion: 0.10
Nodes (20): Best Practices, Common Mistakes, Dashboard Designer, Example 1: Design a Sales Performance Dashboard, Example 2: Design an Engineering Metrics Dashboard, Examples, Instructions, Overview (+12 more)

### Community 13 - "conftest.py"
Cohesion: 0.35
Nodes (14): admin_client(), admin_user(), business_client(), business_student(), client(), computing_client(), computing_student(), _create_schema() (+6 more)

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

### Community 20 - "Requirements Traceability (pre-filled from the DevDash'26 Problem Statement)"
Cohesion: 0.22
Nodes (8): A. Business requirements, B. Non-functional requirements, Build engines (why we can cover all 33 requirements), C. Deliberately left out (fill as we cut), D. Assumptions (from the PS and ours), E. Progress summary (update before final push), Requirements Traceability (pre-filled from the DevDash'26 Problem Statement), Status key

### Community 21 - "UniHive_UI_UX_Plan.md"
Cohesion: 0.25
Nodes (7): 15. Suggested Four-Person Ownership, 18. Suggested Data Entities, 19. Out of Scope for the Hackathon MVP, 20. Final Recommendation, Executive Summary, Source, UniHive — Comprehensive UI/UX Plan

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
Cohesion: 0.47
Nodes (5): TestClient, Auth dependency tests. Unit tests do not call Supabase Auth., test_invalid_jwt_is_rejected(), test_me_requires_token(), test_me_returns_profile()

### Community 26 - "10. Shared Components"
Cohesion: 0.33
Nodes (6): 10.1 Layout, 10.2 Forms and Controls, 10.3 Data Display, 10.4 Feedback and Overlays, 10.5 Feature Components, 10. Shared Components

### Community 27 - "4. User Roles and Permissions"
Cohesion: 0.33
Nodes (6): 4.1 Student, 4.2 Staff, 4.3 Administrator, 4.4 Permission Matrix, 4.5 Authentication and Authorization Flow, 4. User Roles and Permissions

### Community 28 - "schemas/user.py"
Cohesion: 0.50
Nodes (4): AuthorPublic, BaseModel, User response schemas. Never include Auth internals., UserPublic

### Community 29 - "17. Judge-Facing Evidence Checklist"
Cohesion: 0.40
Nodes (5): 17. Judge-Facing Evidence Checklist, Code Quality, Live Demo, Report Evidence, Requirement Coverage

### Community 30 - "1. Product and UI Concept"
Cohesion: 0.40
Nodes (5): 1.1 Product Vision, 1.2 Core Experience by Role, 1.3 Core UX Principles, 1.4 Primary Student Landing Experience, 1. Product and UI Concept

### Community 31 - "13. P0 / P1 / P2 Priorities"
Cohesion: 0.50
Nodes (4): 13. P0 / P1 / P2 Priorities, P0 — Must Work End to End, P1 — After P0 Is Stable, P2 — Extra Time Only

### Community 32 - "2. Requirements and Marks Strategy"
Cohesion: 0.50
Nodes (4): 2.1 Highest-Priority Requirements, 2.2 Efficient Coverage of Smaller Requirements, 2.3 Non-Functional Requirements, 2. Requirements and Marks Strategy

### Community 33 - "5. Navigation Structure"
Cohesion: 0.50
Nodes (4): 5.1 Student Navigation, 5.2 Staff Navigation, 5.3 Administrator Navigation, 5. Navigation Structure

### Community 34 - "6. Complete Screen Inventory"
Cohesion: 0.50
Nodes (4): 6. Complete Screen Inventory, P0 — Must Build, P1 — Build After P0 Works, P2 — Only If Time Remains

### Community 35 - "frontend/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **318 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+313 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `security.py`, `Base`, `conftest.py`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `7. Student UI` connect `7. Student UI` to `UniHive_UI_UX_Plan.md`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `3. Design System` connect `3. Design System` to `UniHive_UI_UX_Plan.md`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `User` (e.g. with `Post` and `Society`) actually correct?**
  _`User` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `Base` (e.g. with `Booking` and `Resource`) actually correct?**
  _`Base` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Post` (e.g. with `Base` and `User`) actually correct?**
  _`Post` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _318 weakly-connected nodes found - possible documentation gaps or missing edges._