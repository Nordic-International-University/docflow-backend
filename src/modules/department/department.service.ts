import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  DepartmentCreateRequest,
  DepartmentDeleteRequest,
  DepartmentRetrieveAllRequest,
  DepartmentRetrieveAllResponse,
  DepartmentRetrieveOneRequest,
  DepartmentUpdateRequest,
  DepartmentRetrieveOneResponse,
} from './interfaces'

import { parsePagination } from '@common/helpers'
@Injectable()
export class DepartmentService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async departmentCreate(payload: DepartmentCreateRequest): Promise<void> {
    // Check if director is already assigned to another department
    if (payload.directorId) {
      const directorAssigned = await this.#_prisma.department.findFirst({
        where: {
          directorId: payload.directorId,
          deletedAt: null,
        },
      })

      if (directorAssigned) {
        throw new ConflictException(
          'This user is already assigned as a director of another department',
        )
      }
    }

    // Check if code is already used
    if (payload.code) {
      const codeExists = await this.#_prisma.department.findFirst({
        where: {
          code: payload.code,
          deletedAt: null,
        },
      })

      if (codeExists) {
        throw new ConflictException('Department code must be unique')
      }
    }

    // Create department and update director's departmentId in a transaction
    const department = await this.#_prisma.$transaction(async (tx) => {
      const department = await tx.department.create({
        data: {
          name: payload.name,
          description: payload.description,
          code: payload.code,
          directorId: payload.directorId,
          location: payload.location,
          ...(payload.parentId && { parentId: payload.parentId }),
        },
      })

      // Update director's departmentId to this department
      if (payload.directorId) {
        await tx.user.update({
          where: { id: payload.directorId },
          data: { departmentId: department.id },
        })
      }

      return department
    })

    // Log department creation
    if (payload.createdBy) {
      await this.#_auditLogService.logAction(
        'Department',
        department.id,
        AuditAction.CREATE,
        payload.createdBy,
        {
          newValues: {
            name: department.name,
            description: department.description,
            code: department.code,
            directorId: department.directorId,
            location: department.location,
            parentId: department.parentId,
          },
        },
      )
    }
  }

  async departmentRetrieveAll(
    payload: DepartmentRetrieveAllRequest,
  ): Promise<DepartmentRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)
    const search = payload.search ? payload.search : undefined

    const departmentList = await this.#_prisma.department.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        parent: { select: { id: true, name: true } },
        director: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
        code: true,
        location: true,
      },
      skip,
      take: limit,
    })

    const count = await this.#_prisma.department.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    })

    return {
      data: departmentList,
      count: count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async departmentRetrieveOne(
    payload: DepartmentRetrieveOneRequest,
  ): Promise<DepartmentRetrieveOneResponse> {
    const department = await this.#_prisma.department.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!department) {
      throw new NotFoundException('Department not found')
    }

    return department
  }

  async departmentUpdate(payload: DepartmentUpdateRequest): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    // Fetch existing department for change tracking
    const existingDepartment = await this.#_prisma.department.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingDepartment) {
      throw new NotFoundException('Department not found')
    }

    if (updateData.code) {
      const codeExists = await this.#_prisma.department.findFirst({
        where: {
          code: updateData.code,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (codeExists) {
        throw new ConflictException('Department code must be unique')
      }
    }

    await this.#_prisma.$transaction(async (tx) => {
      if (updateData.directorId) {
        // Remove director from any other department first
        await tx.department.updateMany({
          where: {
            directorId: updateData.directorId,
            id: { not: id },
            deletedAt: null,
          },
          data: {
            directorId: null,
          },
        })

        // Update the new director's departmentId to this department
        await tx.user.update({
          where: { id: updateData.directorId },
          data: { departmentId: id },
        })
      }

      await tx.department.update({
        where: {
          id,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingDepartment.name) {
      changes.name = { old: existingDepartment.name, new: updateData.name }
    }
    if (
      updateData.description &&
      updateData.description !== existingDepartment.description
    ) {
      changes.description = {
        old: existingDepartment.description,
        new: updateData.description,
      }
    }
    if (updateData.code && updateData.code !== existingDepartment.code) {
      changes.code = { old: existingDepartment.code, new: updateData.code }
    }
    if (
      updateData.directorId &&
      updateData.directorId !== existingDepartment.directorId
    ) {
      changes.directorId = {
        old: existingDepartment.directorId,
        new: updateData.directorId,
      }
    }
    if (
      updateData.location &&
      updateData.location !== existingDepartment.location
    ) {
      changes.location = {
        old: existingDepartment.location,
        new: updateData.location,
      }
    }
    if (
      updateData.parentId &&
      updateData.parentId !== existingDepartment.parentId
    ) {
      changes.parentId = {
        old: existingDepartment.parentId,
        new: updateData.parentId,
      }
    }

    if (Object.keys(changes).length > 0 && updatedBy) {
      await this.#_auditLogService.logAction(
        'Department',
        id,
        AuditAction.UPDATE,
        updatedBy,
        { changes },
      )
    }
  }

  async departmentDelete(payload: DepartmentDeleteRequest): Promise<void> {
    // Fetch existing department for audit log
    const existingDepartment = await this.#_prisma.department.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingDepartment) {
      throw new NotFoundException('Department not found')
    }

    await this.#_prisma.$transaction([
      this.#_prisma.user.updateMany({
        where: {
          departmentId: payload.id,
        },
        data: {
          departmentId: null,
        },
      }),
      this.#_prisma.department.update({
        where: {
          id: payload.id,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ])

    // Log department deletion
    if (payload.deletedBy) {
      await this.#_auditLogService.logAction(
        'Department',
        payload.id,
        AuditAction.DELETE,
        payload.deletedBy,
        {
          oldValues: {
            name: existingDepartment.name,
            description: existingDepartment.description,
            code: existingDepartment.code,
            directorId: existingDepartment.directorId,
            location: existingDepartment.location,
            parentId: existingDepartment.parentId,
          },
        },
      )
    }
  }
}
