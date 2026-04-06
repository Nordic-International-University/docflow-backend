# Task Manager Frontend Qo'llanmasi

Bu hujjat frontend dasturchilari uchun Task Manager bo'limini ishlab chiqish bo'yicha qo'llanma.

## Mundarija

1. [Umumiy ko'rinish](#umumiy-korinish)
2. [Boshlash tartibi](#boshlash-tartibi)
3. [API Endpoints](#api-endpoints)
4. [Ma'lumot turlari (TypeScript)](#malumot-turlari)
5. [Kanban Board implementatsiyasi](#kanban-board)
6. [Sprint implementatsiyasi](#sprint)
7. [Namuna kodlar](#namuna-kodlar)

---

## Umumiy ko'rinish

Task Manager tizimi quyidagi asosiy komponentlardan iborat:

```
Project (Loyiha)
├── BoardColumn[] (Kanban ustunlari)
├── Sprint[] (Scrum sprintlari)
└── Task[] (Vazifalar)
    ├── boardColumnId (qaysi ustunda)
    ├── sprintId (qaysi sprintda)
    ├── taskNumber (PROJ-1, PROJ-2)
    └── assignees[] (tayinlangan xodimlar)
```

### Asosiy xususiyatlar:
- **Kanban Board**: Vazifalarni ustunlar bo'yicha ko'rish va drag-drop
- **Sprint Board**: Scrum metodologiyasi bo'yicha ishlash
- **Hybrid Dashboard**: Bir loyihada ham Kanban, ham Sprint ishlatish mumkin

---

## Boshlash tartibi

Frontend ishlab chiqishni quyidagi tartibda boshlash tavsiya etiladi:

### 1-bosqich: Loyihalar ro'yxati (Project List)
```
GET /api/v1/project
```
- Barcha loyihalar ro'yxatini ko'rsatish
- Har bir loyiha uchun vazifalar soni ko'rsatish

### 2-bosqich: Board Columns (Kanban ustunlari)
```
GET /api/v1/board-column?projectId={id}
```
- Loyiha tanlanganda ustunlarni yuklash
- Agar ustunlar bo'lmasa, default ustunlar yaratish

### 3-bosqich: Vazifalar ro'yxati (Tasks)
```
GET /api/v1/task?projectId={id}
```
- Vazifalarni yuklash va ustunlar bo'yicha guruhlash

### 4-bosqich: Vazifa yaratish/tahrirlash
```
POST /api/v1/task
PATCH /api/v1/task/:id
```

### 5-bosqich: Sprint funksionalligi (ixtiyoriy)
```
GET /api/v1/sprint?projectId={id}
```

---

## API Endpoints

### Project (Loyiha)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/project` | Barcha loyihalar |
| GET | `/api/v1/project/:id` | Bitta loyiha |
| POST | `/api/v1/project` | Yangi loyiha |
| PATCH | `/api/v1/project/:id` | Loyihani tahrirlash |
| DELETE | `/api/v1/project/:id` | Loyihani o'chirish |

### Board Column (Kanban ustunlari)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/board-column?projectId={id}` | Loyiha ustunlari |
| POST | `/api/v1/board-column` | Yangi ustun |
| PATCH | `/api/v1/board-column/:id` | Ustunni tahrirlash |
| DELETE | `/api/v1/board-column/:id` | Ustunni o'chirish |
| POST | `/api/v1/board-column/reorder` | Ustunlar tartibini o'zgartirish |

### Task (Vazifa)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/task?projectId={id}` | Vazifalar ro'yxati |
| GET | `/api/v1/task/:id` | Bitta vazifa (to'liq ma'lumot) |
| POST | `/api/v1/task` | Yangi vazifa |
| PATCH | `/api/v1/task/:id` | Vazifani tahrirlash |
| DELETE | `/api/v1/task/:id` | Vazifani o'chirish |

### Sprint

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/sprint?projectId={id}` | Sprintlar ro'yxati |
| GET | `/api/v1/sprint/:id` | Bitta sprint |
| POST | `/api/v1/sprint` | Yangi sprint |
| PATCH | `/api/v1/sprint/:id` | Sprintni tahrirlash |
| DELETE | `/api/v1/sprint/:id` | Sprintni o'chirish |
| POST | `/api/v1/sprint/:id/start` | Sprintni boshlash |
| POST | `/api/v1/sprint/:id/complete` | Sprintni yakunlash |
| POST | `/api/v1/sprint/:id/cancel` | Sprintni bekor qilish |

---

## Ma'lumot turlari

### Project
```typescript
interface Project {
  id: string
  name: string
  description?: string
  key: string                    // "PROJ", "HR", "DEV" - qisqa kod
  status: ProjectStatus
  departmentId?: string
  startDate?: Date
  endDate?: Date
  color?: string                 // "#3B82F6"
  icon?: string
  taskCounter: number            // Avtomatik task raqamlash uchun
  defaultSprintDays?: number     // Default: 14 kun
}

type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
```

### BoardColumn
```typescript
interface BoardColumn {
  id: string
  projectId: string
  name: string                   // "To Do", "In Progress", "Done"
  color?: string                 // "#3B82F6"
  position: number               // Tartib raqami (0, 1, 2, ...)
  wipLimit?: number              // WIP limit (masalan: 5)
  isClosed: boolean              // true = vazifalar yakunlangan hisoblanadi
  isDefault: boolean             // true = yangi vazifalar shu ustunda
  _count?: {
    tasks: number
  }
}
```

### Task
```typescript
interface Task {
  id: string
  taskNumber: number             // 1, 2, 3 -> ko'rinishi: "PROJ-1"
  title: string
  description?: string
  projectId: string
  categoryId?: string
  status: TaskStatus
  priority: TaskPriority
  createdById: string
  parentTaskId?: string          // Subtask uchun
  boardColumnId?: string         // Kanban ustuni
  sprintId?: string              // Sprint
  storyPoints?: number           // Scrum ball (1, 2, 3, 5, 8, 13)
  coverImageUrl?: string         // Karta rasmi
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  estimatedHours?: number
  actualHours?: number
  position: number               // Ustun ichidagi tartib
  isArchived: boolean

  // Relations
  project?: Project
  category?: TaskCategory
  assignees?: TaskAssignee[]
  labels?: TaskLabel[]
  _count?: {
    subtasks: number
    comments: number
    attachments: number
  }
}

type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'
```

### Sprint
```typescript
interface Sprint {
  id: string
  projectId: string
  name: string                   // "Sprint 1", "Sprint 2"
  goal?: string                  // Sprint maqsadi
  startDate: Date
  endDate: Date
  status: SprintStatus
  velocity?: number              // Yakunlanganda hisoblangan ball
  sprintNumber: number           // 1, 2, 3 (avtomatik)
  _count?: {
    tasks: number
  }
}

type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
```

### TaskCategory
```typescript
interface TaskCategory {
  id: string
  name: string                   // "Bug", "Feature", "Task"
  description?: string
  color?: string                 // "#FF0000"
  icon?: string                  // "bug", "sparkles"
}
```

---

## Kanban Board

### Asosiy komponentlar

```
KanbanBoard
├── KanbanColumn (har bir ustun)
│   ├── ColumnHeader (nom, WIP limit, menu)
│   └── TaskCard[] (vazifa kartalari)
│       ├── TaskTitle
│       ├── TaskLabels
│       ├── TaskAssignees
│       └── TaskMeta (due date, comments count)
└── AddColumnButton
```

### Drag-and-Drop implementatsiyasi

Vazifani boshqa ustun yoki pozitsiyaga ko'chirganda:

```typescript
// Vazifani boshqa ustun/pozitsiyaga ko'chirish
async function moveTask(taskId: string, newColumnId: string, newPosition: number) {
  await api.patch(`/task/${taskId}`, {
    boardColumnId: newColumnId,
    position: newPosition
  })
}
```

### Default ustunlarni yaratish

Agar loyihada ustunlar bo'lmasa, quyidagi default ustunlarni yarating:

```typescript
const defaultColumns = [
  { name: 'Backlog', color: '#6B7280', position: 0, isDefault: true },
  { name: 'To Do', color: '#3B82F6', position: 1 },
  { name: 'In Progress', color: '#F59E0B', position: 2, wipLimit: 5 },
  { name: 'In Review', color: '#8B5CF6', position: 3, wipLimit: 3 },
  { name: 'Done', color: '#10B981', position: 4, isClosed: true }
]

async function createDefaultColumns(projectId: string) {
  for (const column of defaultColumns) {
    await api.post('/board-column', { projectId, ...column })
  }
}
```

### WIP Limit tekshirish

```typescript
function canAddTaskToColumn(column: BoardColumn): boolean {
  if (!column.wipLimit) return true
  return (column._count?.tasks || 0) < column.wipLimit
}
```

---

## Sprint

### Sprint lifecycle

```
PLANNING → ACTIVE → COMPLETED
              ↓
          CANCELLED
```

### Sprint board ko'rinishi

```typescript
// Sprintdagi vazifalarni olish
const tasks = await api.get('/task', {
  params: {
    projectId,
    sprintId: activeSprint.id
  }
})

// Backlog (sprintga qo'shilmagan vazifalar)
const backlog = await api.get('/task', {
  params: {
    projectId,
    sprintId: null  // yoki sprintId parametrsiz
  }
})
```

### Sprint yaratish

```typescript
async function createSprint(projectId: string) {
  const project = await api.get(`/project/${projectId}`)
  const sprintDays = project.defaultSprintDays || 14

  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + sprintDays)

  await api.post('/sprint', {
    projectId,
    name: `Sprint ${nextSprintNumber}`,
    startDate,
    endDate
  })
}
```

### Sprint yakunlash

```typescript
// Sprint yakunlanganda velocity avtomatik hisoblanadi
// (yakunlangan vazifalarning storyPoints yig'indisi)
await api.post(`/sprint/${sprintId}/complete`)
```

---

## Namuna kodlar

### Vazifa yaratish

```typescript
// Minimal
await api.post('/task', {
  title: 'Yangi vazifa',
  projectId: 'xxx-xxx-xxx'
})

// To'liq
await api.post('/task', {
  title: 'Login sahifasini yaratish',
  description: 'JWT autentifikatsiya bilan login sahifa',
  projectId: 'xxx-xxx-xxx',
  categoryId: 'feature-category-id',
  priority: 'HIGH',
  assigneeIds: ['user-id-1', 'user-id-2'],
  boardColumnId: 'todo-column-id',
  sprintId: 'current-sprint-id',
  storyPoints: 5,
  dueDate: '2024-02-15'
})
```

### Vazifa statusini o'zgartirish

```typescript
await api.patch(`/task/${taskId}`, {
  status: 'IN_PROGRESS'
})
```

### Vazifani ustunlar orasida ko'chirish

```typescript
await api.patch(`/task/${taskId}`, {
  boardColumnId: newColumnId,
  position: 0  // ustun boshiga
})
```

### Ustunlar tartibini o'zgartirish

```typescript
await api.post('/board-column/reorder', {
  projectId: 'xxx-xxx-xxx',
  columnIds: ['col-1', 'col-3', 'col-2', 'col-4']  // yangi tartib
})
```

### Task raqamini ko'rsatish

```typescript
function getTaskDisplayNumber(task: Task, project: Project): string {
  return `${project.key}-${task.taskNumber}`
  // Natija: "PROJ-1", "HR-42", "DEV-123"
}
```

---

## Foydali maslahatlar

### 1. Vazifalarni cache qilish
Har safar API chaqirmasdan, local state'da saqlang va faqat o'zgarganda yangilang.

### 2. Optimistic updates
Drag-drop paytida avval UI'ni yangilang, keyin API ga so'rov yuboring. Xato bo'lsa, orqaga qaytaring.

### 3. Real-time yangilanishlar
WebSocket yoki polling orqali boshqa foydalanuvchilar kiritgan o'zgarishlarni kuzating.

### 4. Keyboard shortcuts
- `C` - Yangi vazifa yaratish
- `Enter` - Vazifani ochish
- `E` - Vazifani tahrirlash
- `D` - Due date qo'shish

### 5. Filter va Search
```typescript
// Filter parametrlari
GET /api/v1/task?projectId=xxx&status=IN_PROGRESS&assigneeId=user-id&search=login
```

---

## Xatolar va yechimlar

### "Board column not found or not in same project"
Vazifa yaratishda `boardColumnId` boshqa loyihaga tegishli. Tekshiring.

### "Cannot delete column with tasks"
Ustunni o'chirishdan oldin undagi vazifalarni boshqa ustun yoki arxivga ko'chiring.

### "There is already an active sprint in this project"
Bir loyihada faqat bitta aktiv sprint bo'lishi mumkin. Avval joriy sprintni yakunlang.

---

## Qo'shimcha resurslar

- API Swagger dokumentatsiyasi: `http://localhost:5058/api/docs`
- Prisma schema: `prisma/schema.prisma`
- Backend source: `src/modules/task/`, `src/modules/board-column/`, `src/modules/sprint/`
