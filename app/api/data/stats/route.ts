import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const [companies, employees, requests, documents] = await Promise.all([
      prisma.company.count(),
      prisma.employee.count(),
      prisma.serviceRequest.count(),
      prisma.document.count(),
    ])

    return NextResponse.json({
      companies,
      employees,
      requests,
      documents,
      isReal: true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
