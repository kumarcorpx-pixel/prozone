import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"

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
    console.error("Failed to fetch stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
