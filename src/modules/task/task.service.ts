import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import { TaskPriority } from '@prisma/client'
import { NotificationService } from '../notification/notification.service'
import { TaskCreateDto, TaskUpdateDto, TaskRetrieveQueryDto } from './dtos'

const VALID_PRIORITIES = Object.values(TaskPriority)

@Injectable()
export class TaskService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService
  readonly #_notificationService: NotificationService

  constructor(
    prisma: PrismaService,
    auditLogService: AuditLogService,
    notificationService: NotificationService,
  ) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
    this.#_notificationService = notificationService
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
          score: payload.score,
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

  async taskRetrieveAll(payload: TaskRetrieveQueryDto) {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
      deletedAt: null,
      isArchived: false,
      ...(payload.search && {
        OR: [
          {
            title: { contains: payload.search, mode: 'insensitive' as const },
          },
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
    const { id, updatedBy, assigneeIds, ...updateData } = payload

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

    // Determine if task is moving to/from a closed column
    let isCompleting = false
    let isReopening = false
    if (
      updateData.boardColumnId &&
      updateData.boardColumnId !== existingTask.boardColumnId
    ) {
      const targetColumn = await this.#_prisma.boardColumn.findFirst({
        where: { id: updateData.boardColumnId, deletedAt: null },
        select: { isClosed: true },
      })
      if (targetColumn?.isClosed && !existingTask.completedAt) {
        isCompleting = true
      } else if (!targetColumn?.isClosed && existingTask.completedAt) {
        isReopening = true
      }
    }

    const now = new Date()

    const updatePayload: any = {
      updatedAt: now,
      ...(isCompleting && { completedAt: now }),
      ...(isReopening && { completedAt: null }),
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
    if (updateData.score !== undefined) {
      updatePayload.score = updateData.score
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
          ...(isCompleting && { completedAt: now }),
          ...(isReopening && { completedAt: null }),
        },
      })
    }

    // Calculate KPI scores for assignees when task is completed
    if (
      isCompleting &&
      existingTask.score != null &&
      existingTask.assignees.length > 0
    ) {
      const penaltyPerDay = existingTask.project?.penaltyPerDay ?? 5
      const daysLate = existingTask.dueDate
        ? Math.max(
            0,
            Math.floor(
              (now.getTime() - existingTask.dueDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0
      const penalty = daysLate > 0 ? daysLate * penaltyPerDay : 0
      const earnedScore = Math.max(0, existingTask.score - penalty)

      for (const assignee of existingTask.assignees) {
        try {
          await this.#_prisma.taskKpiScore.create({
            data: {
              taskId: id,
              userId: assignee.userId,
              baseScore: existingTask.score,
              earnedScore,
              penaltyApplied: penalty,
              dueDate: existingTask.dueDate ?? now,
              completedDate: now,
              daysLate,
              periodYear: now.getFullYear(),
              periodMonth: now.getMonth() + 1,
              breakdown: {
                baseScore: existingTask.score,
                daysLate,
                penaltyPerDay,
                totalPenalty: penalty,
                earned: earnedScore,
              },
            },
          })
        } catch {
          // KPI scoring errors should not fail task completion
        }
      }
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
  }
}
