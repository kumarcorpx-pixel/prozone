import { NextRequest, NextResponse } from "next/server"
import { getCalendarEvents, createCalendarEvent } from "@/lib/google-calendar"
import { getUserFromToken } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const startDate = request.nextUrl.searchParams.get("start") || new Date().toISOString()
    const endDate = request.nextUrl.searchParams.get("end") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get refresh token from user record
    const refreshToken = user.avatar_url?.startsWith("gcal:") ? user.avatar_url.slice(5) : null
    if (!refreshToken) {
      return NextResponse.json({ error: "Google Calendar not connected", connected: false }, { status: 400 })
    }

    const events = await getCalendarEvents(refreshToken, startDate, endDate)
    return NextResponse.json({ events, connected: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const refreshToken = user.avatar_url?.startsWith("gcal:") ? user.avatar_url.slice(5) : null
    if (!refreshToken) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 })
    }

    const body = await request.json()
    const eventId = await createCalendarEvent(refreshToken, body)
    return NextResponse.json({ success: true, eventId })
  } catch (error) {
    return handleApiError(error)
  }
}
