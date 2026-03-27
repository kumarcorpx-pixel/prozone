import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

    // Fetch counts and revenue in parallel
    const [companiesCount, employeesCount, activeReqCount, completedReqCount, documentsCount, totalRevenue, paidRevenue, pendingRevenue, overdueRevenue] =
      await Promise.all([
        prisma.company.count(),
        prisma.employee.count(),
        prisma.serviceRequest.count({
          where: { status: { in: ["pending", "in_progress", "under_review"] } },
        }),
        prisma.serviceRequest.count({
          where: { status: "completed" },
        }),
        prisma.document.count(),
        prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "paid" } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "pending" } }),
        prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: "overdue" } }),
      ])

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({
      companies: companiesCount,
      employees: employeesCount,
      activeRequests: activeReqCount,
      completedRequests: completedReqCount,
      documents: documentsCount,
      revenue: {
        total: Number(totalRevenue._sum.totalAmount || 0),
        paid: Number(paidRevenue._sum.totalAmount || 0),
        pending: Number(pendingRevenue._sum.totalAmount || 0),
        overdue: Number(overdueRevenue._sum.totalAmount || 0),
        currency: "AED",
      },
      recentActivity: recentActivity || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
