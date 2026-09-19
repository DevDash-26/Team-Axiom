# UniHive — Comprehensive UI/UX Plan

> **Project:** DevDash’26 Hackathon — Universal College Lanka  
> **Product name:** UniHive  
> **Tagline:** Everything campus. One place.  
> **Document purpose:** A practical, implementation-ready UI/UX plan for a four-person hackathon team  
> **Primary source:** `DevDash Hackathon Problem Statement(2).pdf`

---

## Executive Summary

UniHive is a unified digital campus hub for Universal College Lanka (UCL). It replaces fragmented communication across WhatsApp groups, lecturers, notice boards, societies, and word of mouth with one reliable platform for campus information and services.

The product is designed around three clearly separated roles:

- **Student:** discovers information, uses campus services, submits requests, and tracks personal activity.
- **Staff:** publishes approved content and processes operational requests.
- **Administrator:** controls users, staff, roles, content, records, reports, and system settings.

The strongest hackathon version is not the one with the most pages. It is the version that proves a few important workflows end to end:

1. A student finds trusted information through the dashboard or AI assistant.
2. The student submits a classroom request.
3. Staff review and approve the request.
4. The student receives the result.
5. Staff publish a targeted announcement.
6. Only the correct students receive it.
7. An administrator visibly manages roles and records.

This demonstrates unified access, AI assistance, role-based access control, content maintenance, targeted communication, classroom booking, connected data, and working CRUD operations.

---

# 1. Product and UI Concept

## 1.1 Product Vision

**UniHive is UCL’s trusted digital home for campus life.**

It should feel like:

> UCL institutional identity × modern productivity platform × intelligent campus assistant

The interface must appear professional enough to be a real university platform, while remaining realistic for a four-person team to implement during a hackathon.

## 1.2 Core Experience by Role

| Role | Primary Experience |
|---|---|
| Student | Discover, ask, request, track |
| Staff | Publish, review, process, update |
| Administrator | Control, manage, monitor, audit |

## 1.3 Core UX Principles

1. **One trusted source:** Official information should be clearly identified by author, category, audience, and update time.
2. **AI first, not AI only:** Students may ask natural-language questions, but conventional navigation and search must still work.
3. **Role clarity:** Each role sees only relevant pages and actions.
4. **Minimum clicks:** Frequent actions should be available directly from dashboards.
5. **Connected workflows:** Student, staff, and admin actions should update the same shared records.
6. **Trust and transparency:** AI answers should show their sources and last-updated dates.
7. **Accessible simplicity:** First-time users should understand the product without training.
8. **Hackathon realism:** Prioritize reliable, demonstrable features over excessive scope.

## 1.4 Primary Student Landing Experience

The student dashboard opens with:

> **Good morning, Alex**  
> Here’s what’s happening at UCL today.

Directly below it is the main AI entry point:

> **Ask UniHive**  
> Ask about classrooms, events, deadlines, or campus services…

Below the AI bar are four high-value quick actions:

- Find a Room
- Explore Events
- Lost & Found
- Campus Services

The remaining page contains personalized announcements, upcoming events, academic dates, and recent activity.

---

# 2. Requirements and Marks Strategy

## 2.1 Highest-Priority Requirements

| Requirement | Marks | UI Response | Priority |
|---|---:|---|---|
| BR33 — AI Assistant | 9 | Dashboard AI bar, full assistant page, grounded answers, action links | P0 |
| BR12 — Access Levels | 6 | One login, role routing, protected routes, role-specific menus/actions | P0 |
| BR1 — Unified Access | 5 | Single student home, global search, connected content/services | P0 |
| BR8 — Classroom Booking | 5 | Availability search, request form, staff review, status tracking | P0 |
| BR11 — Content Maintenance | 4 | Staff/admin content tables, create/edit/publish/archive actions | P0 |
| BR2 — Targeted Announcements | 3 | Audience filters by programme, year, faculty; personalized feed | P0 |
| BR3 — Event Visibility | 3 | Event listing, event details, filters | P0 |
| BR7 — Lost & Found | 3 | Search, report, status, detail view | P0 |
| BR13 — Academic Calendar | 3 | Deadlines on dashboard and calendar page | P1 |
| BR15 — Emergency Communication | 3 | High-priority banner and emergency publishing option | P1 |
| BR20 — Job & Internship Visibility | 3 | Opportunities section or filtered campus feed | P1 |
| BR23 — Financial Support Info | 3 | Campus Services knowledge content | P1 |
| BR29 — Wellbeing Support | 3 | Campus Services knowledge content | P1 |

## 2.2 Efficient Coverage of Smaller Requirements

Several information-focused requirements can reuse one searchable **Campus Services** structure and the same AI knowledge source:

