import { NextRequest, NextResponse } from "next/server"

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about", "/contact", "/services", "/faq"]
const publicApiPaths = ["/api/auth/login", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/google", "/api/auth/google/callback", "/api/auth/zoho", "/api/auth/zoho/callback", "/api/contact", "/api/health", "/api/services"]
const cronPaths = ["/api/cron/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public pages
  if (publicPaths.includes(pathname)) return NextResponse.next()

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/icons") || pathname.includes(".")) return NextResponse.next()

  // Allow public API routes
  if (publicApiPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Allow cron routes (they have their own auth)
  if (cronPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Check for auth token
  const token = request.cookies.get("auth_token")?.value

  // Protected pages — redirect to login if no token
  if (!token && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protected API routes — return 401 if no token
  if (!token && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Role-based route protection
  // We can't decode JWT in edge middleware easily without jsonwebtoken
  // So just ensure token exists — role checks happen in the dashboard-shell component

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|icons/).*)",
  ],
}
