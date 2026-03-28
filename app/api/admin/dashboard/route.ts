import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

const demoStats = {
  companies: 24,
  employees: 156,
  activeRequests: 18,
  completedRequests: 243,
  documents: 412,
  revenue: {
    thisMonth: 145000,
    lastMonth: 128000,
    currency: "AED",
  },
  recentActivity: [
    { id: "act-1", type: "request_created", description: "New visa renewal request from ABC Corp", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: "act-2", type: "request_completed", description: "Trade license renewal completed for XYZ LLC", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: "act-3", type: "document_uploaded", description: "Passport copy uploaded for employee John Doe", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  ],
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-dashboard:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return NextResponse.json({ ...demoStats, demo: true })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch counts safely
    const safeCount = async (fn: () => Promise<number>) => {
      try { return await fn() } catch { return 0 }
    }

    const [companiesCount, employeesCount, activeReqCount, completedReqCount, documentsCount] =
      await Promise.all([
        safeCount(() => prisma.company.count()),
        safeCount(() => prisma.employee.count()),
        safeCount(() => prisma.serviceRequest.count({
          where: { status: { in: ["pending", "in_progress", "under_review"] } },
        })),
        safeCount(() => prisma.serviceRequest.count({
          where: { status: "completed" },
        })),
        safeCount(() => prisma.document.count()),
      ])

    // Fetch revenue safely
    let revenueData = { total: 0, paid: 0, pending: 0, overdue: 0 }
    try {
      const [totalRevenue, paidRevenue, pendingRevenue, overdueRevenue] = await Promise.all([
        prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "paid" } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "pending" } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "overdue" } }),
      ])
      revenueData = {
        total: Number(totalRevenue._sum.totalAmount || 0),
        paid: Number(paidRevenue._sum.totalAmount || 0),
        pending: Number(pendingRevenue._sum.totalAmount || 0),
        overdue: Number(overdueRevenue._sum.totalAmount || 0),
      }
    } catch {
      // Revenue queries failed, use defaults
    }

    // Recent activity
    let recentActivity: any[] = []
    try {
      recentActivity = await prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    } catch {
      // ActivityLog query failed, use empty array
    }

    return NextResponse.json({
      companies: companiesCount,
      employees: employeesCount,
      activeRequests: activeReqCount,
      completedRequests: completedReqCount,
      documents: documentsCount,
      revenue: {
        ...revenueData,
        currency: "AED",
      },
      recentActivity,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
