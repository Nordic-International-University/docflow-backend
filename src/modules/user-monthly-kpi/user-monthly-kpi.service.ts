import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  UserMonthlyKpiRetrieveAllRequest,
  UserMonthlyKpiRetrieveAllResponse,
  UserMonthlyKpiResponse,
  LeaderboardRequest,
  LeaderboardResponse,
  TaskKpiScoreResponse,
} from './interfaces'

@Injectable()
export class UserMonthlyKpiService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async userMonthlyKpiRetrieveAll(
    payload: UserMonthlyKpiRetrieveAllRequest,
  ): Promise<UserMonthlyKpiRetrieveAllResponse> {
    const pageNumber = payload.pageNumber || 1
    const pageSize = payload.pageSize || 10
    const skip = (pageNumber - 1) * pageSize

    const where: Record<string, unknown> = {}

    if (payload.userId) {
      where.userId = payload.userId
    }
    if (payload.departmentId) {
      where.departmentId = payload.departmentId
    }
    if (payload.year) {
      where.year = payload.year
    }
    if (payload.month) {
      where.month = payload.month
    }
    if (payload.isFinalized !== undefined) {
      where.isFinalized = payload.isFinalized
    }

    const [kpis, count] = await Promise.all([
      this.#_prisma.userMonthlyKpi.findMany({
        where,
        include: {
          reward: true,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.#_prisma.userMonthlyKpi.count({ where }),
    ])

    // Get user and department info
    const userIds = [...new Set(kpis.map((k) => k.userId))]
    const departmentIds = [
      ...new Set(kpis.map((k) => k.departmentId).filter(Boolean)),
    ]

    const [users, departments] = await Promise.all([
      this.#_prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullname: true, username: true, avatarUrl: true },
      }),
      this.#_prisma.department.findMany({
        where: { id: { in: departmentIds as string[] } },
        select: { id: true, name: true },
      }),
    ])

    const userMap = new Map(users.map((u) => [u.id, u]))
    const deptMap = new Map(departments.map((d) => [d.id, d]))

    return {
      data: kpis.map((k) => ({
        id: k.id,
        userId: k.userId,
        user: userMap.get(k.userId) ?? undefined,
        departmentId: k.departmentId ?? undefined,
        department: k.departmentId
          ? (deptMap.get(k.departmentId) ?? undefined)
          : undefined,
        year: k.year,
        month: k.month,
        totalBaseScore: k.totalBaseScore,
        totalEarnedScore: k.totalEarnedScore,
        totalPenalty: k.totalPenalty,
        tasksCompleted: k.tasksCompleted,
        tasksOnTime: k.tasksOnTime,
        tasksLate: k.tasksLate,
        finalScore: k.finalScore,
        isFullScore: k.isFullScore,
        consecutiveFullMonths: k.consecutiveFullMonths,
        isFinalized: k.isFinalized,
        finalizedAt: k.finalizedAt ?? undefined,
        scoreBreakdown: k.scoreBreakdown as any,
        createdAt: k.createdAt,
        updatedAt: k.updatedAt,
      })),
      count,
      pageNumber,
      pageSize,
    }
  }

  async userMonthlyKpiRetrieveOne(id: string): Promise<UserMonthlyKpiResponse> {
    const kpi = await this.#_prisma.userMonthlyKpi.findFirst({
      where: { id },
      include: {
        reward: true,
      },
    })

    if (!kpi) {
      throw new NotFoundException('User monthly KPI not found')
    }

    const [user, department] = await Promise.all([
      this.#_prisma.user.findFirst({
        where: { id: kpi.userId },
        select: { id: true, fullname: true, username: true, avatarUrl: true },
      }),
      kpi.departmentId
        ? this.#_prisma.department.findFirst({
            where: { id: kpi.departmentId },
            select: { id: true, name: true },
          })
        : null,
    ])

    return {
      id: kpi.id,
      userId: kpi.userId,
      user: user ?? undefined,
      departmentId: kpi.departmentId ?? undefined,
      department: department ?? undefined,
      year: kpi.year,
      month: kpi.month,
      totalBaseScore: kpi.totalBaseScore,
      totalEarnedScore: kpi.totalEarnedScore,
      totalPenalty: kpi.totalPenalty,
      tasksCompleted: kpi.tasksCompleted,
      tasksOnTime: kpi.tasksOnTime,
      tasksLate: kpi.tasksLate,
      finalScore: kpi.finalScore,
      isFullScore: kpi.isFullScore,
      consecutiveFullMonths: kpi.consecutiveFullMonths,
      isFinalized: kpi.isFinalized,
      finalizedAt: kpi.finalizedAt ?? undefined,
      scoreBreakdown: kpi.scoreBreakdown as any,
      createdAt: kpi.createdAt,
      updatedAt: kpi.updatedAt,
    }
  }

  async userMonthlyKpiRetrieveMine(
    userId: string,
    year?: number,
    month?: number,
  ): Promise<UserMonthlyKpiResponse | null> {
    const now = new Date()
    const targetYear = year ?? now.getFullYear()
    const targetMonth = month ?? now.getMonth() + 1

    const kpi = await this.#_prisma.userMonthlyKpi.findFirst({
      where: {
        userId,
        year: targetYear,
        month: targetMonth,
      },
    })

    if (!kpi) {
      return null
    }

    const [user, department] = await Promise.all([
      this.#_prisma.user.findFirst({
        where: { id: kpi.userId },
        select: { id: true, fullname: true, username: true, avatarUrl: true },
      }),
      kpi.departmentId
        ? this.#_prisma.department.findFirst({
            where: { id: kpi.departmentId },
            select: { id: true, name: true },
          })
        : null,
    ])

    return {
      id: kpi.id,
      userId: kpi.userId,
      user: user ?? undefined,
      departmentId: kpi.departmentId ?? undefined,
      department: department ?? undefined,
      year: kpi.year,
      month: kpi.month,
      totalBaseScore: kpi.totalBaseScore,
      totalEarnedScore: kpi.totalEarnedScore,
      totalPenalty: kpi.totalPenalty,
      tasksCompleted: kpi.tasksCompleted,
      tasksOnTime: kpi.tasksOnTime,
      tasksLate: kpi.tasksLate,
      finalScore: kpi.finalScore,
      isFullScore: kpi.isFullScore,
      consecutiveFullMonths: kpi.consecutiveFullMonths,
      isFinalized: kpi.isFinalized,
      finalizedAt: kpi.finalizedAt ?? undefined,
      scoreBreakdown: kpi.scoreBreakdown as any,
      createdAt: kpi.createdAt,
      updatedAt: kpi.updatedAt,
    }
  }

  async userMonthlyKpiHistory(
    userId: string,
    limit: number = 12,
  ): Promise<UserMonthlyKpiResponse[]> {
    const kpis = await this.#_prisma.userMonthlyKpi.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: limit,
    })

    return kpis.map((k) => ({
      id: k.id,
      userId: k.userId,
      departmentId: k.departmentId ?? undefined,
      year: k.year,
      month: k.month,
      totalBaseScore: k.totalBaseScore,
      totalEarnedScore: k.totalEarnedScore,
      totalPenalty: k.totalPenalty,
      tasksCompleted: k.tasksCompleted,
      tasksOnTime: k.tasksOnTime,
      tasksLate: k.tasksLate,
      finalScore: k.finalScore,
      isFullScore: k.isFullScore,
      consecutiveFullMonths: k.consecutiveFullMonths,
      isFinalized: k.isFinalized,
      finalizedAt: k.finalizedAt ?? undefined,
      scoreBreakdown: k.scoreBreakdown as any,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }))
  }

  async getLeaderboard(
    payload: LeaderboardRequest,
  ): Promise<LeaderboardResponse> {
    const where: Record<string, unknown> = {
      year: payload.year,
      month: payload.month,
    }

    if (payload.departmentId) {
      where.departmentId = payload.departmentId
    }

    const kpis = await this.#_prisma.userMonthlyKpi.findMany({
      where,
      orderBy: { finalScore: 'desc' },
      take: payload.limit || 50,
    })

    // Get user and department info
    const userIds = kpis.map((k) => k.userId)
    const departmentIds = [
      ...new Set(kpis.map((k) => k.departmentId).filter(Boolean)),
    ]

    const [users, departments] = await Promise.all([
      this.#_prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullname: true, username: true, avatarUrl: true },
      }),
      this.#_prisma.department.findMany({
        where: { id: { in: departmentIds as string[] } },
        select: { id: true, name: true },
      }),
    ])

    const userMap = new Map(users.map((u) => [u.id, u]))
    const deptMap = new Map(departments.map((d) => [d.id, d]))

    return {
      data: kpis.map((k, index) => ({
        rank: index + 1,
        userId: k.userId,
        user: userMap.get(k.userId) ?? {
          id: k.userId,
          fullname: '',
          username: '',
        },
        department: k.departmentId ? deptMap.get(k.departmentId) : undefined,
        finalScore: k.finalScore,
        tasksCompleted: k.tasksCompleted,
        tasksOnTime: k.tasksOnTime,
      })),
      period: {
        year: payload.year,
        month: payload.month,
      },
    }
  }

  async getTaskKpiScores(
    userId: string,
    year: number,
    month: number,
  ): Promise<TaskKpiScoreResponse[]> {
    const scores = await this.#_prisma.taskKpiScore.findMany({
      where: {
        userId,
        periodYear: year,
        periodMonth: month,
      },
      orderBy: { completedDate: 'desc' },
    })

    return scores.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      userId: s.userId,
      baseScore: s.baseScore,
      earnedScore: s.earnedScore,
      penaltyApplied: s.penaltyApplied,
      dueDate: s.dueDate,
      completedDate: s.completedDate,
      daysLate: s.daysLate,
      periodYear: s.periodYear,
      periodMonth: s.periodMonth,
      breakdown: s.breakdown as any,
      createdAt: s.createdAt,
    }))
  }
}
