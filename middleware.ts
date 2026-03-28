import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about", "/contact", "/services", "/faq", "/privacy", "/consultation", "/offline"]
const publicApiPaths = ["/api/auth/login", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/google", "/api/auth/google/callback", "/api/auth/zoho", "/api/auth/zoho/callback", "/api/contact", "/api/consultation", "/api/health", "/api/services", "/api/activities"]
const cronPaths = ["/api/cron/"]

const ALLOWED_ORIGINS = [
  "https://corporatepro.cloud",
  "https://www.corporatepro.cloud",
]

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yabs-pro-2026-secret-key-change-this")

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

async function verifyJWT(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
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
      headers: {
        "Access-Control-Allow-Origin": origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
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

  // Get and VERIFY token
  const token = request.cookies.get("auth_token")?.value
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

  // Valid token — sliding session + CORS headers
  const response = NextResponse.next()

  response.cookies.set("auth_token", token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // No maxAge = session cookie — dies when browser closes
  })

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
