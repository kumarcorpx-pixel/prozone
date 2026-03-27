// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

async function getRevenueReport() {
  // Monthly revenue grouped by month using raw SQL since Prisma groupBy doesn't support date_trunc
  const monthlyRevenue: any[] = await prisma.$queryRaw`
    SELECT
      TO_CHAR(created_at, 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) AS collected,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) AS pending,
      COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END), 0) AS overdue,
      COALESCE(SUM(subtotal), 0) AS subtotal,
      COALESCE(SUM(vat_amount), 0) AS vat_amount,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM invoices
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month DESC
    LIMIT 12
  `

  return monthlyRevenue.map((row) => ({
    month: row.month,
    revenue: Number(row.revenue),
    collected: Number(row.collected),
    pending: Number(row.pending),
    overdue: Number(row.overdue),
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
  }))
}

async function getServiceReport() {
  const services = await prisma.serviceRequest.groupBy({
    by: ["serviceType"],
    _count: { id: true },
    where: { serviceType: { not: null } },
  })

  const completedByType = await prisma.serviceRequest.groupBy({
    by: ["serviceType"],
    _count: { id: true },
    where: { status: "completed", serviceType: { not: null } },
  })

  // Average processing time for completed requests by service type
  const avgTimes: any[] = await prisma.$queryRaw`
    SELECT
      service_type,
      AVG(EXTRACT(EPOCH FROM (completed_date - created_at)) / 86400) AS avg_days
    FROM service_requests
    WHERE status = 'completed' AND completed_date IS NOT NULL AND service_type IS NOT NULL
    GROUP BY service_type
  `

  const completedMap = new Map(
    completedByType.map((c) => [c.serviceType, c._count.id])
  )
  const avgTimeMap = new Map(
    avgTimes.map((a) => [a.service_type, Number(a.avg_days)])
  )

  return services.map((s) => {
    const total = s._count.id
    const completed = completedMap.get(s.serviceType) || 0
    const rate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0
    const avgDays = Math.round((avgTimeMap.get(s.serviceType) || 0) * 10) / 10
    return {
      service: s.serviceType,
      requests: total,
      completed,
      completion_rate: `${rate}%`,
      avg_processing_days: avgDays,
    }
  })
}

async function getClientReport() {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      createdById: true,
      _count: {
        select: { serviceRequests: true },
      },
    },
  })

  // Sum invoices per company via service requests
  const invoiceSums: any[] = await prisma.$queryRaw`
    SELECT
      sr.company_id,
      COALESCE(SUM(i.total_amount), 0) AS total_billed
    FROM invoices i
    JOIN service_requests sr ON sr.id = i.request_id
    WHERE sr.company_id IS NOT NULL
    GROUP BY sr.company_id
  `

  const billedMap = new Map(
    invoiceSums.map((r) => [r.company_id, Number(r.total_billed)])
  )

  return companies.map((c) => ({
    client: c.name,
    status: c.status,
    requests: c._count.serviceRequests,
    total_billed: billedMap.get(c.id) || 0,
  }))
}

async function getStaffReport() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const staff = await prisma.user.findMany({
    where: { role: "pro_staff" },
    select: {
      id: true,
      fullName: true,
      _count: {
        select: {
          assignedRequests: true,
        },
      },
    },
  })

  // Completed this month per staff
  const completedThisMonth = await prisma.serviceRequest.groupBy({
    by: ["assignedToId"],
    _count: { id: true },
    where: {
      status: "completed",
      completedDate: { gte: startOfMonth },
      assignedToId: { not: null },
    },
  })

  // Avg processing time per staff
  const avgTimes: any[] = await prisma.$queryRaw`
    SELECT
      assigned_to,
      AVG(EXTRACT(EPOCH FROM (completed_date - created_at)) / 86400) AS avg_days
    FROM service_requests
    WHERE status = 'completed' AND completed_date IS NOT NULL AND assigned_to IS NOT NULL
    GROUP BY assigned_to
  `

  const completedMap = new Map(
    completedThisMonth.map((c) => [c.assignedToId, c._count.id])
  )
  const avgTimeMap = new Map(
    avgTimes.map((a) => [a.assigned_to, Number(a.avg_days)])
  )

  return staff.map((s) => ({
    staff: s.fullName,
    active_requests: s._count.assignedRequests,
    completed_this_month: completedMap.get(s.id) || 0,
    avg_days: Math.round((avgTimeMap.get(s.id) || 0) * 10) / 10,
  }))
}

async function getSummaryStats() {
  const [totalRevenueResult, activeClients, totalRequests, completedRequests] =
    await Promise.all([
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
        where: { status: "paid" },
      }),
      prisma.company.count({ where: { status: "active" } }),
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: "completed" } }),
    ])

  // Avg processing time
  const avgTime: any[] = await prisma.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM (completed_date - created_at)) / 86400) AS avg_days
    FROM service_requests
    WHERE status = 'completed' AND completed_date IS NOT NULL
  `

  const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0)
  const completionRate =
    totalRequests > 0
      ? Math.round((completedRequests / totalRequests) * 1000) / 10
      : 0
  const avgDays = Math.round(Number(avgTime[0]?.avg_days || 0))

  return {
    totalRevenue,
    activeClients,
    completionRate,
    avgProcessingDays: avgDays,
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-reports:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"

    const result: Record<string, any> = {}

    if (type === "summary" || type === "all") {
      result.summary = await getSummaryStats()
    }
    if (type === "revenue" || type === "all") {
      result.revenue = await getRevenueReport()
    }
    if (type === "service" || type === "all") {
      result.service = await getServiceReport()
    }
    if (type === "client" || type === "all") {
      result.client = await getClientReport()
    }
    if (type === "staff" || type === "all") {
      result.staff = await getStaffReport()
    }

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
