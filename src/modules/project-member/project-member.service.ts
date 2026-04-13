import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  ProjectMemberCreateRequest,
  ProjectMemberDeleteRequest,
  ProjectMemberRetrieveAllRequest,
  ProjectMemberRetrieveAllResponse,
  ProjectMemberRetrieveOneRequest,
  ProjectMemberUpdateRequest,
  ProjectMemberRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class ProjectMemberService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async projectMemberCreate(
    payload: ProjectMemberCreateRequest,
  ): Promise<void> {
    // Check if project exists
    const project = await this.#_prisma.project.findFirst({
      where: {
        id: payload.projectId,
        deletedAt: null,
      },
    })

    if (!project) {
      throw new NotFoundException('Loyiha topilmadi')
    }

    // Check if user exists
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.userId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi')
    }

    // Check if membership already exists
    const existingMembership = await this.#_prisma.projectMember.findFirst({
      where: {
        projectId: payload.projectId,
        userId: payload.userId,
        deletedAt: null,
      },
    })

    if (existingMembership) {
      throw new ConflictException("Foydalanuvchi allaqachon bu loyiha a'zosi")
    }

    const member = await this.#_prisma.projectMember.create({
      data: {
        projectId: payload.projectId,
        userId: payload.userId,
        role: (payload.role as any) || 'MEMBER',
        joinedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'ProjectMember',
      member.id,
      AuditAction.CREATE,
      payload.createdBy || member.id,
      {
        newValues: {
          projectId: member.projectId,
          userId: member.userId,
          role: member.role,
        },
      },
    )
  }

  async projectMemberRetrieveAll(
    payload: ProjectMemberRetrieveAllRequest,
  ): Promise<ProjectMemberRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(payload.projectId && { projectId: payload.projectId }),
      ...(payload.userId && { userId: payload.userId }),
      ...(payload.role && { role: payload.role }),
      ...(payload.search && {
        OR: [
          {
            user: {
              fullname: {
                contains: payload.search,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            user: {
              lastName: {
                contains: payload.search,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            user: {
              email: { contains: payload.search, mode: 'insensitive' as const },
            },
          },
          {
            project: {
              name: { contains: payload.search, mode: 'insensitive' as const },
            },
          },
        ],
      }),
    }

    const members = await this.#_prisma.projectMember.findMany({
      where,
      select: {
        id: true,
        projectId: true,
        userId: true,
        role: true,
        joinedAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
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
      orderBy: { joinedAt: 'desc' },
    })

    const count = await this.#_prisma.projectMember.count({ where })

    return {
      data: members,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async projectMemberRetrieveOne(
    payload: ProjectMemberRetrieveOneRequest,
  ): Promise<ProjectMemberRetrieveOneResponse> {
    const member = await this.#_prisma.projectMember.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        userId: true,
        role: true,
        joinedAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!member) {
      throw new NotFoundException("Loyiha a'zosi topilmadi")
    }

    return member as ProjectMemberRetrieveOneResponse
  }

  async projectMemberUpdate(
    payload: ProjectMemberUpdateRequest,
  ): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    const existingMember = await this.#_prisma.projectMember.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingMember) {
      throw new NotFoundException("Loyiha a'zosi topilmadi")
    }

    await this.#_prisma.projectMember.update({
      where: { id },
      data: {
        ...(updateData.role && { role: updateData.role as any }),
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, unknown> = {}
    if (updateData.role && updateData.role !== existingMember.role) {
      changes.role = { old: existingMember.role, new: updateData.role }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'ProjectMember',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }
  }

  async projectMemberDelete(
    payload: ProjectMemberDeleteRequest,
  ): Promise<void> {
    const existingMember = await this.#_prisma.projectMember.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            fullname: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!existingMember) {
      throw new NotFoundException("Loyiha a'zosi topilmadi")
    }

    // Soft delete
    await this.#_prisma.projectMember.update({
      where: { id: payload.id },
      data: {
        deletedAt: new Date(),
      },
    })

    await this.#_auditLogService.logAction(
      'ProjectMember',
      payload.id,
      AuditAction.DELETE,
      payload.id,
      {
        oldValues: {
          projectId: existingMember.projectId,
          userId: existingMember.userId,
          role: existingMember.role,
          userName: `${existingMember.user.fullname}`,
          projectName: existingMember.project.name,
        },
      },
    )
  }
}
