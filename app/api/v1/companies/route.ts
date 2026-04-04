import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { parsePagination, paginatedResponse, apiError } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const where: any = {}

    // Client can only see their own companies
    if (auth.user.role === "client") {
      where.createdById = auth.user.id
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { tradeName: { contains: search, mode: "insensitive" } },
        { licenseNumber: { contains: search, mode: "insensitive" } },
      ]
    }
    if (status && status !== "all") {
      where.status = status
    }

    const [data, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, tradeName: true, licenseNumber: true,
          licenseType: true, licenseExpiry: true, status: true, emirate: true,
          phone: true, email: true, address: true,
          _count: { select: { employees: true, documents: true } },
        },
      }),
      prisma.company.count({ where }),
    ])

    return paginatedResponse(data, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}
