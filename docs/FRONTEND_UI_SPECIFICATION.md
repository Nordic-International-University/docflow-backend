# Frontend UI Specification

## Sidebar Menu Structure

```
+------------------------------------------+
|  DOCKFLOW                          [=]   |
+------------------------------------------+
|                                          |
|  MAIN                                    |
|  ----------------------------------------|
|  [icon] Dashboard                        |
|  [icon] Projects                    [>]  |
|  [icon] My Tasks                         |
|  [icon] Calendar                         |
|  [icon] Time Tracking                    |
|                                          |
|  WORKSPACE                               |
|  ----------------------------------------|
|  [icon] Documents                        |
|  [icon] Workflows                        |
|  [icon] Reports                     [>]  |
|                                          |
|  ADMINISTRATION                          |
|  ----------------------------------------|
|  [icon] Users                            |
|  [icon] Roles & Permissions              |
|  [icon] Task Categories                  |
|  [icon] Settings                    [>]  |
|  [icon] Audit Logs                       |
|                                          |
+------------------------------------------+
|  [avatar] John Doe                       |
|  Admin                              [:]  |
+------------------------------------------+
```

---

## Page Specifications

---

## 1. Dashboard

**Route:** `/dashboard`

### Layout
```
+------------------------------------------------------------------+
|  Dashboard                                          [Date Range] |
+------------------------------------------------------------------+
|                                                                  |
|  +------------+  +------------+  +------------+  +------------+  |
|  | Tasks      |  | Completed  |  | In Review  |  | Overdue    |  |
|  | 24         |  | 12         |  | 5          |  | 3          |  |
|  | assigned   |  | this week  |  | pending    |  | tasks      |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                  |
|  +--------------------------------+  +-------------------------+ |
|  | My Tasks                  [>]  |  | Recent Activity         | |
|  |--------------------------------|  |-------------------------| |
|  | [x] Design login page     HIGH |  | John updated Task #123  | |
|  | [ ] API integration       MED  |  | 2 min ago               | |
|  | [ ] Write tests           LOW  |  |-------------------------| |
|  | [ ] Code review           MED  |  | Sarah commented on...   | |
|  |                                |  | 15 min ago              | |
|  +--------------------------------+  +-------------------------+ |
|                                                                  |
|  +--------------------------------+  +-------------------------+ |
|  | Time Logged This Week          |  | Upcoming Deadlines      | |
|  |--------------------------------|  |-------------------------| |
|  | [========] 32h / 40h           |  | Task A - Tomorrow       | |
|  | Mon: 8h | Tue: 6h | Wed: 7h    |  | Task B - In 3 days      | |
|  +--------------------------------+  +-------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### Components
| Component | Data Source | Description |
|-----------|-------------|-------------|
| Stats Cards | `/task` aggregation | Count of tasks by status |
| My Tasks | `GET /task?assigneeId={userId}` | User's assigned tasks |
| Recent Activity | `GET /task-activity` | Latest activities across watched tasks |
| Time Logged | `GET /task-time-entry?userId={userId}` | Weekly time summary |
| Upcoming Deadlines | `GET /task?assigneeId={userId}&sortBy=dueDate` | Tasks sorted by due date |

---

## 2. Projects

### 2.1 Projects List

**Route:** `/projects`

### Layout
```
+------------------------------------------------------------------+
|  Projects                        [Search...]  [+ New Project]    |
+------------------------------------------------------------------+
|  [All] [Active] [Archived]                      [Grid] [List]    |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------+  +------------------------+          |
|  | Project Alpha          |  | Project Beta           |          |
|  | [====----] 60%         |  | [========] 100%        |          |
|  |------------------------|  |------------------------|          |
|  | 12 tasks | 3 members   |  | 8 tasks | 5 members    |          |
|  | Due: Jan 30            |  | Completed              |          |
|  | [avatar][avatar][+2]   |  | [avatar][avatar][+3]   |          |
|  +------------------------+  +------------------------+          |
|                                                                  |
|  +------------------------+  +------------------------+          |
|  | Project Gamma          |  | + Create New Project   |          |
|  | [==------] 25%         |  |                        |          |
|  |------------------------|  |  Click to add a new    |          |
|  | 20 tasks | 8 members   |  |  project               |          |
|  | Due: Feb 15            |  |                        |          |
|  +------------------------+  +------------------------+          |
|                                                                  |
+------------------------------------------------------------------+
```

### Components
| Component | Description |
|-----------|-------------|
| Search | Filter projects by name |
| Status Tabs | Filter: All, Active, Archived |
| View Toggle | Grid or List view |
| Project Cards | Show progress, task count, members, deadline |
| Member Avatars | Stacked avatars with overflow count |

---

### 2.2 Project Detail

**Route:** `/projects/:projectId`

### Layout
```
+------------------------------------------------------------------+
|  [<] Projects / Project Alpha                                    |
+------------------------------------------------------------------+
|  [Overview] [Tasks] [Members] [Labels] [Settings]                |
+------------------------------------------------------------------+
```

#### Tab: Overview
```
+------------------------------------------------------------------+
|  Project Alpha                                     [Edit] [...]  |
+------------------------------------------------------------------+
|  Description: Enterprise task management system implementation   |
|  Status: Active | Due Date: Jan 30, 2024 | Owner: John Doe      |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Progress                  |  | Task Distribution            | |
|  |---------------------------|  |------------------------------| |
|  | [============----] 75%    |  |  [PIE CHART]                 | |
|  |                           |  |  - Completed: 15             | |
|  | Completed: 15/20 tasks    |  |  - In Progress: 3            | |
|  | Hours: 120h / 160h est.   |  |  - Not Started: 2            | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Recent Activity           |  | Team Members                 | |
|  |---------------------------|  |------------------------------| |
|  | John updated Task #12     |  | [av] John Doe - Owner        | |
|  | Sarah completed Task #8   |  | [av] Sarah Smith - Manager   | |
|  | Mike added comment        |  | [av] Mike Johnson - Member   | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