- FAQ access
- Staff directory
- Financial support
- Sports and recreation
- Dining information
- Printing services
- Wellbeing support
- IT support
- Library resources
- Student onboarding

This provides broader requirement coverage without building a separate application for every topic.

## 2.3 Non-Functional Requirements

| NFR | UI/Implementation Evidence |
|---|---|
| Usability | Clear labels, visible states, simple navigation, empty states, guided forms |
| Performance & Scalability | Pagination, filtered queries, skeletons, compact payloads, reusable components |
| Reliability & Availability | Clear failures, retry options, timestamps, stable demo data |
| Security & Privacy | Authentication, authorization, protected routes, limited personal data, confirmation dialogs |
| Maintainability | Design tokens, shared components, modular pages, consistent naming, documentation |
| Robustness | Client/server validation, required fields, error boundaries, safe empty/loading/error states |

---

# 3. Design System

## 3.1 Brand Direction

Use the supplied UCL logo as the visual reference. The interface should use UCL red sparingly as the primary action and active-state color. White and light grey should dominate the surfaces, with near-black text.

Avoid excessive gradients, bright secondary colors, decorative charts, heavy shadows, glass effects, or generic template styling.

## 3.2 Color Palette

> Confirm the precise primary red against the provided logo asset. Until then, use these recommended tokens.

| Token | HEX | Usage |
|---|---|---|
| Primary / UCL Red | `#E31B23` | Primary buttons, links, active navigation, key accents |
| Primary Hover | `#C9151C` | Button and link hover |
| Primary Pressed | `#A80F16` | Pressed state |
| Primary Soft | `#FFF1F2` | Selected rows/cards, subtle highlights |
| Near Black | `#171717` | Main headings and sidebar |
| Dark Grey | `#404040` | Body text |
| Muted Grey | `#737373` | Metadata and helper text |
| Dashboard Background | `#F7F8FA` | Application background |
| Border | `#E5E7EB` | Dividers, inputs, cards, tables |
| White | `#FFFFFF` | Main surface and cards |
| Success | `#15803D` | Approved, available, completed |
| Success Soft | `#F0FDF4` | Success backgrounds |
| Warning | `#B45309` | Pending and attention states |
| Warning Soft | `#FFFBEB` | Pending backgrounds |
| Error | `#DC2626` | Errors, destructive actions, emergencies |
| Error Soft | `#FEF2F2` | Error backgrounds |
| Info | `#2563EB` | Informational status |
| Info Soft | `#EFF6FF` | Informational backgrounds |

## 3.3 Typography

Use **Inter**, with `system-ui, sans-serif` as the fallback.

| Style | Size / Line Height | Weight |
|---|---|---:|
| Display | 36 / 44 px | 700 |
| H1 | 32 / 40 px | 700 |
| H2 | 24 / 32 px | 700 |
| H3 | 18 / 26 px | 600 |
| Large body | 16 / 24 px | 400 |
| Body | 14 / 22 px | 400 |
| Small | 13 / 18 px | 500 |
| Caption | 12 / 16 px | 500 |
| Button | 14 / 20 px | 600 |

## 3.4 Spacing

Use an 8px-based scale:

`4, 8, 12, 16, 24, 32, 40, 48, 64`

- Page padding: `32px` desktop, `24px` tablet, `16px` mobile
- Card padding: `16–24px`
- Section gap: `24–32px`
- Form field gap: `16px`
- Inline control gap: `8–12px`

## 3.5 Shape and Elevation

| Element | Radius |
|---|---:|
| Buttons | 8px |
| Inputs | 8px |
| Cards | 12px |
| Drawers/modals | 16px |
| Badges | 999px |

Cards use a white background, 1px grey border, and very subtle shadow. Only interactive cards receive stronger hover feedback.

## 3.6 Buttons

### Primary

- Red background
- White text
- 40–44px height
- Used once per main action area where possible
- Example: **Submit Request**

### Secondary

- White background
- Dark text
- Grey border
- Example: **Save Draft**

### Tertiary

- Transparent background
- Red or dark text
- Example: **View Details**

### Destructive

- Red text or red background only inside a confirmed destructive context
- Example: **Delete User**

All buttons require normal, hover, pressed, focus, disabled, and loading states.

## 3.7 Inputs

- Minimum 44px touch height; 48px recommended
- Persistent label above each field
- Placeholder used only as an example
- Helper/error text below field
- 2px primary focus ring
- Red border and clear message on error
- Success state only when useful

## 3.8 Tables

- Sticky or clearly separated header
- Subtle row dividers
- Row hover using `#FAFAFA`
- Status shown as text badges, not color alone
- Typical row actions: **View**, **Edit**, **More**
- Pagination after approximately 10–20 records
- Horizontal scroll or record cards on smaller screens

## 3.9 Iconography

Use **Lucide Icons** consistently. Prefer 18–20px outline icons. Never mix icon styles.

