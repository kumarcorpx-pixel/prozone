import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { isOriginAllowed, getCorsHeaders } from "@/lib/cors"

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about", "/contact", "/services", "/faq", "/privacy", "/consultation", "/offline"]
const publicApiPaths = ["/api/auth/login", "/api/auth/logout", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/refresh", "/api/auth/google", "/api/auth/google/callback", "/api/auth/zoho", "/api/auth/zoho/callback", "/api/contact", "/api/consultation", "/api/health", "/api/services"]
const cronPaths = ["/api/cron/"]

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("FATAL: JWT_SECRET environment variable is required")
  return new TextEncoder().encode(secret)
}

async function verifyJWT(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    // Double-check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }
    if (!payload.userId || !payload.role) {
      return null
    }
    return payload as any
  } catch {
    return null
  }
}

// Role-based route access
const routeRoles: Record<string, string[]> = {
  "/admin": ["admin"],
  "/staff": ["admin", "pro_staff"],
  "/dashboard": ["admin", "pro_staff", "client"],
  "/api/admin": ["admin"],
  "/api/staff": ["admin", "pro_staff"],
  "/api/client": ["admin", "client"],
  "/api/data": ["admin", "pro_staff"],
}

function getAllowedRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(routeRoles)) {
    if (pathname.startsWith(prefix)) return roles
  }
  return null // No role restriction
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get("origin")

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }

  // Block unknown origins on API routes
  if (pathname.startsWith("/api/") && origin && !isOriginAllowed(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 })
  }

  // Public paths — no auth needed
  if (publicPaths.includes(pathname)) return NextResponse.next()
  if (pathname.startsWith("/_next") || pathname.startsWith("/icons") || pathname.includes(".")) return NextResponse.next()
  if (publicApiPaths.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (cronPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Get and VERIFY token — check Authorization header first (for mobile/API clients), then cookie fallback
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : request.cookies.get("auth_token")?.value
  const user = token ? await verifyJWT(token) : null

  // No valid token — redirect or 401
  if (!user) {
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      loginUrl.searchParams.set("expired", "true")
      const response = NextResponse.redirect(loginUrl)
      // Clear invalid cookie
      if (token) {
        response.cookies.delete("auth_token")
      }
      return response
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Role-based access control
  const allowedRoles = getAllowedRoles(pathname)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (!pathname.startsWith("/api/")) {
      // Redirect to their correct portal
      const redirectMap: Record<string, string> = {
        admin: "/admin",
        pro_staff: "/staff",
        client: "/dashboard",
      }
      const correctPath = redirectMap[user.role] || "/"
      return NextResponse.redirect(new URL(correctPath, request.url))
    }
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  // Valid token — pass through
  const response = NextResponse.next()

  // Add CORS headers to API responses
  if (pathname.startsWith("/api/") && origin && isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Vary", "Origin")
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|icons/).*)",
  ],
}
