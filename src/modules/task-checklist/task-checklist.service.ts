import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskChecklistCreateRequest,
  TaskChecklistDeleteRequest,
  TaskChecklistRetrieveAllRequest,
  TaskChecklistRetrieveAllResponse,
  TaskChecklistRetrieveOneRequest,
  TaskChecklistRetrieveOneResponse,
  TaskChecklistUpdateRequest,
  TaskChecklistItemCreateRequest,
  TaskChecklistItemDeleteRequest,
  TaskChecklistItemRetrieveAllRequest,
  TaskChecklistItemRetrieveAllResponse,
  TaskChecklistItemRetrieveOneRequest,
  TaskChecklistItemResponse,
  TaskChecklistItemUpdateRequest,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class TaskChecklistService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  // ==================== CHECKLIST METHODS ====================

  async taskChecklistCreate(
    payload: TaskChecklistCreateRequest,
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

    const checklist = await this.#_prisma.taskChecklist.create({
      data: {
        taskId: payload.taskId,
        title: payload.title,
        position: payload.position ?? 0,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskChecklist',
      checklist.id,
      AuditAction.CREATE,
      payload.createdBy || checklist.id,
      {
        newValues: {
          title: checklist.title,
          taskId: checklist.taskId,
        },
      },
    )
  }

  async taskChecklistRetrieveAll(
    payload: TaskChecklistRetrieveAllRequest,
  ): Promise<TaskChecklistRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where = {
      taskId: payload.taskId,
      deletedAt: null,
      ...(payload.search && {
        title: { contains: payload.search, mode: 'insensitive' as const },
      }),
    }

    const checklists = await this.#_prisma.taskChecklist.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        title: true,
        position: true,
        items: {
          where: { deletedAt: null },
          select: {
            id: true,
            checklistId: true,
            title: true,
            isCompleted: true,
            completedById: true,
            completedAt: true,
            position: true,
            completedBy: {
              select: {
                id: true,
                fullname: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { position: 'asc' },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { position: 'asc' },
    })

    const count = await this.#_prisma.taskChecklist.count({ where })

    return {
      data: checklists,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskChecklistRetrieveOne(
    payload: TaskChecklistRetrieveOneRequest,
  ): Promise<TaskChecklistRetrieveOneResponse> {
    const checklist = await this.#_prisma.taskChecklist.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        taskId: true,
        title: true,
        position: true,
        items: {
          where: { deletedAt: null },
          select: {
            id: true,
            checklistId: true,
            title: true,
            isCompleted: true,
            completedById: true,
            completedAt: true,
            position: true,
            completedBy: {
              select: {
                id: true,
                fullname: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { position: 'asc' },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!checklist) {
      throw new NotFoundException('Task checklist not found')
    }

    return checklist as TaskChecklistRetrieveOneResponse
  }

  async taskChecklistUpdate(
    payload: TaskChecklistUpdateRequest,
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingChecklist = await this.#_prisma.taskChecklist.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingChecklist) {
      throw new NotFoundException('Task checklist not found')
    }

    await this.#_prisma.taskChecklist.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, unknown> = {}
    if (updateData.title && updateData.title !== existingChecklist.title) {
      changes.title = { old: existingChecklist.title, new: updateData.title }
    }
    if (
      updateData.position !== undefined &&
      updateData.position !== existingChecklist.position
    ) {
      changes.position = {
        old: existingChecklist.position,
        new: updateData.position,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'TaskChecklist',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async taskChecklistDelete(
    payload: TaskChecklistDeleteRequest,
  ): Promise<void> {
    const existingChecklist = await this.#_prisma.taskChecklist.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingChecklist) {
      throw new NotFoundException('Task checklist not found')
    }

    // Soft delete checklist and its items
    await this.#_prisma.$transaction([
      this.#_prisma.taskChecklist.update({
        where: { id: payload.id },
        data: {
          deletedAt: new Date(),
        },
      }),
      this.#_prisma.taskChecklistItem.updateMany({
        where: {
          checklistId: payload.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ])

    await this.#_auditLogService.logAction(
      'TaskChecklist',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          title: existingChecklist.title,
        },
      },
    )
  }

  // ==================== CHECKLIST ITEM METHODS ====================

  async taskChecklistItemCreate(
    payload: TaskChecklistItemCreateRequest,
  ): Promise<void> {
    // Verify checklist exists
    const checklist = await this.#_prisma.taskChecklist.findFirst({
      where: {
        id: payload.checklistId,
        deletedAt: null,
      },
    })

    if (!checklist) {
      throw new NotFoundException('Task checklist not found')
    }

    const item = await this.#_prisma.taskChecklistItem.create({
      data: {
        checklistId: payload.checklistId,
        title: payload.title,
        position: payload.position ?? 0,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskChecklistItem',
      item.id,
      AuditAction.CREATE,
      payload.createdBy || item.id,
      {
        newValues: {
          title: item.title,
          checklistId: item.checklistId,
        },
      },
    )
  }

  async taskChecklistItemRetrieveAll(
    payload: TaskChecklistItemRetrieveAllRequest,
  ): Promise<TaskChecklistItemRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where = {
      checklistId: payload.checklistId,
      deletedAt: null,
      ...(payload.search && {
        title: { contains: payload.search, mode: 'insensitive' as const },
      }),
    }

    const items = await this.#_prisma.taskChecklistItem.findMany({
      where,
      select: {
        id: true,
        checklistId: true,
        title: true,
        isCompleted: true,
        completedById: true,
        completedAt: true,
        position: true,
        completedBy: {
          select: {
            id: true,
            fullname: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { position: 'asc' },
    })

    const count = await this.#_prisma.taskChecklistItem.count({ where })

    return {
      data: items,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskChecklistItemRetrieveOne(
    payload: TaskChecklistItemRetrieveOneRequest,
  ): Promise<TaskChecklistItemResponse> {
    const item = await this.#_prisma.taskChecklistItem.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        checklistId: true,
        title: true,
        isCompleted: true,
        completedById: true,
        completedAt: true,
        position: true,
        completedBy: {
          select: {
            id: true,
            fullname: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!item) {
      throw new NotFoundException('Task checklist item not found')
    }

    return item as TaskChecklistItemResponse
  }

  async taskChecklistItemUpdate(
    payload: TaskChecklistItemUpdateRequest,
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingItem = await this.#_prisma.taskChecklistItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingItem) {
      throw new NotFoundException('Task checklist item not found')
    }

    // Handle completion status change
    const data: Record<string, unknown> = {
      ...updateData,
      updatedAt: new Date(),
    }

    // When isCompleted changes to true, set completedById and completedAt
    if (updateData.isCompleted === true && !existingItem.isCompleted) {
      data.completedById = updatedBy
      data.completedAt = new Date()
    }
    // When isCompleted changes to false, clear completedById and completedAt
    else if (updateData.isCompleted === false && existingItem.isCompleted) {
      data.completedById = null
      data.completedAt = null
    }

    await this.#_prisma.taskChecklistItem.update({
      where: { id },
      data,
    })

    // Track changes for audit log
    const changes: Record<string, unknown> = {}
    if (updateData.title && updateData.title !== existingItem.title) {
      changes.title = { old: existingItem.title, new: updateData.title }
    }
    if (
      updateData.isCompleted !== undefined &&
      updateData.isCompleted !== existingItem.isCompleted
    ) {
      changes.isCompleted = {
        old: existingItem.isCompleted,
        new: updateData.isCompleted,
      }
    }
    if (
      updateData.position !== undefined &&
      updateData.position !== existingItem.position
    ) {
      changes.position = {
        old: existingItem.position,
        new: updateData.position,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'TaskChecklistItem',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async taskChecklistItemDelete(
    payload: TaskChecklistItemDeleteRequest,
  ): Promise<void> {
    const existingItem = await this.#_prisma.taskChecklistItem.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingItem) {
      throw new NotFoundException('Task checklist item not found')
    }

    // Soft delete
    await this.#_prisma.taskChecklistItem.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'TaskChecklistItem',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          title: existingItem.title,
        },
      },
    )
  }
}
