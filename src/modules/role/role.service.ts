import { Injectable, NotFoundException } from '@nestjs/common'
import {
  RoleCreateRequest,
  RoleDeleteRequest,
  RoleRetrieveAllRequest,
  RoleRetrieveAllResponse,
  RoleRetrieveOneRequest,
  RoleRetrieveOneResponse,
  RoleUpdateRequest,
} from './interfaces'
import { PrismaService } from '@prisma'

@Injectable()
export class RoleService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async roleRetrieveAll(
    payload: RoleRetrieveAllRequest,
  ): Promise<RoleRetrieveAllResponse> {
    const pageNumber = payload.pageNumber ? Number(payload.pageNumber) : 1
    const pageSize = payload.pageSize ? Number(payload.pageSize) : 10
    const skip = (pageNumber - 1) * pageSize
    const take = pageSize

    const roleList = await this.#_prisma.role.findMany({
      where: {
        deletedAt: null,
        ...(payload.search
          ? {
              name: {
                contains: payload.search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: take,
      skip: skip,
    })

    const total = await this.#_prisma.role.count({
      where: {
        deletedAt: null,
      },
    })

    return {
      count: total,
      pageNumber: pageNumber,
      pageSize: pageSize,
      pageCount: Math.ceil(total / pageSize),
      data: roleList.map((role) => {
        return {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions.map((permission) => {
            return {
              id: permission.permission.id,
              name: permission.permission.name,
            }
          }),
          users: 1,
        }
      }),
    }
  }

  async roleRetrieveOne(
    payload: RoleRetrieveOneRequest,
  ): Promise<RoleRetrieveOneResponse> {
    const role = await this.#_prisma.role.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                key: true,
                module: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!role) {
      throw new NotFoundException(`Role not found ${payload.id}`)
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((permission) => {
        return {
          id: permission.permission.id,
          name: permission.permission.name,
          key: permission.permission.key,
          module: permission.permission.module,
          description: permission.permission.description,
        }
      }),
    }
  }

  async roleCreate(payload: RoleCreateRequest): Promise<void> {
    const role = await this.#_prisma.role.create({
      data: {
        name: payload.name,
        description: payload.description,
      },
    })

    const permissions = payload.permissions.map((permission) => {
      return {
        roleId: role.id,
        permissionId: permission,
      }
    })

    await this.#_prisma.rolePermission.createMany({
      data: permissions,
    })

    // TODO: Add audit logging with proper user ID from request context
    // Log role creation
    // await this.#_auditLogService.logAction(
    //   'Role',
    //   role.id,
    //   AuditAction.CREATE,
    //   payload.createdBy || role.id,
    //   {
    //     newValues: {
    //       name: role.name,
    //       description: role.description,
    //       permissions: payload.permissions,
    //     },
    //   },
    // )
  }

  async roleUpdate(payload: RoleUpdateRequest): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    // Fetch existing role for change tracking
    const existingRole = await this.#_prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingRole) {
      throw new NotFoundException(`Role not found ${id}`)
    }

    const currentPermissions = updateData.permissions
      ? await this.#_prisma.rolePermission.findMany({
          where: { roleId: id },
          select: { permissionId: true },
        })
      : []

    const currentPermissionIds = currentPermissions.map((p) => p.permissionId)

    const permissionsToAdd = updateData.permissions
      ? updateData.permissions.filter(
          (pid) => !currentPermissionIds.includes(pid),
        )
      : []
    const permissionsToRemove = updateData.permissions
      ? currentPermissionIds.filter(
          (pid) => !updateData.permissions.includes(pid),
        )
      : []

    const roleUpdateData: any = {}
    if (updateData.name !== undefined) {
      roleUpdateData.name = updateData.name
    }
    if (updateData.description !== undefined) {
      roleUpdateData.description = updateData.description
    }

    const transactionOps = []

    if (Object.keys(roleUpdateData).length > 0) {
      transactionOps.push(
        this.#_prisma.role.update({
          where: { id },
          data: roleUpdateData,
        }),
      )
    }

    if (permissionsToRemove.length > 0) {
      transactionOps.push(
        this.#_prisma.rolePermission.deleteMany({
          where: {
            roleId: id,
            permissionId: { in: permissionsToRemove },
          },
        }),
      )
    }

    if (permissionsToAdd.length > 0) {
      transactionOps.push(
        this.#_prisma.rolePermission.createMany({
          data: permissionsToAdd.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
          skipDuplicates: true,
        }),
      )
    }

    if (transactionOps.length > 0) {
      await this.#_prisma.$transaction(transactionOps)
    }

    // Track changes for audit log
    const changes: Record<string, any> = {}
    if (updateData.name && updateData.name !== existingRole.name) {
      changes.name = { old: existingRole.name, new: updateData.name }
    }
    if (
      updateData.description &&
      updateData.description !== existingRole.description
    ) {
      changes.description = {
        old: existingRole.description,
        new: updateData.description,
      }
    }
    if (updateData.permissions) {
      if (permissionsToAdd.length > 0) {
        changes.permissionsAdded = permissionsToAdd
      }
      if (permissionsToRemove.length > 0) {
        changes.permissionsRemoved = permissionsToRemove
      }
    }

    // TODO: Add audit logging with proper user ID from request context
    // if (Object.keys(changes).length > 0) {
    //   await this.#_auditLogService.logAction(
    //     'Role',
    //     id,
    //     AuditAction.UPDATE,
    //     updatedBy || id,
    //     { changes },
    //   )
    // }
  }

  async roleDelete(payload: RoleDeleteRequest): Promise<void> {
    // Fetch existing role for audit log
    const existingRole = await this.#_prisma.role.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      include: {
        permissions: {
          select: {
            permissionId: true,
          },
        },
      },
    })

    if (!existingRole) {
      throw new NotFoundException(`Role not found ${payload.id}`)
    }

    await this.#_prisma.role.update({
      where: {
        id: payload.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // TODO: Add audit logging with proper user ID from request context
    // Log role deletion
    // await this.#_auditLogService.logAction(
    //   'Role',
    //   payload.id,
    //   AuditAction.DELETE,
    //   payload.deletedBy || payload.id,
    //   {
    //     oldValues: {
    //       name: existingRole.name,
    //       description: existingRole.description,
    //       permissions: existingRole.permissions.map((p) => p.permissionId),
    //     },
    //   },
    // )
  }
}
