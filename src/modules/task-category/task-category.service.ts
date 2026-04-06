import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskCategoryCreateRequest,
  TaskCategoryDeleteRequest,
  TaskCategoryRetrieveAllRequest,
  TaskCategoryRetrieveAllResponse,
  TaskCategoryRetrieveOneRequest,
  TaskCategoryUpdateRequest,
  TaskCategoryRetrieveOneResponse,
} from './interfaces'

@Injectable()
export class TaskCategoryService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskCategoryCreate(payload: TaskCategoryCreateRequest): Promise<void> {
    // Check if name is unique
    const nameExists = await this.#_prisma.taskCategory.findFirst({
      where: {
        name: payload.name,
        deletedAt: null,
      },
    })

    if (nameExists) {
      throw new ConflictException('Task category name must be unique')
    }

    const category = await this.#_prisma.taskCategory.create({
      data: {
        name: payload.name,
        description: payload.description,
        color: payload.color,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskCategory',
      category.id,
      AuditAction.CREATE,
      payload.createdBy || category.id,
      {
        newValues: {
          name: category.name,
          isActive: category.isActive,
        },
      },
    )
  }

  async taskCategoryRetrieveAll(
    payload: TaskCategoryRetrieveAllRequest,
  ): Promise<TaskCategoryRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
      deletedAt: null,
      ...(payload.search && {
        OR: [
          { name: { contains: payload.search, mode: 'insensitive' as const } },
          {
            description: {
              contains: payload.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    }

    const categories = await this.#_prisma.taskCategory.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        isActive: true,
        _count: {
          select: {
            tasks: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskCategory.count({ where })

    const data = categories.map((category) => ({
      ...category,
      taskCount: category._count.tasks,
      _count: undefined,
    }))

    return {
      data,
      count,
      pageNumber,
      pageSize,
    }
  }

  async taskCategoryRetrieveOne(
    payload: TaskCategoryRetrieveOneRequest,
  ): Promise<TaskCategoryRetrieveOneResponse> {
    const category = await this.#_prisma.taskCategory.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        isActive: true,
        _count: {
          select: {
            tasks: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!category) {
      throw new NotFoundException('Task category not found')
    }

    return {
      ...category,
      taskCount: category._count.tasks,
      _count: undefined,
    } as TaskCategoryRetrieveOneResponse
  }

  async taskCategoryUpdate(payload: TaskCategoryUpdateRequest): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingCategory = await this.#_prisma.taskCategory.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingCategory) {
      throw new NotFoundException('Task category not found')
    }

    if (updateData.name) {
      const nameExists = await this.#_prisma.taskCategory.findFirst({
        where: {
          name: updateData.name,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (nameExists) {
        throw new ConflictException('Task category name must be unique')
      }
    }

    await this.#_prisma.taskCategory.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingCategory.name) {
      changes.name = { old: existingCategory.name, new: updateData.name }
    }
    if (
      updateData.isActive !== undefined &&
      updateData.isActive !== existingCategory.isActive
    ) {
      changes.isActive = {
        old: existingCategory.isActive,
        new: updateData.isActive,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'TaskCategory',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async taskCategoryDelete(payload: TaskCategoryDeleteRequest): Promise<void> {
    const existingCategory = await this.#_prisma.taskCategory.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingCategory) {
      throw new NotFoundException('Task category not found')
    }

    // Soft delete - set deletedAt and also deactivate
    await this.#_prisma.taskCategory.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskCategory',
      payload.id,
      AuditAction.DELETE,
      payload.id,
      {
        oldValues: {
          name: existingCategory.name,
        },
      },
    )
  }
}
