import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import { TaskGateway } from '../task/task.gateway'
import { NotificationService } from '../notification/notification.service'
import {
  TaskCommentCreateRequest,
  TaskCommentDeleteRequest,
  TaskCommentRetrieveAllRequest,
  TaskCommentRetrieveAllResponse,
  TaskCommentRetrieveOneRequest,
  TaskCommentRetrieveOneResponse,
  TaskCommentUpdateRequest,
} from './interfaces'
import { bestEffort, parsePagination } from '@common/helpers'

// Reusable select for comment with all nested data
const COMMENT_SELECT = {
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
      username: true,
      avatarUrl: true,
    },
  },
  reactions: {
    select: {
      id: true,
      emoji: true,
      userId: true,
      user: {
        select: {
          id: true,
          fullname: true,
        },
      },
    },
  },
  attachments: {
    select: {
      id: true,
      attachment: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileSize: true,
          mimeType: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          fullname: true,
        },
      },
      createdAt: true,
    },
  },
  mentions: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          fullname: true,
          username: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as const

const REPLY_SELECT = {
  ...COMMENT_SELECT,
  // Replies don't have nested replies (1 level deep)
} as const

@Injectable()
export class TaskCommentService {
  private readonly logger = new Logger(TaskCommentService.name)
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService
  readonly #_taskGateway: TaskGateway
  readonly #_notificationService: NotificationService

