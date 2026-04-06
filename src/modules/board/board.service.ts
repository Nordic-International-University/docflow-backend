import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import { BoardMoveDto } from './dtos'

@Injectable()
export class BoardService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async boardRetrieve(projectId: string) {
    const project = await this.#_prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: { id: true },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const columns = await this.#_prisma.boardColumn.findMany({
      where: { projectId, deletedAt: null },
      select: {
        id: true,
        name: true,
        color: true,
        position: true,
        wipLimit: true,
        isClosed: true,
        isDefault: true,
        tasks: {
          where: {
            deletedAt: null,
            isArchived: false,
            parentTaskId: null, // Only top-level tasks
          },
          select: {
            id: true,
            title: true,
            taskNumber: true,
            priority: true,
            score: true,
            dueDate: true,
            completedAt: true,
            position: true,
            coverImageUrl: true,
            assignees: {
              select: {
                user: {
                  select: {
                    id: true,
                    fullname: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            labels: {
              select: {
                label: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
            subtasks: {
              where: { deletedAt: null },
              select: {
                id: true,
                title: true,
                taskNumber: true,
                priority: true,
                score: true,
                completedAt: true,
                assignees: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        fullname: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
            _count: {
              select: {
                subtasks: { where: { deletedAt: null } },
                comments: true,
                attachments: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        },
      },
      orderBy: { position: 'asc' },
    })

    return {
      columns: columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) => ({
          ...task,
          assignees: task.assignees.map((a) => a.user),
          labels: task.labels.map((l) => l.label),
          subtasks: task.subtasks.map((sub) => ({
            ...sub,
            assignees: sub.assignees.map((a) => a.user),
          })),
        })),
      })),
    }
  }

  async boardMove(projectId: string, payload: BoardMoveDto, movedBy: string) {
    const { taskId, toBoardColumnId, position } = payload

    // Load task with subtasks and assignees in one query
    const task = await this.#_prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
        deletedAt: null,
        parentTaskId: null, // Only top-level tasks can be moved
      },
      include: {
        assignees: { select: { userId: true } },
        project: { select: { penaltyPerDay: true } },
        subtasks: {
          where: { deletedAt: null },
          select: {
            id: true,
            assignees: { select: { userId: true } },
            score: true,
            dueDate: true,
          },
        },
      },
    })

    if (!task) {
      throw new NotFoundException('Task not found in this project')
    }

    // Verify target column
    const targetColumn = await this.#_prisma.boardColumn.findFirst({
      where: {
        id: toBoardColumnId,
        projectId,
        deletedAt: null,
      },
      select: { id: true, isClosed: true, wipLimit: true, name: true },
    })

    if (!targetColumn) {
      throw new NotFoundException('Target column not found in this project')
    }

    // WIP limit check (count existing tasks + 1 for the incoming task, exclude if same column)
    if (
      targetColumn.wipLimit != null &&
      task.boardColumnId !== toBoardColumnId
    ) {
      const currentCount = await this.#_prisma.task.count({
        where: {
          boardColumnId: toBoardColumnId,
          deletedAt: null,
          isArchived: false,
          parentTaskId: null,
        },
      })
      if (currentCount >= targetColumn.wipLimit) {
        throw new BadRequestException(
          `Column "${targetColumn.name}" has reached its WIP limit of ${targetColumn.wipLimit}`,
        )
      }
    }

    const fromColumnId = task.boardColumnId
    const subtaskIds = task.subtasks.map((s) => s.id)

    // Board move — faqat column o'zgaradi, completedAt va KPI ga tegmaydi
    await this.#_prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: {
          boardColumnId: toBoardColumnId,
          parentTaskId: null,
          deletedAt: null,
          position: { gte: position },
          id: { not: taskId },
        },
        data: { position: { increment: 1 } },
      })

      await tx.task.update({
        where: { id: taskId },
        data: {
          boardColumnId: toBoardColumnId,
          position,
        },
      })

      if (subtaskIds.length > 0) {
        await tx.task.updateMany({
          where: { id: { in: subtaskIds } },
          data: { boardColumnId: toBoardColumnId },
        })
      }
    })

    // Activity log
    await this.#_prisma.taskActivity.create({
      data: {
        taskId,
        userId: movedBy,
        action: 'MOVED',
        changes: {
          boardColumnId: { old: fromColumnId, new: toBoardColumnId },
          ...(subtaskIds.length > 0 && { subtasksMoved: subtaskIds.length }),
        },
      },
    })

    await this.#_auditLogService.logAction(
      'Task',
      taskId,
      AuditAction.UPDATE,
      movedBy,
      {
        changes: {
          boardColumnId: { old: fromColumnId, new: toBoardColumnId },
        },
      },
    )

    const affectedColumns = [fromColumnId, toBoardColumnId].filter(
      Boolean,
    ) as string[]

    return {
      movedTask: {
        id: taskId,
        boardColumnId: toBoardColumnId,
        subtasksMoved: subtaskIds.length,
      },
      affectedColumns: [...new Set(affectedColumns)],
    }
  }
}
