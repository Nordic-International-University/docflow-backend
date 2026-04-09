import { Injectable, ExecutionContext } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

/**
 * Global throttler guard — barcha endpointlarga qo'llanadi.
 * Default: 'medium' profili (60 req/min).
 *
 * Alohida endpointlarga qattiqroq limit qo'yish uchun:
 *   @Throttle({ short: { ttl: 60000, limit: 5 } })
 *   async login() { ... }
 *
 * WebSocket endpoint'lar uchun skip qilinadi.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // WebSocket so'rovlarni skip qilish (ular boshqa mexanizmda himoyalanadi)
    const type = context.getType()
    if (type === 'ws') return true
    return false
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // IP + userId kombinatsiyasi (autentifikatsiyalangan bo'lsa)
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const userId = req.user?.userId || 'anonymous'
    return `${ip}-${userId}`
  }
}
