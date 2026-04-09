import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import {
  UserCreateRequest,
  UserDeleteRequest,
  UserRetrieveAllRequest,
  UserRetrieveAllResponse,
  UserRetrieveOneRequest,
  UserRetrieveOneResponse,
  UserUpdateRequest,
} from './interface'
import { PrismaService } from '@prisma'
import { TelegramService } from '../telegram/telegram.service'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)
  readonly #_prisma: PrismaService
  readonly #_telegram: TelegramService
  readonly #_auditLogService: AuditLogService

  constructor(
    prisma: PrismaService,
    telegram: TelegramService,
    auditLogService: AuditLogService,
  ) {
    this.#_prisma = prisma
    this.#_telegram = telegram
    this.#_auditLogService = auditLogService
  }

  async userRetrieveAll(
    payload: UserRetrieveAllRequest & { projectId?: string },
  ): Promise<UserRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const search = payload.search ? payload.search : undefined
    const departmentId = payload.departmentId ? payload.departmentId : undefined

    // Loyihaga tegishli userlar — bo'lim a'zolari + qo'shilgan memberlar
    let projectAccessFilter: any = undefined
    if (payload.projectId) {
      const project = await this.#_prisma.project.findFirst({
        where: { id: payload.projectId, deletedAt: null },
        select: {
          visibility: true,
          departmentId: true,
          createdById: true,
          members: { where: { deletedAt: null }, select: { userId: true } },
        },
      })

      if (project) {
        const memberIds = project.members.map((m) => m.userId)
        const orConditions: any[] = [{ id: { in: memberIds } }]
        if (project.createdById) orConditions.push({ id: project.createdById })
        if (project.visibility === 'DEPARTMENT' && project.departmentId) {
          orConditions.push({ departmentId: project.departmentId })
        }
        if (project.visibility === 'PUBLIC') {
          orConditions.push({}) // PUBLIC — hamma
        }
        projectAccessFilter = { OR: orConditions }
      }
    }

    const baseWhere: any = {
      deletedAt: null,
      isActive: true,
      ...(search && {
        OR: [
          { fullname: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId }),
      ...(projectAccessFilter && projectAccessFilter),
    }

    const userList = await this.#_prisma.user.findMany({
      where: baseWhere,
      select: {
        id: true,
        fullname: true,
        username: true,
        avatarUrl: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        telegramId: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    })

    const total = await this.#_prisma.user.count({ where: baseWhere })

    return {
      count: total,
      pageNumber,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
      data: userList.map((user) => ({
        ...user,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
    }
  }

  async userRetrieveOne(
    payload: UserRetrieveOneRequest,
  ): Promise<UserRetrieveOneResponse> {
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        avatarUrl: true,
        isActive: true,
        telegramId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      role: user.role,
      department: user.department,
      lastLogin: user.lastLogin,
      telegram: {
        isLinked: !!user.telegramId,
        telegramId: user.telegramId || undefined,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async userCreate(payload: UserCreateRequest): Promise<void> {
    const existingUser = await this.#_prisma.user.findFirst({
      where: {
        username: payload.username,
        deletedAt: null,
      },
    })

    if (existingUser) {
      throw new ConflictException('Username already exists')
    }

    if (payload.roleId) {
      const role = await this.#_prisma.role.findFirst({
        where: {
          id: payload.roleId,
          deletedAt: null,
        },
      })

      if (!role) {
        throw new NotFoundException('Role not found')
      }
    }

    if (payload.departmentId) {
      const department = await this.#_prisma.department.findFirst({
        where: {
          id: payload.departmentId,
          deletedAt: null,
        },
      })

      if (!department) {
        throw new NotFoundException('Department not found')
      }
    }

    const hashedPassword = await argon2.hash(payload.password)

    const createdUser = await this.#_prisma.user.create({
      data: {
        fullname: payload.fullname,
        username: payload.username,
        password: hashedPassword,
        roleId: payload.roleId,
        departmentId: payload.departmentId,
        avatarUrl: payload.avatarUrl,
        isActive: payload.isActive ?? true,
      },
    })

    // Log user creation
    await this.#_auditLogService.logAction(
      'User',
      createdUser.id,
      AuditAction.CREATE,
      createdUser.id, // User creates themselves
      {
        newValues: {
          username: createdUser.username,
          fullname: createdUser.fullname,
          roleId: createdUser.roleId,
          departmentId: createdUser.departmentId,
          isActive: createdUser.isActive,
        },
      },
    )
  }

  async userUpdate(payload: UserUpdateRequest): Promise<void> {
    this.logger.log('Updating user with payload:', payload)
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (payload.username && payload.username !== user.username) {
      const existingUser = await this.#_prisma.user.findFirst({
        where: {
          username: payload.username,
          deletedAt: null,
          NOT: {
            id: payload.id,
          },
        },
      })

      if (existingUser) {
        throw new ForbiddenException('Username already exists')
      }
    }

    if (payload.telegramId && payload.telegramId !== user.telegramId) {
      const existingUser = await this.#_prisma.user.findFirst({
        where: {
          telegramId: payload.telegramId,
          deletedAt: null,
          NOT: {
            id: payload.id,
          },
        },
      })

      if (existingUser) {
        throw new ForbiddenException('Telegram ID already exists')
      }
    }

    if (payload.roleId) {
      const role = await this.#_prisma.role.findFirst({
        where: {
          id: payload.roleId,
          deletedAt: null,
        },
      })

      if (!role) {
        throw new NotFoundException('Role not found')
      }
    }

    if (payload.departmentId) {
      const department = await this.#_prisma.department.findFirst({
        where: {
          id: payload.departmentId,
          deletedAt: null,
        },
      })

      if (!department) {
        throw new NotFoundException('Department not found')
      }
    }

    const updateData: any = {
      fullname: payload.fullname,
      username: payload.username,
      roleId: payload.roleId,
      departmentId: payload.departmentId,
      avatarUrl: payload.avatarUrl,
      telegramId: payload.telegramId,
      isActive: payload.isActive,
    }

    if (payload.password) {
      updateData.password = await argon2.hash(payload.password)
    }

    await this.#_prisma.user.update({
      where: {
        id: payload.id,
      },
      data: updateData,
    })

    // Log user update
    const changes: Record<string, any> = {}
    if (payload.fullname && payload.fullname !== user.fullname) {
      changes.fullname = { old: user.fullname, new: payload.fullname }
    }
    if (payload.username && payload.username !== user.username) {
      changes.username = { old: user.username, new: payload.username }
    }
    if (payload.roleId && payload.roleId !== user.roleId) {
      changes.roleId = { old: user.roleId, new: payload.roleId }
    }
    if (payload.departmentId && payload.departmentId !== user.departmentId) {
      changes.departmentId = {
        old: user.departmentId,
        new: payload.departmentId,
      }
    }
    if (payload.isActive !== undefined && payload.isActive !== user.isActive) {
      changes.isActive = { old: user.isActive, new: payload.isActive }
    }

    if (Object.keys(changes).length > 0) {
      await this.#_auditLogService.logAction(
        'User',
        payload.id,
        AuditAction.UPDATE,
        payload.id, // User updates themselves
        { changes },
      )
    }
  }

  async userDelete(payload: UserDeleteRequest): Promise<void> {
    const user = await this.#_prisma.user.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.#_prisma.user.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log user deletion
    await this.#_auditLogService.logAction(
      'User',
      payload.id,
      AuditAction.DELETE,
      payload.id, // User deletes themselves
      {
        oldValues: {
          username: user.username,
          fullname: user.fullname,
          roleId: user.roleId,
          departmentId: user.departmentId,
        },
      },
    )
  }

  async userProfileUpdate() {}

  /**
   * Generate a deep link for linking Telegram account
   */
  async getTelegramLinkInfo(userId: string): Promise<{
    deepLink: string
    userId: string
    instructions: string
  }> {
    const user = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'docflow_bot'
    const deepLink = `https://t.me/${botUsername}?start=${userId}`

    return {
      deepLink,
      userId,
      instructions: `Click the link above or send this command to @${botUsername}: /link ${userId}`,
    }
  }

  /**
   * Link a Telegram ID to the user account
   */
  async linkTelegramAccount(userId: string, telegramId: string): Promise<void> {
    const user = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Check if Telegram ID is already linked to another user
    const existingLink = await this.#_prisma.user.findFirst({
      where: {
        telegramId,
        id: { not: userId },
        deletedAt: null,
      },
    })

    if (existingLink) {
      throw new BadRequestException(
        'This Telegram ID is already linked to another account',
      )
    }

    await this.#_telegram.linkTelegramToUser(userId, telegramId)
  }

  /**
   * Unlink Telegram account from user
   */
  async unlinkTelegramAccount(userId: string): Promise<void> {
    const user = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!user.telegramId) {
      throw new BadRequestException(
        'No Telegram account is linked to this user',
      )
    }

    await this.#_telegram.unlinkTelegramFromUser(userId)
  }

  /**
   * Get user's Telegram link status
   */
  async getTelegramStatus(userId: string): Promise<{
    isLinked: boolean
    telegramId?: string
  }> {
    const user = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { telegramId: true },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return {
      isLinked: !!user.telegramId,
      telegramId: user.telegramId || undefined,
    }
  }
}
