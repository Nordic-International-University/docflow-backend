import { registerAs } from '@nestjs/config'

export interface JwtServiceOptions {
  accessSecret: string
  refreshSecret: string
  accessExpiresIn: number // seconds
  refreshExpiresIn: number // seconds
}

/**
 * Parse duration string (e.g., '1h', '7d', '30m') to seconds
 */
function parseDurationToSeconds(duration: string): number {
  const unit = duration.slice(-1)
  const value = parseInt(duration.slice(0, -1), 10)

  if (isNaN(value)) {
    return 3600 // default 1 hour
  }

  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 60 * 60
    case 'd':
      return value * 24 * 60 * 60
    default:
      return 3600 // default 1 hour
  }
}

export const jwtConfig = registerAs<JwtServiceOptions>(
  'jwt',
  (): JwtServiceOptions => {
    const accessSecret = process.env.JWT_ACCESS_SECRET
    const refreshSecret = process.env.JWT_REFRESH_SECRET

    if (!accessSecret || !refreshSecret) {
      throw new Error(
        'JWT secrets are not configured. Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.',
      )
    }

    return {
      accessSecret,
      refreshSecret,
      accessExpiresIn: parseDurationToSeconds(
        process.env.JWT_ACCESS_EXPIRES_IN || '1h',
      ),
      refreshExpiresIn: parseDurationToSeconds(
        process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      ),
    }
  },
)
