import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  ProjectLabelCreateRequest,
  ProjectLabelDeleteRequest,
  ProjectLabelRetrieveAllRequest,
  ProjectLabelRetrieveAllResponse,
  ProjectLabelRetrieveOneRequest,
  ProjectLabelUpdateRequest,
  ProjectLabelRetrieveOneResponse,
} from './interfaces'

@Injectable()
export class ProjectLabelService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async projectLabelCreate(payload: ProjectLabelCreateRequest): Promise<void> {
    // Verify project exists
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: payload.projectId,
        deletedAt: null,
      },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    // Check if name is unique within project
    const nameExists = await this.#_prisma.projectLabel.findFirst({
      where: {
        projectId: payload.projectId,
        name: payload.name,
        deletedAt: null,
      },
    })

    if (nameExists) {
      throw new ConflictException('Label name must be unique within project')
    }

    const label = await this.#_prisma.projectLabel.create({
      data: {
        projectId: payload.projectId,
        name: payload.name,
        color: payload.color,
        description: payload.description,
      },
    })

    await this.#_auditLogService.logAction(
      'ProjectLabel',
      label.id,
      AuditAction.CREATE,
      payload.createdBy || label.id,
      {
        newValues: {
          name: label.name,
          projectId: label.projectId,
          color: label.color,
        },
      },
    )
  }

  async projectLabelRetrieveAll(
    payload: ProjectLabelRetrieveAllRequest,
  ): Promise<ProjectLabelRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
      deletedAt: null,
      ...(payload.projectId && { projectId: payload.projectId }),
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
    }

    const labels = await this.#_prisma.projectLabel.findMany({
      where,
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        description: true,
        _count: {
          select: {
            taskLabels: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.projectLabel.count({ where })

    const data = labels.map((label) => ({
      ...label,
      taskCount: label._count.taskLabels,
      _count: undefined,
    }))

    return {
      data,
      count,
      pageNumber,
      pageSize,
    }
  }

  async projectLabelRetrieveOne(
    payload: ProjectLabelRetrieveOneRequest,
  ): Promise<ProjectLabelRetrieveOneResponse> {
    const label = await this.#_prisma.projectLabel.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        description: true,
        _count: {
          select: {
            taskLabels: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!label) {
      throw new NotFoundException('Project label not found')
    }

    return {
      ...label,
      taskCount: label._count.taskLabels,
      _count: undefined,
    } as ProjectLabelRetrieveOneResponse
  }

  async projectLabelUpdate(payload: ProjectLabelUpdateRequest): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingLabel = await this.#_prisma.projectLabel.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingLabel) {
      throw new NotFoundException('Project label not found')
    }

    if (updateData.name) {
      const nameExists = await this.#_prisma.projectLabel.findFirst({
        where: {
          projectId: existingLabel.projectId,
          name: updateData.name,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (nameExists) {
        throw new ConflictException('Label name must be unique within project')
      }
    }

    await this.#_prisma.projectLabel.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingLabel.name) {
      changes.name = { old: existingLabel.name, new: updateData.name }
    }
    if (updateData.color && updateData.color !== existingLabel.color) {
      changes.color = { old: existingLabel.color, new: updateData.color }
    }
    if (
      updateData.description !== undefined &&
      updateData.description !== existingLabel.description
    ) {
      changes.description = {
        old: existingLabel.description,
        new: updateData.description,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'ProjectLabel',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async projectLabelDelete(payload: ProjectLabelDeleteRequest): Promise<void> {
    const existingLabel = await this.#_prisma.projectLabel.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existingLabel) {
      throw new NotFoundException('Project label not found')
    }

    // Soft delete
    await this.#_prisma.projectLabel.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'ProjectLabel',
      payload.id,
      AuditAction.DELETE,
      payload.id,
      {
        oldValues: {
          name: existingLabel.name,
          projectId: existingLabel.projectId,
        },
      },
    )
  }
}
