import { NextRequest, NextResponse } from "next/server"

const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/about", "/contact", "/services", "/faq"]
const publicApiPaths = ["/api/auth/login", "/api/auth/signup", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/google", "/api/auth/google/callback", "/api/auth/zoho", "/api/auth/zoho/callback", "/api/contact", "/api/health", "/api/services"]
const cronPaths = ["/api/cron/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // Sliding session: refresh cookie expiry on every authenticated request
  const response = NextResponse.next()
  if (token) {
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // Reset to 24 hours on each request
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|icons/).*)",
  ],
}
