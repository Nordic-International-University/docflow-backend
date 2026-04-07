import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private readonly client: Redis

  constructor() {
    // Hardcoded Redis connection URL
    // Format: redis://[:password@]host[:port][/db-number]
    const REDIS_URL = 'redis://localhost:6379/5'

    this.client = new Redis(REDIS_URL, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    this.client.on('connect', () => {
      this.logger.log('Redis client connected')
    })

    this.client.on('error', (err) => {
      this.logger.error('Redis client error:', err)
    })
  }

  getClient(): Redis {
    return this.client
  }

  // Store connected user with their socket ID (supports multiple devices)
  async setUserSocket(userId: string, socketId: string): Promise<void> {
    const key = `socket:user:${userId}`
    // Add socket to user's set of sockets
    await this.client.sadd(key, socketId)
    // Safety TTL — agar disconnect event o'tkazib yuborilsa, 2 soatdan keyin avto-tozalanadi
    await this.client.expire(key, 7200)
  }

  // Get all socket IDs for a user (for multiple devices)
  async getUserSockets(userId: string): Promise<string[]> {
    const key = `socket:user:${userId}`
    return await this.client.smembers(key)
  }

  // Get single socket ID for a user (backward compatibility)
  async getUserSocket(userId: string): Promise<string | null> {
    const sockets = await this.getUserSockets(userId)
    return sockets.length > 0 ? sockets[0] : null
  }

  // Remove specific socket from user's socket set
  async removeUserSocket(userId: string, socketId: string): Promise<void> {
    const key = `socket:user:${userId}`
    await this.client.srem(key, socketId)

    // If no more sockets, delete the key
    const remaining = await this.client.scard(key)
    if (remaining === 0) {
      await this.client.del(key)
    }
  }

  // Remove all sockets for a user
  async removeAllUserSockets(userId: string): Promise<void> {
    const key = `socket:user:${userId}`
    await this.client.del(key)
  }

  // Store socket metadata
  async setSocketMetadata(
    socketId: string,
    data: { userId: string; username: string; connectedAt: number },
  ): Promise<void> {
    const key = `socket:meta:${socketId}`
    await this.client.set(key, JSON.stringify(data), 'EX', 7200)
  }

  // Get socket metadata
  async getSocketMetadata(
    socketId: string,
  ): Promise<{ userId: string; username: string; connectedAt: number } | null> {
    const key = `socket:meta:${socketId}`
    const data = await this.client.get(key)
    return data ? JSON.parse(data) : null
  }

  // Remove socket metadata
  async removeSocketMetadata(socketId: string): Promise<void> {
    const key = `socket:meta:${socketId}`
    await this.client.del(key)
  }

  // Check if user is online (has at least one connected socket)
  async isUserOnline(userId: string): Promise<boolean> {
    const sockets = await this.getUserSockets(userId)
    return sockets.length > 0
  }

  // Get all online users count (faqat kamida 1 ta haqiqiy socketi bor foydalanuvchilar)
  async getOnlineUsersCount(): Promise<number> {
    const ids = await this.getOnlineUsers()
    return ids.length
  }

  // Get all online users — bo'sh set'li yoki orphan kalitlarni avtomatik tozalaydi
  async getOnlineUsers(): Promise<string[]> {
    const keys = await this.client.keys('socket:user:*')
    if (!keys.length) return []
    const result: string[] = []
    const pipeline = this.client.pipeline()
    for (const k of keys) pipeline.scard(k)
    const cards = await pipeline.exec()
    for (let i = 0; i < keys.length; i++) {
      const count = (cards?.[i]?.[1] as number) || 0
      if (count > 0) {
        result.push(keys[i].replace('socket:user:', ''))
      } else {
        // Orphan kalit — darhol o'chirish
        await this.client.del(keys[i])
      }
    }
    return result
  }

  /**
   * Barcha socket kalitlarini tozalash — server startup'da chaqiriladi.
   * Restart bo'lgach eski socketlar o'lgan, lekin Redis'da qolib ketgan bo'lsa,
   * ular avtomatik tozalanadi. Tirik clientlar darhol qayta ulanadi.
   */
  async clearAllSocketKeys(): Promise<number> {
    const keys = [
      ...(await this.client.keys('socket:user:*')),
      ...(await this.client.keys('socket:meta:*')),
    ]
    if (!keys.length) return 0
    await this.client.del(...keys)
    return keys.length
  }

  async onModuleDestroy() {
    await this.client.quit()
    this.logger.log('Redis client disconnected')
  }
}
