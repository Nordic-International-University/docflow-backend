import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const userAgent = request.headers['user-agent'] || ''
    return {
      ...request?.user,
      ipAddress: request.ipAddress ?? '',
      userAgent: userAgent,
    }
  },
)
