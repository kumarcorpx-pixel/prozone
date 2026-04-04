import { NextRequest, NextResponse } from "next/server"
import { processDocument } from "@/lib/ocr"
import { rateLimit, uploadRateLimit } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`ocr:${ip}`, uploadRateLimit)
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = (formData.get("documentType") as string) || "auto-detect"

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await processDocument(buffer, documentType)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return handleApiError(error)
  }
}
