import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { AuditLogService } from '../audit-log/audit-log.service'
import { AuditAction } from '../audit-log/interfaces/audit-log-enums'
import {
  WorkflowTemplateCreateRequest,
  WorkflowTemplateUpdateRequest,
  WorkflowTemplateRetrieveAllRequest,
  WorkflowTemplateRetrieveOneRequest,
  WorkflowTemplateDeleteRequest,
} from './interfaces'
import { WorkflowType } from '@prisma/client'

@Injectable()
export class WorkflowTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async workflowTemplateCreate(
    payload: WorkflowTemplateCreateRequest,
  ): Promise<any> {
    const { steps, ...templateData } = payload

    // Check if template name already exists
    const existingTemplate = await this.prisma.workflowTemplate.findFirst({
      where: {
        name: payload.name,
        deletedAt: null,
      },
    })

    if (existingTemplate) {
      throw new ConflictException(
        'Workflow template with this name already exists',
      )
    }

    // Validate document type exists (if provided)
    if (payload.documentTypeId) {
      const documentType = await this.prisma.documentType.findFirst({
        where: {
          id: payload.documentTypeId,
          deletedAt: null,
        },
      })

      if (!documentType) {
        throw new NotFoundException('Hujjat turi topilmadi')
      }
    }

    // Validate step orders are unique
    const stepOrders = steps.map((step) => step.order)
    const uniqueOrders = new Set(stepOrders)
    if (stepOrders.length !== uniqueOrders.size) {
      throw new BadRequestException("Bosqich tartib raqamlari noyob bo'lishi kerak")
    }

    // Validate assigned users exist (if provided)
    const userIds = steps
      .filter((step) => step.assignedToUserId)
      .map((step) => step.assignedToUserId!)

    if (userIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
          deletedAt: null,
        },
        select: { id: true },
      })

      if (users.length !== userIds.length) {
        throw new NotFoundException('Tayinlangan foydalanuvchilardan biri yoki bir nechtasi topilmadi')
      }
    }

    // Validate assigned roles exist (if provided)
    const roleIds = steps
      .filter((step) => step.assignedToRoleId)
      .map((step) => step.assignedToRoleId!)

    if (roleIds.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: {
          id: { in: roleIds },
          deletedAt: null,
        },
        select: { id: true },
      })

      if (roles.length !== roleIds.length) {
        throw new NotFoundException('Tayinlangan rollardan biri yoki bir nechtasi topilmadi')
      }
    }

    // Validate assigned departments exist (if provided)
    const departmentIds = steps
      .filter((step) => step.assignedToDepartmentId)
      .map((step) => step.assignedToDepartmentId!)

    if (departmentIds.length > 0) {
      const departments = await this.prisma.department.findMany({
        where: {
          id: { in: departmentIds },
          deletedAt: null,
        },
        select: { id: true },
      })

      if (departments.length !== departmentIds.length) {
        throw new NotFoundException(
          'One or more assigned departments not found',
        )
      }
    }

    // Create template and steps in a transaction
    const template = await this.prisma.$transaction(async (tx) => {
      const createdTemplate = await tx.workflowTemplate.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          documentTypeId: templateData.documentTypeId || null,
          type: templateData.type || WorkflowType.CONSECUTIVE,
          isActive: templateData.isActive ?? true,
          isPublic: templateData.isPublic ?? true,
        },
      })

      // Create all template steps
      await tx.workflowTemplateStep.createMany({
        data: steps.map((step) => ({
          workflowTemplateId: createdTemplate.id,
          order: step.order,
          actionType: step.actionType,
          assignedToUserId: step.assignedToUserId || null,
          assignedToRoleId: step.assignedToRoleId || null,
          assignedToDepartmentId: step.assignedToDepartmentId || null,
          dueInDays: step.dueInDays || null,
          description: step.description || null,
          isRequired: step.isRequired ?? true,
        })),
      })

      // Fetch the complete template with all relations
      return await tx.workflowTemplate.findUnique({
        where: { id: createdTemplate.id },
        include: {
          documentType: {
            select: {
              id: true,
              name: true,
            },
          },
          steps: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              assignedToUser: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                },
              },
              assignedToRole: {
                select: {
                  id: true,
                  name: true,
                },
              },
              assignedToDepartment: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })
    })

    // Log workflow template creation
    await this.auditLogService.logAction(
      'WorkflowTemplate',
      template.id,
      AuditAction.CREATE,
      payload.createdBy || template.id,
      {
        newValues: {
          name: template.name,
          description: template.description,
          documentTypeId: template.documentTypeId,
          type: template.type,
          isActive: template.isActive,
          isPublic: template.isPublic,
          stepsCount: payload.steps.length,
        },
      },
    )

    return this.mapToResponseDto(template)
  }

  async workflowTemplateRetrieveAll(
    payload: WorkflowTemplateRetrieveAllRequest,
  ): Promise<any> {
    const {
      search,
      documentTypeId,
      type,
      isActive,
      isPublic,
      page = 1,
      limit = 10,
    } = payload
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(documentTypeId && { documentTypeId }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
      ...(isPublic !== undefined && { isPublic }),
    }

    const [templates, total] = await Promise.all([
      this.prisma.workflowTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          documentType: {
            select: {
              id: true,
              name: true,
            },
          },
          steps: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              assignedToUser: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                },
              },
              assignedToRole: {
                select: {
                  id: true,
                  name: true,
                },
              },
              assignedToDepartment: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.workflowTemplate.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: templates.map((template) => this.mapToResponseDto(template)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }

  async workflowTemplateRetrieveOne(
    payload: WorkflowTemplateRetrieveOneRequest,
  ): Promise<any> {
    const template = await this.prisma.workflowTemplate.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
        steps: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            assignedToUser: {
              select: {
                id: true,
                fullname: true,
                username: true,
              },
            },
            assignedToRole: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedToDepartment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!template) {
      throw new NotFoundException('Ish jarayoni shabloni topilmadi')
    }

    return this.mapToResponseDto(template)
  }

  async workflowTemplateUpdate(
    payload: WorkflowTemplateUpdateRequest,
  ): Promise<any> {
    const { id, steps, updatedBy, ...updateData } = payload

    // Verify template exists and fetch for change tracking
    const existingTemplate = await this.prisma.workflowTemplate.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        steps: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    })

    if (!existingTemplate) {
      throw new NotFoundException('Ish jarayoni shabloni topilmadi')
    }

    const existingStepsCount = existingTemplate.steps.length

    // Check if name is being updated and if it conflicts with another template
    if (updateData.name && updateData.name !== existingTemplate.name) {
      const nameExists = await this.prisma.workflowTemplate.findFirst({
        where: {
          name: updateData.name,
          deletedAt: null,
          id: { not: id },
        },
      })

      if (nameExists) {
        throw new ConflictException(
          'Workflow template with this name already exists',
        )
      }
    }

    // Validate document type if being updated
    if (updateData.documentTypeId) {
      const documentType = await this.prisma.documentType.findFirst({
        where: {
          id: updateData.documentTypeId,
          deletedAt: null,
        },
      })

      if (!documentType) {
        throw new NotFoundException('Hujjat turi topilmadi')
      }
    }

    // If steps are provided, validate them
    if (steps && steps.length > 0) {
      // Validate step orders are unique
      const stepOrders = steps.map((step) => step.order)
      const uniqueOrders = new Set(stepOrders)
      if (stepOrders.length !== uniqueOrders.size) {
        throw new BadRequestException("Bosqich tartib raqamlari noyob bo'lishi kerak")
      }

      // Validate assigned users
      const userIds = steps
        .filter((step) => step.assignedToUserId)
        .map((step) => step.assignedToUserId!)

      if (userIds.length > 0) {
        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
            deletedAt: null,
          },
          select: { id: true },
        })

        if (users.length !== userIds.length) {
          throw new NotFoundException('Tayinlangan foydalanuvchilardan biri yoki bir nechtasi topilmadi')
        }
      }

      // Validate assigned roles
      const roleIds = steps
        .filter((step) => step.assignedToRoleId)
        .map((step) => step.assignedToRoleId!)

      if (roleIds.length > 0) {
        const roles = await this.prisma.role.findMany({
          where: {
            id: { in: roleIds },
            deletedAt: null,
          },
          select: { id: true },
        })

        if (roles.length !== roleIds.length) {
          throw new NotFoundException('Tayinlangan rollardan biri yoki bir nechtasi topilmadi')
        }
      }

      // Validate assigned departments
      const departmentIds = steps
        .filter((step) => step.assignedToDepartmentId)
        .map((step) => step.assignedToDepartmentId!)

      if (departmentIds.length > 0) {
        const departments = await this.prisma.department.findMany({
          where: {
            id: { in: departmentIds },
            deletedAt: null,
          },
          select: { id: true },
        })

        if (departments.length !== departmentIds.length) {
          throw new NotFoundException(
            'One or more assigned departments not found',
          )
        }
      }
    }

    // Update template in a transaction
    const template = await this.prisma.$transaction(async (tx) => {
      // Update the template
      await tx.workflowTemplate.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })

      // If steps are provided, replace existing steps
      if (steps && steps.length > 0) {
        // Hard delete existing steps (required due to unique constraint on workflow_template_id + order)
        await tx.workflowTemplateStep.deleteMany({
          where: {
            workflowTemplateId: id,
          },
        })

        // Create new steps
        await tx.workflowTemplateStep.createMany({
          data: steps.map((step) => ({
            workflowTemplateId: id,
            order: step.order,
            actionType: step.actionType,
            assignedToUserId: step.assignedToUserId || null,
            assignedToRoleId: step.assignedToRoleId || null,
            assignedToDepartmentId: step.assignedToDepartmentId || null,
            dueInDays: step.dueInDays || null,
            description: step.description || null,
            isRequired: step.isRequired ?? true,
          })),
        })
      }

      // Fetch the updated template
      return await tx.workflowTemplate.findUnique({
        where: { id },
        include: {
          documentType: {
            select: {
              id: true,
              name: true,
            },
          },
          steps: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              assignedToUser: {
                select: {
                  id: true,
                  fullname: true,
                  username: true,
                },
              },
              assignedToRole: {
                select: {
                  id: true,
                  name: true,
                },
              },
              assignedToDepartment: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })
    })

    // Track changes for audit log
    const changes: Record<string, unknown> = {}
    if (updateData.name && updateData.name !== existingTemplate.name) {
      changes.name = { old: existingTemplate.name, new: updateData.name }
    }
    if (
      updateData.description !== undefined &&
      updateData.description !== existingTemplate.description
    ) {
      changes.description = {
        old: existingTemplate.description,
        new: updateData.description,
      }
    }
    if (
      updateData.documentTypeId !== undefined &&
      updateData.documentTypeId !== existingTemplate.documentTypeId
    ) {
      changes.documentTypeId = {
        old: existingTemplate.documentTypeId,
        new: updateData.documentTypeId,
      }
    }
    if (updateData.type && updateData.type !== existingTemplate.type) {
      changes.type = { old: existingTemplate.type, new: updateData.type }
    }
    if (
      updateData.isActive !== undefined &&
      updateData.isActive !== existingTemplate.isActive
    ) {
      changes.isActive = {
        old: existingTemplate.isActive,
        new: updateData.isActive,
      }
    }
    if (
      updateData.isPublic !== undefined &&
      updateData.isPublic !== existingTemplate.isPublic
    ) {
      changes.isPublic = {
        old: existingTemplate.isPublic,
        new: updateData.isPublic,
      }
    }
    if (steps) {
      changes.stepsCount = {
        old: existingStepsCount,
        new: steps.length,
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.auditLogService.logAction(
        'WorkflowTemplate',
        id,
        AuditAction.UPDATE,
        updatedBy || id,
        { changes },
      )
    }

    return this.mapToResponseDto(template)
  }

  async workflowTemplateDelete(
    payload: WorkflowTemplateDeleteRequest,
  ): Promise<void> {
    const existingTemplate = await this.prisma.workflowTemplate.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        steps: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    })

    if (!existingTemplate) {
      throw new NotFoundException('Ish jarayoni shabloni topilmadi')
    }

    // Soft delete the template (steps will be cascade deleted due to relation)
    await this.prisma.$transaction(async (tx) => {
      // Soft delete steps
      await tx.workflowTemplateStep.updateMany({
        where: {
          workflowTemplateId: payload.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      })

      // Soft delete template
      await tx.workflowTemplate.update({
        where: { id: payload.id },
        data: {
          deletedAt: new Date(),
        },
      })
    })

    // Log workflow template deletion
    await this.auditLogService.logAction(
      'WorkflowTemplate',
      payload.id,
      AuditAction.DELETE,
      payload.deletedBy || payload.id,
      {
        oldValues: {
          name: existingTemplate.name,
          description: existingTemplate.description,
          documentTypeId: existingTemplate.documentTypeId,
          type: existingTemplate.type,
          isActive: existingTemplate.isActive,
          isPublic: existingTemplate.isPublic,
          stepsCount: existingTemplate.steps.length,
        },
      },
    )
  }

  private mapToResponseDto(template: any): any {
    if (!template) return null

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      documentType: template.documentType
        ? {
            id: template.documentType.id,
            name: template.documentType.name,
          }
        : null,
      type: template.type,
      isActive: template.isActive,
      isPublic: template.isPublic,
      steps:
        template.steps?.map((step: any) => ({
          id: step.id,
          order: step.order,
          actionType: step.actionType,
          assignedToUser: step.assignedToUser
            ? {
                id: step.assignedToUser.id,
                fullname: step.assignedToUser.fullname,
                username: step.assignedToUser.username,
              }
            : null,
          assignedToRole: step.assignedToRole
            ? {
                id: step.assignedToRole.id,
                name: step.assignedToRole.name,
              }
            : null,
          assignedToDepartment: step.assignedToDepartment
            ? {
                id: step.assignedToDepartment.id,
                name: step.assignedToDepartment.name,
              }
            : null,
          dueInDays: step.dueInDays,
          description: step.description,
          isRequired: step.isRequired,
          createdAt: step.createdAt?.toISOString(),
          updatedAt: step.updatedAt?.toISOString(),
        })) || [],
      createdAt: template.createdAt?.toISOString(),
      updatedAt: template.updatedAt?.toISOString(),
    }
  }
}
