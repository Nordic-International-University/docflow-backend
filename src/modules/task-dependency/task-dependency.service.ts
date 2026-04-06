import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  TaskDependencyCreateRequest,
  TaskDependencyDeleteRequest,
  TaskDependencyRetrieveAllRequest,
  TaskDependencyRetrieveAllResponse,
  TaskDependencyRetrieveOneRequest,
  TaskDependencyRetrieveOneResponse,
} from './interfaces'

@Injectable()
export class TaskDependencyService {
  readonly #_prisma: PrismaService
  readonly #_auditLogService: AuditLogService

  constructor(prisma: PrismaService, auditLogService: AuditLogService) {
    this.#_prisma = prisma
    this.#_auditLogService = auditLogService
  }

  async taskDependencyCreate(
    payload: TaskDependencyCreateRequest,
  ): Promise<void> {
    // Prevent self-dependency
    if (payload.taskId === payload.dependsOnTaskId) {
      throw new BadRequestException('A task cannot depend on itself')
    }

    // Verify both tasks exist
    const [task, dependsOnTask] = await Promise.all([
      this.#_prisma.task.findFirst({
        where: {
          id: payload.taskId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          projectId: true,
        },
      }),
      this.#_prisma.task.findFirst({
        where: {
          id: payload.dependsOnTaskId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          projectId: true,
        },
      }),
    ])

    if (!task) {
      throw new NotFoundException('Dependent task not found')
    }

    if (!dependsOnTask) {
      throw new NotFoundException('Blocking task not found')
    }

    // Verify tasks are in the same project
    if (task.projectId !== dependsOnTask.projectId) {
      throw new BadRequestException(
        'Both tasks must be in the same project to create a dependency',
      )
    }

    // Check for duplicate dependency
    const existingDependency = await this.#_prisma.taskDependency.findFirst({
      where: {
        taskId: payload.taskId,
        dependsOnTaskId: payload.dependsOnTaskId,
      },
    })

    if (existingDependency) {
      throw new ConflictException('This dependency already exists')
    }

    // Check for circular dependency (A depends on B, B depends on A)
    const reverseDependency = await this.#_prisma.taskDependency.findFirst({
      where: {
        taskId: payload.dependsOnTaskId,
        dependsOnTaskId: payload.taskId,
      },
    })

    if (reverseDependency) {
      throw new BadRequestException(
        'Cannot create circular dependency: the blocking task already depends on the dependent task',
      )
    }

    // Check for indirect circular dependencies
    const hasCircularDependency = await this.#_checkCircularDependency(
      payload.taskId,
      payload.dependsOnTaskId,
    )

    if (hasCircularDependency) {
      throw new BadRequestException(
        'Cannot create dependency: this would create a circular dependency chain',
      )
    }

    const dependency = await this.#_prisma.taskDependency.create({
      data: {
        taskId: payload.taskId,
        dependsOnTaskId: payload.dependsOnTaskId,
      },
    })

    await this.#_auditLogService.logAction(
      'TaskDependency',
      dependency.id,
      AuditAction.CREATE,
      payload.createdBy || dependency.id,
      {
        newValues: {
          taskId: dependency.taskId,
          dependsOnTaskId: dependency.dependsOnTaskId,
          taskTitle: task.title,
          dependsOnTaskTitle: dependsOnTask.title,
        },
      },
    )
  }

  async taskDependencyRetrieveAll(
    payload: TaskDependencyRetrieveAllRequest,
  ): Promise<TaskDependencyRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const where: any = {
      ...(payload.taskId && { taskId: payload.taskId }),
      ...(payload.dependsOnTaskId && {
        dependsOnTaskId: payload.dependsOnTaskId,
      }),
    }

    const dependencies = await this.#_prisma.taskDependency.findMany({
      where,
      select: {
        id: true,
        taskId: true,
        dependsOnTaskId: true,
        task: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
        createdAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const count = await this.#_prisma.taskDependency.count({ where })

    return {
      data: dependencies,
      count,
      pageNumber,
      pageSize,
    }
  }

  async taskDependencyRetrieveOne(
    payload: TaskDependencyRetrieveOneRequest,
  ): Promise<TaskDependencyRetrieveOneResponse> {
    const dependency = await this.#_prisma.taskDependency.findFirst({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        taskId: true,
        dependsOnTaskId: true,
        task: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
        createdAt: true,
      },
    })

    if (!dependency) {
      throw new NotFoundException('Task dependency not found')
    }

    return dependency as TaskDependencyRetrieveOneResponse
  }

  async taskDependencyDelete(
    payload: TaskDependencyDeleteRequest,
  ): Promise<void> {
    const existingDependency = await this.#_prisma.taskDependency.findFirst({
      where: {
        id: payload.id,
      },
      include: {
        task: {
          select: {
            title: true,
          },
        },
        dependsOnTask: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!existingDependency) {
      throw new NotFoundException('Task dependency not found')
    }

    // Hard delete
    await this.#_prisma.taskDependency.delete({
      where: { id: payload.id },
    })

    await this.#_auditLogService.logAction(
      'TaskDependency',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          taskId: existingDependency.taskId,
          dependsOnTaskId: existingDependency.dependsOnTaskId,
          taskTitle: existingDependency.task.title,
          dependsOnTaskTitle: existingDependency.dependsOnTask.title,
        },
      },
    )
  }

  /**
   * Check if adding a dependency would create a circular chain
   * by checking if dependsOnTaskId eventually leads back to taskId
   */
  async #_checkCircularDependency(
    taskId: string,
    dependsOnTaskId: string,
  ): Promise<boolean> {
    const visited = new Set<string>()
    const queue = [dependsOnTaskId]

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!

      if (currentTaskId === taskId) {
        return true
      }

      if (visited.has(currentTaskId)) {
        continue
      }

      visited.add(currentTaskId)

      // Get all tasks that the current task depends on
      const dependencies = await this.#_prisma.taskDependency.findMany({
        where: {
          taskId: currentTaskId,
        },
        select: {
          dependsOnTaskId: true,
        },
      })

      for (const dep of dependencies) {
        if (!visited.has(dep.dependsOnTaskId)) {
          queue.push(dep.dependsOnTaskId)
        }
      }
    }

    return false
  }
}
