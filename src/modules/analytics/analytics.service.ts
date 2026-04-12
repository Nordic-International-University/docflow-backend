import { ROLE_NAMES } from '@constants'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { isAdmin } from '@common/helpers'
import { AnalyticsQueryDto, TimeRange } from './dtos/analytics-query.dto'
import {
  DashboardAnalyticsResponseDto,
  DocumentAnalyticsResponseDto,
  WorkflowAnalyticsResponseDto,
  UserAnalyticsResponseDto,
  MetricWithChange,
} from './dtos/analytics-response.dto'

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardAnalytics(
    query: AnalyticsQueryDto,
  ): Promise<DashboardAnalyticsResponseDto> {
    const { currentPeriod, previousPeriod } = this.calculateDateRanges(query)

    // Count total documents
    const totalDocuments = await this.getMetricWithChange(
      async (startDate, endDate) => {
        return this.prisma.document.count({
          where: {
            deletedAt: null,
            ...(startDate && endDate
              ? { createdAt: { gte: startDate, lte: endDate } }
              : {}),
          },
        })
      },
      currentPeriod,
      previousPeriod,
    )

    // Count active users (users who have logged in or created documents)
    const activeUsers = await this.getMetricWithChange(
      async (startDate, endDate) => {
        const usersWithActivity = await this.prisma.user.count({
          where: {
            deletedAt: null,
            OR: [
              {
                createdDocuments: {
                  some: {
                    deletedAt: null,
                    ...(startDate && endDate
                      ? { createdAt: { gte: startDate, lte: endDate } }
                      : {}),
                  },
                },
              },
              {
                assignedWorkflowSteps: {
                  some: {
                    deletedAt: null,
                    ...(startDate && endDate
                      ? {
                          OR: [
                            { completedAt: { gte: startDate, lte: endDate } },
                            { createdAt: { gte: startDate, lte: endDate } },
                          ],
                        }
                      : {}),
                  },
                },
              },
            ],
          },
        })
        return usersWithActivity
      },
      currentPeriod,
      previousPeriod,
    )

    // Count total departments
    const totalDepartments = await this.prisma.department.count({
      where: { deletedAt: null },
    })

    // Count total journals
    const totalJournals = await this.getMetricWithChange(
      async (startDate, endDate) => {
        return this.prisma.journal.count({
          where: {
            deletedAt: null,
            ...(startDate && endDate
              ? { createdAt: { gte: startDate, lte: endDate } }
              : {}),
          },
        })
      },
      currentPeriod,
      previousPeriod,
    )

    // Active workflows
    const activeWorkflows = await this.prisma.workflow.count({
      where: {
        deletedAt: null,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    })

    // Pending workflow steps (nom o'zgardi: pendingTasks → pendingWorkflowSteps)
    const pendingWorkflowSteps = await this.getMetricWithChange(
      async (startDate, endDate) => {
        return this.prisma.workflowStep.count({
          where: {
            deletedAt: null,
            completedAt: null,
            status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
            ...(startDate && endDate
              ? { createdAt: { gte: startDate, lte: endDate } }
              : {}),
          },
        })
      },
      currentPeriod,
      previousPeriod,
    )

    // ============ YANGI: Task, Project, Chat statistika ============

    // Haqiqiy tasklar (task moduli)
    const totalTasks = await this.getMetricWithChange(
      async (startDate, endDate) => {
        return this.prisma.task.count({
          where: {
            deletedAt: null,
            isArchived: false,
            ...(startDate && endDate
              ? { createdAt: { gte: startDate, lte: endDate } }
              : {}),
          },
        })
      },
      currentPeriod,
      previousPeriod,
    )

    // Bajarilgan tasklar
    const completedTasks = await this.prisma.task.count({
      where: {
        deletedAt: null,
        completedAt: { not: null },
      },
    })

    // Muddati o'tgan tasklar
    const overdueTasks = await this.prisma.task.count({
      where: {
        deletedAt: null,
        completedAt: null,
        dueDate: { lt: new Date() },
      },
    })

    // Loyihalar
    const totalProjects = await this.prisma.project.count({
      where: { deletedAt: null, isArchived: false },
    })

    // Chat xabarlari (bugun)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const chatMessagesToday = await this.prisma.chatMessage.count({
      where: {
        deletedAt: null,
        createdAt: { gte: todayStart },
      },
    })

    // Jami chat xabarlari
    const totalChatMessages = await this.prisma.chatMessage.count({
      where: { deletedAt: null },
    })

    // Hujjatlar holati taqsimoti
    const documentsByStatus = await this.prisma.document.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { deletedAt: null },
    })

    const statusDistribution: Record<string, number> = {}
    for (const row of documentsByStatus) {
      statusDistribution[row.status] = row._count.id
    }

    return {
      // Eski maydonlar (frontend buzilmasin)
      totalDocuments,
      activeUsers,
      totalDepartments,
      totalJournals,
      activeWorkflows,
      pendingTasks: pendingWorkflowSteps, // eski nom saqlandi
      // Yangi maydonlar
      pendingWorkflowSteps,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalProjects,
      chatMessagesToday,
      totalChatMessages,
      documentsByStatus: statusDistribution,
    }
  }

  private calculateDateRanges(query: AnalyticsQueryDto): {
    currentPeriod: { start: Date | null; end: Date | null }
    previousPeriod: { start: Date | null; end: Date | null }
  } {
    const now = new Date()
    let currentStart: Date | null = null
    let currentEnd: Date | null = now
    let previousStart: Date | null = null
    let previousEnd: Date | null = null

    if (
      query.timeRange === TimeRange.CUSTOM &&
      query.startDate &&
      query.endDate
    ) {
      currentStart = new Date(query.startDate)
      currentEnd = new Date(query.endDate)

      const duration = currentEnd.getTime() - currentStart.getTime()
      previousEnd = new Date(currentStart.getTime() - 1)
      previousStart = new Date(previousEnd.getTime() - duration)
    } else {
      switch (query.timeRange) {
        case TimeRange.TODAY:
          currentStart = new Date(now.setHours(0, 0, 0, 0))
          previousStart = new Date(currentStart)
          previousStart.setDate(previousStart.getDate() - 1)
          previousEnd = new Date(currentStart.getTime() - 1)
          break

        case TimeRange.WEEK:
          currentStart = new Date(now)
          currentStart.setDate(currentStart.getDate() - 7)
          previousStart = new Date(currentStart)
          previousStart.setDate(previousStart.getDate() - 7)
          previousEnd = new Date(currentStart.getTime() - 1)
          break

        case TimeRange.QUARTER:
          currentStart = new Date(now)
          currentStart.setMonth(currentStart.getMonth() - 3)
          previousStart = new Date(currentStart)
          previousStart.setMonth(previousStart.getMonth() - 3)
          previousEnd = new Date(currentStart.getTime() - 1)
          break

        case TimeRange.YEAR:
          currentStart = new Date(now)
          currentStart.setFullYear(currentStart.getFullYear() - 1)
          previousStart = new Date(currentStart)
          previousStart.setFullYear(previousStart.getFullYear() - 1)
          previousEnd = new Date(currentStart.getTime() - 1)
          break

        case TimeRange.MONTH:
        default:
          currentStart = new Date(now)
          currentStart.setMonth(currentStart.getMonth() - 1)
          previousStart = new Date(currentStart)
          previousStart.setMonth(previousStart.getMonth() - 1)
          previousEnd = new Date(currentStart.getTime() - 1)
          break
      }
    }

    return {
      currentPeriod: { start: currentStart, end: currentEnd },
      previousPeriod: { start: previousStart, end: previousEnd },
    }
  }

  private async getMetricWithChange(
    countFn: (startDate: Date | null, endDate: Date | null) => Promise<number>,
    currentPeriod: { start: Date | null; end: Date | null },
    previousPeriod: { start: Date | null; end: Date | null },
  ): Promise<MetricWithChange> {
    const currentValue = await countFn(currentPeriod.start, currentPeriod.end)
    const previousValue = await countFn(
      previousPeriod.start,
      previousPeriod.end,
    )

    let changePercentage: number | null = null
    if (previousValue > 0) {
      changePercentage = Number(
        (((currentValue - previousValue) / previousValue) * 100).toFixed(1),
      )
    }

    return {
      value: currentValue,
      changePercentage,
    }
  }

  async getDocumentAnalytics(
    query: AnalyticsQueryDto,
  ): Promise<DocumentAnalyticsResponseDto> {
    const { currentPeriod } = this.calculateDateRanges(query)

    // Total documents count
    const totalDocuments = await this.prisma.document.count({
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
    })

    // Count documents by status
    const statusCounts = await this.prisma.document.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      _count: true,
    })

    const documentsByStatus = {
      draft: statusCounts.find((s) => s.status === 'DRAFT')?._count || 0,
      pending: statusCounts.find((s) => s.status === 'PENDING')?._count || 0,
      inReview: statusCounts.find((s) => s.status === 'IN_REVIEW')?._count || 0,
      approved: statusCounts.find((s) => s.status === 'APPROVED')?._count || 0,
      rejected: statusCounts.find((s) => s.status === 'REJECTED')?._count || 0,
      archived: statusCounts.find((s) => s.status === 'ARCHIVED')?._count || 0,
    }

    // Count documents by priority
    // NOTE: priority field does not exist in Document model
    //   by: ['priority'],
    //   where: {
    //     deletedAt: null,
    //     ...(currentPeriod.start && currentPeriod.end
    //       ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
    //       : {}),
    //   },
    //   _count: true,
    // })

    const documentsByPriority = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    }

    // Count documents by type
    const typeCounts = await this.prisma.document.groupBy({
      by: ['documentTypeId'],
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      _count: true,
    })

    const documentTypes = await this.prisma.documentType.findMany({
      where: {
        id: { in: typeCounts.map((t) => t.documentTypeId) },
        deletedAt: null,
      },
      select: { id: true, name: true },
    })

    const documentsByType = typeCounts.map((tc) => {
      const type = documentTypes.find((dt) => dt.id === tc.documentTypeId)
      return {
        typeId: type?.id || tc.documentTypeId,
        typeName: type?.name || 'Unknown',
        count: tc._count,
      }
    })

    // Count documents by department (based on creator's department)
    const departmentCounts = await this.prisma.document.groupBy({
      by: ['createdById'],
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      _count: true,
    })

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: departmentCounts.map((dc) => dc.createdById) },
        departmentId: { not: null },
      },
      select: {
        id: true,
        departmentId: true,
        department: {
          select: { id: true, name: true },
        },
      },
    })

    const deptMap = new Map<string, { name: string; count: number }>()
    departmentCounts.forEach((dc) => {
      const user = users.find((u) => u.id === dc.createdById)
      if (user?.department) {
        const existing = deptMap.get(user.department.id) || {
          name: user.department.name,
          count: 0,
        }
        deptMap.set(user.department.id, {
          name: existing.name,
          count: existing.count + dc._count,
        })
      }
    })

    const documentsByDepartment = Array.from(deptMap.entries()).map(
      ([deptId, data]) => ({
        departmentId: deptId,
        departmentName: data.name,
        count: data.count,
      }),
    )

    // Creation trend
    const creationTrend = await this.getCreationTrend(query)

    // Average documents per day
    const daysDiff =
      currentPeriod.start && currentPeriod.end
        ? Math.max(
            1,
            Math.ceil(
              (currentPeriod.end.getTime() - currentPeriod.start.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 30

    const averageDocumentsPerDay = Number(
      (totalDocuments / daysDiff).toFixed(2),
    )

    // Documents with attachments
    const documentsWithAttachments = await this.prisma.document.count({
      where: {
        deletedAt: null,
        attachments: { some: { deletedAt: null } },
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
    })

    // Total versions (sum of all document versions)
    // NOTE: version field does not exist in Document model
    //   where: {
    //     deletedAt: null,
    //     ...(currentPeriod.start && currentPeriod.end
    //       ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
    //       : {}),
    //   },
    //   _sum: { version: true },
    // })

    const totalVersions = 0

    return {
      totalDocuments,
      documentsByStatus,
      documentsByPriority,
      documentsByType,
      documentsByDepartment,
      creationTrend,
      averageDocumentsPerDay,
      documentsWithAttachments,
      totalVersions,
    }
  }

  private async getCreationTrend(
    query: AnalyticsQueryDto,
  ): Promise<Array<{ period: string; count: number }>> {
    const { currentPeriod } = this.calculateDateRanges(query)

    const documents = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      select: { createdAt: true },
    })

    // Group by period based on time range
    const trendMap = new Map<string, number>()

    documents.forEach((doc) => {
      let periodKey: string
      const date = new Date(doc.createdAt)

      switch (query.timeRange) {
        case TimeRange.TODAY:
          periodKey = `${date.getHours()}:00`
          break
        case TimeRange.WEEK:
          periodKey = date.toISOString().split('T')[0]
          break
        case TimeRange.MONTH:
        case TimeRange.QUARTER:
        case TimeRange.YEAR:
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      trendMap.set(periodKey, (trendMap.get(periodKey) || 0) + 1)
    })

    return Array.from(trendMap.entries())
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }

  async getWorkflowAnalytics(
    query: AnalyticsQueryDto,
  ): Promise<WorkflowAnalyticsResponseDto> {
    const { currentPeriod } = this.calculateDateRanges(query)

    // Total workflows count
    const totalWorkflows = await this.prisma.workflow.count({
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
    })

    // Count workflows by status
    const statusCounts = await this.prisma.workflow.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      _count: true,
    })

    const workflowsByStatus = {
      active: statusCounts.find((s) => s.status === 'ACTIVE')?._count || 0,
      paused: statusCounts.find((s) => s.status === 'PAUSED')?._count || 0,
      completed:
        statusCounts.find((s) => s.status === 'COMPLETED')?._count || 0,
      cancelled:
        statusCounts.find((s) => s.status === 'CANCELLED')?._count || 0,
    }

    // Calculate average completion time for completed workflows
    const completedWorkflows = await this.prisma.workflow.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        ...(currentPeriod.start && currentPeriod.end
          ? {
              createdAt: { gte: currentPeriod.start, lte: currentPeriod.end },
            }
          : {}),
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    })

    let averageCompletionTime = 0
    if (completedWorkflows.length > 0) {
      const totalCompletionTime = completedWorkflows.reduce((sum, workflow) => {
        const duration =
          workflow.updatedAt.getTime() - workflow.createdAt.getTime()
        return sum + duration / (1000 * 60 * 60) // Convert to hours
      }, 0)
      averageCompletionTime = Number(
        (totalCompletionTime / completedWorkflows.length).toFixed(2),
      )
    }

    // Count completed workflows in period
    const completedInPeriod = workflowsByStatus.completed

    // Count cancelled workflows in period
    const cancelledInPeriod = workflowsByStatus.cancelled

    // Calculate step completion rates
    const workflowSteps = await this.prisma.workflowStep.findMany({
      where: {
        deletedAt: null,
        workflow: {
          deletedAt: null,
          ...(currentPeriod.start && currentPeriod.end
            ? {
                createdAt: {
                  gte: currentPeriod.start,
                  lte: currentPeriod.end,
                },
              }
            : {}),
        },
      },
      select: {
        order: true,
        status: true,
        actionType: true,
        startedAt: true,
        completedAt: true,
      },
    })

    // Group by step order
    const stepMap = new Map<
      number,
      {
        total: number
        completed: number
        totalTime: number
        actionType: string
      }
    >()

    workflowSteps.forEach((step) => {
      const existing = stepMap.get(step.order) || {
        total: 0,
        completed: 0,
        totalTime: 0,
        actionType: step.actionType,
      }

      existing.total++
      if (step.status === 'COMPLETED' || step.completedAt) {
        existing.completed++
        if (step.startedAt && step.completedAt) {
          const duration = step.completedAt.getTime() - step.startedAt.getTime()
          existing.totalTime += duration / (1000 * 60 * 60) // Convert to hours
        }
      }

      stepMap.set(step.order, existing)
    })

    const stepCompletionRates = Array.from(stepMap.entries())
      .map(([order, data]) => ({
        stepOrder: order,
        stepName: data.actionType,
        completionRate:
          data.total > 0
            ? Number(((data.completed / data.total) * 100).toFixed(1))
            : 0,
        averageCompletionTime:
          data.completed > 0
            ? Number((data.totalTime / data.completed).toFixed(2))
            : 0,
      }))
      .sort((a, b) => a.stepOrder - b.stepOrder)

    // Completion trend
    const workflows = await this.prisma.workflow.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        ...(currentPeriod.start && currentPeriod.end
          ? {
              updatedAt: { gte: currentPeriod.start, lte: currentPeriod.end },
            }
          : {}),
      },
      select: { updatedAt: true },
    })

    const trendMap = new Map<string, number>()
    workflows.forEach((workflow) => {
      let periodKey: string
      const date = new Date(workflow.updatedAt)

      switch (query.timeRange) {
        case TimeRange.TODAY:
          periodKey = `${date.getHours()}:00`
          break
        case TimeRange.WEEK:
          periodKey = date.toISOString().split('T')[0]
          break
        case TimeRange.MONTH:
        case TimeRange.QUARTER:
        case TimeRange.YEAR:
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      trendMap.set(periodKey, (trendMap.get(periodKey) || 0) + 1)
    })

    const completionTrend = Array.from(trendMap.entries())
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period))

    // Calculate average steps per workflow
    const stepsPerWorkflowData = await this.prisma.workflow.findMany({
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      select: {
        _count: {
          select: { workflowSteps: true },
        },
      },
    })

    const averageStepsPerWorkflow =
      stepsPerWorkflowData.length > 0
        ? Number(
            (
              stepsPerWorkflowData.reduce(
                (sum, w) => sum + w._count.workflowSteps,
                0,
              ) / stepsPerWorkflowData.length
            ).toFixed(2),
          )
        : 0

    return {
      totalWorkflows,
      workflowsByStatus,
      averageCompletionTime,
      completedInPeriod,
      cancelledInPeriod,
      stepCompletionRates,
      completionTrend,
      averageStepsPerWorkflow,
    }
  }

  async getUserAnalytics(
    query: AnalyticsQueryDto,
  ): Promise<UserAnalyticsResponseDto> {
    const { currentPeriod } = this.calculateDateRanges(query)

    // Count active users (users who created documents or completed workflow steps)
    const activeUsersData = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            createdDocuments: {
              some: {
                deletedAt: null,
                ...(currentPeriod.start && currentPeriod.end
                  ? {
                      createdAt: {
                        gte: currentPeriod.start,
                        lte: currentPeriod.end,
                      },
                    }
                  : {}),
              },
            },
          },
          {
            assignedWorkflowSteps: {
              some: {
                deletedAt: null,
                ...(currentPeriod.start && currentPeriod.end
                  ? {
                      OR: [
                        {
                          completedAt: {
                            gte: currentPeriod.start,
                            lte: currentPeriod.end,
                          },
                        },
                        {
                          createdAt: {
                            gte: currentPeriod.start,
                            lte: currentPeriod.end,
                          },
                        },
                      ],
                    }
                  : {}),
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        _count: {
          select: {
            createdDocuments: {
              where: {
                deletedAt: null,
                ...(currentPeriod.start && currentPeriod.end
                  ? {
                      createdAt: {
                        gte: currentPeriod.start,
                        lte: currentPeriod.end,
                      },
                    }
                  : {}),
              },
            },
            assignedWorkflowSteps: {
              where: {
                deletedAt: null,
                completedAt: { not: null },
                ...(currentPeriod.start && currentPeriod.end
                  ? {
                      completedAt: {
                        gte: currentPeriod.start,
                        lte: currentPeriod.end,
                      },
                    }
                  : {}),
              },
            },
          },
        },
        assignedWorkflowSteps: {
          where: {
            deletedAt: null,
            completedAt: null,
            status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
          },
          select: { id: true },
        },
      },
    })

    const totalActiveUsers = activeUsersData.length

    // Top 10 active users sorted by total activity
    const topActiveUsers = activeUsersData
      .map((user) => ({
        userId: user.id,
        username: user.username,
        fullName: user.fullname,
        documentsCreated: user._count.createdDocuments,
        workflowStepsCompleted: user._count.assignedWorkflowSteps,
        workflowStepsPending: user.assignedWorkflowSteps.length,
      }))
      .sort(
        (a, b) =>
          b.documentsCreated +
          b.workflowStepsCompleted -
          (a.documentsCreated + a.workflowStepsCompleted),
      )
      .slice(0, 10)

    // Department activity
    const departments = await this.prisma.department.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            createdDocuments: {
              where: {
                deletedAt: null,
                ...(currentPeriod.start && currentPeriod.end
                  ? {
                      createdAt: {
                        gte: currentPeriod.start,
                        lte: currentPeriod.end,
                      },
                    }
                  : {}),
              },
              select: { id: true },
            },
          },
        },
      },
    })

    // Get workflows by department users
    const departmentActivity = await Promise.all(
      departments.map(async (dept) => {
        const userIds = dept.users.map((u) => u.id)
        const documentsCreated = dept.users.reduce(
          (sum, u) => sum + u.createdDocuments.length,
          0,
        )

        // Count completed workflows where any step was assigned to department users
        const workflowsCompleted = await this.prisma.workflow.count({
          where: {
            deletedAt: null,
            status: 'COMPLETED',
            workflowSteps: {
              some: {
                deletedAt: null,
                assignedToUserId: { in: userIds },
                completedAt: { not: null },
              },
            },
            ...(currentPeriod.start && currentPeriod.end
              ? {
                  updatedAt: {
                    gte: currentPeriod.start,
                    lte: currentPeriod.end,
                  },
                }
              : {}),
          },
        })

        // Count active users in department
        const activeUsers = dept.users.filter(
          (u) =>
            u.createdDocuments.length > 0 ||
            activeUsersData.some((au) => au.id === u.id),
        ).length

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          documentsCreated,
          workflowsCompleted,
          activeUsers,
        }
      }),
    )

    // Calculate averages
    const totalDocuments = await this.prisma.document.count({
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? {
              createdAt: { gte: currentPeriod.start, lte: currentPeriod.end },
            }
          : {}),
      },
    })

    const totalWorkflowSteps = await this.prisma.workflowStep.count({
      where: {
        deletedAt: null,
        completedAt: { not: null },
        ...(currentPeriod.start && currentPeriod.end
          ? {
              completedAt: { gte: currentPeriod.start, lte: currentPeriod.end },
            }
          : {}),
      },
    })

    const totalUsers = await this.prisma.user.count({
      where: { deletedAt: null },
    })

    const averageDocumentsPerUser =
      totalUsers > 0 ? Number((totalDocuments / totalUsers).toFixed(2)) : 0

    const averageWorkflowStepsPerUser =
      totalUsers > 0 ? Number((totalWorkflowSteps / totalUsers).toFixed(2)) : 0

    // Activity trend - count unique active users per period
    const documentsWithUsers = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        ...(currentPeriod.start && currentPeriod.end
          ? { createdAt: { gte: currentPeriod.start, lte: currentPeriod.end } }
          : {}),
      },
      select: {
        createdAt: true,
        createdById: true,
      },
    })

    const workflowStepsWithUsers = await this.prisma.workflowStep.findMany({
      where: {
        deletedAt: null,
        completedAt: { not: null },
        ...(currentPeriod.start && currentPeriod.end
          ? {
              completedAt: { gte: currentPeriod.start, lte: currentPeriod.end },
            }
          : {}),
      },
      select: {
        completedAt: true,
        assignedToUserId: true,
      },
    })

    const activityTrendMap = new Map<string, Set<string>>()

    documentsWithUsers.forEach((doc) => {
      let periodKey: string
      const date = new Date(doc.createdAt)

      switch (query.timeRange) {
        case TimeRange.TODAY:
          periodKey = `${date.getHours()}:00`
          break
        case TimeRange.WEEK:
          periodKey = date.toISOString().split('T')[0]
          break
        case TimeRange.MONTH:
        case TimeRange.QUARTER:
        case TimeRange.YEAR:
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!activityTrendMap.has(periodKey)) {
        activityTrendMap.set(periodKey, new Set())
      }
      activityTrendMap.get(periodKey)?.add(doc.createdById)
    })

    workflowStepsWithUsers.forEach((step) => {
      if (!step.assignedToUserId || !step.completedAt) return

      let periodKey: string
      const date = new Date(step.completedAt)

      switch (query.timeRange) {
        case TimeRange.TODAY:
          periodKey = `${date.getHours()}:00`
          break
        case TimeRange.WEEK:
          periodKey = date.toISOString().split('T')[0]
          break
        case TimeRange.MONTH:
        case TimeRange.QUARTER:
        case TimeRange.YEAR:
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!activityTrendMap.has(periodKey)) {
        activityTrendMap.set(periodKey, new Set())
      }
      activityTrendMap.get(periodKey)?.add(step.assignedToUserId)
    })

    const activityTrend = Array.from(activityTrendMap.entries())
      .map(([period, userSet]) => ({ period, count: userSet.size }))
      .sort((a, b) => a.period.localeCompare(b.period))

    return {
      totalActiveUsers,
      topActiveUsers,
      departmentActivity,
      averageDocumentsPerUser,
      averageWorkflowStepsPerUser,
      activityTrend,
    }
  }

  /**
   * Comprehensive KPI statistics for dashboard.
   * Returns everything in one object — frontend picks what it needs.
   */
  async getKpiStatistics(payload: {
    userId: string
    year: number
    month: number
    currentUserRole?: string
    currentUserDepartmentId?: string
  }) {
    const { userId, year, month } = payload
    const admin = isAdmin(payload.currentUserRole)

    // ============ 1. SHAXSIY KPI (joriy oy) ============
    const personalKpi = await this.prisma.userMonthlyKpi.findFirst({
      where: { userId, year, month },
    })

    // ============ 2. SHAXSIY KPI TRENDI (oxirgi 12 oy) ============
    const trend = await this.prisma.userMonthlyKpi.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 12,
      select: {
        year: true,
        month: true,
        finalScore: true,
        tasksCompleted: true,
        tasksOnTime: true,
        tasksLate: true,
        totalEarnedScore: true,
        totalPenalty: true,
        isFullScore: true,
      },
    })

    // ============ 3. KOMPANIYA / DEPARTAMENT REYTINGI ============
    const leaderboard = await this.prisma.userMonthlyKpi.findMany({
      where: {
        year,
        month,
        ...(payload.currentUserDepartmentId && !admin
          ? { departmentId: payload.currentUserDepartmentId }
          : {}),
      },
      orderBy: { finalScore: 'desc' },
      take: 20,
    })

    const leaderboardWithUsers = await Promise.all(
      leaderboard.map(async (k, idx) => {
        const u = await this.prisma.user.findFirst({
          where: { id: k.userId },
          select: {
            id: true,
            fullname: true,
            username: true,
            avatarUrl: true,
            department: { select: { id: true, name: true } },
          },
        })
        return {
          rank: idx + 1,
          user: u,
          finalScore: k.finalScore,
          tasksCompleted: k.tasksCompleted,
          tasksOnTime: k.tasksOnTime,
          tasksLate: k.tasksLate,
          isFullScore: k.isFullScore,
        }
      }),
    )

    // ============ 4. SHAXSIY TOP-5 TASKLAR ============
    const topTasks = await this.prisma.taskKpiScore.findMany({
      where: { userId, periodYear: year, periodMonth: month },
      orderBy: { earnedScore: 'desc' },
      take: 5,
    })

    const topTasksWithDetails = await Promise.all(
      topTasks.map(async (s) => {
        const task = await this.prisma.task.findFirst({
          where: { id: s.taskId },
          select: {
            id: true,
            title: true,
            taskNumber: true,
            project: { select: { name: true, key: true } },
          },
        })
        return {
          taskId: s.taskId,
          task,
          baseScore: s.baseScore,
          earnedScore: s.earnedScore,
          penaltyApplied: s.penaltyApplied,
          daysLate: s.daysLate,
          completedDate: s.completedDate,
        }
      }),
    )

    // ============ 5. DEPARTMENT KPI ============
    let departmentKpi = null
    if (payload.currentUserDepartmentId) {
      const dept = await this.prisma.departmentMonthlyKpi.findFirst({
        where: { departmentId: payload.currentUserDepartmentId, year, month },
      })
      if (dept) {
        const deptInfo = await this.prisma.department.findFirst({
          where: { id: payload.currentUserDepartmentId },
          select: { id: true, name: true },
        })
        departmentKpi = {
          department: deptInfo,
          averageScore: Number(dept.averageScore),
          totalScore: dept.totalScore,
          totalUsers: dept.totalUsers,
          usersAbove85: dept.usersAbove85,
          usersAt100: dept.usersAt100,
          isEligibleForTeamReward: dept.isEligibleForTeamReward,
        }
      }
    }

    // ============ 6. BARCHA DEPARTAMENT REYTINGI (admin uchun) ============
    let allDepartments: any[] = []
    if (admin) {
      const depts = await this.prisma.departmentMonthlyKpi.findMany({
        where: { year, month },
        orderBy: { averageScore: 'desc' },
      })
      allDepartments = await Promise.all(
        depts.map(async (d, idx) => {
          const info = await this.prisma.department.findFirst({
            where: { id: d.departmentId },
            select: { id: true, name: true },
          })
          return {
            rank: idx + 1,
            department: info,
            averageScore: Number(d.averageScore),
            totalUsers: d.totalUsers,
            usersAbove85: d.usersAbove85,
            usersAt100: d.usersAt100,
          }
        }),
      )
    }

    // ============ 7. ACHIEVEMENTLAR ============
    const achievements = await this.prisma.kpiAchievement.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
      take: 10,
    })

    // ============ 8. MUKOFOTLAR (KpiReward) ============
    const myRewards = await this.prisma.kpiReward.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 12,
      include: { rewardTier: true },
    })

    // ============ 9. UMUMIY KOMPANIYA STATISTIKASI ============
    const allKpisThisMonth = await this.prisma.userMonthlyKpi.findMany({
      where: { year, month },
      select: { finalScore: true, isFullScore: true, tasksCompleted: true },
    })

    const companyStats = {
      totalUsers: allKpisThisMonth.length,
      averageScore:
        allKpisThisMonth.length > 0
          ? Math.round(
              allKpisThisMonth.reduce((s, k) => s + k.finalScore, 0) /
                allKpisThisMonth.length,
            )
          : 0,
      usersAt100: allKpisThisMonth.filter((k) => k.isFullScore).length,
      usersAbove85: allKpisThisMonth.filter((k) => k.finalScore >= 85).length,
      usersBelow50: allKpisThisMonth.filter((k) => k.finalScore < 50).length,
      totalTasksCompleted: allKpisThisMonth.reduce(
        (s, k) => s + k.tasksCompleted,
        0,
      ),
    }

    // ============ 10. SHAXSIY POSITION (kompaniya ichida) ============
    const allSorted = await this.prisma.userMonthlyKpi.findMany({
      where: { year, month },
      orderBy: { finalScore: 'desc' },
      select: { userId: true },
    })
    const myPosition = allSorted.findIndex((k) => k.userId === userId) + 1

    // ============ 11. SCORE BREAKDOWN (priority bo'yicha) ============
    const taskScores = await this.prisma.taskKpiScore.findMany({
      where: { userId, periodYear: year, periodMonth: month },
    })
    const scoreBreakdown = {
      byPriority: {} as Record<string, { count: number; earned: number }>,
      onTimeCount: taskScores.filter((s) => s.daysLate === 0).length,
      lateCount: taskScores.filter((s) => s.daysLate > 0).length,
      totalPenalty: taskScores.reduce((s, t) => s + t.penaltyApplied, 0),
      averageDaysLate:
        taskScores.length > 0
          ? Math.round(
              taskScores.reduce((s, t) => s + t.daysLate, 0) /
                taskScores.length,
            )
          : 0,
    }
    for (const s of taskScores) {
      const key = `${s.baseScore}`
      if (!scoreBreakdown.byPriority[key]) {
        scoreBreakdown.byPriority[key] = { count: 0, earned: 0 }
      }
      scoreBreakdown.byPriority[key].count++
      scoreBreakdown.byPriority[key].earned += s.earnedScore
    }

    // ============ 12. ENG SO'NGGI YAKUNLANGAN TASKLAR ============
    const recentCompletedTasks = await this.prisma.taskKpiScore.findMany({
      where: { userId, periodYear: year, periodMonth: month },
      orderBy: { completedDate: 'desc' },
      take: 10,
    })

    const recentTasksWithDetails = await Promise.all(
      recentCompletedTasks.map(async (s) => {
        const task = await this.prisma.task.findFirst({
          where: { id: s.taskId },
          select: {
            id: true,
            title: true,
            taskNumber: true,
            project: { select: { name: true, key: true } },
          },
        })
        return {
          task,
          earnedScore: s.earnedScore,
          completedDate: s.completedDate,
          daysLate: s.daysLate,
        }
      }),
    )

    // ============ FINAL RESPONSE ============
    return {
      period: { year, month },
      personal: personalKpi
        ? {
            finalScore: personalKpi.finalScore,
            totalBaseScore: personalKpi.totalBaseScore,
            totalEarnedScore: personalKpi.totalEarnedScore,
            totalPenalty: personalKpi.totalPenalty,
            tasksCompleted: personalKpi.tasksCompleted,
            tasksOnTime: personalKpi.tasksOnTime,
            tasksLate: personalKpi.tasksLate,
            isFullScore: personalKpi.isFullScore,
            consecutiveFullMonths: personalKpi.consecutiveFullMonths,
            isFinalized: personalKpi.isFinalized,
            position: myPosition,
            totalUsers: companyStats.totalUsers,
          }
        : null,
      trend: trend.reverse(), // eski → yangi
      scoreBreakdown,
      topTasks: topTasksWithDetails,
      recentCompletedTasks: recentTasksWithDetails,
      department: departmentKpi,
      leaderboard: leaderboardWithUsers,
      allDepartments,
      achievements,
      rewards: myRewards,
      companyStats,
    }
  }
}