---

# 4. User Roles and Permissions

## 4.1 Student

Students can:

- Register and log in
- Manage their profile
- View personalized announcements and official campus content
- Use the AI assistant
- Browse and express interest in events
- Browse societies and express interest in joining
- Search and report lost/found items
- Search classroom availability and request rooms
- View academic dates
- Access campus services and FAQs
- View their requests, activity, and notifications

Students cannot:

- Publish official content
- Approve requests
- Create staff/admin accounts
- Change permissions
- Access management pages

## 4.2 Staff

Staff can:

- Use the same authentication system
- Access a staff-specific dashboard
- View relevant student records
- Search and filter assigned data
- Publish or update authorized content
- Process room and operational requests
- Manage records within their assigned scope
- View limited operational statistics

Staff cannot:

- Access administrator-only settings
- Assign administrator roles
- Manage all staff permissions
- View unrelated sensitive records

## 4.3 Administrator

Administrators can:

- Access the complete administration dashboard
- Manage students and staff
- Create, read, update, disable, and delete records
- Assign roles and permissions
- Manage all platform content
- View reports and activity history
- Configure important system settings

## 4.4 Permission Matrix

| Capability | Student | Staff | Admin |
|---|:---:|:---:|:---:|
| View campus content | ✓ | ✓ | ✓ |
| Use AI Assistant | ✓ | ✓ | ✓ |
| View events | ✓ | ✓ | ✓ |
| Express event interest | ✓ | — | — |
| Express society interest | ✓ | — | — |
| Submit room request | ✓ | — | ✓ |
| Process room requests | — | ✓ | ✓ |
| Submit lost/found report | ✓ | ✓ | ✓ |
| Manage lost/found records | — | Assigned scope | ✓ |
| Create official content | — | Assigned scope | ✓ |
| Target content by audience | — | Assigned scope | ✓ |
| View student directory | — | Limited | ✓ |
| Manage students | — | Limited/No | ✓ |
| Manage staff | — | — | ✓ |
| Manage permissions | — | — | ✓ |
| View reports | — | Limited | ✓ |
| Configure system | — | — | ✓ |

## 4.5 Authentication and Authorization Flow

Use one login form. Do not ask users to choose their role.

1. User submits university email and password.
2. System validates credentials.
3. System reads the user’s assigned role.
4. User is redirected to the matching dashboard.
5. Every protected page checks authorization again.
6. Unauthorized routes display a friendly 403 page.

Recommended routes:

- Student: `/student/dashboard`
- Staff: `/staff/dashboard`
- Admin: `/admin/dashboard`

Example unauthorized state:

> **You don’t have permission to access this page.**  
> Return to your dashboard or contact an administrator if you believe this is incorrect.

---

# 5. Navigation Structure

## 5.1 Student Navigation

Use a light top navigation on desktop.

- UCL logo + UniHive
- Home
- Discover
  - Events
  - Societies
  - Opportunities
  - Campus Updates
- Services
  - Classroom Booking
  - Lost & Found
  - Academic Support
  - Campus Information
- Calendar
- AI Assistant
- Notifications
- Profile menu
  - My Profile
  - My Activity
  - Settings
  - Logout

## 5.2 Staff Navigation

Use a dark or white sidebar with a clear active state.

- UCL logo + UniHive
- Dashboard
- **Content**
  - Announcements
  - Events
  - Societies
  - Campus Information
- **Requests**
  - Room Requests
  - Lost & Found
  - Student Requests
- **People**
  - Students
- **Tools**
  - AI Assistant
  - Notifications
- Profile
- Logout

## 5.3 Administrator Navigation

- UCL logo + UniHive
- Dashboard
- **Management**
  - Users
  - Staff
  - Roles & Permissions
- **Content**
  - Announcements
  - Events
  - Societies
  - Campus Information
  - Academic Calendar
- **Operations**
  - Room Requests
  - Lost & Found
  - Support Requests
- **System**
  - Reports
  - Activity Log
  - Settings
- Profile
- Logout

---

# 6. Complete Screen Inventory

## P0 — Must Build

1. Login
2. Registration
3. Unauthorized/403 page
4. Student Dashboard
5. AI Assistant
6. Campus Updates / Announcements
7. Events listing
8. Event details
9. Classroom availability and booking
10. Student request history/status
11. Lost & Found listing
12. Lost/Found report form
13. Student profile
14. Staff Dashboard
15. Staff content management
16. Create/Edit Announcement
17. Staff request management
18. Admin Dashboard
19. User management
20. Staff management
21. Roles and permissions view
22. Shared CRUD confirmations and feedback states

## P1 — Build After P0 Works

23. Academic Calendar
24. Societies
25. Opportunities
26. Campus Services / FAQ
27. Notifications Centre
28. Reports
29. Activity Log
30. Forgot Password
31. Emergency/schedule-change publishing

