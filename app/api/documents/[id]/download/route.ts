import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const doc = await prisma.document.findUnique({ where: { id } })

    if (!doc || !doc.fileUrl) {
      return NextResponse.json({ error: "Document not found or no file attached" }, { status: 404 })
    }

    const { getMinioUrl } = await import("@/lib/minio")
    const presignedUrl = await getMinioUrl(doc.fileUrl)
    return NextResponse.redirect(presignedUrl)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
