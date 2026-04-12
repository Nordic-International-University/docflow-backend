export function withSoftDelete<T extends Record<string, unknown>>(
  where: T,
): T & { deletedAt: null } {
  if ('deletedAt' in where) return where as any
  return { ...where, deletedAt: null }
}

export function softDeleteArgs<T extends { where?: any }>(args: T): T {
  if (!args.where) args.where = {}
  if (!('deletedAt' in args.where)) {
    args.where.deletedAt = null
  }
  return args
}