## P2 — Only If Time Remains

32. Student onboarding hub
33. Academic-support matching
34. Facility issue reporting
35. Staff directory
36. Sports and recreation
37. Library information
38. Dining and printing information
39. Textbook exchange
40. Student-life highlights
41. Advanced analytics
42. Advanced permission editor

---

# 7. Student UI

## 7.1 Student Dashboard — P0

**Purpose:** Give a student immediate access to trusted, personalized campus information and frequent tasks.

**Access:** Student only.

### Top-to-Bottom Layout

1. **Top navigation**
   - UCL logo and UniHive wordmark
   - Main navigation
   - Notification bell with unread count
   - Student avatar and menu

2. **Welcome header**
   - Time-aware greeting
   - Short contextual message
   - Optional programme/year chip

3. **AI command bar**
   - Large conversational input
   - Send button
   - Suggested prompts: Upcoming events, Next deadline, Find a classroom, Report lost item

4. **Critical alert**
   - Appears only for high-priority emergency or schedule-change content
   - Shows source and last-updated time
   - Can be dismissed only if appropriate

5. **Quick actions**
   - Find a Room
   - Explore Events
   - Lost & Found
   - Campus Services

6. **Personalized feed**
   - Heading: **For You**
   - Tabs: All, Academic, Events, Societies
   - Each item shows category, audience, title, summary, publisher, and time

7. **Upcoming section**
   - Upcoming Events
   - Academic Dates

8. **Recent activity**
   - Room requests
   - Event interest
   - Lost/found reports

### Important States

- First visit: welcome and suggested actions
- No announcements: helpful empty state
- Loading: skeleton cards
- Error: retry button
- New urgent alert: visible priority treatment without full-screen interruption

## 7.2 AI Assistant — P0

**Purpose:** Help students find and act on campus information using natural language.

**Access:** All authenticated roles; responses/actions vary by permission.

### Layout

1. Page header: **UniHive AI**
2. Supporting text: “Ask anything about UCL campus life.”
3. Optional conversation-history panel on desktop
4. Main conversation area
5. Suggested questions when the conversation is empty
6. Composer fixed near the bottom

### Suggested Prompts

- What events are happening this week?
- Find an available classroom this afternoon.
- When is the next academic deadline?
- How do I contact IT support?

### Response Design

Each response may include:

- Direct answer
- Short supporting details
- Source cards
- Last-updated time
- Relevant action buttons

Example:

> Room 302 appears available from 2:00 PM to 4:00 PM.

Actions:

- **View Room**
- **Request Booking**

### Trust and Safety

- Never present invented information as official.
- Show the source and date where possible.
- Clearly say when reliable information is unavailable.
- Do not reveal staff-only or administrator-only data.

## 7.3 Campus Updates — P0

**Purpose:** Provide one authoritative feed for official and targeted updates.

**Access:** Student, staff, admin; management actions depend on role.

### Layout

1. Page title: **Campus Updates**
2. Search bar
3. Filters: All, University, Programme, Academic, Emergency
4. Optional sort: newest, priority
5. Feed of announcement cards
6. Pagination or load more

### Announcement Card

- Category and audience badge
- Title
- Short summary
- Publisher
- Published/updated time
- Pinned/important indicator
- View details action

## 7.4 Events Listing — P0

**Purpose:** Make university and student-organized events visible.

**Access:** All authenticated roles.

### Layout

1. Page title and description
2. Search bar
3. Filters: All, Academic, Society, Workshop, Guest Lecture
4. Date filter
5. Event-card grid or list

Each card shows title, date, time, venue, organizer, category, short description, interest count, and **View Event**.

Students also see an **Interested** control.

## 7.5 Event Details — P0

**Purpose:** Present complete event information and capture student interest.

**Access:** All authenticated roles.

### Layout

1. Back to Events
2. Hero/banner area
3. Category badge and event title
4. Date, time, venue, organizer
5. Primary CTA: **I’m Interested**
6. Interest count
7. About
8. Schedule or key information
9. Organizer/contact information
10. Related events

States include interested/not interested, event full, event cancelled, completed, and unavailable.

## 7.6 Classroom Availability and Booking — P0

**Purpose:** Let students find available rooms and submit requests without contacting staff manually.

**Access:** Student; staff/admin manage requests separately.

### Layout

1. Page title: **Find a Classroom**
2. Description
3. Search panel:
   - Date
   - Start time
   - End time
   - Capacity
   - Find Rooms button
4. Availability results
5. Room cards with room, floor, capacity, availability, and request CTA

### Request Modal

- Selected room
- Date and time
- Purpose
- Group size
- Optional notes
- **Submit Request**

### Confirmation

> **Request submitted**  
> You’ll be notified when staff reviews your request.

