import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@prisma'
import {
  TaskActivityRetrieveAllRequest,
  TaskActivityRetrieveAllResponse,
  TaskActivityRetrieveOneRequest,
  TaskActivityRetrieveOneResponse,
} from './interfaces'

@Injectable()
export class TaskActivityService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async taskActivityRetrieveAll(
    payload: TaskActivityRetrieveAllRequest,
  ): Promise<TaskActivityRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
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
      take,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskActivity.count({ where })

    return {
      data: activities,
      count,
      pageNumber,
      pageSize,
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
