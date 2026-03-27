import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { onDocumentChange } from "@/lib/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { company: { select: { name: true } }, employee: { select: { fullName: true } } },
    })
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      id: doc.id,
      name: doc.name,
      company_name: doc.company?.name,
      employee_name: doc.employee?.fullName,
      document_type: doc.documentType,
      file_url: doc.fileUrl,
      file_name: doc.fileName,
      file_size: doc.fileSize,
      mime_type: doc.mimeType,
      expiry_date: doc.expiryDate,
      status: doc.status,
      notes: doc.notes,
      created_at: doc.createdAt,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Delete from MinIO if file exists
    if (doc.fileUrl) {
      try {
        const { deleteFromMinio } = await import("@/lib/minio")
        await deleteFromMinio(doc.fileUrl)
      } catch (err) {
        console.error("[Delete] MinIO delete failed:", err)
      }
    }

    // Delete from DB
    await prisma.document.delete({ where: { id } })
    await onDocumentChange()
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
