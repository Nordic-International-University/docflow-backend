import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { parseUserAgent } from '@common'
import { NotificationGateway } from '../notification/notification.gateway'
import {
  SessionRetrieveAllRequest,
  SessionRetrieveAllResponse,
  SessionItem,
} from './interfaces'

@Injectable()
export class SessionService {
  readonly #_prisma: PrismaService
  readonly #_gateway: NotificationGateway

  constructor(prisma: PrismaService, gateway: NotificationGateway) {
    this.#_prisma = prisma
    this.#_gateway = gateway
  }

  private mapSession(session: any, currentSessionId?: string): SessionItem {
    const parsed = parseUserAgent(session.userAgent)
    return {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      browser: parsed.browser,
      os: parsed.os,
      device: parsed.device,
      isCurrent: session.id === currentSessionId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }
  }

  async sessionRetrieveAll(
    payload: SessionRetrieveAllRequest,
    userId: string,
    currentSessionId?: string,
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

    return {
      count,
      pageNumber,
      pageSize,
      pageCount: Math.ceil(count / pageSize),
      data: sessions.map((s) => this.mapSession(s, currentSessionId)),
    }
  }

  async sessionRetrieveOne(
    sessionId: string,
    userId: string,
    currentSessionId?: string,
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

    return this.mapSession(session, currentSessionId)
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

    // Real-time: chiqarilgan sessionga "force-logout" yuborish
    try {
      this.#_gateway.server.to(`user:${userId}`).emit('session:revoked', {
        sessionId,
        message: 'Sizning sessiyangiz boshqa qurilmadan chiqarib yuborildi',
        timestamp: new Date().toISOString(),
      })
    } catch {}
  }

  async sessionRevokeAll(
    userId: string,
    exceptSessionId?: string,
  ): Promise<number> {
    const where: any = {
      userId,
      isRevoked: false,
      deletedAt: null,
    }
    if (exceptSessionId) where.id = { not: exceptSessionId }

    const result = await this.#_prisma.refreshToken.updateMany({
      where,
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    })

    // Real-time broadcast
    try {
      this.#_gateway.server.to(`user:${userId}`).emit('session:revoked-all', {
        message: 'Barcha boshqa sessiyalar chiqarib yuborildi',
        exceptSessionId,
        timestamp: new Date().toISOString(),
      })
    } catch {}

    return result.count
  }
}
