/**
 * Assert helpers — 206+ joyda takrorlangan NotFoundException ni qisqartirish.
 *
 * Oldin:
 *   const document = await this.prisma.document.findFirst({ ... })
 *   if (!document) {
 *     throw new NotFoundException('Hujjat topilmadi')
 *   }
 *
 * Keyin:
 *   const document = await this.prisma.document.findFirst({ ... })
 *   assertFound(document, 'Hujjat topilmadi')
 *
 * Yoki (Prisma bilan inline):
 *   const document = assertFound(
 *     await this.prisma.document.findFirst({ ... }),
 *     'Hujjat topilmadi',
 *   )
 */

import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'

/**
 * Entity mavjudligini tekshiradi. null/undefined bo'lsa NotFoundException tashlaydi.
 * TypeScript narrowing: qaytgan qiymat null emas.
 */
export function assertFound<T>(
  entity: T | null | undefined,
  message = "So'ralgan ma'lumot topilmadi",
): T {
  if (entity === null || entity === undefined) {
    throw new NotFoundException(message)
  }
  return entity
}

/**
 * Shart to'g'ri bo'lishi kerak, aks holda BadRequest.
 */
export function assertValid(
  condition: boolean,
  message: string,
): asserts condition {
  if (!condition) {
    throw new BadRequestException(message)
  }
}

/**
 * Ruxsat tekshirish — shart to'g'ri bo'lishi kerak, aks holda Forbidden.
 */
export function assertAllowed(
  condition: boolean,
  message = "Bu amalni bajarishga ruxsat yo'q",
): asserts condition {
  if (!condition) {
    throw new ForbiddenException(message)
  }
}
