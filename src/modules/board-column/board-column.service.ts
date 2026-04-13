import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  BoardColumnCreateDto,
  BoardColumnUpdateDto,
  BoardColumnRetrieveQueryDto,
} from './dtos'

@Injectable()
export class BoardColumnService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async boardColumnCreate(
    payload: BoardColumnCreateDto & { createdBy?: string },
  ): Promise<void> {
    // Verify project exists
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: payload.projectId,
        deletedAt: null,
      },
    })

    if (!project) {
      throw new NotFoundException('Loyiha topilmadi')
    }

    // Check if column name is unique within project
    const nameExists = await this.#_prisma.boardColumn.findFirst({
      where: {
        projectId: payload.projectId,
        name: payload.name,
        deletedAt: null,
      },
    })

    if (nameExists) {
      throw new ConflictException(
        'Column name must be unique within the project',
      )
    }

    // If this column is set as default, unset other defaults
    if (payload.isDefault) {
      await this.#_prisma.boardColumn.updateMany({
        where: {
          projectId: payload.projectId,
          isDefault: true,
          deletedAt: null,
        },
        data: { isDefault: false },
      })
    }

    // Get next position if not provided
    let position = payload.position
    if (position === undefined) {
      const maxPosition = await this.#_prisma.boardColumn.aggregate({
        where: {
          projectId: payload.projectId,
          deletedAt: null,
        },
        _max: { position: true },
      })
      position = (maxPosition._max.position ?? -1) + 1
    }

    const column = await this.#_prisma.boardColumn.create({
      data: {
        projectId: payload.projectId,
        name: payload.name,
        color: payload.color,
        position,
        wipLimit: payload.wipLimit,
        isClosed: payload.isClosed ?? false,
        isDefault: payload.isDefault ?? false,
      },
    })

    await this.#_auditLogService.logAction(
      'BoardColumn',
      column.id,
      AuditAction.CREATE,
      payload.createdBy ?? column.id,
      {
        newValues: {
          name: column.name,
          projectId: column.projectId,
          position: column.position,
        },
      },
    )
  }

  async boardColumnRetrieveAll(payload: BoardColumnRetrieveQueryDto) {
    // Verify project exists
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: payload.projectId,
        deletedAt: null,
      },
    })

    if (!project) {
      throw new NotFoundException('Loyiha topilmadi')
    }

    const columns = await this.#_prisma.boardColumn.findMany({
      where: {
        projectId: payload.projectId,
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        position: true,
        wipLimit: true,
        isClosed: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        ...(payload.includeTaskCount && {
          _count: {
            select: {
              tasks: {
                where: { deletedAt: null },
              },
            },
          },
        }),
      },
      orderBy: { position: 'asc' },
    })

    return { data: columns }
  }

  async boardColumnUpdate(
    payload: BoardColumnUpdateDto & { id: string; updatedBy?: string },
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingColumn = await this.#_prisma.boardColumn.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingColumn) {
      throw new NotFoundException('Ustun topilmadi')
    }

    // Check if name is being changed and if it's unique
    if (updateData.name && updateData.name !== existingColumn.name) {
      const nameExists = await this.#_prisma.boardColumn.findFirst({
        where: {
          projectId: existingColumn.projectId,
          name: updateData.name,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (nameExists) {
        throw new ConflictException(
          'Column name must be unique within the project',
        )
      }
    }

    // If this column is being set as default, unset other defaults
    if (updateData.isDefault === true && !existingColumn.isDefault) {
      await this.#_prisma.boardColumn.updateMany({
        where: {
          projectId: existingColumn.projectId,
          isDefault: true,
          id: { not: id },
          deletedAt: null,
        },
        data: { isDefault: false },
      })
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name
    }
    if (updateData.color !== undefined) {
      updatePayload.color = updateData.color || null
    }
    if (updateData.position !== undefined) {
      updatePayload.position = updateData.position
    }
    if (updateData.wipLimit !== undefined) {
      updatePayload.wipLimit = updateData.wipLimit ?? null
    }
    if (updateData.isClosed !== undefined) {
      updatePayload.isClosed = updateData.isClosed
    }
    if (updateData.isDefault !== undefined) {
      updatePayload.isDefault = updateData.isDefault
    }

    await this.#_prisma.boardColumn.update({
      where: { id },
      data: updatePayload,
    })

    // Track changes for audit
    const changes: Record<string, unknown> = {}
    if (updateData.name && updateData.name !== existingColumn.name) {
      changes.name = { old: existingColumn.name, new: updateData.name }
    }
    if (
      updateData.position !== undefined &&
      updateData.position !== existingColumn.position
    ) {
      changes.position = {
        old: existingColumn.position,
        new: updateData.position,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'BoardColumn',
        id,
        AuditAction.UPDATE,
        updatedBy ?? id,
        { changes },
      )
    }
  }

  async boardColumnDelete(payload: {
    id: string
    deletedBy?: string
  }): Promise<void> {
    const existingColumn = await this.#_prisma.boardColumn.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            tasks: { where: { deletedAt: null } },
          },
        },
      },
    })

    if (!existingColumn) {
      throw new NotFoundException('Ustun topilmadi')
    }

    // Don't allow deletion if there are tasks in this column
    if (existingColumn._count.tasks > 0) {
      throw new BadRequestException(
        'Cannot delete column with tasks. Move or delete tasks first.',
      )
    }

    await this.#_prisma.boardColumn.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'BoardColumn',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy ?? payload.id,
      {
        oldValues: {
          name: existingColumn.name,
          projectId: existingColumn.projectId,
        },
      },
    )
  }

  async boardColumnReorder(
    projectId: string,
    columnIds: string[],
    updatedBy?: string,
  ): Promise<void> {
    // Verify project exists
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    })

    if (!project) {
      throw new NotFoundException('Loyiha topilmadi')
    }

    // Verify all columns exist and belong to the project
    const columns = await this.#_prisma.boardColumn.findMany({
      where: {
        id: { in: columnIds },
        projectId,
        deletedAt: null,
      },
    })

    if (columns.length !== columnIds.length) {
      throw new BadRequestException(
        'Some columns were not found or do not belong to this project',
      )
    }

    // Update positions in a transaction
    await this.#_prisma.$transaction(
      columnIds.map((columnId, index) =>
        this.#_prisma.boardColumn.update({
          where: { id: columnId },
          data: { position: index },
        }),
      ),
    )
  }
}
