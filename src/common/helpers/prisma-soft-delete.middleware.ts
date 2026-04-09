/**
 * Prisma soft-delete helper utilities.
 *
 * 505 joyda `deletedAt: null` yozilgan. Bu helperlar bilan qisqartiriladi.
 * Agar o'chirilganlarni ko'rish kerak → `deletedAt: { not: null }` yozing.
 */


/**
 * Where clause'ga deletedAt: null qo'shadi (agar mavjud bo'lmasa).
 */
export function withSoftDelete<T extends Record<string, any>>(
  where: T,
): T & { deletedAt: null } {
  if ('deletedAt' in where) return where as any
  return { ...where, deletedAt: null }
}

/**
 * Prisma findMany/findFirst args'ga softDelete qo'shadi.
 */
export function softDeleteArgs<T extends { where?: any }>(args: T): T {
  if (!args.where) args.where = {}
  if (!('deletedAt' in args.where)) {
    args.where.deletedAt = null
  }
  return args
}
