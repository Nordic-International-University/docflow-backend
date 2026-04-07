import { IS_PUBLIC_KEY } from '@decorators'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { PrismaService } from '@prisma'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessSecret: string

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('jwt.accessSecret')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers['authorization']
    const token =
      authHeader && request.headers['authorization'].startsWith('Bearer ')
        ? authHeader.slice(7)
        : null

    if (!token) {
      throw new UnauthorizedException('Missing authentication token')
    }

    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.prisma.tokenBlacklist.findFirst({
        where: {
          token,
          expiresAt: {
            gte: new Date(),
          },
        },
      })

      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked')
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.accessSecret,
      })

      // Fetch user from database with permissions
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.userId,
          deletedAt: null,
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          fullname: true,
          roleId: true,
          departmentId: true,
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      id: true,
                      key: true,
                      name: true,
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
        },
      })

      if (!user) {
        throw new UnauthorizedException('User not found or inactive')
      }

      // Extract permission keys
      const permissionKeys =
        user.role?.permissions.map((rp) => rp.permission.key) || []

      // Attach user with permissions to request
      request['user'] = {
        userId: user.id,
        username: user.username,
        fullname: user.fullname,
        roleId: user.roleId,
        roleName: user.role?.name,
        departmentId: user.departmentId,
        departmentName: user.department?.name,
        permissions: permissionKeys,
        sessionId: payload.sessionId,
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException('Invalid or expired token')
    }
    return true
  }
}
