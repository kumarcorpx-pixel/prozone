import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`client-dashboard:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch client data in parallel
    const [companies, activeCount, completedCount, documentsCount] =
      await Promise.all([
        prisma.company.findMany({
          where: { createdById: user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.serviceRequest.count({
          where: {
            clientId: user.id,
            status: { in: ["pending", "in_progress", "under_review"] },
          },
        }),
        prisma.serviceRequest.count({
          where: {
            clientId: user.id,
            status: "completed",
          },
        }),
        prisma.document.count({
          where: { company: { createdById: user.id } },
        }),
      ])

    // Get expiry alerts (documents expiring within 60 days)
    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    const expiryAlerts = await prisma.document.findMany({
      where: {
        company: { createdById: user.id },
        expiryDate: {
          not: null,
          lte: sixtyDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        company: { select: { name: true } },
      },
      orderBy: { expiryDate: "asc" },
    })

    return NextResponse.json({
      companies: companies || [],
      activeRequests: activeCount,
      completedRequests: completedCount,
      documents: documentsCount,
      expiryAlerts: expiryAlerts.map((alert: any) => ({
        id: alert.id,
        type: alert.documentType,
        companyName: alert.company?.name,
        expiresAt: alert.expiryDate?.toISOString(),
        daysLeft: alert.expiryDate
          ? Math.ceil((new Date(alert.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
