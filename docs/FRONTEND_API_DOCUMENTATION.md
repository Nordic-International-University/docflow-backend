# Frontend API Documentation

This document provides comprehensive API documentation for the task management modules. All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

**Base URL:** `/api/v1`

---

## Table of Contents

1. [Task Category](#1-task-category)
2. [Project Member](#2-project-member)
3. [Project Label](#3-project-label)
4. [Task Label](#4-task-label)
5. [Task Comment](#5-task-comment)
6. [Task Attachment](#6-task-attachment)
7. [Task Watcher](#7-task-watcher)
8. [Task Checklist](#8-task-checklist)
9. [Task Dependency](#9-task-dependency)
10. [Task Time Entry](#10-task-time-entry)
11. [Task Activity](#11-task-activity)

---

## Common Response Formats

### Paginated Response
```typescript
interface PaginatedResponse<T> {
  data: T[]
  count: number
  pageNumber: number
  pageSize: number
}
```

### Error Response
```typescript
interface ErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}
```

---

## 1. Task Category

System-wide task categories for classifying tasks (e.g., Bug, Feature, Enhancement).

**Permissions Required:** `TASK_CATEGORY.LIST`, `TASK_CATEGORY.READ`, `TASK_CATEGORY.CREATE`, `TASK_CATEGORY.UPDATE`, `TASK_CATEGORY.DELETE`

### Endpoints

#### GET `/task-category`
Retrieve all task categories with pagination and filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `search` | string | No | Search by category name |
| `isActive` | boolean | No | Filter by active status |

**Response:**
```typescript
{
  data: [{
    id: string
    name: string
    description?: string
    color?: string       // Hex code, e.g., "#ff4444"
    isActive: boolean
    taskCount?: number   // Number of tasks in this category
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/task-category/:id`
Retrieve a single category by ID.

#### POST `/task-category`
Create a new task category.

**Request Body:**
```typescript
{
  name: string          // Required - 2-100 characters
  description?: string  // Optional
  color?: string        // Optional - Hex code (e.g., "#ff4444")
  isActive?: boolean    // Optional - Default: true
}
```

**Example:**
```json
{
  "name": "Bug",
  "description": "Bug fixes and issue resolution",
  "color": "#ff4444",
  "isActive": true
}
```

#### PATCH `/task-category/:id`
Update a category.

**Request Body:**
```typescript
{
  name?: string         // 2-100 characters
  description?: string
  color?: string        // Hex code
  isActive?: boolean
}
```

#### DELETE `/task-category/:id`
Delete a category (soft delete).

---

## 2. Project Member

Manage project team members and their roles.

**Permission Required:** `PROJECT.MANAGE_MEMBERS`

### Roles
| Role | Description |
|------|-------------|
| `OWNER` | Full project control |
| `MANAGER` | Can manage members and settings |
| `MEMBER` | Can work on tasks |
| `VIEWER` | Read-only access |

### Endpoints

#### GET `/project-member`
Retrieve all project members with pagination and filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `projectId` | UUID | No | Filter by project |
| `userId` | UUID | No | Filter by user |
| `role` | string | No | Filter by role: `OWNER`, `MANAGER`, `MEMBER`, `VIEWER` |
| `search` | string | No | Search by user name, email, or project name |

**Response:**
```typescript
{
  data: [{
    id: string
    projectId: string
    userId: string
    role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER'
    joinedAt: Date
    project: {
      id: string
      name: string
    }
    user: {
      id: string
      fullname: string
    }
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/project-member/:id`
Retrieve a single project member by ID.

#### POST `/project-member`
Add a user to a project.

**Request Body:**
```typescript
{
  projectId: string    // Required - UUID
  userId: string       // Required - UUID
  role?: string        // Optional - Default: 'MEMBER'
}
```

**Example:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "role": "MEMBER"
}
```

#### PATCH `/project-member/:id`
Update a member's role.

**Request Body:**
```typescript
{
  role?: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER'
}
```

#### DELETE `/project-member/:id`
Remove a member from the project.

---

## 3. Project Label

Manage labels/tags for projects. Labels can be assigned to tasks.

**Permission Required:** `PROJECT.MANAGE_LABELS`

### Endpoints

#### GET `/project-label`
Retrieve all project labels.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `projectId` | UUID | No | Filter by project |
| `search` | string | No | Search by label name |

**Response:**
```typescript
{
  data: [{
    id: string
    projectId: string
    name: string
    color: string        // Hex code, e.g., "#ff4444"
    description?: string
    taskCount?: number   // Number of tasks using this label
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/project-label/:id`
Retrieve a single label by ID.

#### POST `/project-label`
Create a new project label.

**Request Body:**
```typescript
{
  projectId: string      // Required - UUID
  name: string           // Required - 2-100 characters
  color: string          // Required - Hex code (e.g., "#ff4444")
  description?: string   // Optional - Max 255 characters
}
```

**Example:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Bug",
  "color": "#ff4444",
  "description": "Bug fixes and issue resolution"
}
```

#### PATCH `/project-label/:id`
Update a label.

**Request Body:**
```typescript
{
  name?: string          // 2-100 characters
  color?: string         // Hex code
  description?: string   // Max 255 characters
}
```

#### DELETE `/project-label/:id`
Delete a label.

---

## 4. Task Label

Assign project labels to tasks. This is a join table between tasks and labels.

**Permission Required:** `TASK.UPDATE`

### Endpoints

#### GET `/task-label`
Retrieve all task-label assignments.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `taskId` | UUID | No | Filter by task |
| `labelId` | UUID | No | Filter by label |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    labelId: string
    label: {
      id: string
      name: string
      color?: string
    }
    createdAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/task-label/:id`
Retrieve a single task-label assignment.

#### POST `/task-label`
Assign a label to a task.

**Request Body:**
```typescript
{
  taskId: string    // Required - UUID
  labelId: string   // Required - UUID
}
```

#### DELETE `/task-label/:id`
Remove a label from a task.

---

## 5. Task Comment

Manage comments on tasks with support for threaded replies.

**Permission Required:** `TASK.COMMENT`

### Endpoints

#### GET `/task-comment`
Retrieve all comments for a task.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | UUID | **Yes** | Task ID to get comments for |
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    userId: string
    content: string
    parentCommentId?: string   // If this is a reply
    isEdited: boolean
    editedAt?: Date
    user: {
      id: string
      fullname: string
      avatar?: string
    }
    repliesCount: number
    reactionsCount: number
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/task-comment/:id`
Retrieve a single comment.

#### POST `/task-comment`
Create a new comment.

**Request Body:**
```typescript
{
  taskId: string           // Required - UUID
  content: string          // Required - Comment text
  parentCommentId?: string // Optional - For replies, parent comment UUID
}
```

**Example (New Comment):**
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "This task needs more clarification on the requirements."
}
```

**Example (Reply):**
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "I agree, let me add more details.",
  "parentCommentId": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### PATCH `/task-comment/:id`
Update a comment.

**Request Body:**
```typescript
{
  content: string   // Required - Updated comment text
}
```

#### DELETE `/task-comment/:id`
Delete a comment (soft delete).

---

## 6. Task Attachment

Manage file attachments on tasks. Links to existing attachment records.

**Permission Required:** `TASK.UPDATE`

### Endpoints

#### GET `/task-attachment`
Retrieve all attachments for tasks.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `taskId` | UUID | No | Filter by task |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    attachmentId: string
    uploadedById: string
    description?: string
    attachment: {
      id: string
      fileName: string
      fileSize: number
      mimeType: string
      url?: string
    }
    uploadedBy: {
      id: string
      fullname: string
    }
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/task-attachment/:id`
Retrieve a single attachment.

#### POST `/task-attachment`
Link an attachment to a task.

**Request Body:**
```typescript
{
  taskId: string        // Required - UUID
  attachmentId: string  // Required - UUID of existing attachment
  description?: string  // Optional - Max 500 characters
}
```

**Note:** The attachment must be uploaded first using the Attachment module before linking to a task.

#### PATCH `/task-attachment/:id`
Update attachment description.

**Request Body:**
```typescript
{
  description?: string  // Max 500 characters
}
```

#### DELETE `/task-attachment/:id`
Remove attachment from task (soft delete).

---

## 7. Task Watcher

Allow users to watch tasks for notifications.

**Permission Required:** `TASK.WATCH`

### Endpoints

#### GET `/task-watcher`
Retrieve all watchers.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `taskId` | UUID | No | Filter by task |
| `userId` | UUID | No | Filter by user |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    userId: string
    user: {
      id: string
      fullname: string
    }
    createdAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### POST `/task-watcher/watch/:taskId`
Watch a task (current authenticated user).

**URL Parameter:** `taskId` - The task UUID to watch

**Response:** `201 Created`

#### DELETE `/task-watcher/unwatch/:taskId`
Unwatch a task (current authenticated user).

**URL Parameter:** `taskId` - The task UUID to unwatch

**Response:** `200 OK`

---

## 8. Task Checklist

Manage checklists with items for tasks. Each task can have multiple checklists, and each checklist can have multiple items.

**Permission Required:** `TASK.UPDATE`

### Endpoints

#### Checklist Endpoints

##### GET `/task-checklist`
Retrieve all checklists for a task.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | UUID | **Yes** | Task ID |
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `search` | string | No | Search by title |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    title: string
    position: number
    items: [{
      id: string
      checklistId: string
      title: string
      isCompleted: boolean
      completedById?: string
      completedAt?: Date
      position: number
      completedBy?: {
        id: string
        fullname: string
      }
      createdAt: Date
      updatedAt: Date
    }]
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

##### GET `/task-checklist/:id`
Retrieve a single checklist with its items.

##### POST `/task-checklist`
Create a new checklist.

**Request Body:**
```typescript
{
  taskId: string     // Required - UUID
  title: string      // Required - 2-255 characters
  position?: number  // Optional - Default: 0
}
```

**Example:**
```json
{
  "taskId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Development Tasks",
  "position": 0
}
```

##### PATCH `/task-checklist/:id`
Update a checklist.

**Request Body:**
```typescript
{
  title?: string     // 2-255 characters
  position?: number  // Min: 0
}
```

##### DELETE `/task-checklist/:id`
Delete a checklist and all its items.

#### Checklist Item Endpoints

##### GET `/task-checklist/:checklistId/items`
Retrieve all items for a checklist.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `search` | string | No | Search by title |

##### GET `/task-checklist/:checklistId/items/:itemId`
Retrieve a single checklist item.

##### POST `/task-checklist/:checklistId/items`
Create a new checklist item.

**Request Body:**
```typescript
{
  title: string      // Required - 2-500 characters
  position?: number  // Optional - Default: 0
}
```

**Example:**
```json
{
  "title": "Complete unit tests",
  "position": 0
}
```

##### PATCH `/task-checklist/:checklistId/items/:itemId`
Update a checklist item.

**Request Body:**
```typescript
{
  title?: string       // 2-500 characters
  isCompleted?: boolean
  position?: number    // Min: 0
}
```

**Example (Toggle Completion):**
```json
{
  "isCompleted": true
}
```

##### DELETE `/task-checklist/:checklistId/items/:itemId`
Delete a checklist item.

---

## 9. Task Dependency

Manage task dependencies (blocking relationships between tasks).

**Permission Required:** `TASK.UPDATE`

### Concepts
- **taskId**: The dependent task (the one being blocked)
- **dependsOnTaskId**: The blocking task (must be completed first)

### Endpoints

#### GET `/task-dependency`
Retrieve all task dependencies.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `taskId` | UUID | No | Filter by dependent task |
| `dependsOnTaskId` | UUID | No | Filter by blocking task |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    dependsOnTaskId: string
    task: {
      id: string
      title: string
      status: string
      priority: string
    }
    dependsOnTask: {
      id: string
      title: string
      status: string
      priority: string
    }
    createdAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/task-dependency/:id`
Retrieve a single dependency.

#### POST `/task-dependency`
Create a task dependency.

**Request Body:**
```typescript
{
  taskId: string          // Required - The dependent task UUID
  dependsOnTaskId: string // Required - The blocking task UUID
}
```

**Example:**
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "dependsOnTaskId": "550e8400-e29b-41d4-a716-446655440001"
}
```

This means: Task `taskId` cannot be started/completed until task `dependsOnTaskId` is completed.

#### DELETE `/task-dependency/:id`
Remove a task dependency.

---

## 10. Task Time Entry

Track time spent on tasks.

**Permission Required:** `TASK.TIME_TRACK`

### Endpoints

#### GET `/task-time-entry`
Retrieve all time entries.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `taskId` | UUID | No | Filter by task |
| `userId` | UUID | No | Filter by user |
| `dateFrom` | string | No | Filter entries from date (ISO 8601) |
| `dateTo` | string | No | Filter entries until date (ISO 8601) |
| `isBillable` | boolean | No | Filter by billable status |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    userId: string
    description?: string
    hours: number
    date: Date
    isBillable: boolean
    user: {
      id: string
      fullname: string
    }
    task: {
      id: string
      title: string
    }
    createdAt: Date
    updatedAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

#### GET `/task-time-entry/:id`
Retrieve a single time entry.

#### POST `/task-time-entry`
Create a new time entry.

**Request Body:**
```typescript
{
  taskId: string       // Required - UUID
  description?: string // Optional - Work description
  hours: number        // Required - Hours worked (positive number)
  date: string         // Required - Date (ISO 8601, e.g., "2024-01-15")
  isBillable?: boolean // Optional - Default: true
}
```

**Example:**
```json
{
  "taskId": "123e4567-e89b-12d3-a456-426614174000",
  "description": "Implemented authentication flow",
  "hours": 2.5,
  "date": "2024-01-15",
  "isBillable": true
}
```

**Note:** The `userId` is automatically set from the authenticated user.

#### PATCH `/task-time-entry/:id`
Update a time entry.

**Request Body:**
```typescript
{
  description?: string
  hours?: number       // Positive number
  date?: string        // ISO 8601 date
  isBillable?: boolean
}
```

#### DELETE `/task-time-entry/:id`
Delete a time entry (soft delete).

**Note:** When time entries are created, updated, or deleted, the task's `actualHours` field is automatically recalculated.

---

## 11. Task Activity

View activity history for tasks (read-only).

**Permission Required:** `TASK.READ`

### Activity Actions
Common action types you may see:
- `CREATED` - Task was created
- `UPDATED` - Task fields were updated
- `STATUS_CHANGED` - Task status changed
- `ASSIGNED` - Task was assigned to a user
- `COMMENTED` - Comment was added
- `ATTACHMENT_ADDED` - File was attached
- `LABEL_ADDED` / `LABEL_REMOVED`
- `DEPENDENCY_ADDED` / `DEPENDENCY_REMOVED`

### Endpoints

#### GET `/task-activity`
Retrieve activity history for a task.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | UUID | **Yes** | Task ID |
| `pageNumber` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `userId` | UUID | No | Filter by user who performed action |
| `action` | string | No | Filter by action type |
| `startDate` | string | No | Filter from date (ISO 8601) |
| `endDate` | string | No | Filter until date (ISO 8601) |

**Response:**
```typescript
{
  data: [{
    id: string
    taskId: string
    userId: string
    action: string
    changes?: Record<string, any>  // What changed
    metadata?: Record<string, any> // Additional context
    user: {
      id: string
      fullname: string
      email: string
    }
    createdAt: Date
  }]
  count: number
  pageNumber: number
  pageSize: number
}
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "...",
      "taskId": "...",
      "userId": "...",
      "action": "STATUS_CHANGED",
      "changes": {
        "status": {
          "old": "IN_PROGRESS",
          "new": "COMPLETED"
        }
      },
      "user": {
        "id": "...",
        "fullname": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 50,
  "pageNumber": 1,
  "pageSize": 10
}
```

#### GET `/task-activity/:id`
Retrieve a single activity record.

---

## TypeScript Types

Here are complete TypeScript interfaces for frontend use:

```typescript
// Enums
type ProjectMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER'

type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'OVERDUE'

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'

// Common types
interface User {
  id: string
  fullname: string
  email?: string
  avatar?: string
}

interface PaginatedResponse<T> {
  data: T[]
  count: number
  pageNumber: number
  pageSize: number
}

// Task Category
interface TaskCategory {
  id: string
  name: string
  description?: string
  color?: string
  isActive: boolean
  taskCount?: number
  createdAt: Date
  updatedAt: Date
}

// Project Member
interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: ProjectMemberRole
  joinedAt: Date
  project?: { id: string; name: string }
  user?: User
  createdAt: Date
  updatedAt: Date
}

// Project Label
interface ProjectLabel {
  id: string
  projectId: string
  name: string
  color: string
  description?: string
  taskCount?: number
  createdAt: Date
  updatedAt: Date
}

// Task Label Assignment
interface TaskLabel {
  id: string
  taskId: string
  labelId: string
  label: {
    id: string
    name: string
    color?: string
  }
  createdAt: Date
}

// Task Comment
interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  parentCommentId?: string
  isEdited: boolean
  editedAt?: Date
  user: User
  repliesCount: number
  reactionsCount: number
  createdAt: Date
  updatedAt: Date
}

// Task Attachment
interface TaskAttachment {
  id: string
  taskId: string
  attachmentId: string
  uploadedById: string
  description?: string
  attachment: {
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    url?: string
  }
  uploadedBy: User
  createdAt: Date
  updatedAt: Date
}

// Task Watcher
interface TaskWatcher {
  id: string
  taskId: string
  userId: string
  user: User
  createdAt: Date
}

// Task Checklist
interface TaskChecklistItem {
  id: string
  checklistId: string
  title: string
  isCompleted: boolean
  completedById?: string
  completedAt?: Date
  position: number
  completedBy?: User
  createdAt: Date
  updatedAt: Date
}

interface TaskChecklist {
  id: string
  taskId: string
  title: string
  position: number
  items: TaskChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

// Task Dependency
interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  task: {
    id: string
    title: string
    status: TaskStatus
    priority: TaskPriority
  }
  dependsOnTask: {
    id: string
    title: string
    status: TaskStatus
    priority: TaskPriority
  }
  createdAt: Date
}

// Task Time Entry
interface TaskTimeEntry {
  id: string
  taskId: string
  userId: string
  description?: string
  hours: number
  date: Date
  isBillable: boolean
  user: User
  task: { id: string; title: string }
  createdAt: Date
  updatedAt: Date
}

// Task Activity
interface TaskActivity {
  id: string
  taskId: string
  userId: string
  action: string
  changes?: Record<string, { old: any; new: any }>
  metadata?: Record<string, any>
  user: User
  createdAt: Date
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Missing or invalid JWT token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate entry (e.g., user already a member) |
| `500` | Internal Server Error |

---

## Examples

### Adding a User to a Project
```javascript
const response = await fetch('/api/v1/project-member', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'project-uuid',
    userId: 'user-uuid',
    role: 'MEMBER'
  })
})
```

### Creating a Task Comment with Reply
```javascript
// Create a reply to an existing comment
const response = await fetch('/api/v1/task-comment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    taskId: 'task-uuid',
    content: 'I agree with this approach.',
    parentCommentId: 'parent-comment-uuid'
  })
})
```

### Watching/Unwatching a Task
```javascript
// Watch a task
await fetch(`/api/v1/task-watcher/watch/${taskId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})

// Unwatch a task
await fetch(`/api/v1/task-watcher/unwatch/${taskId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Creating a Checklist with Items
```javascript
// 1. Create checklist
const checklist = await fetch('/api/v1/task-checklist', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    taskId: 'task-uuid',
    title: 'Development Tasks'
  })
}).then(r => r.json())

// 2. Add items to checklist
await fetch(`/api/v1/task-checklist/${checklist.id}/items`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Write unit tests',
    position: 0
  })
})
```

### Logging Time on a Task
```javascript
await fetch('/api/v1/task-time-entry', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    taskId: 'task-uuid',
    hours: 2.5,
    date: '2024-01-15',
    description: 'Implemented user authentication',
    isBillable: true
  })
})
```

### Getting Task Activity Timeline
```javascript
const activities = await fetch(
  `/api/v1/task-activity?taskId=${taskId}&pageSize=20`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json())

// Display timeline
activities.data.forEach(activity => {
  console.log(`${activity.user.fullname} ${activity.action} at ${activity.createdAt}`)
  if (activity.changes) {
    Object.entries(activity.changes).forEach(([field, change]) => {
      console.log(`  ${field}: ${change.old} -> ${change.new}`)
    })
  }
})
```
