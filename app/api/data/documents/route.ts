import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { documentCreateSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { cached, CK, TTL, onDocumentChange } from "@/lib/cache"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response
  const user = auth.user

  try {
    const companyId = request.nextUrl.searchParams.get("companyId")
    const companyFilter = await getClientCompanyFilter(user)
    const isAdminOrStaff = user.role === "admin" || user.role === "pro_staff"

    const mapDocument = (d: any) => ({
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
    })

    if (isAdminOrStaff && !companyId) {
      const mapped = await cached(CK.documents(), TTL.DOCUMENTS, async () => {
        const documents = await prisma.document.findMany({
          orderBy: { createdAt: "desc" },
        })
        return documents.map(mapDocument)
      })
      return NextResponse.json(mapped)
    }

    const whereClause: any = {}
    if (companyId) whereClause.companyId = companyId
    if (companyFilter) whereClause.companyId = { in: companyFilter }

    const documents = await prisma.document.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { createdAt: "desc" },
    })
    const mapped = documents.map(mapDocument)

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const validation = validateBody(documentCreateSchema, {
      name: body.name,
      companyId: body.company_id || body.companyId,
      employeeId: body.employee_id || body.employeeId,
      documentType: body.document_type || body.documentType,
      expiryDate: body.expiry_date || body.expiryDate,
      notes: body.notes,
    })
    if (!validation.success) return validation.response

    const d = await prisma.document.create({
      data: {
        companyId: validation.data.companyId,
        employeeId: validation.data.employeeId || null,
        name: validation.data.name,
        documentType: validation.data.documentType,
        fileUrl: body.file_url || body.fileUrl,
        fileName: body.file_name || body.fileName,
        fileSize: body.file_size != null ? body.file_size : body.fileSize,
        mimeType: body.mime_type || body.mimeType,
        expiryDate: validation.data.expiryDate || null,
        status: body.status || "valid",
        notes: validation.data.notes || null,
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

    await onDocumentChange()
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
