import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-middleware"
import { sendTestNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  const result = await sendTestNotification()
  return NextResponse.json(result)
}
