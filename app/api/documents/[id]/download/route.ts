import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

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

    // Client scoping: verify the document belongs to one of the client's companies
    const companyFilter = await getClientCompanyFilter(auth.user)
    if (companyFilter && doc.companyId && !companyFilter.includes(doc.companyId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If file is stored locally (starts with /uploads/)
    if (doc.fileUrl.startsWith("/uploads/")) {
      try {
        const { readFile } = await import("fs/promises")
        const path = await import("path")
        const filePath = path.join(process.cwd(), "public", doc.fileUrl)
        const fileBuffer = await readFile(filePath)

        // Get filename from notes or fileUrl
        const notesLine = doc.notes?.split("\n").find((l: string) => l.startsWith("file:"))
        const fileName = notesLine?.replace("file:", "") || doc.fileUrl.split("/").pop() || "document"

        // Get mime type from notes or guess from extension
        const mimeLine = doc.notes?.split("\n").find((l: string) => l.startsWith("mime:"))
        const ext = fileName.split(".").pop()?.toLowerCase()
        const mimeType = mimeLine?.replace("mime:", "") ||
          (ext === "pdf" ? "application/pdf" :
           ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
           ext === "png" ? "image/png" :
           "application/octet-stream")

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `inline; filename="${fileName}"`,
            "Cache-Control": "private, max-age=3600",
          },
        })
      } catch {
        return NextResponse.json({ error: "File not found on disk" }, { status: 404 })
      }
    }

    // Try MinIO presigned URL
    try {
      const { getMinioUrl } = await import("@/lib/minio")
      const presignedUrl = await getMinioUrl(doc.fileUrl)
      return NextResponse.redirect(presignedUrl)
    } catch {
      // MinIO failed — try reading from local fallback
      try {
        const { readFile } = await import("fs/promises")
        const path = await import("path")
        const filePath = path.join(process.cwd(), "public", "uploads", doc.fileUrl)
        const fileBuffer = await readFile(filePath)

        const notesLine = doc.notes?.split("\n").find((l: string) => l.startsWith("file:"))
        const fileName = notesLine?.replace("file:", "") || doc.fileUrl.split("/").pop() || "document"
        const mimeLine = doc.notes?.split("\n").find((l: string) => l.startsWith("mime:"))
        const ext = fileName.split(".").pop()?.toLowerCase()
        const mimeType = mimeLine?.replace("mime:", "") ||
          (ext === "pdf" ? "application/pdf" :
           ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
           ext === "png" ? "image/png" :
           "application/octet-stream")

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Disposition": `inline; filename="${fileName}"`,
            "Cache-Control": "private, max-age=3600",
          },
        })
      } catch {
        return NextResponse.json({ error: "File not accessible" }, { status: 404 })
      }
    }
  } catch (error) {
    return handleApiError(error)
  }
}