## 7.7 My Requests — P0

**Purpose:** Show the student the status and history of submitted requests.

### Layout

- Tabs: Pending, Approved, Rejected, All
- Request ID
- Type
- Date submitted
- Requested date/time
- Current status
- Staff note or rejection reason
- View details

## 7.8 Lost & Found — P0

**Purpose:** Enable students and staff to report and search for lost or found property.

### Layout

1. Page title
2. Primary buttons: **I Lost Something**, **I Found Something**
3. Search
4. Filters: Lost/Found, Category, Date, Status
5. Item grid/list

Each item displays image/icon, item name, report type, location, date, status, and details action.

### Report Form

- Lost or Found
- Item name
- Description
- Category
- Location
- Date
- Optional image
- Safe contact or handover method
- Submit

Avoid exposing private contact information publicly.

## 7.9 Student Profile — P0

**Purpose:** Let students view and update appropriate personal details.

### Sections

- Avatar and name
- University email and student ID (read-only where appropriate)
- Programme and year
- Notification preferences (P1)
- Recent account activity
- Save changes
- Logout

---

# 8. Staff UI

## 8.1 Staff Dashboard — P0

**Purpose:** Give staff a practical workspace for content and requests requiring attention.

**Access:** Staff and admin.

### Top-to-Bottom Layout

1. Sidebar and top utility bar
2. Page title: **Staff Workspace**
3. Welcome message and staff-role badge
4. Useful statistic cards:
   - Pending room requests
   - Open lost-item reports
   - Draft announcements
   - Upcoming events
5. **Needs Attention** table
6. Quick actions:
   - Create Announcement
   - Create Event
   - Review Requests
7. Recent activity

Clicking a statistic should open the corresponding page with the relevant filter already applied.

## 8.2 Staff Content Management — P0

**Purpose:** Let authorized staff create and maintain official content.

### Layout

1. Page title
2. **Create Announcement** button
3. Search
4. Filters: status, category, audience, author
5. Table columns:
   - Announcement
   - Audience
   - Status
   - Author
   - Updated
   - Actions
6. Pagination

### Create/Edit Announcement

- Title
- Category
- Body
- Audience type
- Programme
- Year
- Faculty, if used
- Priority
- Status: Draft or Published
- Optional schedule date
- Save Draft
- Publish

This page is a key demonstration of targeted announcements, content maintenance, and staff authorization.

## 8.3 Staff Request Management — P0

**Purpose:** Let staff review and process requests quickly.

### Layout

1. Page title: **Room Requests**
2. Summary chips: Pending, Approved, Rejected
3. Search and status/date filters
4. Request table
5. Details drawer on row click

### Detail Drawer

- Student
- Student ID/programme
- Room
- Date and time
- Purpose
- Group size
- Submitted time
- Current status
- Approve
- Reject

Rejection requires a reason. Approval/rejection produces a toast and updates the student’s request history and notification.

## 8.4 Staff Lost & Found Management — P0/P1

- Search and filter reports
- View report details
- Mark matched, claimed, or closed
- Add internal handover note
- Protect personal contact details

## 8.5 Staff Event Management — P1

- Create and edit events
- Publish/unpublish
- View interest count
- Search and filter by date/category/status
- Archive completed events

---

# 9. Administrator UI

## 9.1 Admin Dashboard — P0

**Purpose:** Provide a system-wide management overview.

**Access:** Administrator only.

### Top-to-Bottom Layout

1. Sidebar
2. Top utility bar with search, notifications, and avatar
3. Page title: **Administration**
4. Supporting text: “System overview and management”
5. Statistics:
   - Total active users
   - Staff accounts
   - Active events
   - Pending requests
6. Quick actions:
   - Add User
   - Add Staff
   - Create Announcement
   - Manage Roles
7. Attention Required
8. Content overview table
9. Recent system activity
10. Simple system status: **Operational**

Avoid decorative metrics such as arbitrary productivity percentages.

## 9.2 User Management — P0

**Purpose:** Manage student and general user accounts.

### Layout

1. Page title: **Users**
2. **Add User** button
3. Search by name, ID, or email
4. Filters: role, programme, year, status
5. Table:
   - User
   - ID
   - Programme
   - Role
   - Status
   - Actions
6. Pagination

### Actions

- View
- Edit
- Disable/Enable
- Delete

Deletion always requires confirmation. Prefer disabling an account where historical records must remain intact.

## 9.3 Staff Management — P0

Reuse the user-management components.

Columns:

- Name
- Department
- Staff role
- Permission scope
- Status
- Actions

Actions:

- Add Staff
- View
- Edit
- Deactivate

## 9.4 Roles and Permissions — P0/P1

**Purpose:** Make access control visible and understandable to judges.

For the hackathon, a read-only matrix backed by correctly enforced roles is enough. An enterprise-grade permission builder is unnecessary.

