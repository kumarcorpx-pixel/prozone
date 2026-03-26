import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId")
  try {
    const documents = await prisma.document.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(documents.map(d => ({
      id: d.id,
      company_id: d.companyId,
      employee_id: d.employeeId,
      name: d.name,
      document_type: d.documentType,
      file_url: d.fileUrl,
      file_name: d.fileName,
      file_size: d.fileSize,
      mime_type: d.mimeType,
      expiry_date: d.expiryDate,
      issue_date: d.issueDate,
      issuing_authority: d.issuingAuthority,
      reference_number: d.referenceNumber,
      reminder_days: d.reminderDays,
      status: d.status,
      notes: d.notes,
      uploaded_by: d.uploadedById,
      created_at: d.createdAt,
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
