import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { WopiTokenService } from '../modules/wopi/wopi-token.service'
import { WopiTokenPayload } from '../modules/wopi/interfaces'

@Injectable()
export class WopiAuthGuard implements CanActivate {
  constructor(private wopiTokenService: WopiTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    // Extract access_token from query parameters (WOPI protocol requirement)
    const accessToken = request.query.access_token as string

    if (!accessToken) {
      throw new UnauthorizedException('Missing WOPI access token')
    }

    try {
      // Validate token and get payload
      const tokenPayload: WopiTokenPayload =
        await this.wopiTokenService.validateToken(accessToken)

      // Attach WOPI context to request for use in controllers/services
      request['wopiContext'] = {
        tokenId: tokenPayload.tokenId,
        userId: tokenPayload.userId,
        fileId: tokenPayload.fileId,
        permissions: tokenPayload.permissions,
        expiresAt: tokenPayload.expiresAt,
      }

      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException('Invalid WOPI access token')
    }
  }
}
