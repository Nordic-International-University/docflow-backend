import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log'
import { AuditAction } from '../audit-log'
import { ProjectStatus, ProjectVisibility } from '@prisma/client'
import { isAdmin } from '@common/helpers'
import {
  ProjectCreateDto,
  ProjectUpdateDto,
  ProjectRetrieveQueryDto,
} from './dtos'

import { parsePagination } from '@common/helpers'
@Injectable()
export class ProjectService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  /**
   * Build visibility filter — kim qaysi loyihalarni ko'ra oladi
   *
   * Admin/Direktor → hammasini
   * Boshqalar → PUBLIC | (DEPARTMENT && o'z bo'limi) | (PRIVATE && member) | createdBy
   */
  private buildVisibilityFilter(
    userId: string,
    roleName?: string,
    departmentId?: string,
  ): any {
    const admin = isAdmin(roleName)

    if (admin) return {}

    const orConditions: any[] = [
      // PUBLIC — hammaga ko'rinadi
      { visibility: 'PUBLIC' },
      // Yaratuvchi har doim ko'radi
      { createdById: userId },
      // Member bo'lsa har qanday visibility'da ko'radi
      { members: { some: { userId } } },
    ]

    // DEPARTMENT — o'z bo'limining loyihalari
    if (departmentId) {
      orConditions.push({
        visibility: 'DEPARTMENT',
        departmentId,
      })
    }

    return { OR: orConditions }
  }

  /**
   * Check if user has access to a specific project
   */
  async checkProjectAccess(
    projectId: string,
    userId: string,
    roleName?: string,
    departmentId?: string,
  ): Promise<void> {
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        ...this.buildVisibilityFilter(userId, roleName, departmentId),
      },
      select: { id: true },
    })

    if (!project) {
      throw new ForbiddenException("Bu loyihaga kirish huquqingiz yo'q")
    }
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

    // Visibility default — DEPARTMENT bo'lim tanlangan bo'lsa, aks holda PRIVATE
    const visibility =
      (payload.visibility as ProjectVisibility) ||
      (payload.departmentId
        ? ProjectVisibility.DEPARTMENT
        : ProjectVisibility.PRIVATE)

    const project = await this.#_prisma.project.create({
      data: {
        name: payload.name,
        description: payload.description,
        key: payload.key.toUpperCase(),
        status: (payload.status as ProjectStatus) || ProjectStatus.PLANNING,
        visibility,
        createdById: payload.createdBy,
        departmentId: payload.departmentId,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        budget: payload.budget,
        color: payload.color,
        icon: payload.icon,
        penaltyPerDay: payload.penaltyPerDay,
      },
    })

    // Yaratuvchi avtomatik OWNER bo'ladi
    if (payload.createdBy) {
      await this.#_prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: payload.createdBy,
          role: 'OWNER',
        },
      })
    }

    // Boshlang'ich a'zolarni qo'shish (boshqa bo'limdan ham mumkin)
    if (payload.initialMemberIds?.length) {
      const memberData = payload.initialMemberIds
        .filter((uid) => uid !== payload.createdBy)
        .map((userId) => ({
          projectId: project.id,
          userId,
          role: 'MEMBER' as const,
        }))
      if (memberData.length > 0) {
        await this.#_prisma.projectMember.createMany({
          data: memberData,
          skipDuplicates: true,
        })
      }
    }

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

  async projectRetrieveAll(
    payload: ProjectRetrieveQueryDto & {
      userId?: string
      roleName?: string
      userDepartmentId?: string
    },
  ) {
    const { page, limit, skip } = parsePagination(payload)

    const visibilityFilter = payload.userId
      ? this.buildVisibilityFilter(
          payload.userId,
          payload.roleName,
          payload.userDepartmentId,
        )
      : {}

    const andConditions: any[] = [{ deletedAt: null }, { isArchived: false }]

    if (payload.search) {
      andConditions.push({
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
      })
    }
    if (payload.status)
      andConditions.push({ status: payload.status as ProjectStatus })
    if (payload.departmentId)
      andConditions.push({ departmentId: payload.departmentId })
    if (Object.keys(visibilityFilter).length > 0)
      andConditions.push(visibilityFilter)

    const where = { AND: andConditions }

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
      take: limit,
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
      pageNumber: page,
      pageSize: limit,
    }
  }

  async projectRetrieveOne(payload: {
    id: string
    userId?: string
    roleName?: string
    userDepartmentId?: string
  }) {
    if (payload.userId) {
      await this.checkProjectAccess(
        payload.id,
        payload.userId,
        payload.roleName,
        payload.userDepartmentId,
      )
    }

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

    const updatePayload: Record<string, any> = {
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
        key: `${existingProject.key.slice(0, 4)}_${Date.now().toString(36)}`.slice(
          0,
          10,
        ),
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
