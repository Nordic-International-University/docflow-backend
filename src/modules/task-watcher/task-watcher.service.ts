import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskWatcherCreateRequest,
  TaskWatcherDeleteRequest,
  TaskWatcherRetrieveAllRequest,
  TaskWatcherRetrieveAllResponse,
  TaskWatcherRetrieveOneRequest,
  TaskWatcherRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class TaskWatcherService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskWatcherCreate(payload: TaskWatcherCreateRequest): Promise<void> {
    // Verify task exists
    const task = await this.#_prisma.task.findFirst({
      where: {
        id: payload.taskId,
        deletedAt: null,
      },
    })

    if (!task) {
      throw new NotFoundException('Task not found')
    }

    // Verify user exists
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.userId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Check for duplicate watcher
    const existingWatcher = await this.#_prisma.taskWatcher.findUnique({
      where: {
        taskId_userId: {
          taskId: payload.taskId,
          userId: payload.userId!,
        },
      },
    })

    if (existingWatcher) {
      throw new ConflictException('User is already watching this task')
    }

    const watcher = await this.#_prisma.taskWatcher.create({
      data: {
        taskId: payload.taskId,
        userId: payload.userId!,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskWatcher',
      watcher.id,
      AuditAction.CREATE,
      payload.createdBy || watcher.id,
      {
        newValues: {
          taskId: watcher.taskId,
          userId: watcher.userId,
        },
      },
    )
  }

  async taskWatcherRetrieveAll(
    payload: TaskWatcherRetrieveAllRequest,
  ): Promise<TaskWatcherRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where = {
      ...(payload.taskId && { taskId: payload.taskId }),
      ...(payload.userId && { userId: payload.userId }),
    }

    const watchers = await this.#_prisma.taskWatcher.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        userId: true,
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskWatcher.count({ where })

    return {
      data: watchers,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskWatcherRetrieveOne(
    payload: TaskWatcherRetrieveOneRequest,
  ): Promise<TaskWatcherRetrieveOneResponse> {
    const watcher = await this.#_prisma.taskWatcher.findFirst({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
        createdAt: true,
      },
    })

    if (!watcher) {
      throw new NotFoundException('Task watcher not found')
    }

    return watcher as TaskWatcherRetrieveOneResponse
  }

  async taskWatcherDelete(payload: TaskWatcherDeleteRequest): Promise<void> {
    const existingWatcher = await this.#_prisma.taskWatcher.findUnique({
      where: {
        taskId_userId: {
          taskId: payload.taskId,
          userId: payload.userId,
        },
      },
    })

    if (!existingWatcher) {
      throw new NotFoundException('Task watcher not found')
    }

    // Hard delete - no soft delete for watchers
    await this.#_prisma.taskWatcher.delete({
      where: {
        taskId_userId: {
          taskId: payload.taskId,
          userId: payload.userId,
        },
      },
    })

    await this.#_auditLogService.logAction(
      'TaskWatcher',
      existingWatcher.id,
      AuditAction.DELETE,
      payload.userId,
      {
        oldValues: {
          taskId: existingWatcher.taskId,
          userId: existingWatcher.userId,
        },
      },
    )
  }
}
