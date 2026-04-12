/**
 * Best-effort async side effect runner.
 *
 * **Muammo**: ko'p joylarda fire-and-forget patterni ishlatilgan:
 *   someAsync().catch(() => {})                // silent — ko'rinmas fail
 *   someAsync().catch((e) => logger.warn(...)) // logged lekin context/retry yo'q
 *
 * **Yechim**: `bestEffort` helper — har fail'da context bilan log yozadi,
 * stack trace'ni saqlaydi, ixtiyoriy retry bilan beqaror infrastrukturaga
 * ham dosh beradi.
 *
 * Ishlatish:
 *   await bestEffort(
 *     () => notificationService.createTaskCompletedNotification(payload),
 *     'notify task completed',
 *     this.logger,
 *   )
 *
 *   // Retry bilan — beqaror tarmoq/DB chaqiriqlari uchun
 *   await bestEffortWithRetry(
 *     () => kpiService.updateUserMonthlyKpi(userId, y, m),
 *     `KPI aggregate for ${userId}`,
 *     this.logger,
 *     { retries: 3, delayMs: 1000 },
 *   )
 *
 * Helper asosiy operatsiyani **hech qachon** throw qilmaydi —
 * side effect fail bo'lsa ham caller davom etadi.
 */

import { Logger } from '@nestjs/common'

/**
 * Minimal Logger-ga o'xshash interfeys.
 * NestJS Logger, console, yoki custom logger'lar bilan ishlaydi.
 */
export interface BestEffortLogger {
  warn(message: string, stack?: string): void
  error?(message: string, stack?: string): void
}

/**
 * Best-effort async side effect. Failure'ni yutadi lekin **har doim log qiladi**.
 *
 * @param fn - bajarish kerak bo'lgan async operatsiya
 * @param context - human-readable tavsif (masalan: "notify user about comment")
 * @param logger - NestJS Logger yoki shunga o'xshash
 * @returns muvaffaqiyatda fn natijasi, fail'da undefined
 */
export async function bestEffort<T>(
  fn: () => Promise<T>,
  context: string,
  logger: BestEffortLogger | Logger,
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (err: any) {
    const message = err?.message ?? String(err)
    const stack = err?.stack
    logger.warn(`[best-effort] ${context} failed: ${message}`, stack)
    return undefined
  }
}

/**
 * Retry bilan best-effort. Beqaror infrastruktura uchun
 * (DB lock, tarmoq blip, rate limit). Har urinish orasida
 * linear backoff (delayMs * attempt).
 *
 * @param fn - async operatsiya
 * @param context - log uchun
 * @param logger - NestJS Logger
 * @param opts.retries - jami urinishlar soni (default 3, ya'ni 1 ta asosiy + 2 ta retry)
 * @param opts.delayMs - asosiy delay (default 500ms)
 */
export async function bestEffortWithRetry<T>(
  fn: () => Promise<T>,
  context: string,
  logger: BestEffortLogger | Logger,
  opts: { retries?: number; delayMs?: number } = {},
): Promise<T | undefined> {
  const retries = opts.retries ?? 3
  const delayMs = opts.delayMs ?? 500

  let lastError: any
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  const message = lastError?.message ?? String(lastError)
  const stack = lastError?.stack
  logger.warn(
    `[best-effort] ${context} failed after ${retries} attempts: ${message}`,
    stack,
  )
  return undefined
}
