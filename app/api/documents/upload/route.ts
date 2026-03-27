import { NextRequest, NextResponse } from "next/server"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`upload:${ip}`, uploadRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Use PDF, JPG, PNG, or DOCX" }, { status: 400 })
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 25MB" }, { status: 400 })
    }

    const name = (formData.get("name") as string) || file.name
    const companyId = (formData.get("companyId") as string) || "general"
    const employeeId = (formData.get("employeeId") as string) || null
    const documentType = (formData.get("documentType") as string) || "other"
    const expiryDate = formData.get("expiryDate") as string | null
    const notes = (formData.get("notes") as string) || null

    const timestamp = Date.now()
    const ext = file.name.split(".").pop()
    const fileName = `${companyId}/${documentType}-${timestamp}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    // Try MinIO first
    try {
      const { uploadToMinio } = await import("@/lib/minio")
      await uploadToMinio(buffer, fileName, file.type)

      const doc = await prisma.document.create({
        data: {
          name,
          companyId,
          employeeId: employeeId || null,
          documentType,
          fileUrl: fileName,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status: "valid",
          notes: notes || null,
        },
      })

      return NextResponse.json({
        success: true,
        id: doc.id,
        fileName: file.name,
        storedName: fileName,
        fileUrl: fileName,
        fileSize: file.size,
        mimeType: file.type,
        storage: "minio",
      })
    } catch (minioErr) {
      console.error("[Upload] MinIO failed, falling back to local:", minioErr)
    }

    // Fallback: local filesystem
    const { writeFile, mkdir } = await import("fs/promises")
    const path = await import("path")
    const uploadDir = path.join(process.cwd(), "public", "uploads", companyId)
    await mkdir(uploadDir, { recursive: true })
    const localFileName = `${documentType}-${timestamp}.${ext}`
    await writeFile(path.join(uploadDir, localFileName), buffer)

    const localFileUrl = `/uploads/${companyId}/${localFileName}`

    const doc = await prisma.document.create({
      data: {
        name,
        companyId,
        employeeId: employeeId || null,
        documentType,
        fileUrl: localFileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: "valid",
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      id: doc.id,
      fileName: file.name,
      storedName: fileName,
      fileUrl: localFileUrl,
      fileSize: file.size,
      mimeType: file.type,
      storage: "local",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
