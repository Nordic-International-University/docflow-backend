import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  AuditLogCreateRequest,
  AuditLogRetrieveAllRequest,
  AuditLogRetrieveOneRequest,
  AuditLogRetrieveAllResponse,
  AuditLogRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name)
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async auditLogCreate(payload: AuditLogCreateRequest): Promise<void> {
    await this.#_prisma.auditLog.create({
      data: {
        entity: payload.entity,
        entityId: payload.entityId,
        action: payload.action,
        changes: payload.changes
          ? JSON.parse(JSON.stringify(payload.changes))
          : null,
        oldValues: payload.oldValues
          ? JSON.parse(JSON.stringify(payload.oldValues))
          : null,
        newValues: payload.newValues
          ? JSON.parse(JSON.stringify(payload.newValues))
          : null,
        ipAddress: payload.ipAddress || null,
        userAgent: payload.userAgent || null,
        performedByUserId: payload.performedByUserId,
      },
    })
  }

  async auditLogRetrieveAll(
    payload: AuditLogRetrieveAllRequest,
  ): Promise<AuditLogRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)
    const search = payload.search ? payload.search : undefined

    const auditLogList = await this.#_prisma.auditLog.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [{ entity: { contains: search, mode: 'insensitive' } }],
        }),
        ...(payload.entity && { entity: payload.entity }),
        ...(payload.entityId && { entityId: payload.entityId }),
        ...(payload.action && { action: payload.action }),
        ...(payload.performedByUserId && {
          performedByUserId: payload.performedByUserId,
        }),
        ...(payload.startDate &&
          payload.endDate && {
            performedAt: {
              gte: payload.startDate,
              lte: payload.endDate,
            },
          }),
        ...(!payload.endDate &&
          payload.startDate && {
            performedAt: {
              gte: payload.startDate,
            },
          }),
        ...(payload.endDate &&
          !payload.startDate && {
            performedAt: {
              lte: payload.endDate,
            },
          }),
      },
      include: {
        performedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        performedAt: 'desc',
      },
    })

    const count = await this.#_prisma.auditLog.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [{ entity: { contains: search, mode: 'insensitive' } }],
        }),
        ...(payload.entity && { entity: payload.entity }),
        ...(payload.entityId && { entityId: payload.entityId }),
        ...(payload.action && { action: payload.action }),
        ...(payload.performedByUserId && {
          performedByUserId: payload.performedByUserId,
        }),
        ...(payload.startDate &&
          payload.endDate && {
            performedAt: {
              gte: payload.startDate,
              lte: payload.endDate,
            },
          }),
        ...(!payload.endDate &&
          payload.startDate && {
            performedAt: {
              gte: payload.startDate,
            },
          }),
        ...(payload.endDate &&
          !payload.startDate && {
            performedAt: {
              lte: payload.endDate,
            },
          }),
      },
    })

    return {
      data: auditLogList,
      count: count,
      pageNumber: page,
      pageSize: limit,
      pageCount: Math.ceil(count / limit),
    }
  }

  async auditLogRetrieveOne(
    payload: AuditLogRetrieveOneRequest,
  ): Promise<AuditLogRetrieveOneResponse> {
    const auditLog: any = await this.#_prisma.auditLog.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        performedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
    })

    if (!auditLog) {
      throw new NotFoundException('Audit log entry not found')
    }

    return auditLog
  }

  async logAction(
    entity: string,
    entityId: string,
    action: string,
    performedByUserId: string,
    options?: {
      changes?: Record<string, any>
      oldValues?: Record<string, any>
      newValues?: Record<string, any>
      ipAddress?: string
      userAgent?: string
    },
  ): Promise<void> {
    // Validate that performedByUserId is a real user, not an entity ID
    if (performedByUserId) {
      const userExists = await this.#_prisma.user.findFirst({
        where: { id: performedByUserId },
        select: { id: true },
      })
      if (!userExists) {
        this.logger.warn(
          `[AuditLog] Skipped: invalid performedByUserId "${performedByUserId}" for ${action} on ${entity}:${entityId}`,
        )
        return
      }
    } else {
      this.logger.warn(
        `[AuditLog] Skipped: no performedByUserId for ${action} on ${entity}:${entityId}`,
      )
      return
    }

    await this.auditLogCreate({
      entity,
      entityId,
      action: action as any,
      performedByUserId,
      changes: options?.changes,
      oldValues: options?.oldValues,
      newValues: options?.newValues,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    })
  }
}