#### Tab: Tasks
```
+------------------------------------------------------------------+
|  [+ Add Task]  [Filters v]  [Search...]            [Board][List] |
+------------------------------------------------------------------+
|                                                                  |
|  KANBAN BOARD VIEW:                                              |
|  +-------------+ +-------------+ +-------------+ +-------------+ |
|  | NOT STARTED | | IN PROGRESS | | IN REVIEW   | | COMPLETED   | |
|  |-------------| |-------------| |-------------| |-------------| |
|  | [Task Card] | | [Task Card] | | [Task Card] | | [Task Card] | |
|  | [Task Card] | | [Task Card] | |             | | [Task Card] | |
|  | [Task Card] | |             | |             | | [Task Card] | |
|  |             | |             | |             | |             | |
|  | + Add Task  | | + Add Task  | | + Add Task  | | + Add Task  | |
|  +-------------+ +-------------+ +-------------+ +-------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Task Card Component:**
```
+---------------------------+
| [Bug] [High]              |
| Fix login validation      |
|---------------------------|
| [checkbox] 2/5            |
| [avatar] John | Due: Jan 5|
+---------------------------+
```

#### Tab: Members
```
+------------------------------------------------------------------+
|  Team Members (5)                               [+ Add Member]   |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | [av] | John Doe        | john@example.com | OWNER   | [...] |
|  |------|-----------------|------------------|---------|-------|
|  | [av] | Sarah Smith     | sarah@example.com| MANAGER | [...] |
|  |------|-----------------|------------------|---------|-------|
|  | [av] | Mike Johnson    | mike@example.com | MEMBER  | [...] |
|  |------|-----------------|------------------|---------|-------|
|  | [av] | Lisa Williams   | lisa@example.com | MEMBER  | [...] |
|  |------|-----------------|------------------|---------|-------|
|  | [av] | Tom Brown       | tom@example.com  | VIEWER  | [...] |
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

**Add Member Modal:**
```
+----------------------------------+
|  Add Team Member            [X]  |
+----------------------------------+
|                                  |
|  Search User                     |
|  [Search input with dropdown]    |
|                                  |
|  Role                            |
|  [Dropdown: MEMBER v]            |
|   - OWNER                        |
|   - MANAGER                      |
|   - MEMBER                       |
|   - VIEWER                       |
|                                  |
|  [Cancel]  [Add Member]          |
+----------------------------------+
```