Display each role and its capabilities. If editing is implemented, only administrators may change it, and changes require confirmation.

## 9.5 Record and Content Management — P0

Use shared management patterns for announcements, events, societies, rooms, lost/found, and campus information:

- Create
- View
- Edit
- Publish/Unpublish
- Archive
- Delete with confirmation
- Search
- Filters
- Pagination
- Success/error feedback

## 9.6 Reports — P1

Keep reports simple and useful:

- Content by category/status
- Event interest totals
- Room-request status totals
- Common AI question topics, without exposing private conversations
- Open vs resolved service records

## 9.7 Activity Log — P1

Show:

- Actor
- Action
- Record
- Time
- Result

Examples:

- Sarah published “Semester Registration Deadline.”
- Admin changed John Doe’s role.
- Room request RQ-104 was approved.

---

# 10. Shared Components

## 10.1 Layout

- `AppShell`
- `StudentTopNav`
- `DashboardSidebar`
- `MobileNavigation`
- `TopUtilityBar`
- `PageHeader`
- `SectionHeader`

## 10.2 Forms and Controls

- `Button`
- `IconButton`
- `Input`
- `Textarea`
- `Select`
- `DatePicker`
- `TimePicker`
- `Checkbox`
- `RadioGroup`
- `SearchBar`
- `FilterBar`
- `FileUpload`

## 10.3 Data Display

- `Badge`
- `Avatar`
- `StatCard`
- `QuickActionCard`
- `AnnouncementCard`
- `EventCard`
- `RoomCard`
- `LostItemCard`
- `DataTable`
- `Pagination`
- `Tabs`
- `Timeline`

## 10.4 Feedback and Overlays

- `Modal`
- `Drawer`
- `ConfirmDialog`
- `Toast`
- `Tooltip`
- `EmptyState`
- `Skeleton`
- `Spinner`
- `InlineAlert`
- `ErrorState`

## 10.5 Feature Components

- `AICommandBar`
- `AIChat`
- `AISourceCard`
- `NotificationDropdown`
- `RoleGuard`
- `PermissionGate`
- `AudienceSelector`
- `RequestStatusTracker`

---

# 11. Interaction and State Specifications

## 11.1 Navigation

- Active page: red indicator and light red background
- Hover: subtle background change
- Sidebar groups may collapse
- Mobile sidebar opens as a drawer
- Current location must remain visually clear

## 11.2 Buttons

- Hover: slightly darker color and optional `translateY(-1px)`
- Pressed: remove translation and darken
- Loading: spinner and disabled repeated submission
- Success/error: show toast or inline confirmation
- Transition: `150ms ease`

## 11.3 Cards

Only clickable cards animate. On hover, use a subtle border and shadow change. Do not animate static information cards.

## 11.4 Modals and Drawers

- Fade and slight scale/slide over 150–200ms
- Focus is trapped inside
- Escape closes only when safe
- Destructive actions require an explicit confirmation

## 11.5 Loading States

Use skeletons for:

- Dashboard feed
- Events
- Tables
- AI responses

Use a spinner for short button-level actions.

AI loading copy:

> UniHive is checking campus information…

## 11.6 Empty States

Never leave a blank card or table.

Examples:

> **No pending requests**  
> You’re all caught up.

> **No events found**  
> Try removing a filter or choosing a different date.

## 11.7 Form Validation

- Validate required fields on blur and submission
- Preserve entered data after validation failure
- Put the message next to the relevant field
- Provide a summary when multiple errors exist
- Validate again on the server

## 11.8 Toasts

Desktop: bottom-right. Mobile: near the bottom above navigation.

Examples:

- Announcement published successfully.
- Room request approved.
- Changes saved.
- Unable to save changes. Try again.

## 11.9 CRUD Confirmation

Example deletion dialog:

> **Delete user?**  
> This action cannot be undone. Historical records may also be affected.

Actions:

- Cancel
- Delete User

---

# 12. Responsive Behaviour

## Desktop — 1024px and Above

- Primary judge-demo layout
- Staff/admin use a 240px sidebar
- Student uses top navigation
- Multi-column dashboard
- Full tables
- Drawers for record details

## Tablet — 768px to 1023px

- Sidebar collapses to icons or a drawer
- Dashboard cards become two columns
- Tables may horizontally scroll
- Main spacing reduces

## Mobile — Below 768px

### Student

Bottom navigation:

- Home
- Discover
- AI
- Services
- Profile

### Staff/Admin

- Hamburger opens navigation drawer
- Cards become single-column
- Filters open in a sheet/drawer
- Tables become horizontal scroll or record cards
- Modals become near-full-screen
- Primary actions remain reachable

## Accessibility Requirements

