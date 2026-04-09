/**
 * Pagination helper — 20+ service'da takrorlanayotgan boilerplate'ni
 * bitta joyga to'plash.
 *
 * Oldin har service'da:
 *   const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
 *   const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
 *   const skip = (pageNumber - 1) * pageSize
 *   const take = pageSize
 *
 * Endi:
 *   const { page, limit, skip } = parsePagination(payload)
 */

export interface PaginationInput {
  pageNumber?: number | string
  pageSize?: number | string
  page?: number | string
  limit?: number | string
}

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  pageNumber: number
  pageSize: number
  pageCount: number
}

/**
 * Pagination parametrlarini parse qilish.
 * Har xil nom konventsiyalarini qo'llab-quvvatlaydi:
 *   pageNumber/pageSize yoki page/limit
 */
export function parsePagination(
  input: PaginationInput,
  defaults = { page: 1, limit: 10 },
): PaginationParams {
  const page = Math.max(
    1,
    Number(input.pageNumber || input.page || defaults.page),
  )
  const limit = Math.min(
    100, // absolute max
    Math.max(1, Number(input.pageSize || input.limit || defaults.limit)),
  )
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Paginated response yaratish — barcha service'lar uchun bir xil format.
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  return {
    data,
    count: total,
    pageNumber: params.page,
    pageSize: params.limit,
    pageCount: Math.ceil(total / params.limit),
  }
}
