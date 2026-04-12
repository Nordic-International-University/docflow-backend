/**
 * Global Search Service — PostgreSQL Full-Text Search.
 *
 * Barcha entity'lardan qidirish: document, task, project, workflow,
 * user, journal. ABAC orqali faqat ruxsat etilgan natijalar.
 *
 * Kelajakda Elasticsearch'ga migrate qilish mumkin — shu service'ni
 * almashtirish kifoya, controller o'zgarmaydi.
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { accessibleBy } from '@casl/prisma'
import type { AppAbility } from '../../casl/casl.types'

export interface SearchResult {
  type: 'document' | 'task' | 'project' | 'workflow' | 'user' | 'journal'
  id: string
  title: string
  description: string | null
  score: number
  meta: Record<string, any>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  facets: {
    byType: Record<string, number>
  }
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name)

  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(
    query: string,
    options: {
      type?: string // all, document, task, project, workflow, user, journal
      page?: number
      limit?: number
      ability?: AppAbility
      userId?: string
    },
  ): Promise<SearchResponse> {
    const page = options.page || 1
    const limit = Math.min(options.limit || 20, 50)
    const type = options.type || 'all'
    const searchTerm = query.trim()

    if (!searchTerm || searchTerm.length < 2) {
      return { results: [], total: 0, page, limit, facets: { byType: {} } }
    }

    const allResults: SearchResult[] = []
    const facets: Record<string, number> = {}

    // ABAC filter'lar
    const docFilter = options.ability
      ? accessibleBy(options.ability, 'read').Document
      : {}
    const taskFilter = options.ability
      ? accessibleBy(options.ability, 'read').Task
      : {}
    const projectFilter = options.ability
      ? accessibleBy(options.ability, 'read').Project
      : {}
    const workflowFilter = options.ability
      ? accessibleBy(options.ability, 'read').Workflow
      : {}
    const journalFilter = options.ability
      ? accessibleBy(options.ability, 'read').Journal
      : {}

    const searchMode = 'insensitive' as const

    // ═══════════ DOCUMENTS ═══════════
    if (type === 'all' || type === 'document') {
      const docs = await this.prisma.document.findMany({
        where: {
          deletedAt: null,
          ...docFilter,
          OR: [
            { title: { contains: searchTerm, mode: searchMode } },
            { description: { contains: searchTerm, mode: searchMode } },
            { documentNumber: { contains: searchTerm, mode: searchMode } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          documentNumber: true,
          status: true,
          createdBy: { select: { fullname: true } },
          documentType: { select: { name: true } },
          journal: { select: { name: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      for (const doc of docs) {
        allResults.push({
          type: 'document',
          id: doc.id,
          title: doc.title,
          description: doc.description,
          score: this.calculateRelevance(searchTerm, doc.title, doc.description),
          meta: {
            documentNumber: doc.documentNumber,
            status: doc.status,
            createdBy: doc.createdBy?.fullname,
            documentType: doc.documentType?.name,
            journal: doc.journal?.name,
          },
        })
      }
      facets['document'] = docs.length
    }

    // ═══════════ TASKS ═══════════
    if (type === 'all' || type === 'task') {
      const tasks = await this.prisma.task.findMany({
        where: {
          deletedAt: null,
          isArchived: false,
          ...taskFilter,
          OR: [
            { title: { contains: searchTerm, mode: searchMode } },
            { description: { contains: searchTerm, mode: searchMode } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          taskNumber: true,
          priority: true,
          completedAt: true,
          project: { select: { name: true, key: true } },
          createdBy: { select: { fullname: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      for (const task of tasks) {
        allResults.push({
          type: 'task',
          id: task.id,
          title: task.title,
          description: task.description,
          score: this.calculateRelevance(searchTerm, task.title, task.description),
          meta: {
            taskNumber: task.taskNumber,
            priority: task.priority,
            completed: !!task.completedAt,
            project: task.project?.name,
            projectKey: task.project?.key,
            createdBy: task.createdBy?.fullname,
          },
        })
      }
      facets['task'] = tasks.length
    }

    // ═══════════ PROJECTS ═══════════
    if (type === 'all' || type === 'project') {
      const projects = await this.prisma.project.findMany({
        where: {
          deletedAt: null,
          isArchived: false,
          ...projectFilter,
          OR: [
            { name: { contains: searchTerm, mode: searchMode } },
            { description: { contains: searchTerm, mode: searchMode } },
            { key: { contains: searchTerm, mode: searchMode } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          key: true,
          status: true,
          visibility: true,
          department: { select: { name: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      for (const project of projects) {
        allResults.push({
          type: 'project',
          id: project.id,
          title: project.name,
          description: project.description,
          score: this.calculateRelevance(searchTerm, project.name, project.description),
          meta: {
            key: project.key,
            status: project.status,
            visibility: project.visibility,
            department: project.department?.name,
          },
        })
      }
      facets['project'] = projects.length
    }

    // ═══════════ WORKFLOWS ═══════════
    if (type === 'all' || type === 'workflow') {
      const workflows = await this.prisma.workflow.findMany({
        where: {
          deletedAt: null,
          ...workflowFilter,
          document: {
            OR: [
              { title: { contains: searchTerm, mode: searchMode } },
              { documentNumber: { contains: searchTerm, mode: searchMode } },
            ],
          },
        },
        select: {
          id: true,
          status: true,
          type: true,
          deadline: true,
          document: {
            select: {
              title: true,
              documentNumber: true,
              createdBy: { select: { fullname: true } },
            },
          },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      for (const wf of workflows) {
        allResults.push({
          type: 'workflow',
          id: wf.id,
          title: wf.document.title || wf.document.documentNumber || 'Workflow',
          description: null,
          score: this.calculateRelevance(
            searchTerm,
            wf.document.title,
            wf.document.documentNumber,
          ),
          meta: {
            status: wf.status,
            workflowType: wf.type,
            deadline: wf.deadline,
            createdBy: wf.document.createdBy?.fullname,
          },
        })
      }
      facets['workflow'] = workflows.length
    }

    // ═══════════ USERS ═══════════
    if (type === 'all' || type === 'user') {
      const users = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          OR: [
            { fullname: { contains: searchTerm, mode: searchMode } },
            { username: { contains: searchTerm, mode: searchMode } },
          ],
        },
        select: {
          id: true,
          fullname: true,
          username: true,
          avatarUrl: true,
          department: { select: { name: true } },
          role: { select: { name: true } },
        },
        take: limit,
        orderBy: { fullname: 'asc' },
      })

      for (const user of users) {
        allResults.push({
          type: 'user',
          id: user.id,
          title: user.fullname,
          description: user.username,
          score: this.calculateRelevance(searchTerm, user.fullname, user.username),
          meta: {
            username: user.username,
            avatarUrl: user.avatarUrl,
            department: user.department?.name,
            role: user.role?.name,
          },
        })
      }
      facets['user'] = users.length
    }

    // ═══════════ JOURNALS ═══════════
    if (type === 'all' || type === 'journal') {
      const journals = await this.prisma.journal.findMany({
        where: {
          deletedAt: null,
          ...journalFilter,
          OR: [
            { name: { contains: searchTerm, mode: searchMode } },
            { prefix: { contains: searchTerm, mode: searchMode } },
          ],
        },
        select: {
          id: true,
          name: true,
          prefix: true,
          department: { select: { name: true } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      for (const journal of journals) {
        allResults.push({
          type: 'journal',
          id: journal.id,
          title: journal.name,
          description: journal.prefix,
          score: this.calculateRelevance(searchTerm, journal.name, journal.prefix),
          meta: {
            prefix: journal.prefix,
            department: journal.department?.name,
          },
        })
      }
      facets['journal'] = journals.length
    }

    // Score bo'yicha tartiblash
    allResults.sort((a, b) => b.score - a.score)

    // Pagination
    const total = allResults.length
    const paginatedResults = allResults.slice((page - 1) * limit, page * limit)

    return {
      results: paginatedResults,
      total,
      page,
      limit,
      facets: { byType: facets },
    }
  }

  /**
   * Oddiy relevance hisoblash — title match > description match.
   * Kelajakda PostgreSQL tsvector yoki Elasticsearch bilan almashtiriladi.
   */
  private calculateRelevance(
    query: string,
    title?: string | null,
    description?: string | null,
  ): number {
    let score = 0
    const q = query.toLowerCase()

    if (title) {
      const t = title.toLowerCase()
      if (t === q) score += 100 // aniq mos
      else if (t.startsWith(q)) score += 80 // boshidan mos
      else if (t.includes(q)) score += 50 // ichida bor
    }

    if (description) {
      const d = description.toLowerCase()
      if (d.includes(q)) score += 20
    }

    return score
  }
}
