import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { Prisma } from '@prisma/client'
import { randomBytes, createHash } from 'crypto'
import {
  WopiTokenGenerationRequest,
  WopiTokenGenerationResponse,
  WopiTokenPayload,
  WopiTokenPermissions,
} from './interfaces'
import { WorkflowPermissionService } from './workflow-permission.service'

@Injectable()
export class WopiTokenService {
  readonly #_prisma: PrismaService
  readonly #_workflowPermissionService: WorkflowPermissionService
  private readonly TOKEN_LENGTH = 32 // 32 bytes = 256 bits
  private readonly TOKEN_EXPIRY_HOURS = 1 // 1 hour default

  constructor(
    prisma: PrismaService,
    workflowPermissionService: WorkflowPermissionService,
  ) {
    this.#_prisma = prisma
    this.#_workflowPermissionService = workflowPermissionService
  }

  /**
   * Generate a secure WOPI access token for a file
   */
  async generateToken(
    payload: WopiTokenGenerationRequest,
    userId: string,
  ): Promise<WopiTokenGenerationResponse> {
    // Verify file exists and user has access
    const attachment = await this.#_prisma.attachment.findFirst({
      where: {
        id: payload.fileId,
        deletedAt: null,
      },
    })

    if (!attachment) {
      throw new NotFoundException("Fayl topilmadi")
    }

    // Get workflow-based permissions for this user and file
    const workflowPermissions =
      await this.#_workflowPermissionService.getUserPermissionsForFile(
        userId,
        payload.fileId,
      )

    // Verify user has at least read access
    if (!workflowPermissions.UserCanRead) {
      throw new UnauthorizedException(
        'You do not have permission to access this file',
      )
    }

    // Generate a secure random token
    const rawToken = randomBytes(this.TOKEN_LENGTH).toString('hex')
    const hashedToken = this.hashToken(rawToken)

    // Set expiry time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS)

    // Define permissions based on workflow step
    const permissions: WopiTokenPermissions = {
      UserCanWrite: workflowPermissions.UserCanWrite,
      UserCanRead: workflowPermissions.UserCanRead,
      UserCanRename: false,
      UserCanDelete: false,
    }

    // Store token in database
    await this.#_prisma.wopiAccessToken.create({
      data: {
        token: hashedToken,
        userId: userId,
        fileId: payload.fileId,
        permissions: permissions as unknown as Prisma.InputJsonValue,
        expiresAt: expiresAt,
      },
    })

    // Construct WOPI source URL
    const wopiSrc = this.constructWopiSrc(payload.fileId)

    return {
      accessToken: rawToken,
      expiresAt: expiresAt,
      wopiSrc: wopiSrc,
    }
  }

  /**
   * Validate a WOPI access token and return its payload
   */
  async validateToken(rawToken: string): Promise<WopiTokenPayload> {
    if (!rawToken) {
      throw new UnauthorizedException("Kirish tokeni talab qilinadi")
    }

    const hashedToken = this.hashToken(rawToken)

    // Find token in database
    const tokenRecord = await this.#_prisma.wopiAccessToken.findFirst({
      where: {
        token: hashedToken,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            deletedAt: true,
          },
        },
        file: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
      },
    })

    if (!tokenRecord) {
      throw new UnauthorizedException("Yaroqsiz kirish tokeni")
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      // Clean up expired token
      await this.revokeToken(hashedToken)
      throw new UnauthorizedException("Kirish tokeni muddati tugagan")
    }

    // Check if user is still active
    if (!tokenRecord.user.isActive || tokenRecord.user.deletedAt) {
      throw new UnauthorizedException("Foydalanuvchi endi faol emas")
    }

    // Check if file still exists
    if (tokenRecord.file.deletedAt) {
      throw new NotFoundException("Fayl endi mavjud emas")
    }

    return {
      tokenId: tokenRecord.id,
      userId: tokenRecord.userId,
      fileId: tokenRecord.fileId,
      permissions: tokenRecord.permissions as unknown as WopiTokenPermissions,
      expiresAt: tokenRecord.expiresAt,
    }
  }

  /**
   * Revoke a WOPI access token
   */
  async revokeToken(hashedToken: string): Promise<void> {
    await this.#_prisma.wopiAccessToken.updateMany({
      where: {
        token: hashedToken,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Revoke all tokens for a specific file
   */
  async revokeAllTokensForFile(fileId: string): Promise<void> {
    await this.#_prisma.wopiAccessToken.updateMany({
      where: {
        fileId: fileId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Revoke all tokens for a specific user
   */
  async revokeAllTokensForUser(userId: string): Promise<void> {
    await this.#_prisma.wopiAccessToken.updateMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Clean up expired tokens (can be run as a cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.#_prisma.wopiAccessToken.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return result.count
  }

  /**
   * Hash a token using SHA-256
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * Construct the WOPI source URL for a file
   */
  private constructWopiSrc(fileId: string): string {
    const baseUrl = process.env.WOPI_HOST_URL || 'https://api.docverse.uz'
    return `${baseUrl}/api/v1/wopi/files/${fileId}`
  }
}
