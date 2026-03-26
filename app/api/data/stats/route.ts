import { NextRequest, NextResponse } from "next/server"
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
