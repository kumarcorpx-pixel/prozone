import { NextRequest, NextResponse } from "next/server"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { onDocumentChange } from "@/lib/cache"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
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

      const docData: any = {
          name,
          documentType,
          fileUrl: fileName,
          fileSize: finalSize,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status: "valid",
          notes: [
            notes,
            `file:${file.name}`,
            `mime:${uploadMime}`,
            thumbnailPath ? `thumb:${thumbnailPath}` : null,
            compressionSaved > 0 ? `compressed:${compressionSaved}%` : null,
          ].filter(Boolean).join("\n") || null,
      }
      // Use connect for relations (works with both schema versions)
      if (companyId && companyId !== "general") docData.companyId = companyId
      if (employeeId) docData.employeeId = employeeId
      // Try adding fileName/mimeType (may not exist in VPS schema)
      try { docData.fileName = file.name; docData.mimeType = uploadMime } catch {}

      const doc = await prisma.document.create({ data: docData }).catch(async (err: any) => {
        // Retry without optional fields if they don't exist in schema
        if (err.message?.includes("fileName") || err.message?.includes("mimeType")) {
          delete docData.fileName
          delete docData.mimeType
          return prisma.document.create({ data: docData })
        }
        // Retry with connect syntax if direct ID fails
        if (err.message?.includes("companyId") || err.message?.includes("employeeId")) {
          delete docData.companyId
          delete docData.employeeId
          if (companyId && companyId !== "general") docData.company = { connect: { id: companyId } }
          if (employeeId) docData.employee = { connect: { id: employeeId } }
          return prisma.document.create({ data: docData })
        }
        throw err
      })

      // Auto-populate expiry fields
      if (expiryDate && companyId && companyId !== "general") {
        if (documentType === "trade_license") {
          await prisma.company.update({ where: { id: companyId }, data: { licenseExpiry: new Date(expiryDate) } }).catch(() => {})
        }
      }
      if (expiryDate && employeeId) {
        const expiryField: Record<string, string> = {
          visa: "visaExpiry",
          emirates_id: "emiratesIdExpiry",
          passport: "passportExpiry",
          labor_card: "laborCardExpiry",
        }
        const field = expiryField[documentType]
        if (field) {
          await prisma.employee.update({ where: { id: employeeId }, data: { [field]: new Date(expiryDate) } }).catch(() => {})
        }
      }

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

    const localDocData: any = {
        name,
        documentType,
        fileUrl: localFileUrl,
        fileSize: finalSize,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: "valid",
        notes: [
          notes,
          `file:${file.name}`,
          `mime:${uploadMime}`,
          thumbnailPath ? `thumb:${thumbnailPath}` : null,
          compressionSaved > 0 ? `compressed:${compressionSaved}%` : null,
        ].filter(Boolean).join("\n") || null,
    }
    if (companyId && companyId !== "general") localDocData.companyId = companyId
    if (employeeId) localDocData.employeeId = employeeId

    const doc = await prisma.document.create({ data: localDocData }).catch(async (err: any) => {
      if (err.message?.includes("companyId") || err.message?.includes("employeeId")) {
        delete localDocData.companyId
        delete localDocData.employeeId
        if (companyId && companyId !== "general") localDocData.company = { connect: { id: companyId } }
        if (employeeId) localDocData.employee = { connect: { id: employeeId } }
        return prisma.document.create({ data: localDocData })
      }
      throw err
    })

    // Auto-populate expiry fields
    if (expiryDate && companyId && companyId !== "general") {
      if (documentType === "trade_license") {
        await prisma.company.update({ where: { id: companyId }, data: { licenseExpiry: new Date(expiryDate) } }).catch(() => {})
      }
    }
    if (expiryDate && employeeId) {
      const expiryField: Record<string, string> = {
        visa: "visaExpiry",
        emirates_id: "emiratesIdExpiry",
        passport: "passportExpiry",
        labor_card: "laborCardExpiry",
      }
      const field = expiryField[documentType]
      if (field) {
        await prisma.employee.update({ where: { id: employeeId }, data: { [field]: new Date(expiryDate) } }).catch(() => {})
      }
    }

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
