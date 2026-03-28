import { NextRequest, NextResponse } from "next/server"

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about", "/contact", "/services", "/faq"]
const publicApiPaths = ["/api/auth/login", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/google", "/api/auth/google/callback", "/api/auth/zoho", "/api/auth/zoho/callback", "/api/contact", "/api/quote", "/api/health", "/api/services"]
const cronPaths = ["/api/cron/"]

const ALLOWED_ORIGINS = [
  "https://corporatepro.cloud",
  "https://www.corporatepro.cloud",
]

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

export function middleware(request: NextRequest) {
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

  if (publicPaths.includes(pathname)) return NextResponse.next()
  if (pathname.startsWith("/_next") || pathname.startsWith("/icons") || pathname.includes(".")) return NextResponse.next()
  if (publicApiPaths.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (cronPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

  const token = request.cookies.get("auth_token")?.value

  if (!token && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!token && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Sliding session + CORS headers
  const response = NextResponse.next()

  if (token) {
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    })
  }

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
