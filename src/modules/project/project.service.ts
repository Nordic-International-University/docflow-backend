import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import { ProjectStatus } from '@prisma/client'
import {
  ProjectCreateDto,
  ProjectUpdateDto,
  ProjectRetrieveQueryDto,
} from './dtos'

@Injectable()
export class ProjectService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async projectCreate(
    payload: ProjectCreateDto & { createdBy?: string },
  ): Promise<void> {
    // Check if project key is unique
    const keyExists = await this.#_prisma.project.findFirst({
      where: {
        key: payload.key.toUpperCase(),
        deletedAt: null,
      },
    })

    if (keyExists) {
      throw new ConflictException('Project key must be unique')
    }

    const project = await this.#_prisma.project.create({
      data: {
        name: payload.name,
        description: payload.description,
        key: payload.key.toUpperCase(),
        status: (payload.status as ProjectStatus) || ProjectStatus.PLANNING,
        departmentId: payload.departmentId,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        budget: payload.budget,
        color: payload.color,
        icon: payload.icon,
        penaltyPerDay: payload.penaltyPerDay,
      },
    })

    // Create default board columns
    const defaultColumns = [
      {
        name: 'Yangi',
        color: '#3B82F6',
        position: 0,
        isDefault: true,
        isClosed: false,
      },
      {
        name: 'Bajarilmoqda',
        color: '#F59E0B',
        position: 1,
        isDefault: false,
        isClosed: false,
      },
      {
        name: 'Tekshiruvda',
        color: '#8B5CF6',
        position: 2,
        isDefault: false,
        isClosed: false,
      },
      {
        name: 'Yakunlangan',
        color: '#10B981',
        position: 3,
        isDefault: false,
        isClosed: true,
      },
    ]

    await this.#_prisma.boardColumn.createMany({
      data: defaultColumns.map((col) => ({
        projectId: project.id,
        ...col,
      })),
    })

    if (payload.createdBy) {
      await this.#_auditLogService.logAction(
        'Project',
        project.id,
        AuditAction.CREATE,
        payload.createdBy,
        {
          newValues: {
            name: project.name,
            key: project.key,
            status: project.status,
          },
        },
      )
    }
  }

  async projectRetrieveAll(payload: ProjectRetrieveQueryDto) {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
      deletedAt: null,
      isArchived: false,
      ...(payload.search && {
        OR: [
          { name: { contains: payload.search, mode: 'insensitive' as const } },
          {
            description: {
              contains: payload.search,
              mode: 'insensitive' as const,
            },
          },
          { key: { contains: payload.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(payload.status && { status: payload.status as ProjectStatus }),
      ...(payload.departmentId && { departmentId: payload.departmentId }),
    }

    const projectList = await this.#_prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        key: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        startDate: true,
        endDate: true,
        budget: true,
        color: true,
        icon: true,
        penaltyPerDay: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const count = await this.#_prisma.project.count({ where })

    return {
      data: projectList.map((p) => ({
        ...p,
        budget: p.budget ? Number(p.budget) : undefined,
      })),
      count,
      pageNumber,
      pageSize,
    }
  }

  async projectRetrieveOne(payload: { id: string }) {
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        key: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        startDate: true,
        endDate: true,
        budget: true,
        color: true,
        icon: true,
        penaltyPerDay: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { deletedAt: null },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        labels: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
          },
        },
      },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return {
      ...project,
      budget: project.budget ? Number(project.budget) : undefined,
    }
  }

  async projectUpdate(
    payload: ProjectUpdateDto & { id: string; updatedBy?: string },
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingProject = await this.#_prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingProject) {
      throw new NotFoundException('Project not found')
    }

    if (updateData.key) {
      const keyExists = await this.#_prisma.project.findFirst({
        where: {
          key: updateData.key,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (keyExists) {
        throw new ConflictException('Project key must be unique')
      }
    }

    const updatePayload: any = {
      ...updateData,
      updatedAt: new Date(),
    }
    if (updateData.status) {
      updatePayload.status = updateData.status as ProjectStatus
    }
    if (updateData.startDate) {
      updatePayload.startDate = new Date(updateData.startDate)
    }
    if (updateData.endDate) {
      updatePayload.endDate = new Date(updateData.endDate)
    }

    await this.#_prisma.project.update({
      where: { id },
      data: updatePayload,
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingProject.name) {
      changes.name = { old: existingProject.name, new: updateData.name }
    }
    if (updateData.status && updateData.status !== existingProject.status) {
      changes.status = { old: existingProject.status, new: updateData.status }
    }

    if (Object.keys(changes).length > 0 && updatedBy) {
      await this.#_auditLogService.logAction(
        'Project',
        id,
        AuditAction.UPDATE,
        updatedBy,
        { changes },
      )
    }
  }

  async projectDelete(payload: {
    id: string
    deletedBy: string
  }): Promise<void> {
    const existingProject = await this.#_prisma.project.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingProject) {
      throw new NotFoundException('Project not found')
    }

    await this.#_prisma.project.update({
      where: { id: payload.id },
      data: {
        key: `${existingProject.key.slice(0, 4)}_${Date.now().toString(36)}`.slice(0, 10),
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'Project',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy,
      {
        oldValues: {
          name: existingProject.name,
          key: existingProject.key,
        },
      },
    )
  }
}
