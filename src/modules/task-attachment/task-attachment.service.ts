import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskAttachmentCreateRequest,
  TaskAttachmentDeleteRequest,
  TaskAttachmentRetrieveAllRequest,
  TaskAttachmentRetrieveAllResponse,
  TaskAttachmentRetrieveOneRequest,
  TaskAttachmentRetrieveOneResponse,
  TaskAttachmentUpdateRequest,
} from './interfaces'

@Injectable()
export class TaskAttachmentService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskAttachmentCreate(
    payload: TaskAttachmentCreateRequest,
  ): Promise<void> {
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

    // Verify attachment exists
    const attachment = await this.#_prisma.attachment.findFirst({
      where: {
        id: payload.attachmentId,
        deletedAt: null,
      },
    })

    if (!attachment) {
      throw new NotFoundException('Attachment not found')
    }

    // Check for duplicate task-attachment combination
    const existingAttachment = await this.#_prisma.taskAttachment.findFirst({
      where: {
        taskId: payload.taskId,
        attachmentId: payload.attachmentId,
        deletedAt: null,
      },
    })

    if (existingAttachment) {
      throw new ConflictException(
        'This attachment is already linked to the task',
      )
    }

    const taskAttachment = await this.#_prisma.taskAttachment.create({
      data: {
        taskId: payload.taskId,
        attachmentId: payload.attachmentId,
        uploadedById: payload.uploadedById!,
        description: payload.description,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskAttachment',
      taskAttachment.id,
      AuditAction.CREATE,
      payload.uploadedById || taskAttachment.id,
      {
        newValues: {
          taskId: taskAttachment.taskId,
          attachmentId: taskAttachment.attachmentId,
        },
      },
    )
  }

  async taskAttachmentRetrieveAll(
    payload: TaskAttachmentRetrieveAllRequest,
  ): Promise<TaskAttachmentRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
      deletedAt: null,
      ...(payload.taskId && { taskId: payload.taskId }),
    }

    const attachments = await this.#_prisma.taskAttachment.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        attachmentId: true,
        uploadedById: true,
        description: true,
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
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskAttachment.count({ where })

    return {
      data: attachments,
      count,
      pageNumber,
      pageSize,
    }
  }

  async taskAttachmentRetrieveOne(
    payload: TaskAttachmentRetrieveOneRequest,
  ): Promise<TaskAttachmentRetrieveOneResponse> {
    const taskAttachment = await this.#_prisma.taskAttachment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        taskId: true,
        attachmentId: true,
        uploadedById: true,
        description: true,
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
        updatedAt: true,
      },
    })

    if (!taskAttachment) {
      throw new NotFoundException('Task attachment not found')
    }

    return {
      ...taskAttachment,
      attachment: {
        ...taskAttachment.attachment,
        url: taskAttachment.attachment.fileUrl,
      },
    } as TaskAttachmentRetrieveOneResponse
  }

  async taskAttachmentUpdate(
    payload: TaskAttachmentUpdateRequest,
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingAttachment = await this.#_prisma.taskAttachment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingAttachment) {
      throw new NotFoundException('Task attachment not found')
    }

    await this.#_prisma.taskAttachment.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (
      updateData.description !== undefined &&
      updateData.description !== existingAttachment.description
    ) {
      changes.description = {
        old: existingAttachment.description,
        new: updateData.description,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'TaskAttachment',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async taskAttachmentDelete(
    payload: TaskAttachmentDeleteRequest,
  ): Promise<void> {
    const existingAttachment = await this.#_prisma.taskAttachment.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingAttachment) {
      throw new NotFoundException('Task attachment not found')
    }

    // Soft delete
    await this.#_prisma.taskAttachment.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'TaskAttachment',
      payload.id,
      AuditAction.DELETE,
      payload.id,
      {
        oldValues: {
          taskId: existingAttachment.taskId,
          attachmentId: existingAttachment.attachmentId,
        },
      },
    )
  }
}