#### Tab: Labels
```
+------------------------------------------------------------------+
|  Project Labels (6)                               [+ Add Label]  |
+------------------------------------------------------------------+
|                                                                  |
|  +--------+  +----------+  +--------+  +------------+            |
|  | Bug    |  | Feature  |  | Urgent |  | Enhancement|            |
|  | #ff4444|  | #44ff44  |  | #ff8800|  | #4488ff    |            |
|  | 5 tasks|  | 12 tasks |  | 2 tasks|  | 8 tasks    |            |
|  +--------+  +----------+  +--------+  +------------+            |
|                                                                  |
|  +------------+  +----------+                                    |
|  | Documentation| | Testing |                                    |
|  | #8844ff    |  | #44ffff |                                     |
|  | 3 tasks    |  | 6 tasks |                                     |
|  +------------+  +----------+                                    |
|                                                                  |
+------------------------------------------------------------------+
```

**Add/Edit Label Modal:**
```
+----------------------------------+
|  Create Label               [X]  |
+----------------------------------+
|                                  |
|  Name *                          |
|  [Bug                    ]       |
|                                  |
|  Color *                         |
|  [#ff4444] [Color Picker]        |
|                                  |
|  Description                     |
|  [Bug fixes and issues   ]       |
|                                  |
|  [Cancel]  [Create Label]        |
+----------------------------------+
```

#### Tab: Settings
```
+------------------------------------------------------------------+
|  Project Settings                                                |
+------------------------------------------------------------------+
|                                                                  |
|  General                                                         |
|  ----------------------------------------------------------------|
|  Project Name     [Project Alpha                           ]     |
|  Description      [Enterprise task management system...    ]     |
|  Status           [Active v]                                     |
|  Start Date       [2024-01-01]                                   |
|  Due Date         [2024-01-30]                                   |
|                                                                  |
|                                      [Cancel]  [Save Changes]    |
|  ----------------------------------------------------------------|
|                                                                  |
|  Danger Zone                                                     |
|  ----------------------------------------------------------------|
|  Archive Project    [Archive]                                    |
|  Delete Project     [Delete]  - This action cannot be undone     |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 3. My Tasks

**Route:** `/my-tasks`

### Layout
```
+------------------------------------------------------------------+
|  My Tasks                                    [+ Create Task]     |
+------------------------------------------------------------------+
|  [All] [To Do] [In Progress] [In Review] [Completed]            |
+------------------------------------------------------------------+
|  [Search...]  [Priority v] [Due Date v] [Project v]              |
+------------------------------------------------------------------+
|                                                                  |
|  TODAY                                                           |
|  +---------------------------------------------------------------+
|  | [ ] | Fix authentication bug        | HIGH   | Project A | > |
|  | [ ] | Review PR #234                 | MEDIUM | Project B | > |
|  +---------------------------------------------------------------+
|                                                                  |
|  TOMORROW                                                        |
|  +---------------------------------------------------------------+
|  | [ ] | Implement user settings page   | MEDIUM | Project A | > |
|  +---------------------------------------------------------------+
|                                                                  |
|  THIS WEEK                                                       |
|  +---------------------------------------------------------------+
|  | [ ] | Write API documentation        | LOW    | Project C | > |
|  | [ ] | Database optimization          | HIGH   | Project A | > |
|  +---------------------------------------------------------------+
|                                                                  |
|  LATER                                                           |
|  +---------------------------------------------------------------+
|  | [ ] | Feature planning Q2            | LOW    | Project B | > |
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

---

## 4. Task Detail

**Route:** `/tasks/:taskId` (Modal or Full Page)