- Keyboard-accessible interactive elements
- Visible focus ring
- Color contrast appropriate for key text/actions
- 44px minimum touch targets
- Text labels or tooltips for unfamiliar icons
- Status must not rely only on color
- Semantic headings and form labels
- Respect reduced-motion preferences

---

# 13. P0 / P1 / P2 Priorities

## P0 — Must Work End to End

- Authentication
- Role-aware redirection
- Protected routes and actions
- Student Dashboard
- AI Assistant with source/action presentation
- Targeted announcements
- Events and event interest
- Classroom search/request
- Staff request approval/rejection
- Student request status and notification
- Lost & Found basic workflow
- Staff Dashboard
- Staff content CRUD
- Admin Dashboard
- User and staff management
- Visible roles/permissions
- Core loading, empty, error, validation, and confirmation states
- Desktop demo quality
- Basic mobile responsiveness

## P1 — After P0 Is Stable

- Academic Calendar
- Societies and society interest
- Opportunities/jobs/internships
- Campus Services / FAQs
- Notification centre
- Emergency and schedule-change publishing
- Reports
- Activity log
- Forgot Password

## P2 — Extra Time Only

- Onboarding hub
- Academic support matching
- Volunteering and alumni pages
- Facility issue reporting
- Textbook exchange
- Dining, printing, sports, and library pages
- Student-life highlights
- Advanced analytics
- Dynamic permission editor
- Dark mode
- Complex notification preferences

---

# 14. Recommended Build Order

## Phase 1 — Foundation

1. Confirm product scope and data model.
2. Add design tokens and reusable UI components.
3. Build the application shell.
4. Implement authentication.
5. Add Student, Staff, and Admin roles.
6. Protect routes and API actions.

**Done when:** all three test accounts log in and reach different authorized dashboards.

## Phase 2 — Student Core

1. Student Dashboard
2. Announcements feed
3. Events listing/details
4. Event interest
5. AI Assistant UI

**Done when:** a student can discover targeted information and ask the assistant a predefined or connected query.

## Phase 3 — Classroom Workflow

1. Classroom availability data
2. Search/filter UI
3. Request modal and submission
4. Staff pending-request table
5. Approve/reject action
6. Student status update and notification

**Done when:** one request moves successfully from student to staff and back to student.

## Phase 4 — Targeted Content Workflow

1. Staff announcement table
2. Create/edit form
3. Audience selector
4. Publish action
5. Student feed filtering

**Done when:** a staff member publishes to Software Engineering Year 2 and only the correct demo student sees it.

## Phase 5 — Additional Coverage

1. Lost & Found
2. Academic Calendar
3. Campus Services knowledge
4. AI retrieval from the same content

## Phase 6 — Administration

1. Admin overview
2. User management
3. Staff management
4. Roles and permissions
5. Shared CRUD and activity overview

## Phase 7 — Quality and Demo Polish

1. Validation
2. Loading/empty/error states
3. Responsive fixes
4. Toasts and confirmation dialogs
5. Demo data reset/check
6. Browser testing
7. Screenshots for the report
8. Final rehearsal

---

# 15. Suggested Four-Person Ownership

| Person | Primary Ownership | Shared Responsibility |
|---|---|---|
| Person 1 | Authentication, database, RBAC, backend/API foundation | Integration and security checks |
| Person 2 | Student dashboard, announcements, events, AI interface | Shared UI components |
| Person 3 | Classroom workflow, Lost & Found, staff processing | API integration and testing |
| Person 4 | Admin/staff UI, CRUD screens, UI consistency, QA, documentation | Visual design and integration support |

Everyone should document their own technical decisions, tests, screenshots, and limitations while they work. Person 4 should assemble and edit the report—not reconstruct the entire project at the end.

---

# 16. Final Judge-Demo Flow

## Demo Preparation

Prepare three accounts:

- `student@ucl.demo`
- `staff@ucl.demo`
- `admin@ucl.demo`

Prepare stable demo data:

- One targeted Software Engineering Year 2 announcement
- At least three events
- At least three rooms
- A known available time slot for Room 302
- At least one lost/found item
- A predictable set of AI answers and sources

## Part 1 — Student

1. Log in as Student.
2. Show the personalized dashboard.
3. Point out the audience label: **Software Engineering · Year 2**.
4. Ask UniHive AI: “I need somewhere to study with my group this afternoon.”
5. Open the suggested available room.
6. Submit a booking request.
7. Show the success confirmation.
8. Open Events and mark one as Interested.
9. Search Lost & Found for “water bottle.”
10. Log out.

Suggested narration:

> Students currently search WhatsApp, notice boards, and multiple informal sources. UniHive gives them one trusted campus platform, and its AI assistant helps them find information without knowing where it is stored.

## Part 2 — Staff

