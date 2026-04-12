import { Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'
import { Logger } from '@nestjs/common'

export interface AuthenticatedSocket extends Socket {
  userId?: string
  username?: string
}

export interface WsAuthResult {
  userId: string
  username: string
}

/**
 * WebSocket JWT auth — barcha gateway'lar uchun shared helper.
 * Oldin 3 ta gateway'da 30+ qator takrorlangan edi.
 *
 * Ishlatish:
 *   const user = await authenticateWsClient(client, jwtService, configService, prisma)
 */
export async function authenticateWsClient(
  client: AuthenticatedSocket,
  jwtService: JwtService,
  configService: ConfigService,
  prisma: PrismaService,
  logger?: Logger,
): Promise<WsAuthResult> {
  const token =
    client.handshake.auth?.token ||
    client.handshake.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    throw new Error('Missing authentication token')
  }

  const payload = await jwtService.verifyAsync(token, {
    secret: configService.get<string>('jwt.accessSecret'),
  })

  // SECURITY: token blacklist tekshirish (logout qilingan token'lar)
  const isBlacklisted = await prisma.tokenBlacklist.findFirst({
    where: { token, expiresAt: { gte: new Date() } },
  })
  if (isBlacklisted) {
    throw new Error('Token has been revoked')
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null, isActive: true },
    select: { id: true, username: true },
  })

  if (!user) {
    throw new Error('User not found or inactive')
  }

  client.userId = user.id
  client.username = user.username

  return { userId: user.id, username: user.username }
}

/**
 * WS auth xatosini to'g'ri handle qilish — token expired vs boshqa xato.
 */
export function handleWsAuthError(
  client: AuthenticatedSocket,
  error: any,
  logger?: Logger,
): void {
  const isExpired =
    error.message?.includes('expired') || error.name === 'TokenExpiredError'

  if (isExpired) {
    logger?.warn(`WS token expired: ${client.id}`)
    client.emit('auth:token_expired', {
      message: 'Token muddati tugagan',
      action: 'REFRESH_TOKEN',
    })
  } else {
    logger?.warn(`WS auth failed: ${client.id} — ${error.message}`)
    client.emit('error', { message: 'Authentication failed' })
  }
  client.disconnect()
}
