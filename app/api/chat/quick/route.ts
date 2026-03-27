import { NextRequest, NextResponse } from "next/server"
import { chatWithAI } from "@/lib/ai-chat"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`chat:${ip}`, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const { question, userRole, userName } = await request.json()
    if (!question) return NextResponse.json({ error: "Question required" }, { status: 400 })

    const response = await chatWithAI(
      [{ role: "user", content: question.substring(0, 500) }],
      userRole,
      userName
    )

    return NextResponse.json({ response })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
