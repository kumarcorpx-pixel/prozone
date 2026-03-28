import { NextRequest, NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set("auth_token", "", { httpOnly: true, path: "/", maxAge: 0, secure: false })
  response.cookies.delete("auth_token")
  return response
}

// GET /api/auth/logout — allows direct browser access to force logout
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set("auth_token", "", { httpOnly: true, path: "/", maxAge: 0, secure: false })
  response.cookies.delete("auth_token")
  return response
}
