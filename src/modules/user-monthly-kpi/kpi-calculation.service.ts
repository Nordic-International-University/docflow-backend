import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { TaskPriority } from '@prisma/client'
import { TaskKpiScoreCreateRequest, TaskKpiScoreResponse } from './interfaces'

const PRIORITY_LEVEL_MAP: Record<TaskPriority, number> = {
  [TaskPriority.CRITICAL]: 1,
  [TaskPriority.URGENT]: 3,
  [TaskPriority.HIGH]: 5,
  [TaskPriority.MEDIUM]: 7,
  [TaskPriority.LOW]: 9,
}

@Injectable()
export class KpiCalculationService {
  static getPriorityLevel(priority: TaskPriority): number {
    return PRIORITY_LEVEL_MAP[priority]
  }
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  /**
   * Calculate and record KPI score when a task is completed
   */
  async calculateTaskScore(
    payload: TaskKpiScoreCreateRequest,
  ): Promise<TaskKpiScoreResponse> {
    // Get the score config for this priority level
    const scoreConfig = await this.#_prisma.taskScoreConfig.findFirst({
      where: {
        priorityLevel: payload.priorityLevel,
        isActive: true,
        deletedAt: null,
      },
    })

    if (!scoreConfig) {
      throw new NotFoundException(
        `Task score config for priority level ${payload.priorityLevel} not found`,
      )
    }

    // Calculate days late
    const dueDate = new Date(payload.dueDate)
    const completedDate = new Date(payload.completedDate)
    dueDate.setHours(0, 0, 0, 0)
    completedDate.setHours(0, 0, 0, 0)

    const diffTime = completedDate.getTime() - dueDate.getTime()
    const daysLate = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    // Calculate penalty
    let effectiveDaysLate = daysLate
    if (scoreConfig.maxPenaltyDays && daysLate > scoreConfig.maxPenaltyDays) {
      effectiveDaysLate = scoreConfig.maxPenaltyDays
    }

    const penaltyApplied =
      effectiveDaysLate * Math.abs(scoreConfig.penaltyPerDay)
    const earnedScore = Math.max(0, scoreConfig.baseScore - penaltyApplied)

    // Determine the period (month/year) based on completion date
    const periodYear = completedDate.getFullYear()
    const periodMonth = completedDate.getMonth() + 1

    // Create the TaskKpiScore record
    const taskKpiScore = await this.#_prisma.taskKpiScore.create({
      data: {
        taskId: payload.taskId,
        userId: payload.userId,
        baseScore: scoreConfig.baseScore,
        earnedScore,
        penaltyApplied,
        dueDate: payload.dueDate,
        completedDate: payload.completedDate,
        daysLate,
        periodYear,
        periodMonth,
        breakdown: {
          baseScore: scoreConfig.baseScore,
          daysLate,
          penaltyPerDay: scoreConfig.penaltyPerDay,
          totalPenalty: penaltyApplied,
          earned: earnedScore,
        },
      },
    })

    // Update or create the user's monthly KPI record
    await this.updateUserMonthlyKpi(payload.userId, periodYear, periodMonth)

    return {
      id: taskKpiScore.id,
      taskId: taskKpiScore.taskId,
      userId: taskKpiScore.userId,
      baseScore: taskKpiScore.baseScore,
      earnedScore: taskKpiScore.earnedScore,
      penaltyApplied: taskKpiScore.penaltyApplied,
      dueDate: taskKpiScore.dueDate,
      completedDate: taskKpiScore.completedDate,
      daysLate: taskKpiScore.daysLate,
      periodYear: taskKpiScore.periodYear,
      periodMonth: taskKpiScore.periodMonth,
      breakdown: taskKpiScore.breakdown as any,
      createdAt: taskKpiScore.createdAt,
    }
  }

  /**
   * Update user's monthly KPI aggregation
   */
  async updateUserMonthlyKpi(
    userId: string,
    year: number,
    month: number,
  ): Promise<void> {
    // Get user's department
    const user = await this.#_prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { departmentId: true },
    })

    // Aggregate all task scores for this user in this period
    const taskScores = await this.#_prisma.taskKpiScore.findMany({
      where: {
        userId,
        periodYear: year,
        periodMonth: month,
      },
    })

    const totalBaseScore = taskScores.reduce((sum, s) => sum + s.baseScore, 0)
    const totalEarnedScore = taskScores.reduce(
      (sum, s) => sum + s.earnedScore,
      0,
    )
    const totalPenalty = taskScores.reduce(
      (sum, s) => sum + s.penaltyApplied,
      0,
    )
    const tasksCompleted = taskScores.length
    const tasksOnTime = taskScores.filter((s) => s.daysLate === 0).length
    const tasksLate = taskScores.filter((s) => s.daysLate > 0).length

    // Calculate final score (capped at 100)
    const finalScore = Math.min(100, totalEarnedScore)
    const isFullScore = finalScore >= 100

    // Build score breakdown by priority
    const scoreBreakdown: Record<string, { count: number; earned: number }> = {}
    for (const score of taskScores) {
      const breakdown = score.breakdown as any
      const priority = `priority${breakdown?.baseScore || 'unknown'}`
      if (!scoreBreakdown[priority]) {
        scoreBreakdown[priority] = { count: 0, earned: 0 }
      }
      scoreBreakdown[priority].count++
      scoreBreakdown[priority].earned += score.earnedScore
    }

    // Check for existing record
    const existing = await this.#_prisma.userMonthlyKpi.findFirst({
      where: { userId, year, month },
    })

    // Calculate consecutive full months
    let consecutiveFullMonths = 0
    if (isFullScore) {
      // Check previous months
      const previousMonthlyKpis = await this.#_prisma.userMonthlyKpi.findMany({
        where: {
          userId,
          isFullScore: true,
          OR: [{ year: year, month: { lt: month } }, { year: { lt: year } }],
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })

      // Count consecutive months
      let checkYear = year
      let checkMonth = month - 1
      if (checkMonth < 1) {
        checkMonth = 12
        checkYear--
      }

      for (const kpi of previousMonthlyKpis) {
        if (
          kpi.year === checkYear &&
          kpi.month === checkMonth &&
          kpi.isFullScore
        ) {
          consecutiveFullMonths++
          checkMonth--
          if (checkMonth < 1) {
            checkMonth = 12
            checkYear--
          }
        } else {
          break
        }
      }
      consecutiveFullMonths++ // Include current month
    }

    const data = {
      userId,
      departmentId: user?.departmentId,
      year,
      month,
      totalBaseScore,
      totalEarnedScore,
      totalPenalty,
      tasksCompleted,
      tasksOnTime,
      tasksLate,
      finalScore,
      isFullScore,
      consecutiveFullMonths,
      scoreBreakdown,
      updatedAt: new Date(),
    }

    if (existing) {
      await this.#_prisma.userMonthlyKpi.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await this.#_prisma.userMonthlyKpi.create({ data })
    }

    // Check for achievements (e.g., 3 consecutive months at 100)
    if (consecutiveFullMonths >= 3) {
      await this.checkAndCreateAchievement(
        userId,
        consecutiveFullMonths,
        year,
        month,
      )
    }

    // Update department monthly KPI
    if (user?.departmentId) {
      await this.updateDepartmentMonthlyKpi(user.departmentId, year, month)
    }
  }

  /**
   * Check and create achievement for consecutive full scores
   */
  private async checkAndCreateAchievement(
    userId: string,
    consecutiveMonths: number,
    year: number,
    month: number,
  ): Promise<void> {
    // Check if achievement already exists for this milestone
    const existingAchievement = await this.#_prisma.kpiAchievement.findFirst({
      where: {
        userId,
        achievementType: 'EMPLOYEE_OF_YEAR_NOMINATION',
        year,
      },
    })

    if (!existingAchievement && consecutiveMonths >= 3) {
      await this.#_prisma.kpiAchievement.create({
        data: {
          userId,
          achievementType: 'EMPLOYEE_OF_YEAR_NOMINATION',
          title: 'Yil xodimi nomzodi',
          description: `Ketma-ket ${consecutiveMonths} oy davomida 100 ball to'pladi`,
          year,
          month,
          metadata: {
            consecutiveMonths,
            achievedAt: new Date().toISOString(),
          },
        },
      })
    }
  }

  /**
   * Update department's monthly KPI aggregation
   */
  async updateDepartmentMonthlyKpi(
    departmentId: string,
    year: number,
    month: number,
  ): Promise<void> {
    // Get all user monthly KPIs for this department
    const userKpis = await this.#_prisma.userMonthlyKpi.findMany({
      where: {
        departmentId,
        year,
        month,
      },
    })

    if (userKpis.length === 0) {
      return
    }

    const totalUsers = userKpis.length
    const totalScore = userKpis.reduce((sum, k) => sum + k.finalScore, 0)
    const averageScore = totalScore / totalUsers
    const usersAbove85 = userKpis.filter((k) => k.finalScore >= 85).length
    const usersAt100 = userKpis.filter((k) => k.finalScore >= 100).length
    const isEligibleForTeamReward = averageScore >= 85

    const existing = await this.#_prisma.departmentMonthlyKpi.findFirst({
      where: { departmentId, year, month },
    })

    const data = {
      departmentId,
      year,
      month,
      averageScore,
      totalScore,
      totalUsers,
      usersAbove85,
      usersAt100,
      isEligibleForTeamReward,
      updatedAt: new Date(),
    }

    if (existing) {
      await this.#_prisma.departmentMonthlyKpi.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await this.#_prisma.departmentMonthlyKpi.create({ data })
    }
  }

  /**
   * Finalize a month's KPI and create rewards
   */
  async finalizeMonth(
    year: number,
    month: number,
    finalizedBy: string,
  ): Promise<void> {
    // Get all user monthly KPIs for this period
    const userKpis = await this.#_prisma.userMonthlyKpi.findMany({
      where: {
        year,
        month,
        isFinalized: false,
      },
    })

    for (const kpi of userKpis) {
      // Find the appropriate reward tier
      const rewardTier = await this.#_prisma.kpiRewardTier.findFirst({
        where: {
          isActive: true,
          deletedAt: null,
          minScore: { lte: kpi.finalScore },
          maxScore: { gte: kpi.finalScore },
        },
      })

      // Create reward record
      await this.#_prisma.kpiReward.create({
        data: {
          userMonthlyKpiId: kpi.id,
          rewardTierId: rewardTier?.id,
          userId: kpi.userId,
          year,
          month,
          finalScore: kpi.finalScore,
          rewardAmount: rewardTier?.rewardAmount,
          rewardBhm: rewardTier?.rewardBhm,
          isPenalty: rewardTier?.isPenalty ?? false,
          penaltyType: rewardTier?.penaltyType,
          status: 'PENDING',
        },
      })

      // Mark as finalized
      await this.#_prisma.userMonthlyKpi.update({
        where: { id: kpi.id },
        data: {
          isFinalized: true,
          finalizedAt: new Date(),
        },
      })
    }

    // Finalize department KPIs
    await this.#_prisma.departmentMonthlyKpi.updateMany({
      where: { year, month, isFinalized: false },
      data: {
        isFinalized: true,
        finalizedAt: new Date(),
      },
    })
  }
}
