import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  SessionRetrieveAllRequest,
  SessionRetrieveAllResponse,
  SessionItem,
} from './interfaces'

@Injectable()
export class SessionService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async sessionRetrieveAll(
    payload: SessionRetrieveAllRequest,
    userId: string,
  ): Promise<SessionRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize

    const where = {
      userId,
      isRevoked: false,
      expiresAt: { gte: new Date() },
      deletedAt: null,
    }

    const [sessions, count] = await Promise.all([
      this.#_prisma.refreshToken.findMany({
        where,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.#_prisma.refreshToken.count({ where }),
    ])

    const data: SessionItem[] = sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }))

    return {
      count,
      pageNumber,
      pageSize,
      pageCount: Math.ceil(count / pageSize),
      data,
    }
  }

  async sessionRetrieveOne(
    sessionId: string,
    userId: string,
  ): Promise<SessionItem> {
    const session = await this.#_prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
        isRevoked: false,
        expiresAt: { gte: new Date() },
        deletedAt: null,
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    if (!session) {
      throw new NotFoundException('Sessiya topilmadi')
    }

    return {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }
  }

  async sessionRevoke(sessionId: string, userId: string): Promise<void> {
    const session = await this.#_prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
        isRevoked: false,
        deletedAt: null,
      },
    })

    if (!session) {
      throw new NotFoundException('Sessiya topilmadi')
    }

    await this.#_prisma.refreshToken.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    })
  }

  async sessionRevokeAll(userId: string): Promise<number> {
    const result = await this.#_prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
        deletedAt: null,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    })

    return result.count
  }
}
