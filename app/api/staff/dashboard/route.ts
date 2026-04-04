import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`staff-dashboard:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!["pro_staff", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [assignedCount, pendingCount, completedTodayCount] = await Promise.all([
      prisma.serviceRequest.count({
        where: {
          assignedToId: user.id,
          status: { in: ["pending", "in_progress", "under_review"] },
        },
      }),
      prisma.serviceRequest.count({
        where: {
          assignedToId: user.id,
          status: "pending",
        },
      }),
      prisma.serviceRequest.count({
        where: {
          assignedToId: user.id,
          status: "completed",
          updatedAt: { gte: todayStart },
        },
      }),
    ])

    // Recent activity for this staff member
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Map activity log entries to the format the frontend expects
    const mappedActivity = (recentActivity || []).map((a: any) => {
      const createdAt = a.createdAt || a.created_at
      const diffMs = Date.now() - new Date(createdAt).getTime()
      const minutes = Math.floor(diffMs / 60000)
      let time = ""
      if (minutes < 60) time = `${minutes}m ago`
      else if (minutes < 1440) time = `${Math.floor(minutes / 60)}h ago`
      else time = `${Math.floor(minutes / 1440)}d ago`

      return {
        id: a.id,
        message: a.action || "Activity",
        time,
        type: a.entityType || "general",
        entityId: a.entityId,
      }
    })

    return NextResponse.json({
      assignedRequests: assignedCount,
      pendingTasks: pendingCount,
      completedToday: completedTodayCount,
      recentActivity: mappedActivity,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
