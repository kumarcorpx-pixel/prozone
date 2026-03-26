import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId")

    const documents = await prisma.document.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
    })

    const mapped = documents.map((d) => ({
      id: d.id,
      company_id: d.companyId,
      employee_id: d.employeeId,
      name: d.name,
      document_type: d.documentType,
      file_url: d.fileUrl,
      file_size: d.fileSize,
      expiry_date: d.expiryDate,
      status: d.status,
      notes: d.notes,
      created_at: d.createdAt,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}
