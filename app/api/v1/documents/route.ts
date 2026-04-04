import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { parsePagination, paginatedResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const companyId = searchParams.get("companyId") || ""
    const employeeId = searchParams.get("employeeId") || ""
    const documentType = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""

    const where: any = {}
    if (companyId) where.companyId = companyId
    if (employeeId) where.employeeId = employeeId
    if (documentType) where.documentType = documentType
    if (status && status !== "all") where.status = status

    if (auth.user.role === "client") {
      const clientCompanies = await prisma.company.findMany({
        where: { createdById: auth.user.id },
        select: { id: true },
      })
      where.companyId = { in: clientCompanies.map(c => c.id) }
    }

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { id: true, name: true } },
          employee: { select: { id: true, fullName: true } },
          uploadedBy: { select: { id: true, fullName: true } },
        },
      }),
      prisma.document.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}
