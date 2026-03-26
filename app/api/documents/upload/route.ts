import { NextRequest, NextResponse } from "next/server"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`upload:${ip}`, uploadRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Use PDF, JPG, PNG, or DOCX" }, { status: 400 })
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 10MB" }, { status: 400 })
    }

    const companyId = formData.get("companyId") as string || "general"
    const docType = formData.get("documentType") as string || "other"
    const timestamp = Date.now()
    const ext = file.name.split(".").pop()
    const fileName = `${companyId}-${docType}-${timestamp}.${ext}`

    // Try Supabase Storage upload
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()
      const buffer = Buffer.from(await file.arrayBuffer())

      const { data, error } = await supabase.storage
        .from("documents")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(data.path)

      return NextResponse.json({
        success: true,
        fileName: file.name,
        storedName: fileName,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        mimeType: file.type,
      })
    }

    // Demo mode - return mock success
    return NextResponse.json({
      success: true,
      fileName: file.name,
      storedName: fileName,
      fileUrl: `/uploads/${fileName}`,
      fileSize: file.size,
      mimeType: file.type,
      demo: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 })
  }
}