1. Log in as Staff.
2. Land on Staff Workspace.
3. Open the new request under Needs Attention.
4. Approve it.
5. Create an announcement.
6. Target **Software Engineering, Year 2**.
7. Publish it.
8. Log out.

This proves content maintenance, staff permissions, targeted delivery, and operational processing.

## Part 3 — Student Again

1. Log in as the same student.
2. Show the room-approval notification.
3. Show the targeted announcement on the dashboard.

This is the strongest connected-system moment in the demo.

## Part 4 — Administrator

1. Log in as Admin.
2. Show the Admin Dashboard.
3. Open Users and search for the demo student.
4. Show status and role.
5. Open Roles & Permissions.
6. Briefly demonstrate Add/Edit and the Delete confirmation modal.
7. Do not perform a real deletion unless the demo data can be safely reset.

Suggested narration:

> Students, staff, and administrators use the same platform, but every route, navigation item, record, and action is permission-controlled.

## Finish

Return to the student experience and ask:

> What’s happening at UCL this week?

The answer should combine events, announcements, and academic dates with visible sources. Finish on the Student Dashboard, not an admin table.

---

# 17. Judge-Facing Evidence Checklist

## Requirement Coverage

- [ ] One unified student home
- [ ] Targeted announcement is visibly personalized
- [ ] Event listing and interest action work
- [ ] Classroom request completes end to end
- [ ] Lost & Found search/report works
- [ ] Staff content maintenance works
- [ ] Three roles show different permissions
- [ ] Academic dates appear somewhere visible
- [ ] AI answers natural-language questions
- [ ] AI answer includes source and useful action

## Code Quality

- [ ] Shared components instead of duplicated UI
- [ ] Clear file and variable names
- [ ] No hard-coded role checks scattered throughout the app
- [ ] Central design tokens
- [ ] Server-side authorization for protected actions
- [ ] Clean error handling
- [ ] No dead code or unused demo pages

## Report Evidence

- [ ] Problem summary
- [ ] Scope and prioritization rationale
- [ ] Personas/roles
- [ ] User flows
- [ ] Architecture/data model
- [ ] Design-system decisions
- [ ] Testing table with results
- [ ] Screenshots of working flows
- [ ] Known limitations
- [ ] Future improvements
- [ ] Contribution summary

## Live Demo

- [ ] Demo accounts tested
- [ ] Demo data present
- [ ] AI output predictable
- [ ] No broken navigation
- [ ] No unhandled empty states
- [ ] Browser zoom and resolution checked
- [ ] Backup screenshots/video ready
- [ ] One person controls the demo
- [ ] Team rehearsed timing and handovers

---

# 18. Suggested Data Entities

This is a lightweight implementation guide, not a requirement to build a complex database.

- `User`: id, name, email, role, programme, year, status
- `Role`: id, name, permissions
- `Announcement`: id, title, body, category, priority, audience, author, status, timestamps
- `Event`: id, title, category, description, date, time, venue, organizer, status
- `EventInterest`: id, eventId, userId, createdAt
- `Room`: id, name, floor, capacity, status
- `RoomRequest`: id, roomId, userId, date, startTime, endTime, purpose, status, reviewerNote
- `LostFoundItem`: id, type, itemName, category, description, location, date, image, status, reporterId
- `AcademicDate`: id, title, type, date, audience
- `CampusResource`: id, category, title, content, contact, updatedAt
- `Notification`: id, userId, type, title, message, read, createdAt
- `ActivityLog`: id, actorId, action, entityType, entityId, timestamp

---

# 19. Out of Scope for the Hackathon MVP

Unless core functionality is already stable, do not spend time on:

- Integration with unavailable university systems
- Full enterprise permission builders
- Real-time infrastructure monitoring
- Dark mode
- Complex AI agent behavior
- Advanced analytics dashboards
- Separate native mobile apps
- Elaborate animations
- Dozens of independent service pages
- Production-grade email/SMS notification infrastructure

Document these as future extensions instead.

---

# 20. Final Recommendation

The most convincing UniHive implementation is a connected, trustworthy campus platform—not a collection of static dashboard screens.

Concentrate visual-design effort on:

1. Student Dashboard
2. UniHive AI
3. Classroom booking and status flow
4. Staff request workspace
5. Targeted announcement creation
6. Admin user and role management

Concentrate technical effort on:

1. Working authentication
2. Enforced role-based access
3. Shared data across roles
4. Complete CRUD where claimed
5. Stable end-to-end workflows
6. Validation and feedback states
7. Rehearsed demonstration data

The final product should let a judge watch one piece of information or one request move cleanly through **Student → Staff → System → Student**, while the AI layer makes the platform conversationally searchable. That is the clearest proof that UniHive solves the real UCL problem.

---

## Source

- Universal College Lanka, **DevDash’26 Problem Statement** (`DevDash Hackathon Problem Statement(2).pdf`)

