import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    // Get client's company IDs
    const clientCompanies = await prisma.company.findMany({
      where: { createdById: auth.user.id },
      select: { id: true },
    })
    const companyIds = clientCompanies.map((c: any) => c.id)

    if (companyIds.length === 0) return NextResponse.json([])

    const where: any = { companyId: { in: companyIds } }

    const documents = await prisma.document.findMany({
      where,
      include: {
        company: { select: { name: true } },
        employee: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const mapped = documents.map((d: any) => ({
      id: d.id,
      company_id: d.companyId,
      company_name: d.company?.name,
      employee_id: d.employeeId,
      employee_name: d.employee?.fullName,
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
      created_at: d.createdAt,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
