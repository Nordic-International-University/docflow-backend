import { Request } from 'express'

/**
 * Extract the real client IP address from request headers
 * Handles reverse proxy headers (nginx, cloudflare, etc.)
 */
export function getClientIp(req: Request): string | null {
  // Check common proxy headers in order of priority
  const forwardedFor = req.headers['x-forwarded-for']
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
    // The first one is the original client IP
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0]
    return normalizeIp(ips.trim())
  }

  // X-Real-IP (nginx)
  const realIp = req.headers['x-real-ip']
  if (realIp) {
    const ip = Array.isArray(realIp) ? realIp[0] : realIp
    return normalizeIp(ip.trim())
  }

  // CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers['cf-connecting-ip']
  if (cfIp) {
    const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp
    return normalizeIp(ip.trim())
  }

  // True-Client-IP (Akamai, Cloudflare Enterprise)
  const trueClientIp = req.headers['true-client-ip']
  if (trueClientIp) {
    const ip = Array.isArray(trueClientIp) ? trueClientIp[0] : trueClientIp
    return normalizeIp(ip.trim())
  }

  // Fall back to req.ip (Express) or socket address
  if (req.ip) {
    return normalizeIp(req.ip)
  }

  const socketAddress = req.socket?.remoteAddress
  if (socketAddress) {
    return normalizeIp(socketAddress)
  }

  return null
}

/**
 * Normalize IP address (handle IPv6-mapped IPv4 addresses)
 */
function normalizeIp(ip: string): string {
  // Convert IPv6-mapped IPv4 to IPv4 (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7)
  }
  return ip
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(req: Request): string | null {
  const userAgent = req.headers['user-agent']
  if (!userAgent) {
    return null
  }
  return Array.isArray(userAgent) ? userAgent[0] : userAgent
}

/**
 * Parse user agent to get device info (simplified)
 */
export function parseUserAgent(userAgent: string | null): {
  browser: string
  os: string
  device: string
} {
  if (!userAgent) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' }
  }

  let browser = 'Unknown'
  let os = 'Unknown'
  let device = 'Desktop'

  // Detect browser
  if (userAgent.includes('Firefox/')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Edg/')) {
    browser = 'Edge'
  } else if (userAgent.includes('Chrome/')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
    browser = 'Opera'
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
  } else if (
    userAgent.includes('iOS') ||
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad')
  ) {
    os = 'iOS'
  }

  // Detect device type
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    device = 'Mobile'
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet'
  }

  return { browser, os, device }
}
