import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthLoginRequestDto } from './dtos'
import { AuthRefreshTokenDto } from './dtos/auth-refresh-token.dtos'
import { AuthGuard, PermissionGuard } from '@guards'
import { Public } from '@decorators'
import { getClientIp, getUserAgent } from '@common'
import { Request } from 'express'

@ApiTags('Auth')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ short: { ttl: 60000, limit: 5 } })  // Login: faqat 5 urinish / daqiqa
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() payload: AuthLoginRequestDto, @Req() req: Request) {
    const ipAddress = getClientIp(req)
    const userAgent = getUserAgent(req)

    return await this.authService.login(
      {
        username: payload.username,
        password: payload.password,
      },
      ipAddress,
      userAgent,
    )
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({
    description: 'Access token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async refreshToken(
    @Body() payload: AuthRefreshTokenDto,
    @Req() req: Request,
  ): Promise<any> {
    const ipAddress = getClientIp(req)
    const userAgent = getUserAgent(req)

    return await this.authService.refreshToken(payload, ipAddress, userAgent)
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User profile' })
  @ApiResponse({ status: 200, description: 'Profile successful' })
  async profile(@Req() req: any): Promise<any> {
    return await this.authService.profile(req.user.userId)
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user and revoke tokens',
    description: 'Revokes refresh token and blacklists access token',
  })
  @ApiOkResponse({
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
      },
    },
  })
  async logout(@Req() req: any): Promise<any> {
    const authHeader = req.headers['authorization']
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    await this.authService.logout({
      userId: req.user.userId,
      accessToken,
      revokeAllTokens: false,
    })

    return { message: 'Logout successful' }
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout from all devices',
    description: 'Revokes all refresh tokens for the user',
  })
  @ApiOkResponse({
    description: 'Logged out from all devices successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logged out from all devices successfully',
        },
      },
    },
  })
  async logoutAll(@Req() req: any): Promise<any> {
    const authHeader = req.headers['authorization']
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    await this.authService.logout({
      userId: req.user.userId,
      accessToken,
      revokeAllTokens: true,
    })

    return { message: 'Logged out from all devices successfully' }
  }
}
