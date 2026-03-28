import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

const demoDashboard = {
  assignedRequests: 8,
  pendingTasks: 3,
  completedToday: 2,
  recentActivity: [
    { id: "act-1", type: "status_updated", description: "Visa renewal moved to In Progress", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: "act-2", type: "document_reviewed", description: "Reviewed passport copy for ABC Corp", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: "act-3", type: "request_completed", description: "Trade name reservation completed", createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  ],
}

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
      return NextResponse.json({ ...demoDashboard, demo: true })
    }

    if (!["staff", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [assignedCount, pendingCount, completedTodayCount] = await Promise.all([
      prisma.serviceRequest.count({
        where: {
          assignedTo: user.id,
          status: { in: ["pending", "in_progress", "under_review"] },
        },
      }),
      prisma.serviceRequest.count({
        where: {
          assignedTo: user.id,
          status: "pending",
        },
      }),
      prisma.serviceRequest.count({
        where: {
          assignedTo: user.id,
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

    return NextResponse.json({
      assignedRequests: assignedCount,
      pendingTasks: pendingCount,
      completedToday: completedTodayCount,
      recentActivity: recentActivity || [],
    })
  } catch (error) {
    return handleApiError(error)
  }
}
