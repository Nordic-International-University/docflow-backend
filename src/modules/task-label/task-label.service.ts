import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskLabelCreateRequest,
  TaskLabelDeleteRequest,
  TaskLabelRetrieveAllRequest,
  TaskLabelRetrieveAllResponse,
  TaskLabelRetrieveOneRequest,
  TaskLabelRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class TaskLabelService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskLabelCreate(payload: TaskLabelCreateRequest): Promise<void> {
    // Verify task exists
    const task = await this.#_prisma.task.findFirst({
      where: {
        id: payload.taskId,
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
      },
    })

    if (!task) {
      throw new NotFoundException('Task not found')
    }

    // Verify label exists and belongs to the same project as the task
    const label = await this.#_prisma.projectLabel.findFirst({
      where: {
        id: payload.labelId,
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
      },
    })

    if (!label) {
      throw new NotFoundException('Label not found')
    }

    if (label.projectId !== task.projectId) {
      throw new BadRequestException(
        'Label must belong to the same project as the task',
      )
    }

    // Check for duplicate assignment
    const existingAssignment = await this.#_prisma.taskLabel.findFirst({
      where: {
        taskId: payload.taskId,
        labelId: payload.labelId,
      },
    })

    if (existingAssignment) {
      throw new ConflictException('Label is already assigned to this task')
    }

    const taskLabel = await this.#_prisma.taskLabel.create({
      data: {
        taskId: payload.taskId,
        labelId: payload.labelId,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskLabel',
      taskLabel.id,
      AuditAction.CREATE,
      payload.createdBy || taskLabel.id,
      {
        newValues: {
          taskId: taskLabel.taskId,
          labelId: taskLabel.labelId,
          labelName: label.name,
        },
      },
    )
  }

  async taskLabelRetrieveAll(
    payload: TaskLabelRetrieveAllRequest,
  ): Promise<TaskLabelRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where = {
      ...(payload.taskId && { taskId: payload.taskId }),
      ...(payload.labelId && { labelId: payload.labelId }),
    }

    const taskLabels = await this.#_prisma.taskLabel.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        labelId: true,
        label: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskLabel.count({ where })

    return {
      data: taskLabels,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskLabelRetrieveOne(
    payload: TaskLabelRetrieveOneRequest,
  ): Promise<TaskLabelRetrieveOneResponse> {
    const taskLabel = await this.#_prisma.taskLabel.findFirst({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        taskId: true,
        labelId: true,
        label: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        createdAt: true,
      },
    })

    if (!taskLabel) {
      throw new NotFoundException('Task label not found')
    }

    return taskLabel as TaskLabelRetrieveOneResponse
  }

  async taskLabelDelete(payload: TaskLabelDeleteRequest): Promise<void> {
    const existingTaskLabel = await this.#_prisma.taskLabel.findFirst({
      where: {
        id: payload.id,
      },
      include: {
        label: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!existingTaskLabel) {
      throw new NotFoundException('Task label not found')
    }

    // Hard delete for join table
    await this.#_prisma.taskLabel.delete({
      where: { id: payload.id },
    })

    await this.#_auditLogService.logAction(
      'TaskLabel',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          taskId: existingTaskLabel.taskId,
          labelId: existingTaskLabel.labelId,
          labelName: existingTaskLabel.label.name,
        },
      },
    )
  }
}
