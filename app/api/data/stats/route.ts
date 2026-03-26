import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
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
