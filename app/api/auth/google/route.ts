import { NextRequest, NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  const staffId = request.nextUrl.searchParams.get("staffId") || "unknown"

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: "Google Calendar not configured" }, { status: 500 })
  }

  const url = getAuthUrl(staffId)
  return NextResponse.redirect(url)
}