  constructor(
    prisma: PrismaService,
    auditLogService: AuditLogService,
    taskGateway: TaskGateway,
    notificationService: NotificationService,
  ) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
    this.#_taskGateway = taskGateway
    this.#_notificationService = notificationService
  }

  async taskCommentCreate(payload: TaskCommentCreateRequest): Promise<any> {
    const task = await this.#_prisma.task.findFirst({
      where: { id: payload.taskId, deletedAt: null },
      select: {
        id: true,
        projectId: true,
        title: true,
        taskNumber: true,
        createdById: true,
        project: { select: { key: true } },
        assignees: { select: { userId: true } },
      },
    })

    if (!task) {
      throw new NotFoundException('Task not found')
    }

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
        content: payload.content || '',
        parentCommentId: payload.parentCommentId,
      },
    })

    // Attach files (images, videos, voice) if provided
    if (payload.attachmentIds?.length) {
      await this.#_prisma.taskCommentAttachment.createMany({
        data: payload.attachmentIds.map((attachmentId) => ({
          commentId: comment.id,
          attachmentId,
          uploadedById: payload.userId,
        })),
        skipDuplicates: true,
      })
    }

    // Fetch full comment with relations for response and real-time
    const created = await this.#_prisma.taskComment.findFirst({
      where: { id: comment.id },
      select: {
        ...COMMENT_SELECT,
        parentComment: {
          select: {
            id: true,
            content: true,
            user: {
              select: { id: true, fullname: true, username: true },
            },
            attachments: {
              select: {
                attachment: { select: { mimeType: true, fileName: true } },
              },
              take: 1,
            },
          },
        },
      },
    })

    const fullComment = {
      ...created,
      replyTo: created?.parentComment
        ? {
            id: created.parentComment.id,
            content: created.parentComment.content?.substring(0, 100) || '',
            user: created.parentComment.user,
            attachmentType:
              created.parentComment.attachments?.[0]?.attachment?.mimeType ||
              null,
            attachmentName:
              created.parentComment.attachments?.[0]?.attachment?.fileName ||
              null,
          }
        : null,
      parentComment: undefined,
    }

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

    // Real-time broadcast
    this.#_taskGateway.emitTaskCommentAdded(
      task.projectId,
      task.id,
      fullComment,
    )

    // Notification: barcha assignee + creator ga
    const commentUser = await this.#_prisma.user.findFirst({
      where: { id: payload.userId },
      select: { fullname: true },
    })
    const notifyIds = [
      ...task.assignees.map((a) => a.userId),
      task.createdById,
    ].filter((id, i, arr) => arr.indexOf(id) === i)
    bestEffort(
      () =>
        this.#_notificationService.createTaskCommentNotification({
          taskId: task.id,
          taskTitle: task.title,
          taskNumber: task.taskNumber,
          projectKey: task.project?.key || '',
          commentByUserId: payload.userId,
          commentByName: commentUser?.fullname || '',
          commentPreview: payload.content || '',
          notifyUserIds: notifyIds,
        }),
      `notify task comment added (task=${task.id}, recipients=${notifyIds.length})`,
      this.logger,
    )

    return fullComment
  }

  async taskCommentRetrieveAll(
    payload: TaskCommentRetrieveAllRequest,
  ): Promise<TaskCommentRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const task = await this.#_prisma.task.findFirst({
      where: { id: payload.taskId, deletedAt: null },
    })

    if (!task) {
      throw new NotFoundException('Task not found')
    }

    const where = {
      taskId: payload.taskId,
      deletedAt: null,
    }

    // Telegram-style: barcha izohlar flat listda, eski → yangi (asc)
    const comments = await this.#_prisma.taskComment.findMany({
      where,
      select: {
        ...COMMENT_SELECT,
        // Reply bo'lsa — ota izoh haqida qisqa ma'lumot (Telegram style)
        parentComment: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
              },
            },
            attachments: {
              select: {
                attachment: {
                  select: {
                    mimeType: true,
                    fileName: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' }, // Eski → yangi (chat style)
    })

    const count = await this.#_prisma.taskComment.count({ where })

    const data = comments.map((comment) => ({
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      isEdited: comment.isEdited,
      editedAt: comment.editedAt,
      user: comment.user,
      // Telegram-style reply reference
      replyTo: comment.parentComment
        ? {
            id: comment.parentComment.id,
            content: comment.parentComment.content?.substring(0, 100) || '',
            user: comment.parentComment.user,
            attachmentType:
              comment.parentComment.attachments?.[0]?.attachment?.mimeType ||
              null,
            attachmentName:
              comment.parentComment.attachments?.[0]?.attachment?.fileName ||
              null,
          }
        : null,
      reactions: comment.reactions,
      attachments: comment.attachments,
      mentions: comment.mentions,
      reactionsCount: comment._count.reactions,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }))

    return {
      data,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskCommentRetrieveOne(
    payload: TaskCommentRetrieveOneRequest,
  ): Promise<TaskCommentRetrieveOneResponse> {
    const comment = await this.#_prisma.taskComment.findFirst({
      where: { id: payload.id, deletedAt: null },
      select: {
        ...COMMENT_SELECT,
        parentComment: {
          select: {
            id: true,
            content: true,
            user: {
              select: { id: true, fullname: true, username: true },
            },
            attachments: {
              select: {
                attachment: { select: { mimeType: true, fileName: true } },
              },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    })

    if (!comment) {
      throw new NotFoundException('Task comment not found')
    }

    return {
      ...comment,
      replyTo: comment.parentComment
        ? {
            id: comment.parentComment.id,
            content: comment.parentComment.content?.substring(0, 100) || '',
            user: comment.parentComment.user,
            attachmentType:
              comment.parentComment.attachments?.[0]?.attachment?.mimeType ||
              null,
            attachmentName:
              comment.parentComment.attachments?.[0]?.attachment?.fileName ||
              null,
          }
        : null,
      parentComment: undefined,
      reactionsCount: comment._count.reactions,
      _count: undefined,
    } as TaskCommentRetrieveOneResponse
  }

  async taskCommentUpdate(payload: TaskCommentUpdateRequest): Promise<void> {
    const { id, updatedBy, content } = payload

    const existingComment = await this.#_prisma.taskComment.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, taskId: true, content: true },
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

    const changes: Record<string, unknown> = {}
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

    // Real-time: fetch task for projectId
    const task = await this.#_prisma.task.findFirst({
      where: { id: existingComment.taskId },
      select: { projectId: true },
    })
    if (task) {
      const updatedComment = await this.#_prisma.taskComment.findFirst({
        where: { id },
        select: COMMENT_SELECT,
      })
      this.#_taskGateway.server
        .to(`project:${task.projectId}`)
        .emit('task:comment-updated', {
          taskId: existingComment.taskId,
          comment: updatedComment,
          timestamp: new Date().toISOString(),
        })
    }
  }

  async taskCommentDelete(payload: TaskCommentDeleteRequest): Promise<void> {
    const existingComment = await this.#_prisma.taskComment.findFirst({
      where: { id: payload.id, deletedAt: null },
      select: { id: true, taskId: true, content: true },
    })

    if (!existingComment) {
      throw new NotFoundException('Task comment not found')
    }

    await this.#_prisma.taskComment.update({
      where: { id: payload.id },
      data: { deletedAt: new Date() },
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

    // Real-time broadcast
    const task = await this.#_prisma.task.findFirst({
      where: { id: existingComment.taskId },
      select: { projectId: true },
    })
    if (task) {
      this.#_taskGateway.server
        .to(`project:${task.projectId}`)
        .emit('task:comment-deleted', {
          taskId: existingComment.taskId,
          commentId: payload.id,
          timestamp: new Date().toISOString(),
        })
    }
  }
}
