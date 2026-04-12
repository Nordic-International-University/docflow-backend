import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'
import {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRefreshTokenRequest,
  AuthRefreshTokenResponse,
  AuthLogoutRequest,
} from './interfaces'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { transformPermissions } from '@common'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  private readonly accessSecret: string
  private readonly refreshSecret: string
  private readonly accessExpiresIn: number
  private readonly refreshExpiresIn: number

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('jwt.accessSecret')
    this.refreshSecret = this.configService.get<string>('jwt.refreshSecret')
    this.accessExpiresIn = this.configService.get<number>('jwt.accessExpiresIn')
    this.refreshExpiresIn = this.configService.get<number>(
      'jwt.refreshExpiresIn',
    )
  }

  async login(
    payload: AuthLoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthLoginResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: payload.username,
        deletedAt: null,
        isActive: true,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    key: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await argon2.verify(user.password, payload.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const permissionKeys =
      user.role?.permissions.map((rp) => rp.permission.key) || []

    const structuredPermissions = transformPermissions(permissionKeys)

    const tokens = await this.generateTokens(
      {
        userId: user.id,
        username: user.username,
        fullname: user.fullname,
        roleId: user.roleId,
        departmentId: user.departmentId,
      },
      ipAddress,
      userAgent,
    )

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: tokens.sessionId,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role?.name,
        permissions: structuredPermissions,
      },
    }
  }

  async refreshToken(
    payload: AuthRefreshTokenRequest,
    _ipAddress?: string,
    _userAgent?: string,
  ): Promise<AuthRefreshTokenResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync(payload.refreshToken, {
        secret: this.refreshSecret,
      })

      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: payload.refreshToken,
          userId: decoded.userId,
          isRevoked: false,
          deletedAt: null,
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullname: true,
              roleId: true,
              departmentId: true,
              isActive: true,
              deletedAt: true,
            },
          },
        },
      })

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or expired refresh token')
      }

      if (!storedToken.user.isActive || storedToken.user.deletedAt) {
        throw new UnauthorizedException('User account is inactive or deleted')
      }

      // SECURITY: eski refresh token'ni revoke qilish (rotation)
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      })

      // Yangi access token
      const accessToken = await this.jwtService.signAsync(
        {
          userId: storedToken.user.id,
          username: storedToken.user.username,
          fullname: storedToken.user.fullname,
          roleId: storedToken.user.roleId,
          departmentId: storedToken.user.departmentId,
        },
        {
          secret: this.accessSecret,
          expiresIn: this.accessExpiresIn,
        },
      )

      // Yangi refresh token (rotation — har refresh'da yangi token)
      const newRefreshToken = await this.jwtService.signAsync(
        { userId: storedToken.user.id },
        { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
      )

      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(
            Date.now() + this.refreshExpiresIn * 1000,
          ),
        },
      })

      return {
        accessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  async logout(payload: AuthLogoutRequest): Promise<void> {
    if (payload.refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: {
          token: payload.refreshToken,
          userId: payload.userId,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      })
    }

    if (payload.accessToken) {
      try {
        const decoded = await this.jwtService.verifyAsync(payload.accessToken, {
          secret: this.accessSecret,
        })

        await this.prisma.tokenBlacklist.create({
          data: {
            token: payload.accessToken,
            tokenType: 'ACCESS',
            expiresAt: new Date(decoded.exp * 1000),
            reason: 'User logout',
          },
        })
      } catch {
        // Ignore invalid token errors during logout - token may already be expired
      }
    }

    // Optionally revoke all user's refresh tokens
    if (payload.revokeAllTokens) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: payload.userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      })
    }
  }

  async profile(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        avatarUrl: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    key: true,
                  },
                },
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const permissionKeys =
      user.role?.permissions.map((rp) => rp.permission.key) || []
    const structuredPermissions = transformPermissions(permissionKeys)

    return {
      ...user,
      permissions: structuredPermissions,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private async generateTokens(
    payload: {
      userId: string
      username: string
      fullname: string
      roleId?: string
      departmentId?: string
    },
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Generate refresh token first (so we get sessionId)
    const refreshTokenPayload = {
      ...payload,
      jti: crypto.randomBytes(16).toString('hex'),
    }

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    })

    const expiresAt = new Date(Date.now() + this.refreshExpiresIn * 1000)

    // Store refresh token in database first to get sessionId
    const stored = await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt,
        ipAddress,
        userAgent,
      },
      select: { id: true },
    })

    // Access token includes sessionId for guard to read
    const accessToken = await this.jwtService.signAsync(
      { ...payload, sessionId: stored.id },
      { secret: this.accessSecret, expiresIn: this.accessExpiresIn },
    )

    return { accessToken, refreshToken, sessionId: stored.id }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.prisma.tokenBlacklist.findFirst({
      where: {
        token,
        expiresAt: {
          gte: new Date(),
        },
      },
    })

    return !!blacklisted
  }

  // Cleanup expired tokens (should be run periodically via cron job)
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date()

    // Delete expired refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          {
            isRevoked: true,
            revokedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          }, // Keep revoked tokens for 30 days
        ],
      },
    })

    // Delete expired blacklisted tokens
    await this.prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    })
  }
}
