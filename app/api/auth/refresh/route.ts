import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken, signToken, verifyToken } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`refresh:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    // Accept token from Authorization header or cookie
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify current token (allow expired tokens within 24h grace period)
    let userId: string | null = null
    try {
      const payload = verifyToken(token)
      userId = payload.userId
    } catch (err: any) {
      // If token expired, try to extract userId from it anyway
      if (err.name === "TokenExpiredError") {
        try {
          const jwt = await import("jsonwebtoken")
          const decoded = jwt.default.decode(token) as any
          if (decoded?.userId) {
            // Check if expired within last 24 hours
            const expiredAt = (decoded.exp || 0) * 1000
            const gracePeriod = 24 * 60 * 60 * 1000
            if (Date.now() - expiredAt < gracePeriod) {
              userId = decoded.userId
            }
          }
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Token expired beyond grace period" }, { status: 401 })
    }

    // Fetch fresh user data
    const user = await getUserFromToken(token).catch(() => null)

    // If getUserFromToken fails (expired token), fetch directly
    let userData: any = user
    if (!userData) {
      const prisma = (await import("@/lib/prisma")).default
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, fullName: true, phone: true,
          role: true, avatarUrl: true, isActive: true,
        },
      })
      if (!dbUser || !dbUser.isActive) {
        return NextResponse.json({ error: "User not found or deactivated" }, { status: 401 })
      }
      userData = {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.fullName,
        phone: dbUser.phone,
        role: dbUser.role,
        avatar_url: dbUser.avatarUrl,
        is_active: dbUser.isActive,
      }
    }

    // Issue new token
    const newToken = signToken({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
    })

    // Set cookie for web clients
    const response = NextResponse.json({
      success: true,
      token: newToken,
      user: userData,
    })

    response.cookies.set("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
      path: "/",
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
