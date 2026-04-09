import { ROLE_NAMES } from '@constants'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log'
import { AuditAction } from '../audit-log'
import { TaskPriority } from '@prisma/client'
import { NotificationService } from '../notification'
import { KpiCalculationService } from '../user-monthly-kpi'
import { TaskGateway } from './task.gateway'
import { TaskCreateDto, TaskUpdateDto, TaskRetrieveQueryDto } from './dtos'

const VALID_PRIORITIES = Object.values(TaskPriority)

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService
  readonly #_notificationService: NotificationService
  readonly #_kpiService: KpiCalculationService
  readonly #_taskGateway: TaskGateway

  constructor(
    prisma: PrismaService,
    auditLogService: AuditLogService,
    notificationService: NotificationService,
    kpiService: KpiCalculationService,
    taskGateway: TaskGateway,
  ) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
    this.#_notificationService = notificationService
    this.#_kpiService = kpiService
    this.#_taskGateway = taskGateway
  }

  private async resolveScore(
    scoreConfigId?: string | null,
    manualScore?: number | null,
  ): Promise<number> {
    if (scoreConfigId) {
      const config = await this.#_prisma.taskScoreConfig.findFirst({
        where: { id: scoreConfigId, isActive: true, deletedAt: null },
        select: { baseScore: true },
      })
      if (config) return config.baseScore
    }

    if (manualScore != null && manualScore > 0) return manualScore
    return 0
  }
  private async scoreTaskKpi(
    taskId: string,
    score: number,
    dueDate: Date | null,
    assigneeUserIds: string[],
    penaltyPerDay: number,
  ): Promise<void> {
    if (assigneeUserIds.length === 0) return

    const now = new Date()
    const daysLate = dueDate
      ? Math.max(
          0,
          Math.floor((now.getTime() - dueDate.getTime()) / 86_400_000),
        )
      : 0
    const penalty = daysLate > 0 ? daysLate * penaltyPerDay : 0
    const earnedScore = Math.max(0, score - penalty)
    const periodYear = now.getFullYear()
    const periodMonth = now.getMonth() + 1

    // N+1 fix: parallel upsert (sequential o'rniga)
    await Promise.all(
      assigneeUserIds.map((userId) =>
        this.#_prisma.taskKpiScore.upsert({
          where: { taskId_userId: { taskId, userId } },
          create: {
            taskId,
            userId,
            baseScore: score,
            earnedScore,
            penaltyApplied: penalty,
            dueDate: dueDate ?? now,
            completedDate: now,
            daysLate,
            periodYear,
            periodMonth,
            breakdown: {
              baseScore: score,
              daysLate,
              penaltyPerDay,
              totalPenalty: penalty,
              earned: earnedScore,
            },
          },
          update: {
            baseScore: score,
            earnedScore,
            penaltyApplied: penalty,
            completedDate: now,
            daysLate,
            periodYear,
            periodMonth,
            breakdown: {
              baseScore: score,
              daysLate,
              penaltyPerDay,
              totalPenalty: penalty,
              earned: earnedScore,
            },
          },
        }),
      ),
    )

    // Monthly KPI yangilash (parallel)
    await Promise.all(
      assigneeUserIds.map((userId) =>
        this.#_kpiService
          .updateUserMonthlyKpi(userId, periodYear, periodMonth)
          .catch((err: any) =>
            this.logger.warn(`KPI update failed for ${userId}: ${err.message}`),
          ),
      ),
    )
  }

  /**
   * Remove KPI scores when task is reopened. Updates monthly KPI.
   */
  private async removeTaskKpi(taskId: string): Promise<void> {
    const existing = await this.#_prisma.taskKpiScore.findMany({
      where: { taskId },
      select: { userId: true, periodYear: true, periodMonth: true },
    })

    if (existing.length === 0) return

    await this.#_prisma.taskKpiScore.deleteMany({ where: { taskId } })

    // N+1 fix: Re-aggregate monthly KPI (parallel)
    await Promise.all(
      existing.map((score) =>
        this.#_kpiService
          .updateUserMonthlyKpi(score.userId, score.periodYear, score.periodMonth)
          .catch((err: any) =>
            this.logger.warn(`KPI re-aggregate failed: ${err.message}`),
          ),
      ),
    )
  }

  async taskCreate(
    payload: TaskCreateDto & { createdById: string },
  ): Promise<void> {
    const project = await this.#_prisma.project.findFirst({
      where: { id: payload.projectId, deletedAt: null },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    if (payload.parentTaskId) {
      const parentTask = await this.#_prisma.task.findFirst({
        where: {
          id: payload.parentTaskId,
          projectId: payload.projectId,
          deletedAt: null,
        },
      })
      if (!parentTask) {
        throw new NotFoundException(
          'Parent task not found or not in same project',
        )
      }
    }

    // Resolve score from config or manual input
    const resolvedScore = await this.resolveScore(
      payload.scoreConfigId,
      payload.score,
    )

    // Everything inside transaction for data integrity
    const task = await this.#_prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id: payload.projectId },
        data: { taskCounter: { increment: 1 } },
        select: { taskCounter: true },
      })

      // Resolve board column: provided → default → null
      let boardColumnId = payload.boardColumnId
      if (!boardColumnId) {
        const defaultColumn = await tx.boardColumn.findFirst({
          where: {
            projectId: payload.projectId,
            isDefault: true,
            deletedAt: null,
          },
          select: { id: true },
        })
        boardColumnId = defaultColumn?.id
      } else {
        const column = await tx.boardColumn.findFirst({
          where: {
            id: boardColumnId,
            projectId: payload.projectId,
            deletedAt: null,
          },
        })
        if (!column) {
          throw new NotFoundException(
            'Board column not found or not in same project',
          )
        }
      }

      const priority =
        payload.priority &&
        VALID_PRIORITIES.includes(payload.priority as TaskPriority)
          ? (payload.priority as TaskPriority)
          : TaskPriority.MEDIUM

      const created = await tx.task.create({
        data: {
          title: payload.title,
          description: payload.description,
          projectId: payload.projectId,
          categoryId: payload.categoryId,
          priority,
          createdById: payload.createdById,
          parentTaskId: payload.parentTaskId,
          startDate: payload.startDate
            ? new Date(payload.startDate)
            : undefined,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
          estimatedHours: payload.estimatedHours,
          position: payload.position || 0,
          taskNumber: updatedProject.taskCounter,
          boardColumnId,
          score: resolvedScore || undefined,
          coverImageUrl: payload.coverImageUrl,
        },
      })

      // Create assignees inside transaction
      if (payload.assigneeIds && payload.assigneeIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: payload.assigneeIds.map((userId) => ({
            taskId: created.id,
            userId,
          })),
          skipDuplicates: true,
        })
      }

      // Auto-add creator as watcher
      await tx.taskWatcher.create({
        data: { taskId: created.id, userId: payload.createdById },
      })

      return created
    })

    await this.#_prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: payload.createdById,
        action: 'CREATED',
        changes: { title: task.title, priority: task.priority },
      },
    })

    await this.#_auditLogService.logAction(
      'Task',
      task.id,
      AuditAction.CREATE,
      payload.createdById,
      { newValues: { title: task.title, projectId: task.projectId } },
    )

    // Real-time broadcast: task created
    this.#_taskGateway.emitTaskCreated(
      task.projectId,
      task,
      payload.createdById,
    )

    // Notify assignees (skip creator — they already know)
    if (payload.assigneeIds?.length) {
      for (const userId of payload.assigneeIds) {
        if (userId === payload.createdById) continue
        try {
          await this.#_notificationService.createTaskAssignedNotification({
            userId,
            assignedById: payload.createdById,
            taskId: task.id,
            taskTitle: task.title,
            taskNumber: task.taskNumber,
            projectKey: project.key,
            projectId: task.projectId,
            score: task.score ?? undefined,
          })
        } catch {
          // Notification failure should never block task creation
        }
      }
    }
  }

  async taskRetrieveAll(
    payload: TaskRetrieveQueryDto & {
      userId?: string
      roleName?: string
      userDepartmentId?: string
    },
  ) {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    // Project visibility filter — faqat ko'rinadigan loyihalar tasklari
    const isAdmin =
      payload.roleName === ROLE_NAMES.SUPER_ADMIN || payload.roleName === ROLE_NAMES.ADMIN

    const projectAccessFilter: any = isAdmin
      ? {}
      : {
          project: {
            OR: [
              { visibility: 'PUBLIC' },
              { createdById: payload.userId },
              { members: { some: { userId: payload.userId } } },
              ...(payload.userDepartmentId
                ? [
                    {
                      visibility: 'DEPARTMENT',
                      departmentId: payload.userDepartmentId,
                    },
                  ]
                : []),
            ],
          },
        }

    const where: any = {
      deletedAt: null,
      isArchived: false,
      ...projectAccessFilter,
      ...(payload.search && {
        OR: [
          { title: { contains: payload.search, mode: 'insensitive' as const } },
          {
            description: {
              contains: payload.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...(payload.projectId && { projectId: payload.projectId }),
      ...(payload.priority && { priority: payload.priority as TaskPriority }),
      ...(payload.assigneeId && {
        assignees: { some: { userId: payload.assigneeId } },
      }),
      ...(payload.createdById && { createdById: payload.createdById }),
      ...(payload.categoryId && { categoryId: payload.categoryId }),
      ...(payload.parentTaskId && { parentTaskId: payload.parentTaskId }),
      ...(payload.boardColumnId && { boardColumnId: payload.boardColumnId }),
    }

    const taskList = await this.#_prisma.task.findMany({
      where,
      select: {
        id: true,
        taskNumber: true,
        title: true,
        description: true,
        projectId: true,
        project: {
          select: { id: true, name: true, key: true },
        },
        categoryId: true,
        category: {
          select: { id: true, name: true, color: true },
        },
        priority: true,
        score: true,
        boardColumnId: true,
        boardColumn: {
          select: { id: true, name: true, color: true },
        },
        assignees: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        createdById: true,
        createdBy: {
          select: { id: true, fullname: true, username: true },
        },
        parentTaskId: true,
        startDate: true,
        dueDate: true,
        completedAt: true,
        estimatedHours: true,
        actualHours: true,
        position: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        subtasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, priority: true, score: true },
        },
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true,
            watchers: true,
          },
        },
      },
      skip,
      take,
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    })

    const count = await this.#_prisma.task.count({ where })

    return {
      data: taskList.map((t) => ({
        ...t,
        estimatedHours: t.estimatedHours ? Number(t.estimatedHours) : undefined,
        actualHours: t.actualHours ? Number(t.actualHours) : undefined,
      })),
      count,
      pageNumber,
      pageSize,
    }
  }

  async taskRetrieveOne(payload: { id: string }) {
    const task = await this.#_prisma.task.findFirst({
      where: { id: payload.id, deletedAt: null },
      select: {
        id: true,
        taskNumber: true,
        title: true,
        description: true,
        projectId: true,
        project: {
          select: { id: true, name: true, key: true },
        },
        categoryId: true,
        category: {
          select: { id: true, name: true, color: true },
        },
        priority: true,
        score: true,
        boardColumnId: true,
        boardColumn: {
          select: { id: true, name: true, color: true, isClosed: true },
        },
        assignees: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        createdById: true,
        createdBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
            avatarUrl: true,
          },
        },
        parentTaskId: true,
        parentTask: {
          select: { id: true, title: true },
        },
        startDate: true,
        dueDate: true,
        completedAt: true,
        estimatedHours: true,
        actualHours: true,
        position: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        subtasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, priority: true, score: true },
        },
        labels: {
          select: {
            id: true,
            label: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        watchers: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true,
            checklists: true,
            timeEntries: true,
          },
        },
      },
    })

    if (!task) {
      throw new NotFoundException('Task not found')
    }

    return {
      ...task,
      estimatedHours: task.estimatedHours
        ? Number(task.estimatedHours)
        : undefined,
      actualHours: task.actualHours ? Number(task.actualHours) : undefined,
    }
  }

  async taskUpdate(
    payload: TaskUpdateDto & { id: string; updatedBy: string },
  ): Promise<void> {
    const { id, updatedBy, assigneeIds, scoreConfigId, ...updateData } = payload

    const existingTask = await this.#_prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: {
        assignees: { select: { userId: true } },
        project: { select: { key: true, penaltyPerDay: true } },
      },
    })

    if (!existingTask) {
      throw new NotFoundException('Task not found')
    }

    const now = new Date()

    const updatePayload: any = {
      updatedAt: now,
    }

    if (updateData.title !== undefined) {
      updatePayload.title = updateData.title
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description
    }
    if (updateData.categoryId !== undefined) {
      updatePayload.categoryId = updateData.categoryId || null
    }
    if (updateData.priority !== undefined) {
      if (VALID_PRIORITIES.includes(updateData.priority as TaskPriority)) {
        updatePayload.priority = updateData.priority as TaskPriority
      }
    }
    if (updateData.parentTaskId !== undefined) {
      updatePayload.parentTaskId = updateData.parentTaskId || null
    }
    if (updateData.startDate !== undefined) {
      updatePayload.startDate = updateData.startDate
        ? new Date(updateData.startDate)
        : null
    }
    if (updateData.dueDate !== undefined) {
      updatePayload.dueDate = updateData.dueDate
        ? new Date(updateData.dueDate)
        : null
    }
    if (updateData.estimatedHours !== undefined) {
      updatePayload.estimatedHours = updateData.estimatedHours
    }
    if (updateData.actualHours !== undefined) {
      updatePayload.actualHours = updateData.actualHours
    }
    if (updateData.position !== undefined) {
      updatePayload.position = updateData.position
    }
    if (updateData.boardColumnId !== undefined) {
      updatePayload.boardColumnId = updateData.boardColumnId || null
    }
    // Score: scoreConfigId yoki qo'lda kiritilgan score
    if (scoreConfigId || updateData.score !== undefined) {
      const resolved = await this.resolveScore(scoreConfigId, updateData.score)
      if (resolved > 0) updatePayload.score = resolved
    }
    if (updateData.coverImageUrl !== undefined) {
      updatePayload.coverImageUrl = updateData.coverImageUrl || null
    }

    await this.#_prisma.task.update({
      where: { id },
      data: updatePayload,
    })

    // Move subtasks to the same column when parent moves
    if (
      updateData.boardColumnId &&
      updateData.boardColumnId !== existingTask.boardColumnId &&
      !existingTask.parentTaskId // only for top-level tasks
    ) {
      await this.#_prisma.task.updateMany({
        where: {
          parentTaskId: id,
          deletedAt: null,
        },
        data: {
          boardColumnId: updateData.boardColumnId,
        },
      })
    }

    // Handle assignees update
    if (assigneeIds !== undefined) {
      const existingAssigneeIds = existingTask.assignees.map((a) => a.userId)
      const newAssigneeIds = assigneeIds || []

      const toRemove = existingAssigneeIds.filter(
        (userId) => !newAssigneeIds.includes(userId),
      )
      const toAdd = newAssigneeIds.filter(
        (userId) => !existingAssigneeIds.includes(userId),
      )

      if (toRemove.length > 0) {
        await this.#_prisma.taskAssignee.deleteMany({
          where: { taskId: id, userId: { in: toRemove } },
        })
      }

      if (toAdd.length > 0) {
        await this.#_prisma.taskAssignee.createMany({
          data: toAdd.map((userId) => ({ taskId: id, userId })),
          skipDuplicates: true,
        })

        // Notify only NEW assignees (skip the person who did the update)
        for (const userId of toAdd) {
          if (userId === updatedBy) continue
          try {
            await this.#_notificationService.createTaskAssignedNotification({
              userId,
              assignedById: updatedBy,
              taskId: id,
              taskTitle: existingTask.title,
              taskNumber: existingTask.taskNumber,
              projectKey: existingTask.project?.key ?? '',
              projectId: existingTask.projectId,
              score: existingTask.score ?? undefined,
            })
          } catch {
            // Notification failure should never block task update
          }
        }
      }
    }

    // Track changes
    const changes: Record<string, any> = {}
    if (updateData.title && updateData.title !== existingTask.title) {
      changes.title = { old: existingTask.title, new: updateData.title }
    }
    if (
      updateData.boardColumnId &&
      updateData.boardColumnId !== existingTask.boardColumnId
    ) {
      changes.boardColumnId = {
        old: existingTask.boardColumnId,
        new: updateData.boardColumnId,
      }
    }
    if (updateData.priority && updateData.priority !== existingTask.priority) {
      changes.priority = {
        old: existingTask.priority,
        new: updateData.priority,
      }
    }
    if (assigneeIds !== undefined) {
      const existingAssigneeIds = existingTask.assignees.map((a) => a.userId)
      if (
        JSON.stringify(existingAssigneeIds.sort()) !==
        JSON.stringify((assigneeIds || []).sort())
      ) {
        changes.assignees = {
          old: existingAssigneeIds,
          new: assigneeIds || [],
        }
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_prisma.taskActivity.create({
        data: {
          taskId: id,
          userId: updatedBy,
          action: 'UPDATED',
          changes,
        },
      })

      await this.#_auditLogService.logAction(
        'Task',
        id,
        AuditAction.UPDATE,
        updatedBy,
        {
          changes,
        },
      )
    }

    // Real-time broadcast: task updated
    const updatedTask = await this.#_prisma.task.findFirst({
      where: { id },
      include: {
        assignees: {
          include: {
            user: { select: { id: true, fullname: true, username: true } },
          },
        },
        category: { select: { id: true, name: true, color: true } },
        boardColumn: { select: { id: true, name: true } },
      },
    })
    if (updatedTask) {
      // Board move emit
      if (
        updateData.boardColumnId &&
        updateData.boardColumnId !== existingTask.boardColumnId
      ) {
        this.#_taskGateway.emitTaskMoved(
          existingTask.projectId,
          id,
          existingTask.boardColumnId || '',
          updateData.boardColumnId,
          updatedBy,
        )
      }
      this.#_taskGateway.emitTaskUpdated(
        existingTask.projectId,
        updatedTask,
        updatedBy,
      )
    }
  }

  /**
   * Topshiriqni yakunlash — KPI hisoblanadi.
   * Board column'dan mustaqil ishlaydi.
   */
  async taskComplete(payload: {
    id: string
    completedBy: string
  }): Promise<any> {
    const task = await this.#_prisma.task.findFirst({
      where: { id: payload.id, deletedAt: null },
      include: {
        assignees: { select: { userId: true } },
        project: { select: { penaltyPerDay: true } },
        subtasks: {
          where: { deletedAt: null, completedAt: null },
          include: {
            assignees: { select: { userId: true } },
          },
        },
      },
    })

    if (!task) throw new NotFoundException('Topshiriq topilmadi')

    const now = new Date()

    // Set completedAt if not already set (boardMove may have set it already)
    if (!task.completedAt) {
      await this.#_prisma.task.update({
        where: { id: payload.id },
        data: { completedAt: now },
      })
    }

    const subtaskIds = task.subtasks.map((s) => s.id)
    if (subtaskIds.length > 0) {
      await this.#_prisma.task.updateMany({
        where: { id: { in: subtaskIds } },
        data: { completedAt: now },
      })
    }

    // KPI for main task — use stored score (set from config at create/update)
    const score = task.score ?? 0
    const penaltyPerDay = task.project?.penaltyPerDay ?? 5
    if (score > 0) {
      await this.scoreTaskKpi(
        payload.id,
        score,
        task.dueDate,
        task.assignees.map((a) => a.userId),
        penaltyPerDay,
      )
    }

    // KPI for subtasks
    for (const sub of task.subtasks) {
      const subScore = (sub as any).score ?? 0
      if (subScore <= 0) continue
      await this.scoreTaskKpi(
        sub.id,
        subScore,
        (sub as any).dueDate,
        sub.assignees.map((a) => a.userId),
        penaltyPerDay,
      )
    }

    // Activity log
    await this.#_prisma.taskActivity.create({
      data: {
        taskId: payload.id,
        userId: payload.completedBy,
        action: 'COMPLETED',
        changes: { score, completedAt: now.toISOString() },
      },
    })

    await this.#_auditLogService.logAction(
      'Task',
      payload.id,
      AuditAction.UPDATE,
      payload.completedBy,
      { changes: { status: { old: 'in_progress', new: 'completed' } } },
    )

    // Real-time
    this.#_taskGateway.emitTaskUpdated(
      task.projectId,
      { ...task, completedAt: now, score },
      payload.completedBy,
    )

    return {
      message: 'Topshiriq yakunlandi',
      taskId: payload.id,
      score,
      completedAt: now,
    }
  }

  /**
   * Topshiriqni qayta ochish — KPI bekor qilinadi.
   */
  async taskUncomplete(payload: {
    id: string
    reopenedBy: string
  }): Promise<any> {
    const task = await this.#_prisma.task.findFirst({
      where: { id: payload.id, deletedAt: null },
      include: {
        subtasks: { where: { deletedAt: null }, select: { id: true } },
      },
    })

    if (!task) throw new NotFoundException('Topshiriq topilmadi')

    // Clear completedAt if set (boardMove may have cleared it already)
    if (task.completedAt) {
      await this.#_prisma.task.update({
        where: { id: payload.id },
        data: { completedAt: null },
      })
    }

    const subtaskIds = task.subtasks.map((s) => s.id)
    if (subtaskIds.length > 0) {
      await this.#_prisma.task.updateMany({
        where: { id: { in: subtaskIds } },
        data: { completedAt: null },
      })
      // Remove subtask KPI scores
      for (const sub of task.subtasks) {
        await this.removeTaskKpi(sub.id)
      }
    }

    // Remove KPI scores and re-aggregate
    await this.removeTaskKpi(payload.id)

    // Activity log
    await this.#_prisma.taskActivity.create({
      data: {
        taskId: payload.id,
        userId: payload.reopenedBy,
        action: 'REOPENED',
        changes: {
          completedAt: { old: task.completedAt?.toISOString(), new: null },
        },
      },
    })

    await this.#_auditLogService.logAction(
      'Task',
      payload.id,
      AuditAction.UPDATE,
      payload.reopenedBy,
      { changes: { status: { old: 'completed', new: 'reopened' } } },
    )

    // Real-time
    this.#_taskGateway.emitTaskUpdated(
      task.projectId,
      { ...task, completedAt: null },
      payload.reopenedBy,
    )

    return { message: 'Topshiriq qayta ochildi', taskId: payload.id }
  }

  async taskDelete(payload: { id: string; deletedBy: string }): Promise<void> {
    const existingTask = await this.#_prisma.task.findFirst({
      where: { id: payload.id, deletedAt: null },
    })

    if (!existingTask) {
      throw new NotFoundException('Task not found')
    }

    await this.#_prisma.task.update({
      where: { id: payload.id },
      data: { deletedAt: new Date() },
    })

    await this.#_auditLogService.logAction(
      'Task',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy,
      {
        oldValues: {
          title: existingTask.title,
          projectId: existingTask.projectId,
        },
      },
    )

    // Real-time broadcast: task deleted
    this.#_taskGateway.emitTaskDeleted(
      existingTask.projectId,
      payload.id,
      payload.deletedBy,
    )
  }
}
