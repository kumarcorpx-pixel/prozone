import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId")

    const documents = await prisma.document.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
    })

    const mapped = documents.map((d: any) => ({
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const d = await prisma.document.create({
      data: {
        companyId: body.company_id || body.companyId,
        employeeId: body.employee_id || body.employeeId,
        name: body.name,
        documentType: body.document_type || body.documentType,
        fileUrl: body.file_url || body.fileUrl,
        fileName: body.file_name || body.fileName,
        fileSize: body.file_size != null ? body.file_size : body.fileSize,
        mimeType: body.mime_type || body.mimeType,
        expiryDate: body.expiry_date || body.expiryDate,
        status: body.status || "valid",
        notes: body.notes,
      },
    })

    const mapped = {
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
    }

    return NextResponse.json(mapped)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
