/**
 * Department Hierarchy Service — bo'lim ierarxiyasini aniqlash.
 *
 * Har request'da foydalanuvchining bo'lim pozitsiyasini hisoblaydi:
 * - Qaysi bo'limning boshliq'i (director)
 * - Qo'l ostidagi barcha bo'limlar (rekursiv children)
 * - O'z bo'limining ota zanjiri (root'gacha)
 *
 * Misol: IT departamenti (id=1) ostida "Tashkiliy ishlar" (id=2) va
 * "Dastur ishlab chiqish" (id=3) bo'lsa:
 *   - IT boshlig'i uchun subordinateDeptIds = [1, 2, 3]
 *   - Tashkiliy ishlar xodimi uchun subordinateDeptIds = [] (boshliq emas)
 *   - Tashkiliy ishlar xodimi uchun ancestorDeptIds = [2, 1] (o'zi + ota)
 *
 * Performance: barcha bo'limlar bir query bilan olinadi (~100 row,
 * < 5ms), keyin in-memory tree walking. Natija 5 daqiqa cache'lanadi.
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'

export interface DepartmentScope {
  ownDeptId: string | null
  isDeptHead: boolean
  /** Boshliq bo'lgan bo'lim + uning barcha child'lari (rekursiv) */
  subordinateDeptIds: string[]
  /** O'z bo'limidan root'gacha zanjir */
  ancestorDeptIds: string[]
}

interface DeptRow {
  id: string
  parentId: string | null
  directorId: string | null
}

// In-memory cache (single process deployment uchun yetarli)
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 daqiqa
const cache = new Map<string, { data: DepartmentScope; expiresAt: number }>()

@Injectable()
export class DepartmentHierarchyService {
  private readonly logger = new Logger(DepartmentHierarchyService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Foydalanuvchining bo'lim ierarxiyasidagi pozitsiyasi.
   * 5 daqiqa in-memory cache bilan.
   */
  async resolveScope(
    userId: string,
    departmentId: string | null,
  ): Promise<DepartmentScope> {
    const cacheKey = userId
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    const scope = await this.computeScope(userId, departmentId)

    cache.set(cacheKey, {
      data: scope,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return scope
  }

  /**
   * Cache'ni bekor qilish — bo'lim tuzilmasi o'zgarganda chaqiriladi.
   * Admin department yaratsa/o'zgartirsa/o'chirsa.
   */
  invalidateUser(userId: string): void {
    cache.delete(userId)
  }

  /** Barcha foydalanuvchilar cache'ini tozalash */
  invalidateAll(): void {
    cache.clear()
    this.logger.log('Department hierarchy cache cleared')
  }

  private async computeScope(
    userId: string,
    departmentId: string | null,
  ): Promise<DepartmentScope> {
    // Barcha bo'limlarni bir query bilan olish (odatda < 100 row)
    const allDepts: DeptRow[] = await this.prisma.department.findMany({
      where: { deletedAt: null },
      select: { id: true, parentId: true, directorId: true },
    })

    // parent → children xaritasi
    const childrenMap = new Map<string, string[]>()
    const deptMap = new Map<string, DeptRow>()
    for (const dept of allDepts) {
      deptMap.set(dept.id, dept)
      if (dept.parentId) {
        const siblings = childrenMap.get(dept.parentId) || []
        siblings.push(dept.id)
        childrenMap.set(dept.parentId, siblings)
      }
    }

    // 1. User direktor bo'lgan bo'limlar
    const directorOfDepts = allDepts.filter((d) => d.directorId === userId)
    const isDeptHead = directorOfDepts.length > 0

    // 2. Subordinate deptIds — directorOf + barcha rekursiv children
    const subordinateDeptIds: string[] = []
    const visited = new Set<string>()

    const collectChildren = (deptId: string) => {
      if (visited.has(deptId)) return
      visited.add(deptId)
      subordinateDeptIds.push(deptId)
      const children = childrenMap.get(deptId) || []
      for (const childId of children) {
        collectChildren(childId)
      }
    }

    for (const dept of directorOfDepts) {
      collectChildren(dept.id)
    }

    // 3. Ancestor deptIds — o'z bo'limidan yuqoriga
    const ancestorDeptIds: string[] = []
    if (departmentId) {
      let currentId: string | null = departmentId
      const ancestorVisited = new Set<string>()
      while (currentId && !ancestorVisited.has(currentId)) {
        ancestorVisited.add(currentId)
        ancestorDeptIds.push(currentId)
        const dept = deptMap.get(currentId)
        currentId = dept?.parentId ?? null
      }
    }

    return {
      ownDeptId: departmentId,
      isDeptHead,
      subordinateDeptIds,
      ancestorDeptIds,
    }
  }
}

// Periodik tozalash — stale cache entry'lar
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of cache.entries()) {
      if (entry.expiresAt < now) cache.delete(key)
    }
  },
  5 * 60 * 1000,
).unref()
