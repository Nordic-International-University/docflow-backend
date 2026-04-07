import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { GroqTool } from './groq.service'

export interface ToolContext {
  userId: string
  roleName?: string
  departmentId?: string
}

const ROLE_ADMIN = ['Super Administrator', 'Admin']

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
    ]
  }

  /**
   * Tool execution — Groq qaytargan tool_call'ni bajarish
   */
  async executeTool(name: string, args: any, ctx: ToolContext): Promise<any> {
    this.logger.log(`Executing tool: ${name} for user ${ctx.userId}`)

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
}
