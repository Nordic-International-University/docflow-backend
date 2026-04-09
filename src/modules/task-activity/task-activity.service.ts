import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  TaskActivityRetrieveAllRequest,
  TaskActivityRetrieveAllResponse,
  TaskActivityRetrieveOneRequest,
  TaskActivityRetrieveOneResponse,
} from './interfaces'
import { parsePagination } from '@common/helpers'

@Injectable()
export class TaskActivityService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async taskActivityRetrieveAll(
    payload: TaskActivityRetrieveAllRequest,
  ): Promise<TaskActivityRetrieveAllResponse> {
    const { page, limit, skip } = parsePagination(payload)

    const where = {
      taskId: payload.taskId,
      ...(payload.userId && { userId: payload.userId }),
      ...(payload.action && { action: payload.action }),
      ...(payload.startDate || payload.endDate
        ? {
            createdAt: {
              ...(payload.startDate && { gte: new Date(payload.startDate) }),
              ...(payload.endDate && { lte: new Date(payload.endDate) }),
            },
          }
        : {}),
    }

    const activities = await this.#_prisma.taskActivity.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        userId: true,
        action: true,
        changes: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskActivity.count({ where })

    return {
      data: activities,
      count,
      pageNumber: page,
      pageSize: limit,
    }
  }

  async taskActivityRetrieveOne(
    payload: TaskActivityRetrieveOneRequest,
  ): Promise<TaskActivityRetrieveOneResponse> {
    const activity = await this.#_prisma.taskActivity.findFirst({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        action: true,
        changes: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullname: true,
          },
        },
      },
    })

    if (!activity) {
      throw new NotFoundException('Task activity not found')
    }

    return activity as TaskActivityRetrieveOneResponse
  }
}