### Layout
```
+------------------------------------------------------------------+
|  [<] Task Detail                              [Watch] [Edit] [X] |
+------------------------------------------------------------------+
|                                                                  |
|  +-----------------------------------------+  +-----------------+|
|  | Fix authentication bug             [>]  |  | Details         ||
|  |-----------------------------------------|  |-----------------||
|  |                                         |  | Status          ||
|  | Description                             |  | [IN_PROGRESS v] ||
|  | The login form is not validating email  |  |                 ||
|  | addresses correctly. Users can submit   |  | Priority        ||
|  | invalid emails.                         |  | [HIGH v]        ||
|  |                                         |  |                 ||
|  | +-------------------------------------+ |  | Category        ||
|  | | Checklist: QA Tasks        [2/4]   | |  | [Bug v]         ||
|  | |-------------------------------------| |  |                 ||
|  | | [x] Write test cases               | |  | Assignee        ||
|  | | [x] Test on staging                | |  | [av] John Doe   ||
|  | | [ ] Code review                    | |  |                 ||
|  | | [ ] Deploy to production           | |  | Due Date        ||
|  | | [+ Add item]                       | |  | [Jan 15, 2024]  ||
|  | +-------------------------------------+ |  |                 ||
|  |                                         |  | Project         ||
|  | +-------------------------------------+ |  | Project Alpha   ||
|  | | Attachments (2)          [+ Add]   | |  |                 ||
|  | |-------------------------------------| |  | Labels          ||
|  | | [doc] requirements.pdf    1.2 MB   | |  | [Bug] [Urgent]  ||
|  | | [img] screenshot.png      245 KB   | |  | [+ Add Label]   ||
|  | +-------------------------------------+ |  |                 ||
|  |                                         |  | Watchers (3)    ||
|  | +-------------------------------------+ |  | [av][av][av]    ||
|  | | Dependencies                        | |  |                 ||
|  | |-------------------------------------| |  | Time Tracking   ||
|  | | Blocked by:                         | |  | 4.5h logged     ||
|  | | - Setup database schema (Completed) | |  | [+ Log Time]    ||
|  | | Blocking:                           | |  |                 ||
|  | | - Deploy to production (Not Started)| |  +-----------------+|
|  | +-------------------------------------+ |                     |
|  |                                         |                     |
|  +-----------------------------------------+                     |
|                                                                  |
|  COMMENTS                                                        |
|  +---------------------------------------------------------------+
|  | [avatar] Write a comment...                         [Send]   |
|  +---------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | [av] Sarah Smith                              2 hours ago    |
|  | I've tested this on staging and found additional issues.     |
|  |                                                               |
|  |    [av] John Doe                              1 hour ago     |
|  |    Thanks, can you share the details?                        |
|  |                                                               |
|  |    [Reply] [Edit] [Delete]                                   |
|  +---------------------------------------------------------------+
|                                                                  |
|  ACTIVITY                                                        |
|  +---------------------------------------------------------------+
|  | [av] John changed status from NOT_STARTED to IN_PROGRESS     |
|  | 3 hours ago                                                   |
|  |---------------------------------------------------------------|
|  | [av] Sarah added label "Urgent"                               |
|  | 5 hours ago                                                   |
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

### Task Detail Sections

| Section | API Endpoint | Description |
|---------|--------------|-------------|
| Header | `GET /task/:id` | Title, watch status |
| Description | `GET /task/:id` | Task description |
| Details Sidebar | `GET /task/:id` | Status, priority, category, assignee, due date |
| Checklist | `GET /task-checklist?taskId={id}` | Checklists with items |
| Attachments | `GET /task-attachment?taskId={id}` | File attachments |
| Dependencies | `GET /task-dependency?taskId={id}` | Blocking/blocked by tasks |
| Labels | `GET /task-label?taskId={id}` | Assigned labels |
| Watchers | `GET /task-watcher?taskId={id}` | Users watching this task |
| Time Tracking | `GET /task-time-entry?taskId={id}` | Logged time entries |
| Comments | `GET /task-comment?taskId={id}` | Comments and replies |
| Activity | `GET /task-activity?taskId={id}` | Activity history |

---

## 5. Calendar

**Route:** `/calendar`

### Layout
```
+------------------------------------------------------------------+
|  Calendar                           [Today]  [< Jan 2024 >]      |
+------------------------------------------------------------------+
|  [Month] [Week] [Day]                          [+ Create Task]   |
+------------------------------------------------------------------+
|                                                                  |
|  +------+------+------+------+------+------+------+              |
|  | Sun  | Mon  | Tue  | Wed  | Thu  | Fri  | Sat  |              |
|  +------+------+------+------+------+------+------+              |
|  |      |      |      |  1   |  2   |  3   |  4   |              |
|  |      |      |      |      |[task]|      |      |              |
|  +------+------+------+------+------+------+------+              |
|  |  5   |  6   |  7   |  8   |  9   |  10  |  11  |              |
|  |      |[task]|      |[task]|      |[task]|      |              |
|  |      |[task]|      |      |      |[task]|      |              |
|  +------+------+------+------+------+------+------+              |
|  |  12  |  13  |  14  |  15  |  16  |  17  |  18  |              |
|  |[task]|      |[task]|      |      |      |      |              |
|  +------+------+------+------+------+------+------+              |
|  |  19  |  20  |  21  |  22  |  23  |  24  |  25  |              |
|  |      |      |[task]|[task]|      |      |      |              |
|  +------+------+------+------+------+------+------+              |
|  |  26  |  27  |  28  |  29  |  30  |  31  |      |              |
|  |      |[task]|      |      |[task]|      |      |              |
|  +------+------+------+------+------+------+------+              |
|                                                                  |
+------------------------------------------------------------------+
```

### Features
- Color-coded by project or priority
- Click task to open detail modal
- Drag and drop to reschedule
- Filter by project, assignee

---

## 6. Time Tracking

**Route:** `/time-tracking`

### Layout
```
+------------------------------------------------------------------+
|  Time Tracking                                   [+ Log Time]    |
+------------------------------------------------------------------+
|  [This Week v]  [All Projects v]  [Export CSV]                   |
+------------------------------------------------------------------+
|                                                                  |
|  Weekly Summary                                                  |
|  +---------------------------------------------------------------+
|  |  Mon    Tue    Wed    Thu    Fri    Sat    Sun    TOTAL      |
|  |  8.0h   7.5h   6.0h   8.0h   4.5h   0.0h   0.0h   34.0h      |
|  |  [===================================================================] |
|  +---------------------------------------------------------------+
|                                                                  |
|  Time Entries                                                    |
|  +---------------------------------------------------------------+
|  | Date       | Task                    | Hours | Billable | ... |
|  |------------|-------------------------|-------|----------|-----|
|  | Jan 15     | Fix auth bug            | 2.5h  | Yes      | [x] |
|  | Jan 15     | Code review             | 1.5h  | Yes      | [x] |
|  | Jan 14     | API documentation       | 3.0h  | No       | [ ] |
|  | Jan 14     | Team meeting            | 1.0h  | Yes      | [x] |
|  | Jan 13     | Database optimization   | 4.0h  | Yes      | [x] |
|  +---------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | By Project                |  | Billable vs Non-Billable     | |
|  |---------------------------|  |------------------------------| |
|  | Project Alpha    18.5h    |  |  [PIE CHART]                 | |
|  | Project Beta     10.0h    |  |  Billable: 28h (82%)         | |
|  | Project Gamma     5.5h    |  |  Non-billable: 6h (18%)      | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

