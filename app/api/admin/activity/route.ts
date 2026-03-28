import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let activities: any[] = []
    try {
      activities = await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { fullName: true } } },
      })
    } catch {
      // If the query fails (e.g. relation mismatch on VPS), return empty
      return NextResponse.json({ activities: [] })
    }

    const mapped = activities.map((a: any) => ({
      id: a.id,
      message: `${a.user?.fullName || "System"} ${a.action}${a.entityType ? ` ${a.entityType}` : ""}`,
      time: getRelativeTime(a.createdAt),
      action: a.action,
    }))

    return NextResponse.json({ activities: mapped })
  } catch (error) {
    return handleApiError(error)
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
