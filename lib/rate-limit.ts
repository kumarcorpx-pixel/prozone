import { NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs })
    return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (record.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { success: true, remaining: config.maxRequests - record.count, resetIn: record.resetTime - now }
}

// Presets
export const loginRateLimit = { maxRequests: 5, windowMs: 15 * 60 * 1000 } // 5 per 15 min
export const apiRateLimit = { maxRequests: 100, windowMs: 60 * 1000 } // 100 per min
export const uploadRateLimit = { maxRequests: 20, windowMs: 60 * 1000 } // 20 per min

export function withRateLimitHeaders(response: NextResponse, rl: { success: boolean; remaining: number; resetIn: number }, limit: { maxRequests: number }) {
  response.headers.set("X-RateLimit-Limit", String(limit.maxRequests))
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, rl.remaining)))
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(rl.resetIn / 1000)))
  return response
}
