import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString("en-GB")
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const userFilter = request.nextUrl.searchParams.get("user")
    const actionFilter = request.nextUrl.searchParams.get("action")

    const where: any = {}
    if (userFilter) where.userId = userFilter
    if (actionFilter) where.action = actionFilter

    try {
      const activities = await prisma.activityLog.findMany({
        where,
        include: { user: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      })

      const mapped = activities.map((a: any) => ({
        id: a.id,
        user_id: a.userId,
        user_name: a.user?.fullName || null,
        user_role: a.user?.role || null,
        action: a.action,
        entity_type: a.entityType,
        entity_id: a.entityId,
        details: a.details,
        created_at: a.createdAt,
        time: getRelativeTime(a.createdAt),
        message: `${a.action || "Action"}${a.entityType ? ` on ${a.entityType}` : ""}`,
      }))

      return NextResponse.json({ data: mapped })
    } catch {
      return NextResponse.json({ data: [] })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
