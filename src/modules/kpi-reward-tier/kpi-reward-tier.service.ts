import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  KpiRewardTierCreateRequest,
  KpiRewardTierUpdateRequest,
  KpiRewardTierRetrieveAllRequest,
  KpiRewardTierRetrieveAllResponse,
  KpiRewardTierResponse,
} from './interfaces'

@Injectable()
export class KpiRewardTierService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async kpiRewardTierCreate(
    payload: KpiRewardTierCreateRequest,
  ): Promise<void> {
    // Validate score range
    if (payload.minScore > payload.maxScore) {
      throw new BadRequestException("Minimal ball maksimal balldan katta bo'lishi mumkin emas")
    }

    // Check for overlapping ranges
    const overlapping = await this.#_prisma.kpiRewardTier.findFirst({
      where: {
        deletedAt: null,
        OR: [
          {
            AND: [
              { minScore: { lte: payload.minScore } },
              { maxScore: { gte: payload.minScore } },
            ],
          },
          {
            AND: [
              { minScore: { lte: payload.maxScore } },
              { maxScore: { gte: payload.maxScore } },
            ],
          },
        ],
      },
    })

    if (overlapping) {
      throw new BadRequestException(
        `Score range overlaps with existing tier: ${overlapping.name} (${overlapping.minScore}-${overlapping.maxScore})`,
      )
    }

    await this.#_prisma.kpiRewardTier.create({
      data: {
        minScore: payload.minScore,
        maxScore: payload.maxScore,
        rewardBhm: payload.rewardBhm,
        rewardAmount: payload.rewardAmount,
        isPenalty: payload.isPenalty ?? false,
        penaltyType: payload.penaltyType,
        name: payload.name,
        description: payload.description,
        color: payload.color,
      },
    })
  }

  async kpiRewardTierRetrieveAll(
    payload: KpiRewardTierRetrieveAllRequest,
  ): Promise<KpiRewardTierRetrieveAllResponse> {
    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (payload.isActive !== undefined) {
      where.isActive = payload.isActive
    }

    const tiers = await this.#_prisma.kpiRewardTier.findMany({
      where,
      orderBy: { minScore: 'asc' },
    })

    return {
      data: tiers.map((t) => ({
        id: t.id,
        minScore: t.minScore,
        maxScore: t.maxScore,
        rewardBhm: t.rewardBhm ? Number(t.rewardBhm) : undefined,
        rewardAmount: t.rewardAmount ? Number(t.rewardAmount) : undefined,
        isPenalty: t.isPenalty,
        penaltyType: t.penaltyType ?? undefined,
        name: t.name,
        description: t.description ?? undefined,
        color: t.color ?? undefined,
        isActive: t.isActive,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      count: tiers.length,
    }
  }

  async kpiRewardTierRetrieveOne(id: string): Promise<KpiRewardTierResponse> {
    const tier = await this.#_prisma.kpiRewardTier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!tier) {
      throw new NotFoundException('KPI mukofot darajasi topilmadi')
    }

    return {
      id: tier.id,
      minScore: tier.minScore,
      maxScore: tier.maxScore,
      rewardBhm: tier.rewardBhm ? Number(tier.rewardBhm) : undefined,
      rewardAmount: tier.rewardAmount ? Number(tier.rewardAmount) : undefined,
      isPenalty: tier.isPenalty,
      penaltyType: tier.penaltyType ?? undefined,
      name: tier.name,
      description: tier.description ?? undefined,
      color: tier.color ?? undefined,
      isActive: tier.isActive,
      createdAt: tier.createdAt,
      updatedAt: tier.updatedAt,
    }
  }

  async kpiRewardTierFindByScore(
    score: number,
  ): Promise<KpiRewardTierResponse | null> {
    const tier = await this.#_prisma.kpiRewardTier.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
        minScore: { lte: score },
        maxScore: { gte: score },
      },
    })

    if (!tier) {
      return null
    }

    return {
      id: tier.id,
      minScore: tier.minScore,
      maxScore: tier.maxScore,
      rewardBhm: tier.rewardBhm ? Number(tier.rewardBhm) : undefined,
      rewardAmount: tier.rewardAmount ? Number(tier.rewardAmount) : undefined,
      isPenalty: tier.isPenalty,
      penaltyType: tier.penaltyType ?? undefined,
      name: tier.name,
      description: tier.description ?? undefined,
      color: tier.color ?? undefined,
      isActive: tier.isActive,
      createdAt: tier.createdAt,
      updatedAt: tier.updatedAt,
    }
  }

  async kpiRewardTierUpdate(
    payload: KpiRewardTierUpdateRequest,
  ): Promise<void> {
    const existing = await this.#_prisma.kpiRewardTier.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      throw new NotFoundException('KPI mukofot darajasi topilmadi')
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (payload.minScore !== undefined) {
      updateData.minScore = payload.minScore
    }
    if (payload.maxScore !== undefined) {
      updateData.maxScore = payload.maxScore
    }
    if (payload.rewardBhm !== undefined) {
      updateData.rewardBhm = payload.rewardBhm
    }
    if (payload.rewardAmount !== undefined) {
      updateData.rewardAmount = payload.rewardAmount
    }
    if (payload.isPenalty !== undefined) {
      updateData.isPenalty = payload.isPenalty
    }
    if (payload.penaltyType !== undefined) {
      updateData.penaltyType = payload.penaltyType
    }
    if (payload.name !== undefined) {
      updateData.name = payload.name
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description
    }
    if (payload.color !== undefined) {
      updateData.color = payload.color
    }
    if (payload.isActive !== undefined) {
      updateData.isActive = payload.isActive
    }

    await this.#_prisma.kpiRewardTier.update({
      where: { id: payload.id },
      data: updateData,
    })
  }

  async kpiRewardTierDelete(id: string): Promise<void> {
    const existing = await this.#_prisma.kpiRewardTier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existing) {
      throw new NotFoundException('KPI mukofot darajasi topilmadi')
    }

    await this.#_prisma.kpiRewardTier.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
