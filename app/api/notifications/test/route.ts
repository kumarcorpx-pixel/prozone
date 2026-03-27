import { NextResponse } from "next/server"
import { sendTestNotification } from "@/lib/notifications"

export async function POST() {
  const result = await sendTestNotification()
  return NextResponse.json(result)
}
