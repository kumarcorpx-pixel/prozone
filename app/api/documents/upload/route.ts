import { NextRequest, NextResponse } from "next/server"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { onDocumentChange } from "@/lib/cache"
import { logAudit } from "@/lib/audit"
import { processDocument } from "@/lib/ocr"

async function runOcrAndUpdate(buffer: Buffer, docType: string, companyId: string, employeeId: string | null, expiryDate: string | null) {
  try {
    const { extractedData, documentType: detectedType } = await processDocument(buffer, "auto-detect")
    if (!extractedData) return { extractedData: null, detectedType }

    const updates: Record<string, any> = {}

    // Auto-populate company fields from OCR
    if (companyId && companyId !== "general") {
      if (detectedType === "trade-license") {
        const d = extractedData as any
        if (d.licenseNumber?.value) updates.licenseNumber = d.licenseNumber.value
        if (d.expiryDate?.value && !expiryDate) {
          try { const p = parseFlexDate(d.expiryDate.value); if (p) updates.licenseExpiry = p } catch {}
        }
        if (d.legalForm?.value) updates.legalForm = d.legalForm.value
      }
      if (detectedType === "establishment-card") {
        const d = extractedData as any
        if (d.cardNumber?.value) updates.establishmentCardNumber = d.cardNumber.value
        if (d.molNumber?.value) updates.molNumber = d.molNumber.value
        if (d.sponsorName?.value) updates.sponsorName = d.sponsorName.value
        if (d.sponsorEid?.value) updates.sponsorEid = d.sponsorEid.value
        if (d.expiryDate?.value && !expiryDate) {
          try { const p = parseFlexDate(d.expiryDate.value); if (p) updates.establishmentCardExpiry = p } catch {}
        }
      }
      if (detectedType === "ejari") {
        const d = extractedData as any
        if (d.contractNumber?.value) updates.ejariTawtheeqNumber = d.contractNumber.value
        if (d.expiryDate?.value && !expiryDate) {
          try { const p = parseFlexDate(d.expiryDate.value); if (p) updates.ejariTawtheeqExpiry = p } catch {}
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.company.update({ where: { id: companyId }, data: updates }).catch(() => {})
      }
    }

    // Auto-populate employee fields from OCR
    if (employeeId) {
      const empUpdates: Record<string, any> = {}
      if (detectedType === "passport") {
        const d = extractedData as any
        if (d.passportNumber?.value) empUpdates.passportNumber = d.passportNumber.value
        if (d.nationality?.value) empUpdates.nationality = d.nationality.value
        if (d.expiryDate?.value && !expiryDate) {
          try { const p = parseFlexDate(d.expiryDate.value); if (p) empUpdates.passportExpiry = p } catch {}
        }
      }
      if (detectedType === "emirates-id") {
        const d = extractedData as any
        if (d.idNumber?.value) empUpdates.emiratesId = d.idNumber.value
        if (d.nationality?.value) empUpdates.nationality = d.nationality.value
        if (d.expiryDate?.value && !expiryDate) {
          try { const p = parseFlexDate(d.expiryDate.value); if (p) empUpdates.emiratesIdExpiry = p } catch {}
        }
      }
      if (detectedType === "visa") {
        const d = extractedData as any
        if (d.visaNumber?.value) empUpdates.visaNumber = d.visaNumber.value
        if (d.expiryDate?.value && !expiryDate) {
          try { const p = parseFlexDate(d.expiryDate.value); if (p) empUpdates.visaExpiry = p } catch {}
        }
      }
      if (Object.keys(empUpdates).length > 0) {
        await prisma.employee.update({ where: { id: employeeId }, data: empUpdates }).catch(() => {})
      }
    }

    return { extractedData, detectedType }
  } catch (err) {
    console.error("[OCR] Processing failed:", err)
    return { extractedData: null, detectedType: docType }
  }
}

function parseFlexDate(dateStr: string): Date | null {
  // Handle DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const parts = dateStr.split(/[\/\-\.]/)
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number)
    if (y > 100) return new Date(y, m - 1, d)
    if (y > 25) return new Date(1900 + y, m - 1, d)
    return new Date(2000 + y, m - 1, d)
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

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
    let documentType = (formData.get("documentType") as string) || "other"
    const expiryDate = formData.get("expiryDate") as string | null
    const notes = (formData.get("notes") as string) || null

    // Normalize Labour → Labor (British/American spelling)
    if (documentType === "labour_card") documentType = "labor_card"

    // Auto-detect document type from filename if type is "other"
    if (documentType === "other") {
      const fn = (name || file.name).toLowerCase()
      if (fn.includes("trade") && fn.includes("licen")) documentType = "trade_license"
      else if (fn.includes("establishment") || fn.includes("estab")) documentType = "establishment_card"
      else if (fn.includes("ejari") || fn.includes("tawtheeq")) documentType = "ejari"
      else if (fn.includes("memorandum") || fn.includes("moa")) documentType = "moa"
      else if (fn.includes("power of attorney") || fn.includes("poa")) documentType = "poa"
      else if (fn.includes("labour") || fn.includes("labor")) documentType = "labor_card"
      else if (fn.includes("visa")) documentType = "visa"
      else if (fn.includes("emirates") && fn.includes("id")) documentType = "emirates_id"
      else if (fn.includes("passport")) documentType = "passport"
      else if (fn.includes("noc") || fn.includes("no objection")) documentType = "noc"
      else if (fn.includes("wps") || fn.includes("sif")) documentType = "wps"
      else if (fn.includes("insurance") || fn.includes("medical")) documentType = "medical_insurance"
      else if (fn.includes("immigration")) documentType = "immigration_card"
      else if (fn.includes("offer") && fn.includes("letter")) documentType = "offer_letter"
    }

    // Duplicate detection: check if same name + type + company/employee already exists
    try {
      const where: any = { name, documentType }
      if (companyId && companyId !== "general") where.companyId = companyId
      if (employeeId) where.employeeId = employeeId
      const existing = await prisma.document.findFirst({ where }).catch(() => null)
      if (existing) {
        return NextResponse.json({
          error: `Duplicate document: "${name}" (${documentType}) already exists. Delete the existing one first or rename this file.`,
          existingId: existing.id,
        }, { status: 409 })
      }
    } catch {}

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

      // Run OCR in background to extract document data
      const ocrResult = await runOcrAndUpdate(buffer, documentType, companyId, employeeId, expiryDate)

      // If OCR found an expiry date and none was provided, update the document record
      if (ocrResult.extractedData && !expiryDate) {
        const ed = ocrResult.extractedData as any
        if (ed.expiryDate?.value) {
          try {
            const parsed = parseFlexDate(ed.expiryDate.value)
            if (parsed) await prisma.document.update({ where: { id: doc.id }, data: { expiryDate: parsed } }).catch(() => {})
          } catch {}
        }
      }

      await onDocumentChange()
      logAudit(auth.user.id, "UPLOAD", "document", doc.id, { name, documentType, companyId }).catch(() => {})
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
        ocrData: ocrResult.extractedData,
        detectedType: ocrResult.detectedType,
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

    // Run OCR to extract document data
    const ocrResult = await runOcrAndUpdate(buffer, documentType, companyId, employeeId, expiryDate)

    if (ocrResult.extractedData && !expiryDate) {
      const ed = ocrResult.extractedData as any
      if (ed.expiryDate?.value) {
        try {
          const parsed = parseFlexDate(ed.expiryDate.value)
          if (parsed) await prisma.document.update({ where: { id: doc.id }, data: { expiryDate: parsed } }).catch(() => {})
        } catch {}
      }
    }

    await onDocumentChange()
    logAudit(auth.user.id, "UPLOAD", "document", doc.id, { name, documentType, companyId }).catch(() => {})
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
      ocrData: ocrResult.extractedData,
      detectedType: ocrResult.detectedType,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
