import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  TaskScoreConfigCreateRequest,
  TaskScoreConfigUpdateRequest,
  TaskScoreConfigRetrieveAllRequest,
  TaskScoreConfigRetrieveAllResponse,
  TaskScoreConfigResponse,
} from './interfaces'

@Injectable()
export class TaskScoreConfigService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async taskScoreConfigCreate(
    payload: TaskScoreConfigCreateRequest,
  ): Promise<void> {
    // Check if priority level already exists
    const existing = await this.#_prisma.taskScoreConfig.findFirst({
      where: {
        priorityLevel: payload.priorityLevel,
        deletedAt: null,
      },
    })

    if (existing) {
      throw new ConflictException(
        `Task score config for priority level ${payload.priorityLevel} already exists`,
      )
    }

    await this.#_prisma.taskScoreConfig.create({
      data: {
        priorityLevel: payload.priorityLevel,
        priorityCode: payload.priorityCode,
        baseScore: payload.baseScore,
        recommendedDays: payload.recommendedDays,
        penaltyPerDay: payload.penaltyPerDay,
        maxPenaltyDays: payload.maxPenaltyDays,
        description: payload.description,
        criteria: payload.criteria,
      },
    })
  }

  async taskScoreConfigRetrieveAll(
    payload: TaskScoreConfigRetrieveAllRequest,
  ): Promise<TaskScoreConfigRetrieveAllResponse> {
    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (payload.isActive !== undefined) {
      where.isActive = payload.isActive
    }

    const configs = await this.#_prisma.taskScoreConfig.findMany({
      where,
      orderBy: { priorityLevel: 'asc' },
    })

    return {
      data: configs.map((c) => ({
        id: c.id,
        priorityLevel: c.priorityLevel,
        priorityCode: c.priorityCode,
        baseScore: c.baseScore,
        recommendedDays: c.recommendedDays,
        penaltyPerDay: c.penaltyPerDay,
        maxPenaltyDays: c.maxPenaltyDays ?? undefined,
        description: c.description,
        criteria: c.criteria ?? undefined,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      count: configs.length,
    }
  }

  async taskScoreConfigRetrieveOne(
    id: string,
  ): Promise<TaskScoreConfigResponse> {
    const config = await this.#_prisma.taskScoreConfig.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!config) {
      throw new NotFoundException('Task score config not found')
    }

    return {
      id: config.id,
      priorityLevel: config.priorityLevel,
      priorityCode: config.priorityCode,
      baseScore: config.baseScore,
      recommendedDays: config.recommendedDays,
      penaltyPerDay: config.penaltyPerDay,
      maxPenaltyDays: config.maxPenaltyDays ?? undefined,
      description: config.description,
      criteria: config.criteria ?? undefined,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }
  }

  async taskScoreConfigRetrieveByPriority(
    priorityLevel: number,
  ): Promise<TaskScoreConfigResponse> {
    const config = await this.#_prisma.taskScoreConfig.findFirst({
      where: {
        priorityLevel,
        deletedAt: null,
        isActive: true,
      },
    })

    if (!config) {
      throw new NotFoundException(
        `Task score config for priority level ${priorityLevel} not found`,
      )
    }

    return {
      id: config.id,
      priorityLevel: config.priorityLevel,
      priorityCode: config.priorityCode,
      baseScore: config.baseScore,
      recommendedDays: config.recommendedDays,
      penaltyPerDay: config.penaltyPerDay,
      maxPenaltyDays: config.maxPenaltyDays ?? undefined,
      description: config.description,
      criteria: config.criteria ?? undefined,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }
  }

  async taskScoreConfigUpdate(
    payload: TaskScoreConfigUpdateRequest,
  ): Promise<void> {
    const existing = await this.#_prisma.taskScoreConfig.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      throw new NotFoundException('Task score config not found')
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (payload.priorityCode !== undefined) {
      updateData.priorityCode = payload.priorityCode
    }
    if (payload.baseScore !== undefined) {
      updateData.baseScore = payload.baseScore
    }
    if (payload.recommendedDays !== undefined) {
      updateData.recommendedDays = payload.recommendedDays
    }
    if (payload.penaltyPerDay !== undefined) {
      updateData.penaltyPerDay = payload.penaltyPerDay
    }
    if (payload.maxPenaltyDays !== undefined) {
      updateData.maxPenaltyDays = payload.maxPenaltyDays
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description
    }
    if (payload.criteria !== undefined) {
      updateData.criteria = payload.criteria
    }
    if (payload.isActive !== undefined) {
      updateData.isActive = payload.isActive
    }

    await this.#_prisma.taskScoreConfig.update({
      where: { id: payload.id },
      data: updateData,
    })
  }

  async taskScoreConfigDelete(id: string): Promise<void> {
    const existing = await this.#_prisma.taskScoreConfig.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existing) {
      throw new NotFoundException('Task score config not found')
    }

    await this.#_prisma.taskScoreConfig.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}
