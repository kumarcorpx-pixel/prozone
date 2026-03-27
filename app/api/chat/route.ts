import { NextRequest, NextResponse } from "next/server"
import { chatWithAIStream } from "@/lib/ai-chat"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`chat:${ip}`, { maxRequests: 30, windowMs: 60 * 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 })
  }

  try {
    const { messages, userRole, userName } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 })
    }
    if (messages.length > 20) {
      return NextResponse.json({ error: "Too many messages" }, { status: 400 })
    }

    const stream = await chatWithAIStream(messages, userRole, userName)

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Chat failed" }, { status: 500 })
  }
}