**Log Time Modal:**
```
+----------------------------------+
|  Log Time                   [X]  |
+----------------------------------+
|                                  |
|  Task *                          |
|  [Search or select task v]       |
|                                  |
|  Date *                          |
|  [2024-01-15]                    |
|                                  |
|  Hours *                         |
|  [2.5]                           |
|                                  |
|  Description                     |
|  [Implemented login flow...]     |
|                                  |
|  [x] Billable                    |
|                                  |
|  [Cancel]  [Log Time]            |
+----------------------------------+
```

---

## 7. Documents

**Route:** `/documents`

### Layout
```
+------------------------------------------------------------------+
|  Documents                       [Search...]  [+ Upload]         |
+------------------------------------------------------------------+
|  [All] [My Uploads] [Shared with me]           [Grid] [List]     |
+------------------------------------------------------------------+
|                                                                  |
|  Folders                                                         |
|  +----------+  +----------+  +----------+  +----------+          |
|  | [folder] |  | [folder] |  | [folder] |  | [folder] |          |
|  | Project  |  | Templates|  | Reports  |  | Archive  |          |
|  | Alpha    |  |          |  |          |  |          |          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                  |
|  Recent Files                                                    |
|  +---------------------------------------------------------------+
|  | [pdf] | requirements.pdf    | 1.2 MB | Jan 15 | John    | ... |
|  | [doc] | project_plan.docx   | 856 KB | Jan 14 | Sarah   | ... |
|  | [xls] | budget_2024.xlsx    | 2.1 MB | Jan 12 | Mike    | ... |
|  | [img] | wireframes.png      | 3.4 MB | Jan 10 | Lisa    | ... |
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

---

## 8. Reports

**Route:** `/reports`

### Sub-menu
```
Reports >
  - Project Progress
  - Time Reports
  - Team Performance
  - Task Analytics
