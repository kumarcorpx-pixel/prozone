import { NextRequest, NextResponse } from "next/server"
import { getTokensFromCode } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")
    const staffId = request.nextUrl.searchParams.get("state")

    if (!code) {
      return NextResponse.redirect(new URL("/staff/settings?calendar=error", request.url))
    }

    const tokens = await getTokensFromCode(code)

    // Store refresh token - for now save to a simple JSON file or DB
    // In production, save to the staff user's record in PostgreSQL
    if (tokens.refresh_token) {
      try {
        const prisma = (await import("@/lib/prisma")).default
        // Store as a note or in a separate field - using notes for now
        if (staffId && staffId !== "unknown") {
          await prisma.user.update({
            where: { id: staffId },
            data: { avatarUrl: `gcal:${tokens.refresh_token}` }, // Temp: store in avatarUrl
          })
        }
      } catch (e) {
        console.error("[Google] Failed to save token:", e)
      }
    }

    return NextResponse.redirect(new URL("/staff/settings?calendar=connected", request.url))
  } catch (err: any) {
    console.error("[Google Callback] Error:", err.message)
    return NextResponse.redirect(new URL("/staff/settings?calendar=error", request.url))
  }
}
