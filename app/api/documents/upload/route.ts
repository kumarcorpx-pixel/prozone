import { NextRequest, NextResponse } from "next/server"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { onDocumentChange } from "@/lib/cache"

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
    const buffer = Buffer.from(await file.arrayBuffer())

    // Check if image — process with Sharp
    const { isImage, processImage } = await import("@/lib/image-processor")
    const imageFile = isImage(file.type)

    let uploadBuffer: any = buffer
    let uploadMime = file.type
    let uploadExt = file.name.split(".").pop() || "bin"
    let finalSize = file.size
    let thumbnailPath: string | null = null
    let compressionSaved = 0

    if (imageFile) {
      try {
        const processed = await processImage(buffer)
        uploadBuffer = processed.compressed
        uploadMime = "image/jpeg"
        uploadExt = "jpg"
        finalSize = processed.compressed.length
        compressionSaved = Math.round((1 - finalSize / file.size) * 100)

        // Upload thumbnail to MinIO
        try {
          const { uploadToMinio } = await import("@/lib/minio")
          const thumbPath = `${companyId}/thumb/${documentType}-${timestamp}.jpg`
          await uploadToMinio(processed.thumbnail, thumbPath, "image/jpeg")
          thumbnailPath = thumbPath
        } catch {}

        console.log(`[Upload] Image processed: ${file.name} — ${file.size} → ${finalSize} bytes (${compressionSaved}% saved)`)
      } catch (sharpErr) {
        console.error("[Upload] Sharp processing failed, using original:", sharpErr)
        // Fall back to original buffer
      }
    }

    const fileName = `${companyId}/${documentType}-${timestamp}.${uploadExt}`

    // Try MinIO first
    try {
      const { uploadToMinio } = await import("@/lib/minio")
      await uploadToMinio(uploadBuffer, fileName, uploadMime)

      const doc = await prisma.document.create({
        data: {
          name,
          companyId,
          employeeId: employeeId || null,
          documentType,
          fileUrl: fileName,
          fileName: file.name,
          fileSize: finalSize,
          mimeType: uploadMime,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status: "valid",
          notes: [
            notes,
            thumbnailPath ? `thumb:${thumbnailPath}` : null,
            compressionSaved > 0 ? `compressed:${compressionSaved}%` : null,
          ].filter(Boolean).join("\n") || null,
        },
      })

      await onDocumentChange()
      return NextResponse.json({
        success: true,
        id: doc.id,
        fileName: file.name,
        storedName: fileName,
        fileUrl: fileName,
        thumbnailUrl: thumbnailPath,
        fileSize: finalSize,
        originalSize: file.size,
        compressionSaved: `${compressionSaved}%`,
        mimeType: uploadMime,
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
    const localFileName = `${documentType}-${timestamp}.${uploadExt}`
    await writeFile(path.join(uploadDir, localFileName), uploadBuffer)

    // Save thumbnail locally too
    if (imageFile && thumbnailPath === null) {
      try {
        const processed = await processImage(buffer)
        const thumbDir = path.join(process.cwd(), "public", "uploads", companyId, "thumb")
        await mkdir(thumbDir, { recursive: true })
        const thumbFile = `${documentType}-${timestamp}.jpg`
        await writeFile(path.join(thumbDir, thumbFile), processed.thumbnail)
        thumbnailPath = `/uploads/${companyId}/thumb/${thumbFile}`
      } catch {}
    }

    const localFileUrl = `/uploads/${companyId}/${localFileName}`

    const doc = await prisma.document.create({
      data: {
        name,
        companyId,
        employeeId: employeeId || null,
        documentType,
        fileUrl: localFileUrl,
        fileName: file.name,
        fileSize: finalSize,
        mimeType: uploadMime,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: "valid",
        notes: [
          notes,
          thumbnailPath ? `thumb:${thumbnailPath}` : null,
          compressionSaved > 0 ? `compressed:${compressionSaved}%` : null,
        ].filter(Boolean).join("\n") || null,
      },
    })

    await onDocumentChange()
    return NextResponse.json({
      success: true,
      id: doc.id,
      fileName: file.name,
      storedName: fileName,
      fileUrl: localFileUrl,
      thumbnailUrl: thumbnailPath,
      fileSize: finalSize,
      originalSize: file.size,
      compressionSaved: `${compressionSaved}%`,
      mimeType: uploadMime,
      storage: "local",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
