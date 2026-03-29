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

    // Helper to resolve file path — checks persistent dir first, then public
    const resolveFilePath = async (fileUrl: string) => {
      const { access, readFile } = await import("fs/promises")
      const path = await import("path")
      const UPLOAD_ROOT = process.env.UPLOAD_DIR || "/var/www/uploads"

      // Path 1: Persistent upload dir (/var/www/uploads/companyId/file.pdf)
      if (fileUrl.startsWith("/uploads/")) {
        const relativePath = fileUrl.replace("/uploads/", "")
        const persistentPath = path.join(UPLOAD_ROOT, relativePath)
        try { await access(persistentPath); return await readFile(persistentPath) } catch {}

        // Path 2: Public dir (old location)
        const publicPath = path.join(process.cwd(), "public", fileUrl)
        try { await access(publicPath); return await readFile(publicPath) } catch {}
      }

      // Path 3: MinIO-style path (companyId/doctype-timestamp.ext)
      const persistentPath = path.join(UPLOAD_ROOT, fileUrl)
      try { await access(persistentPath); return await readFile(persistentPath) } catch {}

      const publicPath = path.join(process.cwd(), "public", "uploads", fileUrl)
      try { await access(publicPath); return await readFile(publicPath) } catch {}

      return null
    }

    // Get filename and mime type from document metadata
    const notesLine = doc.notes?.split("\n").find((l: string) => l.startsWith("file:"))
    const fileName = notesLine?.replace("file:", "") || doc.fileUrl.split("/").pop() || "document"
    const mimeLine = doc.notes?.split("\n").find((l: string) => l.startsWith("mime:"))
    const ext = fileName.split(".").pop()?.toLowerCase()
    const mimeType = mimeLine?.replace("mime:", "") ||
      (ext === "pdf" ? "application/pdf" :
       ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
       ext === "png" ? "image/png" :
       ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
       ext === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
       ext === "csv" ? "text/csv" :
       "application/octet-stream")

    // Try local file first
    const fileBuffer = await resolveFilePath(doc.fileUrl)
    if (fileBuffer) {
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "private, max-age=3600",
        },
      })
    }

    // Try MinIO presigned URL as last resort
    try {
      const { getMinioUrl } = await import("@/lib/minio")
      const presignedUrl = await getMinioUrl(doc.fileUrl)
      return NextResponse.redirect(presignedUrl)
    } catch {}

    return NextResponse.json({ error: "File not found. It may have been uploaded before the current storage was configured." }, { status: 404 })
  } catch (error) {
    return handleApiError(error)
  }
}
