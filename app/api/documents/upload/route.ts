import { NextRequest, NextResponse } from "next/server"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
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

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 10MB" }, { status: 400 })
    }

    const companyId = (formData.get("companyId") as string) || "general"
    const docType = (formData.get("documentType") as string) || "other"
    const timestamp = Date.now()
    const ext = file.name.split(".").pop()
    const fileName = `${companyId}/${docType}-${timestamp}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    // Try MinIO first
    try {
      const { uploadToMinio } = await import("@/lib/minio")
      const fileUrl = await uploadToMinio(buffer, fileName, file.type)
      return NextResponse.json({
        success: true,
        fileName: file.name,
        storedName: fileName,
        fileUrl,
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
    const localFileName = `${docType}-${timestamp}.${ext}`
    await writeFile(path.join(uploadDir, localFileName), buffer)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      storedName: fileName,
      fileUrl: `/uploads/${companyId}/${localFileName}`,
      fileSize: file.size,
      mimeType: file.type,
      storage: "local",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 })
  }
}
