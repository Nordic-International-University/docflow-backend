import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { GroqTool } from './groq.service'

export interface ToolContext {
  userId: string
  roleName?: string
  departmentId?: string
}

const ROLE_ADMIN = ['Super Administrator', 'Admin']

const SENSITIVE_PATTERNS = /password|passwd|token|secret|api[_-]?key|private[_-]?key|credential|\.env/i

function sanitizeArgs(args: any): any {
  if (!args || typeof args !== 'object') return args
  const out: any = Array.isArray(args) ? [] : {}
  for (const k of Object.keys(args)) {
    if (SENSITIVE_PATTERNS.test(k)) continue
    const v = args[k]
    if (typeof v === 'string' && SENSITIVE_PATTERNS.test(v)) continue
    out[k] = v
  }
  return out
}

@Injectable()
export class AiToolsService {
  private readonly logger = new Logger(AiToolsService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tool definitions — Groq function calling formati
   */
  getToolDefinitions(): GroqTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'getMyTasks',
          description:
            "Foydalanuvchining tasklari ro'yxatini qaytaradi. Filter parametrlari: status, priority, sana oralig'i, muddati o'tganlar, bugun yaratilganlar.",
          parameters: {
            type: 'object',
            properties: {
              completed: { type: 'boolean', description: 'Yakunlanganmi' },
              overdue: { type: 'boolean', description: "Muddati o'tgan" },
              dueToday: { type: 'boolean', description: 'Bugungi muddatdagilar' },
              dueTomorrow: { type: 'boolean', description: 'Ertangi muddatdagilar' },
              createdToday: { type: 'boolean', description: 'Bugun yaratilgan' },
              priority: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'],
              },
              limit: { type: 'number', description: 'Maksimum 50' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getMyWorkflows',
          description:
            'Foydalanuvchiga tegishli ish jarayonlari (workflow). Yaratuvchi yoki bosqichga tayinlangan.',
          parameters: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'],
              },
              overdue: { type: 'boolean' },
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDocumentByNumber',
          description:
            "Hujjat raqami bo'yicha hujjat ma'lumotlarini va PDF havolasini qaytaradi. Masalan IB-2026-0005.",
          parameters: {
            type: 'object',
            properties: {
              documentNumber: { type: 'string' },
            },
            required: ['documentNumber'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDocumentsByType',
          description:
            "Hujjat turi bo'yicha hujjatlarni qaytaradi. typeName: Buyruq, Shartnoma, Xat va h.k.",
          parameters: {
            type: 'object',
            properties: {
              typeName: { type: 'string', description: "Hujjat turi nomi" },
              status: { type: 'string', enum: ['DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'] },
              limit: { type: 'number' },
            },
            required: ['typeName'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'searchDocuments',
          description: "Hujjat sarlavhasi yoki tavsifi bo'yicha qidiruv.",
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getMyKpi',
          description:
            "Foydalanuvchining joriy oy KPI ko'rsatkichlarini qaytaradi.",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getMyNotifications',
          description: "O'qilmagan bildirishnomalarni qaytaradi.",
          parameters: {
            type: 'object',
            properties: {
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDocumentPdf',
          description:
            "Tasdiqlangan hujjat PDF havolasini qaytaradi. Faqat APPROVED hujjatlar.",
          parameters: {
            type: 'object',
            properties: {
              documentNumber: { type: 'string' },
            },
            required: ['documentNumber'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getMyProjects',
          description: "Foydalanuvchi a'zo bo'lgan loyihalarni qaytaradi.",
          parameters: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDepartmentStats',
          description: "O'z bo'limi statistikasini qaytaradi: jami xodimlar, faol task, KPI o'rtachasi.",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDocumentLatestFile',
          description:
            "Hujjat raqami bo'yicha ENG OXIRGI versiya faylni qaytaradi (PDF). Misol: 'IB-2026-0005 hujjati faylini ber'.",
          parameters: {
            type: 'object',
            properties: {
              documentNumber: { type: 'string', description: 'Hujjat raqami' },
            },
            required: ['documentNumber'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDocumentVersions',
          description: "Hujjat barcha fayl versiyalari (eski va yangi).",
          parameters: {
            type: 'object',
            properties: {
              documentNumber: { type: 'string' },
            },
            required: ['documentNumber'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getTaskByRef',
          description: "Topshiriq ref'i bo'yicha ma'lumotlarini qaytaradi (masalan: DOCFLOW-15).",
          parameters: {
            type: 'object',
            properties: {
              ref: { type: 'string', description: "Task ref, masalan: DOCFLOW-15" },
            },
            required: ['ref'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'findUserByName',
          description:
            "Foydalanuvchini ism, familiya yoki username bo'yicha qidiradi. CREATE operatsiyalari uchun userId aniqlash maqsadida.",
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: "Ism, familiya yoki username" },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'findProjectByName',
          description: "Loyihani nomi yoki kaliti bo'yicha qidiradi.",
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'createTask',
          description:
            "Yangi topshiriq yaratadi. Avval findProjectByName va findUserByName bilan ID larni aniqlang. Yaratishdan oldin foydalanuvchidan tasdiq oling.",
          parameters: {
            type: 'object',
            properties: {
              projectId: { type: 'string', description: 'Loyiha UUID' },
              title: { type: 'string', description: 'Topshiriq nomi' },
              description: { type: 'string' },
              priority: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'],
              },
              score: { type: 'number', description: 'Ball (5-50)' },
              dueDate: { type: 'string', description: 'YYYY-MM-DD format' },
              assigneeIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Foydalanuvchi UUID lari',
              },
            },
            required: ['projectId', 'title'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'addTaskComment',
          description: "Topshiriqqa izoh qo'shadi.",
          parameters: {
            type: 'object',
            properties: {
              taskId: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['taskId', 'content'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'completeTask',
          description: "Topshiriqni yakunlangan deb belgilaydi.",
          parameters: {
            type: 'object',
            properties: {
              taskId: { type: 'string' },
            },
            required: ['taskId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'countMyTasks',
          description: "Foydalanuvchi tasklarini sanaydi: bugun, hafta, muddati o'tgan, jami.",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getRecentDocuments',
          description: "So'nggi yaratilgan hujjatlarni qaytaradi (vaqt bo'yicha).",
          parameters: {
            type: 'object',
            properties: {
              days: { type: 'number', description: "Necha kun ichida" },
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getMyOverallStats',
          description:
            "Foydalanuvchining umumiy statistikasi: barcha tasklar, hujjatlar, workflowlar, KPI, loyihalar, o'qilmagan bildirishnomalar. 'Mening umumiy statistikam', 'menga tegishli hammasi' kabi savollar uchun.",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getDepartmentFullStats',
          description:
            "Foydalanuvchi bo'limining to'liq statistikasi: xodimlar, tasklar, hujjatlar, workflowlar, o'rtacha KPI. 'Bo'limimning statistikasi', 'bo'limda nima bo'lyapti' kabi savollar uchun.",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getWorkflowStatusForDocument',
          description: "Hujjatning workflow holatini va bosqichlarini ko'rsatadi.",
          parameters: {
            type: 'object',
            properties: {
              documentNumber: { type: 'string' },
            },
            required: ['documentNumber'],
          },
        },
      },
    ]
  }

  /**
   * Tool execution — Groq qaytargan tool_call'ni bajarish
   */
  async executeTool(name: string, args: any, ctx: ToolContext): Promise<any> {
    args = sanitizeArgs(args)
    if (!ctx.userId) return { error: 'Autentifikatsiya talab qilinadi' }
    this.logger.log(`AI tool: ${name} user=${ctx.userId} role=${ctx.roleName || '-'}`)

    try {
      switch (name) {
        case 'getMyTasks':
          return await this.getMyTasks(args, ctx)
        case 'getMyWorkflows':
          return await this.getMyWorkflows(args, ctx)
        case 'getDocumentByNumber':
          return await this.getDocumentByNumber(args, ctx)
        case 'getDocumentsByType':
          return await this.getDocumentsByType(args, ctx)
        case 'searchDocuments':
          return await this.searchDocuments(args, ctx)
        case 'getMyKpi':
          return await this.getMyKpi(ctx)
        case 'getMyNotifications':
          return await this.getMyNotifications(args, ctx)
        case 'getDocumentPdf':
          return await this.getDocumentPdf(args, ctx)
        case 'getMyProjects':
          return await this.getMyProjects(args, ctx)
        case 'getDepartmentStats':
          return await this.getDepartmentStats(ctx)
        case 'getDocumentLatestFile':
          return await this.getDocumentLatestFile(args, ctx)
        case 'getDocumentVersions':
          return await this.getDocumentVersions(args, ctx)
        case 'getTaskByRef':
          return await this.getTaskByRef(args, ctx)
        case 'findUserByName':
          return await this.findUserByName(args, ctx)
        case 'findProjectByName':
          return await this.findProjectByName(args, ctx)
        case 'createTask':
          return await this.createTask(args, ctx)
        case 'addTaskComment':
          return await this.addTaskComment(args, ctx)
        case 'completeTask':
          return await this.completeTask(args, ctx)
        case 'countMyTasks':
          return await this.countMyTasks(ctx)
        case 'getRecentDocuments':
          return await this.getRecentDocuments(args, ctx)
        case 'getWorkflowStatusForDocument':
          return await this.getWorkflowStatusForDocument(args, ctx)
        case 'getMyOverallStats':
          return await this.getMyOverallStats(ctx)
        case 'getDepartmentFullStats':
          return await this.getDepartmentFullStats(ctx)
        default:
          return { error: `Noma'lum tool: ${name}` }
      }
    } catch (err: any) {
      this.logger.error(`Tool ${name} failed: ${err.message}`)
      return { error: err.message }
    }
  }

  // ============ TOOL IMPLEMENTATIONS ============

  private startOfDay(d: Date) {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }

  private endOfDay(d: Date) {
    const x = new Date(d)
    x.setHours(23, 59, 59, 999)
    return x
  }

  private isAdmin(ctx: ToolContext): boolean {
    return ROLE_ADMIN.includes(ctx.roleName || '')
  }

  /** Hujjatga kirish: yaratuvchi, workflow ishtirokchisi yoki admin */
  private async canAccessDocument(documentId: string, ctx: ToolContext): Promise<boolean> {
    if (this.isAdmin(ctx)) return true
    const doc = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [
          { createdById: ctx.userId },
          { workflow: { some: { workflowSteps: { some: { assignedToUserId: ctx.userId } } } } },
        ],
      },
      select: { id: true },
    })
    return !!doc
  }

  /** Topshiriqqa kirish: yaratuvchi, assignee, loyiha a'zosi yoki admin */
  private async canAccessTask(taskId: string, ctx: ToolContext): Promise<boolean> {
    if (this.isAdmin(ctx)) return true
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        OR: [
          { createdById: ctx.userId },
          { assignees: { some: { userId: ctx.userId } } },
          { project: { members: { some: { userId: ctx.userId } } } },
          { project: { createdById: ctx.userId } },
        ],
      },
      select: { id: true },
    })
    return !!task
  }

  /** Loyihaga yozish: a'zo, yaratuvchi yoki admin */
  private async canWriteProject(projectId: string, ctx: ToolContext): Promise<boolean> {
    if (this.isAdmin(ctx)) return true
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { createdById: ctx.userId },
          { members: { some: { userId: ctx.userId } } },
        ],
      },
      select: { id: true },
    })
    return !!project
  }

  private async getMyTasks(args: any, ctx: ToolContext) {
    const where: any = {
      deletedAt: null,
      isArchived: false,
      assignees: { some: { userId: ctx.userId } },
    }

    if (args.completed === true) where.completedAt = { not: null }
    if (args.completed === false) where.completedAt = null
    if (args.priority) where.priority = args.priority

    const now = new Date()
    if (args.overdue) {
      where.completedAt = null
      where.dueDate = { lt: now }
    }
    if (args.dueToday) {
      where.dueDate = { gte: this.startOfDay(now), lte: this.endOfDay(now) }
    }
    if (args.dueTomorrow) {
      const t = new Date(now)
      t.setDate(t.getDate() + 1)
      where.dueDate = { gte: this.startOfDay(t), lte: this.endOfDay(t) }
    }
    if (args.createdToday) {
      where.createdAt = { gte: this.startOfDay(now), lte: this.endOfDay(now) }
    }

    const tasks = await this.prisma.task.findMany({
      where,
      take: Math.min(args.limit || 20, 50),
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        taskNumber: true,
        title: true,
        priority: true,
        score: true,
        dueDate: true,
        completedAt: true,
        project: { select: { name: true, key: true } },
        createdBy: { select: { fullname: true } },
      },
    })

    return {
      count: tasks.length,
      tasks: tasks.map((t) => ({
        ref: `${t.project?.key}-${t.taskNumber}`,
        title: t.title,
        priority: t.priority,
        score: t.score,
        dueDate: t.dueDate,
        completed: !!t.completedAt,
        project: t.project?.name,
        createdBy: t.createdBy?.fullname,
        url: `/dashboard/task/${t.id}`,
      })),
    }
  }

  private async getMyWorkflows(args: any, ctx: ToolContext) {
    const where: any = {
      deletedAt: null,
      OR: [
        { document: { createdById: ctx.userId } },
        { workflowSteps: { some: { assignedToUserId: ctx.userId, deletedAt: null } } },
      ],
    }
    if (args.status) where.status = args.status
    if (args.overdue) {
      where.status = 'ACTIVE'
      where.deadline = { lt: new Date() }
    }

    const workflows = await this.prisma.workflow.findMany({
      where,
      take: Math.min(args.limit || 20, 50),
      orderBy: { createdAt: 'desc' },
      include: {
        document: {
          select: { id: true, title: true, documentNumber: true, status: true },
        },
        workflowSteps: {
          where: { deletedAt: null, isCreator: false },
          select: { order: true, status: true, actionType: true },
        },
      },
    })

    return {
      count: workflows.length,
      workflows: workflows.map((w) => ({
        id: w.id,
        document: w.document,
        type: w.type,
        status: w.status,
        currentStep: w.currentStepOrder,
        totalSteps: w.workflowSteps.length,
        deadline: w.deadline,
        url: `/dashboard/workflow/${w.id}`,
      })),
    }
  }

  private async getDocumentByNumber(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const doc = await this.prisma.document.findFirst({
      where: {
        documentNumber: args.documentNumber,
        deletedAt: null,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { createdById: ctx.userId },
                {
                  workflow: {
                    some: {
                      workflowSteps: { some: { assignedToUserId: ctx.userId } },
                    },
                  },
                },
              ],
            }),
      },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        status: true,
        pdfUrl: true,
        documentType: { select: { name: true } },
        createdBy: { select: { fullname: true } },
        createdAt: true,
      },
    })

    if (!doc) return { error: 'Hujjat topilmadi yoki sizda ruxsat yo\'q' }
    return {
      ...doc,
      url: `/dashboard/document/${doc.id}`,
    }
  }

  private async getDocumentsByType(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const where: any = {
      deletedAt: null,
      documentType: { name: { contains: args.typeName, mode: 'insensitive' } },
      ...(args.status && { status: args.status }),
      ...(!isAdmin && { createdById: ctx.userId }),
    }

    const docs = await this.prisma.document.findMany({
      where,
      take: Math.min(args.limit || 20, 50),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        status: true,
        pdfUrl: true,
        documentType: { select: { name: true } },
        createdBy: { select: { fullname: true } },
        createdAt: true,
      },
    })

    return {
      count: docs.length,
      documents: docs.map((d) => ({ ...d, url: `/dashboard/document/${d.id}` })),
    }
  }

  private async searchDocuments(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const docs = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: args.query, mode: 'insensitive' } },
          { description: { contains: args.query, mode: 'insensitive' } },
          { documentNumber: { contains: args.query, mode: 'insensitive' } },
        ],
        ...(!isAdmin && { createdById: ctx.userId }),
      },
      take: Math.min(args.limit || 10, 30),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        status: true,
        documentType: { select: { name: true } },
        createdBy: { select: { fullname: true } },
      },
    })

    return {
      count: docs.length,
      documents: docs.map((d) => ({ ...d, url: `/dashboard/document/${d.id}` })),
    }
  }

  private async getMyKpi(ctx: ToolContext) {
    const now = new Date()
    const kpi = await this.prisma.userMonthlyKpi.findFirst({
      where: { userId: ctx.userId, year: now.getFullYear(), month: now.getMonth() + 1 },
    })
    if (!kpi) return { message: 'Joriy oy uchun KPI ma\'lumoti yo\'q' }
    return {
      year: kpi.year,
      month: kpi.month,
      finalScore: kpi.finalScore,
      tasksCompleted: kpi.tasksCompleted,
      tasksOnTime: kpi.tasksOnTime,
      tasksLate: kpi.tasksLate,
      isFullScore: kpi.isFullScore,
    }
  }

  private async getMyNotifications(args: any, ctx: ToolContext) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: ctx.userId, isRead: false, deletedAt: null },
      take: Math.min(args.limit || 10, 30),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
      },
    })
    return { count: notifications.length, notifications }
  }

  private async getDocumentPdf(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const doc = await this.prisma.document.findFirst({
      where: {
        documentNumber: args.documentNumber,
        deletedAt: null,
        status: 'APPROVED',
        ...(!isAdmin && {
          OR: [
            { createdById: ctx.userId },
            { workflow: { some: { workflowSteps: { some: { assignedToUserId: ctx.userId } } } } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        pdfUrl: true,
      },
    })

    if (!doc) return { error: 'Tasdiqlangan PDF topilmadi yoki sizda ruxsat yo\'q' }
    if (!doc.pdfUrl) return { error: 'PDF fayl mavjud emas' }

    return {
      title: doc.title,
      documentNumber: doc.documentNumber,
      pdfUrl: doc.pdfUrl,
      url: `/dashboard/document/${doc.id}`,
      isAttachment: true,
    }
  }

  private async getMyProjects(args: any, ctx: ToolContext) {
    const projects = await this.prisma.project.findMany({
      where: {
        deletedAt: null,
        isArchived: false,
        ...(args.status && { status: args.status }),
        OR: [
          { createdById: ctx.userId },
          { members: { some: { userId: ctx.userId } } },
          ...(ctx.departmentId
            ? [{ visibility: 'DEPARTMENT' as any, departmentId: ctx.departmentId }]
            : []),
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        status: true,
        _count: { select: { tasks: true, members: true } },
      },
    })
    return {
      count: projects.length,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        key: p.key,
        status: p.status,
        tasksCount: p._count.tasks,
        membersCount: p._count.members,
        url: `/dashboard/project/${p.id}`,
      })),
    }
  }

  private async getDepartmentStats(ctx: ToolContext) {
    if (!ctx.departmentId) return { error: 'Siz bo\'limga biriktirilmagansiz' }

    const [usersCount, activeTasksCount, completedTasksCount, dept] = await Promise.all([
      this.prisma.user.count({
        where: { departmentId: ctx.departmentId, deletedAt: null, isActive: true },
      }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          completedAt: null,
          project: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          completedAt: { not: null },
          project: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.department.findFirst({
        where: { id: ctx.departmentId },
        select: { name: true },
      }),
    ])

    return {
      department: dept?.name,
      totalUsers: usersCount,
      activeTasks: activeTasksCount,
      completedTasks: completedTasksCount,
    }
  }

  // ============ NEW TOOLS ============

  private async getDocumentLatestFile(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const doc = await this.prisma.document.findFirst({
      where: {
        documentNumber: args.documentNumber,
        deletedAt: null,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { createdById: ctx.userId },
                { workflow: { some: { workflowSteps: { some: { assignedToUserId: ctx.userId } } } } },
              ],
            }),
      },
      include: {
        attachments: {
          where: { deletedAt: null, mimeType: 'application/pdf' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!doc) return { error: 'Hujjat topilmadi yoki ruxsat yo\'q' }
    if (!doc.attachments[0]) return { error: 'PDF fayl mavjud emas' }

    const att = doc.attachments[0]
    return {
      documentId: doc.id,
      documentNumber: doc.documentNumber,
      title: doc.title,
      status: doc.status,
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      url: `/dashboard/document/${doc.id}`,
      isAttachment: true,
      pdfUrl: att.fileUrl,
    }
  }

  private async getDocumentVersions(args: any, ctx: ToolContext) {
    const isAdmin = this.isAdmin(ctx)
    const doc = await this.prisma.document.findFirst({
      where: {
        documentNumber: args.documentNumber,
        deletedAt: null,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { createdById: ctx.userId },
                { workflow: { some: { workflowSteps: { some: { assignedToUserId: ctx.userId } } } } },
              ],
            }),
      },
      include: {
        attachments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { fullname: true } } },
        },
      },
    })
    if (!doc) return { error: "Hujjat topilmadi yoki sizda ruxsat yo'q" }

    return {
      documentNumber: doc.documentNumber,
      title: doc.title,
      versions: doc.attachments.map((a, idx) => ({
        version: doc.attachments.length - idx,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        mimeType: a.mimeType,
        uploadedBy: a.uploadedBy?.fullname,
        createdAt: a.createdAt,
      })),
    }
  }

  private async getTaskByRef(args: any, ctx: ToolContext) {
    // ref format: PROJECTKEY-NUMBER
    const match = args.ref?.match(/^([A-Z0-9]+)-(\d+)$/i)
    if (!match) return { error: "Noto'g'ri format. Misol: DOCFLOW-15" }

    const [, projectKey, taskNum] = match
    const isAdmin = this.isAdmin(ctx)
    const task = await this.prisma.task.findFirst({
      where: {
        taskNumber: parseInt(taskNum, 10),
        project: { key: projectKey.toUpperCase() },
        deletedAt: null,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { createdById: ctx.userId },
                { assignees: { some: { userId: ctx.userId } } },
                { project: { members: { some: { userId: ctx.userId } } } },
                { project: { createdById: ctx.userId } },
              ],
            }),
      },
      include: {
        project: { select: { name: true, key: true } },
        category: { select: { name: true } },
        createdBy: { select: { fullname: true } },
        assignees: { include: { user: { select: { fullname: true } } } },
      },
    })
    if (!task) return { error: "Topshiriq topilmadi yoki sizda ruxsat yo'q" }

    return {
      ref: `${task.project?.key}-${task.taskNumber}`,
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      score: task.score,
      dueDate: task.dueDate,
      completed: !!task.completedAt,
      project: task.project?.name,
      category: task.category?.name,
      createdBy: task.createdBy?.fullname,
      assignees: task.assignees.map((a) => a.user.fullname),
      url: `/dashboard/task/${task.id}`,
    }
  }

  private async findUserByName(args: any, ctx: ToolContext) {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { fullname: { contains: args.name, mode: 'insensitive' } },
          { username: { contains: args.name, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: {
        id: true,
        fullname: true,
        username: true,
        role: { select: { name: true } },
        department: { select: { name: true } },
      },
    })
    return { count: users.length, users }
  }

  private async findProjectByName(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const projects = await this.prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: args.name, mode: 'insensitive' } },
          { key: { contains: args.name, mode: 'insensitive' } },
        ],
        ...(isAdmin
          ? {}
          : {
              AND: [
                {
                  OR: [
                    { visibility: 'PUBLIC' },
                    { createdById: ctx.userId },
                    { members: { some: { userId: ctx.userId } } },
                    ...(ctx.departmentId
                      ? [{ visibility: 'DEPARTMENT' as any, departmentId: ctx.departmentId }]
                      : []),
                  ],
                },
              ],
            }),
      },
      take: 5,
      select: { id: true, name: true, key: true, status: true },
    })
    return { count: projects.length, projects }
  }

  private async createTask(args: any, ctx: ToolContext) {
    // Security: loyihaga yozish huquqi
    if (!(await this.canWriteProject(args.projectId, ctx))) {
      return { error: "Loyiha topilmadi yoki sizda topshiriq yaratish huquqi yo'q" }
    }
    // Input validation
    if (!args.title || args.title.trim().length < 3) {
      return { error: "Topshiriq nomi kamida 3 belgi bo'lishi kerak" }
    }
    if (args.title.length > 500) {
      return { error: "Topshiriq nomi juda uzun (maksimum 500 belgi)" }
    }
    if (args.score !== undefined && (args.score < 0 || args.score > 100)) {
      return { error: "Ball 0-100 oralig'ida bo'lishi kerak" }
    }
    if (args.dueDate) {
      const d = new Date(args.dueDate)
      if (isNaN(d.getTime())) return { error: "Noto'g'ri sana formati (YYYY-MM-DD)" }
    }
    const project = await this.prisma.project.findFirst({
      where: { id: args.projectId, deletedAt: null },
      select: { id: true, name: true, key: true, taskCounter: true },
    })
    if (!project) return { error: 'Loyiha topilmadi' }

    const updatedProject = await this.prisma.project.update({
      where: { id: project.id },
      data: { taskCounter: { increment: 1 } },
      select: { taskCounter: true },
    })

    const defaultCol = await this.prisma.boardColumn.findFirst({
      where: { projectId: project.id, isDefault: true, deletedAt: null },
      select: { id: true },
    })

    const task = await this.prisma.task.create({
      data: {
        title: args.title,
        description: args.description,
        projectId: project.id,
        priority: (args.priority || 'MEDIUM') as any,
        score: args.score,
        dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
        createdById: ctx.userId,
        taskNumber: updatedProject.taskCounter,
        boardColumnId: defaultCol?.id,
      },
    })

    if (args.assigneeIds?.length) {
      const validUsers = await this.prisma.user.findMany({
        where: { id: { in: args.assigneeIds }, deletedAt: null, isActive: true },
        select: { id: true },
      })
      if (validUsers.length) {
        await this.prisma.taskAssignee.createMany({
          data: validUsers.map((u) => ({ taskId: task.id, userId: u.id })),
          skipDuplicates: true,
        })
      }
    }

    return {
      success: true,
      message: 'Topshiriq yaratildi',
      task: {
        id: task.id,
        ref: `${project.key}-${task.taskNumber}`,
        title: task.title,
        url: `/dashboard/task/${task.id}`,
      },
    }
  }

  private async addTaskComment(args: any, ctx: ToolContext) {
    if (!(await this.canAccessTask(args.taskId, ctx))) {
      return { error: "Topshiriq topilmadi yoki sizda ruxsat yo'q" }
    }
    const task = await this.prisma.task.findFirst({
      where: { id: args.taskId, deletedAt: null },
      include: { project: { select: { key: true } } },
    })
    if (!task) return { error: 'Topshiriq topilmadi' }

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId: args.taskId,
        userId: ctx.userId,
        content: args.content,
      },
    })

    return {
      success: true,
      message: "Izoh qo'shildi",
      commentId: comment.id,
      taskRef: `${task.project?.key}-${task.taskNumber}`,
    }
  }

  private async completeTask(args: any, ctx: ToolContext) {
    if (!(await this.canAccessTask(args.taskId, ctx))) {
      return { error: "Topshiriq topilmadi yoki sizda ruxsat yo'q" }
    }
    const task = await this.prisma.task.findFirst({
      where: { id: args.taskId, deletedAt: null },
      include: { project: { select: { key: true } } },
    })
    if (!task) return { error: 'Topshiriq topilmadi' }
    const isAssignee = await this.prisma.taskAssignee.findFirst({
      where: { taskId: args.taskId, userId: ctx.userId },
    })
    if (!this.isAdmin(ctx) && task.createdById !== ctx.userId && !isAssignee) {
      return { error: 'Siz bu topshiriqni yakunlash huquqiga ega emassiz' }
    }
    if (task.completedAt) return { error: 'Topshiriq allaqachon yakunlangan' }

    await this.prisma.task.update({
      where: { id: args.taskId },
      data: { completedAt: new Date() },
    })

    return {
      success: true,
      message: 'Topshiriq yakunlandi',
      taskId: args.taskId,
      taskRef: `${task.project?.key}-${task.taskNumber}`,
    }
  }

  private async countMyTasks(ctx: ToolContext) {
    const now = new Date()
    const todayStart = this.startOfDay(now)
    const todayEnd = this.endOfDay(now)
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const baseWhere = {
      deletedAt: null,
      isArchived: false,
      assignees: { some: { userId: ctx.userId } },
    }

    const [total, completed, dueToday, dueWeek, overdue] = await Promise.all([
      this.prisma.task.count({ where: baseWhere }),
      this.prisma.task.count({ where: { ...baseWhere, completedAt: { not: null } } }),
      this.prisma.task.count({
        where: { ...baseWhere, completedAt: null, dueDate: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.task.count({
        where: { ...baseWhere, completedAt: null, dueDate: { gte: now, lte: weekEnd } },
      }),
      this.prisma.task.count({
        where: { ...baseWhere, completedAt: null, dueDate: { lt: now } },
      }),
    ])

    return { total, completed, active: total - completed, dueToday, dueWeek, overdue }
  }

  private async getRecentDocuments(args: any, ctx: ToolContext) {
    const isAdmin = ROLE_ADMIN.includes(ctx.roleName || '')
    const days = args.days || 7
    const since = new Date()
    since.setDate(since.getDate() - days)

    const docs = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: since },
        ...(!isAdmin && { createdById: ctx.userId }),
      },
      take: Math.min(args.limit || 10, 30),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        documentNumber: true,
        status: true,
        documentType: { select: { name: true } },
        createdBy: { select: { fullname: true } },
        createdAt: true,
      },
    })

    return {
      count: docs.length,
      documents: docs.map((d) => ({ ...d, url: `/dashboard/document/${d.id}` })),
    }
  }

  private async getWorkflowStatusForDocument(args: any, ctx: ToolContext) {
    const isAdmin = this.isAdmin(ctx)
    const doc = await this.prisma.document.findFirst({
      where: {
        documentNumber: args.documentNumber,
        deletedAt: null,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { createdById: ctx.userId },
                { workflow: { some: { workflowSteps: { some: { assignedToUserId: ctx.userId } } } } },
              ],
            }),
      },
      select: { id: true, title: true, documentNumber: true, status: true },
    })
    if (!doc) return { error: "Hujjat topilmadi yoki sizda ruxsat yo'q" }

    const workflow = await this.prisma.workflow.findFirst({
      where: { documentId: doc.id, deletedAt: null },
      include: {
        workflowSteps: {
          where: { deletedAt: null, isCreator: false },
          orderBy: { order: 'asc' },
          include: { assignedToUser: { select: { fullname: true } } },
        },
      },
    })

    if (!workflow) {
      return {
        document: { id: doc.id, title: doc.title, documentNumber: doc.documentNumber, status: doc.status },
        message: "Bu hujjat uchun ish jarayoni yo'q",
      }
    }

    return {
      document: { id: doc.id, title: doc.title, documentNumber: doc.documentNumber, status: doc.status },
      workflow: {
        id: workflow.id,
        type: workflow.type,
        status: workflow.status,
        currentStep: workflow.currentStepOrder,
        totalSteps: workflow.workflowSteps.length,
        url: `/dashboard/workflow/${workflow.id}`,
        steps: workflow.workflowSteps.map((s) => ({
          order: s.order,
          actionType: s.actionType,
          status: s.status,
          assignedTo: s.assignedToUser?.fullname,
          completedAt: s.completedAt,
        })),
      },
    }
  }

  // ============ YANGI: STATISTIKA VA KENGROQ TOOLS ============

  private async getMyOverallStats(ctx: ToolContext) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const taskWhere = { deletedAt: null, assignees: { some: { userId: ctx.userId } } }

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      activeTasks,
      totalDocs,
      approvedDocs,
      pendingDocs,
      activeWorkflows,
      pendingWorkflowSteps,
      unreadNotifications,
      kpi,
      projectsCount,
    ] = await Promise.all([
      this.prisma.task.count({ where: taskWhere }),
      this.prisma.task.count({ where: { ...taskWhere, completedAt: { not: null } } }),
      this.prisma.task.count({
        where: { ...taskWhere, completedAt: null, dueDate: { lt: now } },
      }),
      this.prisma.task.count({ where: { ...taskWhere, completedAt: null } }),
      this.prisma.document.count({ where: { createdById: ctx.userId, deletedAt: null } }),
      this.prisma.document.count({
        where: { createdById: ctx.userId, deletedAt: null, status: 'APPROVED' },
      }),
      this.prisma.document.count({
        where: { createdById: ctx.userId, deletedAt: null, status: { in: ['PENDING', 'IN_REVIEW'] } },
      }),
      this.prisma.workflow.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          OR: [
            { document: { createdById: ctx.userId } },
            { workflowSteps: { some: { assignedToUserId: ctx.userId } } },
          ],
        },
      }),
      this.prisma.workflowStep.count({
        where: {
          deletedAt: null,
          assignedToUserId: ctx.userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] as any },
        },
      }),
      this.prisma.notification.count({
        where: { userId: ctx.userId, isRead: false, deletedAt: null },
      }),
      this.prisma.userMonthlyKpi.findFirst({
        where: { userId: ctx.userId, year: now.getFullYear(), month: now.getMonth() + 1 },
      }),
      this.prisma.project.count({
        where: {
          deletedAt: null,
          isArchived: false,
          OR: [
            { createdById: ctx.userId },
            { members: { some: { userId: ctx.userId } } },
          ],
        },
      }),
    ])

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeTasks,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      documents: { total: totalDocs, approved: approvedDocs, pending: pendingDocs },
      workflows: { active: activeWorkflows, pendingMySteps: pendingWorkflowSteps },
      notifications: { unread: unreadNotifications },
      kpi: kpi
        ? { finalScore: kpi.finalScore, tasksCompleted: kpi.tasksCompleted, tasksOnTime: kpi.tasksOnTime, tasksLate: kpi.tasksLate }
        : null,
      projects: projectsCount,
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    }
  }

  private async getDepartmentFullStats(ctx: ToolContext) {
    if (!ctx.departmentId) return { error: "Siz bo'limga biriktirilmagansiz" }
    // Faqat admin yoki shu bo'lim xodimi
    const now = new Date()
    const [
      dept,
      totalUsers,
      activeTasks,
      completedTasks,
      overdueTasks,
      totalDocs,
      approvedDocs,
      activeWorkflows,
      avgKpi,
    ] = await Promise.all([
      this.prisma.department.findFirst({
        where: { id: ctx.departmentId },
        select: { name: true },
      }),
      this.prisma.user.count({
        where: { departmentId: ctx.departmentId, deletedAt: null, isActive: true },
      }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          completedAt: null,
          project: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          completedAt: { not: null },
          project: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          completedAt: null,
          dueDate: { lt: now },
          project: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.document.count({
        where: {
          deletedAt: null,
          createdBy: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.document.count({
        where: {
          deletedAt: null,
          status: 'APPROVED',
          createdBy: { departmentId: ctx.departmentId },
        },
      }),
      this.prisma.workflow.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          document: { createdBy: { departmentId: ctx.departmentId } },
        },
      }),
      this.prisma.userMonthlyKpi.aggregate({
        where: {
          departmentId: ctx.departmentId,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
        _avg: { finalScore: true },
      }),
    ])

    return {
      department: dept?.name,
      totalUsers,
      tasks: {
        active: activeTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        total: activeTasks + completedTasks,
      },
      documents: { total: totalDocs, approved: approvedDocs },
      workflows: { active: activeWorkflows },
      avgKpiScore: avgKpi._avg.finalScore ? Math.round(avgKpi._avg.finalScore) : null,
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    }
  }
}
