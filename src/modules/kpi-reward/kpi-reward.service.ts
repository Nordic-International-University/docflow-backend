import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { KpiRewardStatus } from '@prisma/client'
import {
  KpiRewardRetrieveAllRequest,
  KpiRewardRetrieveAllResponse,
  KpiRewardResponse,
  KpiRewardApproveRequest,
  KpiRewardPayRequest,
  KpiRewardRejectRequest,
} from './interfaces'

@Injectable()
export class KpiRewardService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async kpiRewardRetrieveAll(
    payload: KpiRewardRetrieveAllRequest,
  ): Promise<KpiRewardRetrieveAllResponse> {
    const pageNumber = payload.pageNumber || 1
    const pageSize = payload.pageSize || 10
    const skip = (pageNumber - 1) * pageSize

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (payload.userId) {
      where.userId = payload.userId
    }
    if (payload.year) {
      where.year = payload.year
    }
    if (payload.month) {
      where.month = payload.month
    }
    if (payload.status) {
      where.status = payload.status as KpiRewardStatus
    }

    const [rewards, count] = await Promise.all([
      this.#_prisma.kpiReward.findMany({
        where,
        include: {
          rewardTier: {
            select: { id: true, name: true, color: true },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.#_prisma.kpiReward.count({ where }),
    ])

    // Get user info
    const userIds = [
      ...new Set([
        ...rewards.map((r) => r.userId),
        ...rewards.map((r) => r.approvedById).filter(Boolean),
      ]),
    ]

    const users = await this.#_prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, fullname: true, username: true, avatarUrl: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return {
      data: rewards.map((r) => ({
        id: r.id,
        userMonthlyKpiId: r.userMonthlyKpiId,
        rewardTierId: r.rewardTierId ?? undefined,
        rewardTier: r.rewardTier ?? undefined,
        userId: r.userId,
        user: userMap.get(r.userId),
        year: r.year,
        month: r.month,
        finalScore: r.finalScore,
        rewardAmount: r.rewardAmount ? Number(r.rewardAmount) : undefined,
        rewardBhm: r.rewardBhm ? Number(r.rewardBhm) : undefined,
        isPenalty: r.isPenalty,
        penaltyType: r.penaltyType ?? undefined,
        status: r.status,
        approvedById: r.approvedById ?? undefined,
        approvedBy: r.approvedById
          ? {
              id: r.approvedById,
              fullname: userMap.get(r.approvedById)?.fullname || '',
            }
          : undefined,
        approvedAt: r.approvedAt ?? undefined,
        paidAt: r.paidAt ?? undefined,
        notes: r.notes ?? undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      count,
      pageNumber,
      pageSize,
    }
  }

  async kpiRewardRetrieveOne(id: string): Promise<KpiRewardResponse> {
    const reward = await this.#_prisma.kpiReward.findFirst({
      where: { id, deletedAt: null },
      include: {
        rewardTier: {
          select: { id: true, name: true, color: true },
        },
      },
    })

    if (!reward) {
      throw new NotFoundException('KPI mukofoti topilmadi')
    }

    const [user, approver] = await Promise.all([
      this.#_prisma.user.findFirst({
        where: { id: reward.userId },
        select: { id: true, fullname: true, username: true, avatarUrl: true },
      }),
      reward.approvedById
        ? this.#_prisma.user.findFirst({
            where: { id: reward.approvedById },
            select: { id: true, fullname: true },
          })
        : null,
    ])

    return {
      id: reward.id,
      userMonthlyKpiId: reward.userMonthlyKpiId,
      rewardTierId: reward.rewardTierId ?? undefined,
      rewardTier: reward.rewardTier ?? undefined,
      userId: reward.userId,
      user: user ?? undefined,
      year: reward.year,
      month: reward.month,
      finalScore: reward.finalScore,
      rewardAmount: reward.rewardAmount
        ? Number(reward.rewardAmount)
        : undefined,
      rewardBhm: reward.rewardBhm ? Number(reward.rewardBhm) : undefined,
      isPenalty: reward.isPenalty,
      penaltyType: reward.penaltyType ?? undefined,
      status: reward.status,
      approvedById: reward.approvedById ?? undefined,
      approvedBy: approver ?? undefined,
      approvedAt: reward.approvedAt ?? undefined,
      paidAt: reward.paidAt ?? undefined,
      notes: reward.notes ?? undefined,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    }
  }

  async kpiRewardApprove(payload: KpiRewardApproveRequest): Promise<void> {
    const reward = await this.#_prisma.kpiReward.findFirst({
      where: { id: payload.id, deletedAt: null },
    })

    if (!reward) {
      throw new NotFoundException('KPI mukofoti topilmadi')
    }

    if (reward.status !== KpiRewardStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve reward with status: ${reward.status}`,
      )
    }

    await this.#_prisma.kpiReward.update({
      where: { id: payload.id },
      data: {
        status: KpiRewardStatus.APPROVED,
        approvedById: payload.approvedById,
        approvedAt: new Date(),
        notes: payload.notes,
        updatedAt: new Date(),
      },
    })
  }

  async kpiRewardPay(payload: KpiRewardPayRequest): Promise<void> {
    const reward = await this.#_prisma.kpiReward.findFirst({
      where: { id: payload.id, deletedAt: null },
    })

    if (!reward) {
      throw new NotFoundException('KPI mukofoti topilmadi')
    }

    if (reward.status !== KpiRewardStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot mark as paid with status: ${reward.status}. Must be APPROVED first.`,
      )
    }

    await this.#_prisma.kpiReward.update({
      where: { id: payload.id },
      data: {
        status: KpiRewardStatus.PAID,
        paidAt: new Date(),
        notes: payload.notes
          ? `${reward.notes || ''}\nPaid: ${payload.notes}`
          : reward.notes,
        updatedAt: new Date(),
      },
    })
  }

  async kpiRewardReject(payload: KpiRewardRejectRequest): Promise<void> {
    const reward = await this.#_prisma.kpiReward.findFirst({
      where: { id: payload.id, deletedAt: null },
    })

    if (!reward) {
      throw new NotFoundException('KPI mukofoti topilmadi')
    }

    if (reward.status === KpiRewardStatus.PAID) {
      throw new BadRequestException("To'langan mukofotni rad etib bo'lmaydi")
    }

    await this.#_prisma.kpiReward.update({
      where: { id: payload.id },
      data: {
        status: KpiRewardStatus.REJECTED,
        notes: payload.notes,
        updatedAt: new Date(),
      },
    })
  }

  async kpiRewardBulkApprove(
    ids: string[],
    approvedById: string,
  ): Promise<{ approved: number; failed: number }> {
    let approved = 0
    let failed = 0

    for (const id of ids) {
      try {
        await this.kpiRewardApprove({ id, approvedById })
        approved++
      } catch {
        failed++
      }
    }

    return { approved, failed }
  }
}
