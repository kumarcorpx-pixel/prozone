import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const clientCompanies = await prisma.company.findMany({
      where: { createdById: auth.user.id },
      select: { id: true },
    })
    const companyIds = clientCompanies.map((c: any) => c.id)

    const [companies, employees, documents, activeRequests] = await Promise.all([
      companyIds.length,
      companyIds.length > 0
        ? prisma.employee.count({ where: { companyId: { in: companyIds } } })
        : 0,
      companyIds.length > 0
        ? prisma.document.count({ where: { companyId: { in: companyIds } } })
        : 0,
      prisma.serviceRequest
        .count({
          where: {
            clientId: auth.user.id,
            status: { in: ["pending", "in_progress", "under_review"] },
          },
        })
        .catch(() => 0),
    ])

    return NextResponse.json({ companies, employees, documents, activeRequests })
  } catch (error) {
    return handleApiError(error)
  }
}
