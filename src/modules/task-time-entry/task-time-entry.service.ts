import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskTimeEntryCreateRequest,
  TaskTimeEntryDeleteRequest,
  TaskTimeEntryRetrieveAllRequest,
  TaskTimeEntryRetrieveAllResponse,
  TaskTimeEntryRetrieveOneRequest,
  TaskTimeEntryRetrieveOneResponse,
  TaskTimeEntryUpdateRequest,
} from './interfaces'
import { Prisma } from '@prisma/client'
import { parsePagination } from '@common/helpers'

@Injectable()
export class TaskTimeEntryService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskTimeEntryCreate(
    payload: TaskTimeEntryCreateRequest,
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

    const timeEntry = await this.#_prisma.taskTimeEntry.create({
      data: {
        taskId: payload.taskId,
        userId: payload.userId,
        description: payload.description,
        hours: new Prisma.Decimal(payload.hours),
        date: new Date(payload.date),
        isBillable:
          payload.isBillable !== undefined ? payload.isBillable : true,
      },
    })

    // Update task.actualHours
    await this.#_updateTaskActualHours(payload.taskId)

    await this.#_auditLogService.logAction(
      'TaskTimeEntry',
      timeEntry.id,
      AuditAction.CREATE,
      payload.createdBy || payload.userId,
      {
        newValues: {
          taskId: timeEntry.taskId,
          hours: timeEntry.hours.toString(),
          date: timeEntry.date,
          isBillable: timeEntry.isBillable,
        },
      },
    )
  }

  async taskTimeEntryRetrieveAll(
    payload: TaskTimeEntryRetrieveAllRequest,
  ): Promise<TaskTimeEntryRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where: any = {
      deletedAt: null,
      ...(payload.taskId && { taskId: payload.taskId }),
      ...(payload.userId && { userId: payload.userId }),
      ...(payload.isBillable !== undefined && {
        isBillable: payload.isBillable,
      }),
      ...(payload.dateFrom || payload.dateTo
        ? {
            date: {
              ...(payload.dateFrom && { gte: new Date(payload.dateFrom) }),
              ...(payload.dateTo && { lte: new Date(payload.dateTo) }),
            },
          }
        : {}),
    }

    const timeEntries = await this.#_prisma.taskTimeEntry.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        userId: true,
        description: true,
        hours: true,
        date: true,
        isBillable: true,
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    })

    const count = await this.#_prisma.taskTimeEntry.count({ where })

    const data = timeEntries.map((entry) => ({
      ...entry,
      hours: Number(entry.hours),
    }))

    return {
      data,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskTimeEntryRetrieveOne(
    payload: TaskTimeEntryRetrieveOneRequest,
  ): Promise<TaskTimeEntryRetrieveOneResponse> {
    const timeEntry = await this.#_prisma.taskTimeEntry.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        description: true,
        hours: true,
        date: true,
        isBillable: true,
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found')
    }

    return {
      ...timeEntry,
      hours: Number(timeEntry.hours),
    } as TaskTimeEntryRetrieveOneResponse
  }

  async taskTimeEntryUpdate(
    payload: TaskTimeEntryUpdateRequest,
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingEntry = await this.#_prisma.taskTimeEntry.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingEntry) {
      throw new NotFoundException('Time entry not found')
    }

    const dataToUpdate: any = {
      updatedAt: new Date(),
    }

    if (updateData.description !== undefined) {
      dataToUpdate.description = updateData.description
    }
    if (updateData.hours !== undefined) {
      dataToUpdate.hours = new Prisma.Decimal(updateData.hours)
    }
    if (updateData.date !== undefined) {
      dataToUpdate.date = new Date(updateData.date)
    }
    if (updateData.isBillable !== undefined) {
      dataToUpdate.isBillable = updateData.isBillable
    }

    await this.#_prisma.taskTimeEntry.update({
      where: { id },
      data: dataToUpdate,
    })

    // Update task.actualHours if hours changed
    if (updateData.hours !== undefined) {
      await this.#_updateTaskActualHours(existingEntry.taskId)
    }

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (
      updateData.hours !== undefined &&
      Number(existingEntry.hours) !== updateData.hours
    ) {
      changes.hours = {
        old: Number(existingEntry.hours),
        new: updateData.hours,
      }
    }
    if (
      updateData.isBillable !== undefined &&
      updateData.isBillable !== existingEntry.isBillable
    ) {
      changes.isBillable = {
        old: existingEntry.isBillable,
        new: updateData.isBillable,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'TaskTimeEntry',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async taskTimeEntryDelete(
    payload: TaskTimeEntryDeleteRequest,
  ): Promise<void> {
    const existingEntry = await this.#_prisma.taskTimeEntry.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingEntry) {
      throw new NotFoundException('Time entry not found')
    }

    // Soft delete
    await this.#_prisma.taskTimeEntry.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Update task.actualHours
    await this.#_updateTaskActualHours(existingEntry.taskId)

    await this.#_auditLogService.logAction(
      'TaskTimeEntry',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          taskId: existingEntry.taskId,
          hours: Number(existingEntry.hours),
          date: existingEntry.date,
        },
      },
    )
  }

  async #_updateTaskActualHours(taskId: string): Promise<void> {
    const result = await this.#_prisma.taskTimeEntry.aggregate({
      where: {
        taskId,
        deletedAt: null,
      },
      _sum: {
        hours: true,
      },
    })

    const totalHours = result._sum.hours || new Prisma.Decimal(0)

    await this.#_prisma.task.update({
      where: { id: taskId },
      data: {
        actualHours: totalHours,
      },
    })
  }
}
