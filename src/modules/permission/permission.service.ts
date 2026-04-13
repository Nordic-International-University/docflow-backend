import { ForbiddenException, Injectable } from '@nestjs/common'
import {
  PermissionCreateRequest,
  PermissionDeleteRequest,
  PermissionRetrieveAllRequest,
  PermissionRetrieveAllResponse,
  PermissionRetrieveOneRequest,
  PermissionRetrieveOneResponse,
  PermissionUpdateRequest,
} from './interfaces'
import { PrismaService } from '@prisma'

@Injectable()
export class PermissionService {
  readonly #_prisma: PrismaService

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma
  }

  async permissionRetrieveAll(
    payload: PermissionRetrieveAllRequest,
  ): Promise<PermissionRetrieveAllResponse> {
    const pageNumber = payload.pageNumber || 1
    const pageSize = payload.pageSize || 10

    const search = payload.search?.trim()
    const permissionList = await this.#_prisma.permission.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        key: true,
        module: true,
        description: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    })

    const total = await this.#_prisma.permission.count({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    })

    return {
      count: total,
      pageNumber: pageNumber,
      pageSize: pageSize,
      pageCount: Math.ceil(total / pageSize),
      data: this.#_moduleByFilter(permissionList),
    }
  }

  async permissionRetrieveOne(
    payload: PermissionRetrieveOneRequest,
  ): Promise<PermissionRetrieveOneResponse> {
    return await this.#_prisma.permission.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        key: true,
        description: true,
      },
    })
  }

  async permissionCreate(payload: PermissionCreateRequest): Promise<void> {
    const permission = await this.#_prisma.permission.findFirst({
      where: {
        key: payload.key,
      },
    })

    if (permission) {
      throw new ForbiddenException('Ruxsat kaliti allaqachon ishlatilgan')
    }

    const createdPermission = await this.#_prisma.permission.create({
      data: {
        name: payload.name,
        key: payload.key,
        module: payload.module,
        description: payload.description,
      },
    })

    //   'Permission',
    //   createdPermission.id,
    //   AuditAction.CREATE,
    //   {
    //     newValues: {
    //       name: createdPermission.name,
    //       key: createdPermission.key,
    //       module: createdPermission.module,
    //       description: createdPermission.description,
    //     },
    //   },
    // )
  }

  async permissionUpdate(payload: PermissionUpdateRequest): Promise<void> {
    const { id, updatedBy, ...updateData } = payload

    // Fetch existing permission for change tracking
    const existingPermission = await this.#_prisma.permission.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!existingPermission) {
      throw new ForbiddenException('Ruxsat topilmadi')
    }

    // Check if key is being changed and if it's already used
    if (updateData.key && updateData.key !== existingPermission.key) {
      const keyExists = await this.#_prisma.permission.findFirst({
        where: {
          key: updateData.key,
          id: { not: id },
          deletedAt: null,
        },
      })

      if (keyExists) {
        throw new ForbiddenException(
          'Ruxsat kaliti boshqa ruxsat tomonidan allaqachon ishlatilgan',
        )
      }
    }

    await this.#_prisma.permission.update({
      where: {
        id,
      },
      data: {
        name: updateData.name,
        key: updateData.key,
        module: updateData.module,
        description: updateData.description,
      },
    })

    // Track changes for audit log
    const changes: Record<string, unknown> = {}
    if (updateData.name && updateData.name !== existingPermission.name) {
      changes.name = { old: existingPermission.name, new: updateData.name }
    }
    if (updateData.key && updateData.key !== existingPermission.key) {
      changes.key = { old: existingPermission.key, new: updateData.key }
    }
    if (updateData.module && updateData.module !== existingPermission.module) {
      changes.module = {
        old: existingPermission.module,
        new: updateData.module,
      }
    }
    if (
      updateData.description &&
      updateData.description !== existingPermission.description
    ) {
      changes.description = {
        old: existingPermission.description,
        new: updateData.description,
      }
    }

  }

  async permissionDelete(payload: PermissionDeleteRequest): Promise<void> {
    const permission = await this.#_prisma.permission.findFirst({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    })

    if (!permission) {
      throw new ForbiddenException('Ruxsat topilmadi')
    }

    await this.#_prisma.permission.update({
      where: {
        id: payload.id,
      },
      data: {
        key: `${new Date()}/deleted`,
        deletedAt: new Date(),
      },
    })

    //   'Permission',
    //   payload.id,
    //   AuditAction.DELETE,
    //   {
    //     oldValues: {
    //       name: permission.name,
    //       key: permission.key,
    //       module: permission.module,
    //       description: permission.description,
    //     },
    //   },
    // )
  }

  #_moduleByFilter(permissions: any): any[] {
    const groupedPermissions = permissions.reduce(
      (acc: any[], permission: any) => {
        const moduleGroup = acc.find(
          (group: any) => group.module === permission.module,
        )

        if (moduleGroup) {
          moduleGroup.permissions.push({
            id: permission.id,
            name: permission.name,
            key: permission.key,
            description: permission.description,
          })
        } else {
          acc.push({
            module: permission.module,
            permissions: [
              {
                id: permission.id,
                name: permission.name,
                key: permission.key,
                description: permission.description,
              },
            ],
          })
        }

        return acc
      },
      [],
    )

    return groupedPermissions
  }
}
