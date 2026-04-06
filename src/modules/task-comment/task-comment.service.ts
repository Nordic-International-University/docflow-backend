import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskCommentCreateRequest,
  TaskCommentDeleteRequest,
  TaskCommentRetrieveAllRequest,
  TaskCommentRetrieveAllResponse,
  TaskCommentRetrieveOneRequest,
  TaskCommentRetrieveOneResponse,
  TaskCommentUpdateRequest,
} from './interfaces'

@Injectable()
export class TaskCommentService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskCommentCreate(payload: TaskCommentCreateRequest): Promise<void> {
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

    // Validate parent comment if provided
    if (payload.parentCommentId) {
      const parentComment = await this.#_prisma.taskComment.findFirst({
        where: {
          id: payload.parentCommentId,
          taskId: payload.taskId,
          deletedAt: null,
        },
      })

      if (!parentComment) {
        throw new BadRequestException(
          'Parent comment not found or does not belong to this task',
        )
      }
    }

    const comment = await this.#_prisma.taskComment.create({
      data: {
        taskId: payload.taskId,
        userId: payload.userId,
        content: payload.content,
        parentCommentId: payload.parentCommentId,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskComment',
      comment.id,
      AuditAction.CREATE,
      payload.userId,
      {
        newValues: {
          taskId: comment.taskId,
          content: comment.content,
          parentCommentId: comment.parentCommentId,
        },
      },
    )
  }

  async taskCommentRetrieveAll(
    payload: TaskCommentRetrieveAllRequest,
  ): Promise<TaskCommentRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

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

    const where: any = {
      taskId: payload.taskId,
      deletedAt: null,
      parentCommentId: null, // Only get top-level comments
    }

    const comments = await this.#_prisma.taskComment.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        userId: true,
        content: true,
        parentCommentId: true,
        isEdited: true,
        editedAt: true,
        user: {
          select: {
            id: true,
            fullname: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskComment.count({ where })

    const data = comments.map((comment) => ({
      ...comment,
      repliesCount: comment._count.replies,
      reactionsCount: comment._count.reactions,
      _count: undefined,
    }))

    return {
      data,
      count,
      pageNumber,
      pageSize,
    }
  }

  async taskCommentRetrieveOne(
    payload: TaskCommentRetrieveOneRequest,
  ): Promise<TaskCommentRetrieveOneResponse> {
    const comment = await this.#_prisma.taskComment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        content: true,
        parentCommentId: true,
        isEdited: true,
        editedAt: true,
        user: {
          select: {
            id: true,
            fullname: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!comment) {
      throw new NotFoundException('Task comment not found')
    }

    return {
      ...comment,
      repliesCount: comment._count.replies,
      reactionsCount: comment._count.reactions,
      _count: undefined,
    } as TaskCommentRetrieveOneResponse
  }

  async taskCommentUpdate(payload: TaskCommentUpdateRequest): Promise<void> {
    const { id, updatedBy, content } = payload

    const existingComment = await this.#_prisma.taskComment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingComment) {
      throw new NotFoundException('Task comment not found')
    }

    await this.#_prisma.taskComment.update({
      where: { id },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (content !== existingComment.content) {
      changes.content = { old: existingComment.content, new: content }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'TaskComment',
        id,
        AuditAction.UPDATE,
        updatedBy,
        { changes },
      )
    }
  }

  async taskCommentDelete(payload: TaskCommentDeleteRequest): Promise<void> {
    const existingComment = await this.#_prisma.taskComment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingComment) {
      throw new NotFoundException('Task comment not found')
    }

    // Soft delete
    await this.#_prisma.taskComment.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'TaskComment',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy,
      {
        oldValues: {
          content: existingComment.content,
          taskId: existingComment.taskId,
        },
      },
    )
  }
}