```

### 8.1 Project Progress Report

**Route:** `/reports/project-progress`

```
+------------------------------------------------------------------+
|  Project Progress Report                         [Export PDF]    |
+------------------------------------------------------------------+
|  [Select Project v]  [Date Range: Last 30 days v]                |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | Project Status Overview                                       |
|  |---------------------------------------------------------------|
|  | [PROGRESS BAR CHART showing tasks by status over time]        |
|  +---------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  | Task Completion Rate      |  | Time vs Estimate             | |
|  |---------------------------|  |------------------------------| |
|  | This Week: 85%            |  | Estimated: 160h              | |
|  | Last Week: 72%            |  | Actual: 142h                 | |
|  | Trend: +13% improvement   |  | Remaining: 18h               | |
|  +---------------------------+  +------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 8.2 Time Reports

**Route:** `/reports/time`

```
+------------------------------------------------------------------+
|  Time Reports                                    [Export CSV]    |
+------------------------------------------------------------------+
|  [User v] [Project v] [Date Range v]  [Billable Only: [ ]]       |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | [BAR CHART: Hours by day/week/month]                          |
|  +---------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | User          | Project       | Task           | Hours | Rate |
|  |---------------|---------------|----------------|-------|------|
|  | John Doe      | Project Alpha | Auth bug fix   | 12.5h | $150 |
|  | John Doe      | Project Beta  | API work       | 8.0h  | $150 |
|  | Sarah Smith   | Project Alpha | Testing        | 15.0h | $120 |
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

---

## 9. Users (Admin)

**Route:** `/admin/users`

### Layout
```
+------------------------------------------------------------------+
|  User Management                                 [+ Add User]    |
+------------------------------------------------------------------+
|  [Search...]  [Role v]  [Status v]                               |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | [av] | Name            | Email           | Role    | Status  |
|  |------|-----------------|-----------------|---------|---------|
|  | [av] | John Doe        | john@ex.com     | Admin   | Active  |
|  | [av] | Sarah Smith     | sarah@ex.com    | Manager | Active  |
|  | [av] | Mike Johnson    | mike@ex.com     | User    | Active  |
|  | [av] | Lisa Williams   | lisa@ex.com     | User    | Inactive|
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

---

## 10. Task Categories (Admin)

**Route:** `/admin/task-categories`

### Purpose
System-wide task categories for classifying tasks. Unlike Project Labels (which are project-specific), Task Categories are global and available across all projects.

**Examples:** Bug, Feature, Enhancement, Documentation, Research, Support, etc.

### Layout
```
+------------------------------------------------------------------+
|  Task Categories                             [+ Add Category]    |
+------------------------------------------------------------------+
|  [All] [Active] [Inactive]                    [Search...]        |
+------------------------------------------------------------------+
|                                                                  |
|  +----------+  +-----------+  +-------------+  +-----------+     |
|  | Bug      |  | Feature   |  | Enhancement |  | Support   |     |
|  | #ff4444  |  | #44ff44   |  | #4488ff     |  | #ff8800   |     |
|  |----------|  |-----------|  |-------------|  |-----------|     |
|  | 45 tasks |  | 120 tasks |  | 32 tasks    |  | 18 tasks  |     |
|  | Active   |  | Active    |  | Active      |  | Inactive  |     |
|  | [Edit]   |  | [Edit]    |  | [Edit]      |  | [Edit]    |     |
|  +----------+  +-----------+  +-------------+  +-----------+     |
|                                                                  |
|  +-------------+  +------------+  +----------+                   |
|  | Documentation|  | Research  |  | Testing  |                   |
|  | #8844ff     |  | #44ffff   |  | #ffff44  |                    |
|  |-------------|  |-----------|  |----------|                    |
|  | 28 tasks    |  | 15 tasks  |  | 52 tasks |                    |
|  | Active      |  | Active    |  | Active   |                    |
|  | [Edit]      |  | [Edit]    |  | [Edit]   |                    |
|  +-------------+  +------------+  +----------+                   |
|                                                                  |
+------------------------------------------------------------------+
```

