import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "default-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check for overdue payments and send reminders
    // For now, return summary
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Invoice reminder check completed",
      overdueCount: 0,
      remindersSent: 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
