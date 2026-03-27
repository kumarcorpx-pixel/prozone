import { NextRequest, NextResponse } from "next/server"
import { chatWithAI } from "@/lib/ai-chat"
import { rateLimit } from "@/lib/rate-limit"
import { chatMessageSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`chat:${ip}`, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const validation = validateBody(chatMessageSchema, body)
    if (!validation.success) return validation.response

    const response = await chatWithAI(
      [{ role: "user", content: validation.data.question.substring(0, 500) }],
      validation.data.userRole,
      validation.data.userName
    )

    return NextResponse.json({ response })
  } catch (error) {
    return handleApiError(error)
  }
}
