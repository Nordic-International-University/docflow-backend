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
      throw new NotFoundException('Project not found')
    }

    // Check if user exists
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.userId,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
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
      throw new ConflictException('User is already a member of this project')
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
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
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
      take,
      orderBy: { joinedAt: 'desc' },
    })

    const count = await this.#_prisma.projectMember.count({ where })

    return {
      data: members,
      count,
      pageNumber,
      pageSize,
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
      throw new NotFoundException('Project member not found')
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
      throw new NotFoundException('Project member not found')
    }

    await this.#_prisma.projectMember.update({
      where: { id },
      data: {
        ...(updateData.role && { role: updateData.role as any }),
        updatedAt: new Date(),
      },
    })

    // Track changes for audit log
    const changes: Record<string, any> = {}
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
      throw new NotFoundException('Project member not found')
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