### Alternative: List View
```
+------------------------------------------------------------------+
|  Task Categories                             [+ Add Category]    |
+------------------------------------------------------------------+
|  [Search...]  [Status: All v]                      [Grid] [List] |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | Color | Name          | Description              | Tasks | Status   | Actions |
|  |-------|---------------|--------------------------|-------|----------|---------|
|  | #ff44 | Bug           | Bug fixes and issues     | 45    | Active   | [...]   |
|  | #44ff | Feature       | New feature development  | 120   | Active   | [...]   |
|  | #4488 | Enhancement   | Improvements to existing | 32    | Active   | [...]   |
|  | #ff88 | Support       | Customer support tickets | 18    | Inactive | [...]   |
|  | #8844 | Documentation | Docs and guides          | 28    | Active   | [...]   |
|  +---------------------------------------------------------------+
|                                                                  |
+------------------------------------------------------------------+
```

### Add/Edit Category Modal
```
+----------------------------------+
|  Create Category            [X]  |
+----------------------------------+
|                                  |
|  Name *                          |
|  [Bug                       ]    |
|                                  |
|  Description                     |
|  [Bug fixes and issues      ]    |
|                                  |
|  Color                           |
|  [#ff4444] [Color Picker ▼]      |
|                                  |
|  +---------------------------+   |
|  | Preview:                  |   |
|  | +-------+                 |   |
|  | | Bug   | <- colored tag  |   |
|  | +-------+                 |   |
|  +---------------------------+   |
|                                  |
|  Status                          |
|  [x] Active                      |
|                                  |
|  [Cancel]  [Save Category]       |
+----------------------------------+
```

### Features
| Feature | Description |
|---------|-------------|
| Color Picker | Visual color selection with preset colors |
| Preview | Live preview of how the category tag will look |
| Task Count | Shows how many tasks are using this category |
| Active/Inactive | Deactivate categories without deleting |
| Search | Filter categories by name |

### API Integration
| Action | Endpoint |
|--------|----------|
| List | `GET /task-category` |
| Create | `POST /task-category` |
| Update | `PATCH /task-category/:id` |
| Delete | `DELETE /task-category/:id` |

### Usage in Task Form
When creating/editing a task, Task Category appears as a dropdown:
```
+----------------------------------+
|  Category                        |
|  [Bug ▼                     ]    |
|   +---------------------------+  |
|   | [●] Bug                   |  |
|   | [●] Feature               |  |
|   | [●] Enhancement           |  |
|   | [●] Documentation         |  |
|   | [●] Research              |  |
|   +---------------------------+  |
+----------------------------------+
```

---

## 11. Roles & Permissions (Admin)

**Route:** `/admin/roles`

### Layout
```
+------------------------------------------------------------------+
|  Roles & Permissions                             [+ Create Role] |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+  +---------------------------------------+ |
|  | Roles            |  | Admin                          [Edit] | |
|  |------------------|  |---------------------------------------| |
|  | > Admin          |  | Description: Full system access       | |
|  |   Manager        |  |                                       | |
|  |   Team Lead      |  | Permissions:                          | |
|  |   Developer      |  | +-----------------------------------+ | |
|  |   Viewer         |  | | PROJECT                           | | |
|  |                  |  | | [x] Create  [x] Read              | | |
|  |                  |  | | [x] Update  [x] Delete            | | |
|  |                  |  | | [x] Manage Members                | | |
|  |                  |  | | [x] Manage Labels                 | | |
|  |                  |  | +-----------------------------------+ | |
|  |                  |  | | TASK                              | | |
|  |                  |  | | [x] Create  [x] Read              | | |
|  |                  |  | | [x] Update  [x] Delete            | | |
|  |                  |  | | [x] Comment [x] Watch             | | |
|  |                  |  | | [x] Time Track                    | | |
|  |                  |  | +-----------------------------------+ | |
|  +------------------+  +---------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 12. Settings (Admin)

**Route:** `/admin/settings`

### Sub-menu
```
Settings >
  - General
  - Email Templates
  - Integrations
  - Backup
