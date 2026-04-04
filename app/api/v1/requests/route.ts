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
    const status = searchParams.get("status") || ""
    const companyId = searchParams.get("companyId") || ""

    const where: any = {}
    if (status && status !== "all") where.status = status
    if (companyId) where.companyId = companyId

    if (auth.user.role === "client") {
      where.clientId = auth.user.id
    } else if (auth.user.role === "pro_staff") {
      where.assignedToId = auth.user.id
    }

    const [data, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { id: true, name: true } },
          client: { select: { id: true, fullName: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}
