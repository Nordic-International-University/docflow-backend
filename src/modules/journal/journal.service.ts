import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  JournalCreateRequest,
  JournalUpdateRequest,
  JournalDeleteRequest,
  JournalRetrieveAllResponse,
  JournalRetrieveOneRequest,
  JournalRetrieveOneResponse,
} from './interfaces'

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async journalRetrieveAll(payload): Promise<JournalRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const search = payload.search ? payload.search : undefined

    const journalList = await this.prisma.journal.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { prefix: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        format: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        responsibleUser: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
    })

    const total = await this.prisma.journal.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { prefix: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    })

    return {
      data: journalList.map((journal) => ({
        ...journal,
        documentsCount: 0,
      })),
      count: total,
      pageNumber,
      pageSize,
      pageCount: Math.ceil(journalList.length / pageSize),
    }
  }

  async journalRetrieveOne(
    payload: JournalRetrieveOneRequest,
  ): Promise<JournalRetrieveOneResponse> {
    const journal = await this.prisma.journal.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        format: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        responsibleUser: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
      },
    })

    if (!journal) {
      throw new NotFoundException('Journal not found')
    }

    return {
      ...journal,
      documentsCount: 0,
    }
  }

  async journalCreate(payload: JournalCreateRequest) {
    const departament = await this.prisma.department.findFirst({
      where: {
        id: payload.departmentId,
        deletedAt: null,
      },
    })

    if (!departament) {
      throw new NotFoundException('Department not found')
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.responsibleUserId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const createdJournal = await this.prisma.journal.create({
      data: {
        name: payload.name,
        prefix: payload.prefix,
        format: payload.format,
        departmentId: payload.departmentId,
        responsibleUserId: payload.responsibleUserId,
      },
    })

    // Log journal creation
    await this.auditLogService.logAction(
      'Journal',
      createdJournal.id,
      AuditAction.CREATE,
      payload.createdBy || createdJournal.id,
      {
        newValues: {
          name: createdJournal.name,
          prefix: createdJournal.prefix,
          format: createdJournal.format,
          departmentId: createdJournal.departmentId,
          responsibleUserId: createdJournal.responsibleUserId,
        },
      },
    )
  }

  async journalUpdate(payload: JournalUpdateRequest) {
    const { id, updatedBy, ...updateData } = payload

    // Fetch existing journal for change tracking
    const existingJournal = await this.prisma.journal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingJournal) {
      throw new NotFoundException('Journal not found')
    }

    if (updateData.departmentId) {
      const departament = await this.prisma.department.findFirst({
        where: {
          id: updateData.departmentId,
          deletedAt: null,
        },
      })

      if (!departament) {
        throw new NotFoundException('Department not found')
      }
    }

    if (updateData.responsibleUserId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: updateData.responsibleUserId,
          deletedAt: null,
        },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }
    }

    await this.prisma.journal.update({
      where: {
        id,
      },
      data: {
        name: updateData.name,
        prefix: updateData.prefix,
        format: updateData.format,
        departmentId: updateData.departmentId,
        responsibleUserId: updateData.responsibleUserId,
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingJournal.name) {
      changes.name = { old: existingJournal.name, new: updateData.name }
    }
    if (updateData.prefix && updateData.prefix !== existingJournal.prefix) {
      changes.prefix = { old: existingJournal.prefix, new: updateData.prefix }
    }
    if (updateData.format && updateData.format !== existingJournal.format) {
      changes.format = { old: existingJournal.format, new: updateData.format }
    }
    if (
      updateData.departmentId !== undefined &&
      updateData.departmentId !== existingJournal.departmentId
    ) {
      changes.departmentId = {
        old: existingJournal.departmentId,
        new: updateData.departmentId,
      }
    }
    if (
      updateData.responsibleUserId !== undefined &&
      updateData.responsibleUserId !== existingJournal.responsibleUserId
    ) {
      changes.responsibleUserId = {
        old: existingJournal.responsibleUserId,
        new: updateData.responsibleUserId,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.auditLogService.logAction(
        'Journal',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async journalDelete(payload: JournalDeleteRequest) {
    // Fetch existing journal for audit log
    const existingJournal = await this.prisma.journal.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingJournal) {
      throw new NotFoundException('Journal not found')
    }

    await this.prisma.journal.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log journal deletion
    await this.auditLogService.logAction(
      'Journal',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          name: existingJournal.name,
          prefix: existingJournal.prefix,
          format: existingJournal.format,
          departmentId: existingJournal.departmentId,
          responsibleUserId: existingJournal.responsibleUserId,
        },
      },
    )
  }
}