```

---

## 13. Audit Logs (Admin)

**Route:** `/admin/audit-logs`

### Layout
```
+------------------------------------------------------------------+
|  Audit Logs                                      [Export]        |
+------------------------------------------------------------------+
|  [Search...]  [User v]  [Action v]  [Date Range v]               |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------------------------------------------+
|  | Timestamp           | User        | Action  | Resource   | ID |
|  |---------------------|-------------|---------|------------|-----|
|  | 2024-01-15 10:30:00 | John Doe    | UPDATE  | Task       | #123|
|  | 2024-01-15 10:25:00 | Sarah Smith | CREATE  | Comment    | #456|
|  | 2024-01-15 10:20:00 | Mike Johnson| DELETE  | Attachment | #789|
|  | 2024-01-15 10:15:00 | John Doe    | CREATE  | TimeEntry  | #012|
|  +---------------------------------------------------------------+
|                                                                  |
|  [< Previous]  Page 1 of 50  [Next >]                            |
|                                                                  |
+------------------------------------------------------------------+
```

**Detail View (click on row):**
```
+----------------------------------+
|  Audit Log Detail           [X]  |
+----------------------------------+
|                                  |
|  Action: UPDATE                  |
|  Resource: Task                  |
|  Resource ID: #123               |
|  User: John Doe                  |
|  Timestamp: 2024-01-15 10:30:00  |
|                                  |
|  Changes:                        |
|  +----------------------------+  |
|  | Field    | Old     | New   |  |
|  |----------|---------|-------|  |
|  | status   | PENDING | DONE  |  |
|  | priority | LOW     | HIGH  |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
```

---

## Component Library Summary

### Common Components Needed

| Component | Usage |
|-----------|-------|
| `DataTable` | Lists with sorting, filtering, pagination |
| `KanbanBoard` | Task board with drag & drop |
| `Modal` | Dialogs for create/edit forms |
| `Card` | Project cards, task cards |
| `Avatar` | User avatars with initials fallback |
| `AvatarStack` | Stacked avatars for team display |
| `Badge` | Status, priority, labels |
| `Dropdown` | Select menus, action menus |
| `DatePicker` | Date selection |
| `DateRangePicker` | Date range selection |
| `SearchInput` | Search with debounce |
| `Tabs` | Tab navigation |
| `Progress` | Progress bars |
| `Chart` | Pie, bar, line charts |
| `EmptyState` | No data placeholder |
| `LoadingState` | Loading skeletons |
| `Toast` | Notifications |
| `ConfirmDialog` | Delete confirmations |
| `RichTextEditor` | Comment/description editing |
| `FileUpload` | Drag & drop file upload |
| `ColorPicker` | Label color selection |
| `Checkbox` | Checklist items |
| `Timeline` | Activity feed |

---

## State Management Recommendations

```typescript
// Suggested store structure

interface AppState {
  // Auth
  auth: {
    user: User | null
    token: string | null
    permissions: string[]
  }

  // Projects
  projects: {
    list: Project[]
    current: Project | null
    loading: boolean
  }

  // Tasks
  tasks: {
    list: Task[]
    filters: TaskFilters
    view: 'board' | 'list'
    loading: boolean
  }

  // Current Task (for detail view)
  currentTask: {
    data: Task | null
    comments: Comment[]
    checklists: Checklist[]
    attachments: Attachment[]
    activities: Activity[]
    watchers: Watcher[]
    timeEntries: TimeEntry[]
    loading: boolean
  }

  // UI State
  ui: {
    sidebarCollapsed: boolean
    theme: 'light' | 'dark'
    modals: {
      taskDetail: boolean
      addMember: boolean
      // ...
    }
  }
}
```

---

## API Integration Tips

1. **Use React Query / TanStack Query** for data fetching and caching
2. **Implement optimistic updates** for checklist items, comments
3. **Use WebSocket** for real-time updates (comments, status changes)
4. **Debounce search inputs** (300ms delay)
5. **Prefetch** project data on hover for faster navigation
6. **Cache invalidation** - Invalidate related queries on mutations

```typescript
// Example with React Query
const { data: tasks } = useQuery({
  queryKey: ['tasks', projectId, filters],
  queryFn: () => taskApi.getAll({ projectId, ...filters })
})

const updateTask = useMutation({
  mutationFn: taskApi.update,
  onSuccess: () => {
    queryClient.invalidateQueries(['tasks'])
    queryClient.invalidateQueries(['task-activity'])
  }
})
```
