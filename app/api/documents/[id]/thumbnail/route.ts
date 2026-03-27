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
    const doc = await prisma.document.findUnique({ where: { id }, select: { notes: true, fileUrl: true, mimeType: true } })

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Extract thumbnail path from notes (stored as "thumb:path")
    const thumbLine = doc.notes?.split("\n").find((l: string) => l.startsWith("thumb:"))
    const thumbPath = thumbLine?.replace("thumb:", "")

    if (thumbPath) {
      // Try MinIO presigned URL
      try {
        const { getMinioUrl } = await import("@/lib/minio")
        const url = await getMinioUrl(thumbPath)
        return NextResponse.redirect(url)
      } catch {}

      // Try local file
      if (thumbPath.startsWith("/uploads/")) {
        return NextResponse.redirect(new URL(thumbPath, request.url))
      }
    }

    // No thumbnail — generate on-the-fly from original if it's an image
    if (doc.fileUrl && doc.mimeType?.startsWith("image/")) {
      try {
        const { getMinioUrl } = await import("@/lib/minio")
        // Just redirect to original for now
        const url = await getMinioUrl(doc.fileUrl)
        return NextResponse.redirect(url)
      } catch {}
    }

    return NextResponse.json({ error: "No thumbnail available" }, { status: 404 })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
