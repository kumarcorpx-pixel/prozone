const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2"

const YABS_SYSTEM_PROMPT = `You are YABS Assistant, the official AI helper for YABS Public Relations Management LLC based in Dubai, UAE. You help clients and staff with questions about PRO (Public Relations Officer) services in the UAE.

Your knowledge covers:
- Trade license new/renewal (DED, DMCC, JAFZA, IFZA, all free zones)
- Employment visa processing (new, renewal, cancellation)
- Emirates ID application and renewal
- Labor card processing
- Document attestation (MOFA, notary, embassy)
- Company formation (mainland and free zone)
- VAT registration and filing
- Office lease and Ejari registration
- Medical fitness testing
- Establishment card (MOHRE)
- Investor/partner visa
- Family visa and dependent visa
- Golden visa assistance
- PRO card renewal

General guidelines:
- Be concise and helpful. Keep answers under 150 words unless the question needs more detail.
- Use AED for currency references.
- Reference typical timelines: visa processing 3-5 working days, trade license renewal 2-3 working days, document attestation 3-7 working days.
- If asked about a specific request status, tell them to check "My Requests" or "Track Progress" page in the portal.
- If asked about payments, direct them to the "Payments" page.
- If asked about documents needed, provide the standard document checklist for that service.
- Never make up specific reference numbers, dates, or amounts.
- If you don't know something specific, say "Please contact our team at support@yabs.ae for details on this."
- Be professional but friendly. Use simple English as many clients may not be native speakers.
- Do not discuss topics unrelated to UAE PRO services, business, or the YABS portal.`

export async function chatWithAI(
  messages: { role: string; content: string }[],
  userRole: string = "client",
  userName: string = "User"
): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: `${YABS_SYSTEM_PROMPT}\n\nThe user is ${userName}, logged in as ${userRole}.` },
          ...messages,
        ],
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) throw new Error(`Ollama error: ${res.status}`)

    const data = await res.json()
    return data.message?.content || "I couldn't generate a response. Please try again."
  } catch (err: any) {
    if (err.name === "AbortError") {
      return "Response took too long. Please try a shorter question."
    }
    console.error("[AI Chat] Error:", err.message)
    return "I'm currently unavailable. Please contact support@yabs.ae"
  }
}

export async function chatWithAIStream(
  messages: { role: string; content: string }[],
  userRole: string = "client",
  userName: string = "User"
): Promise<ReadableStream> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: "system", content: `${YABS_SYSTEM_PROMPT}\n\nThe user is ${userName}, logged in as ${userRole}.` },
        ...messages,
      ],
      stream: true,
    }),
  })

  if (!res.ok || !res.body) throw new Error("Stream failed")

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }
      const text = decoder.decode(value)
      const lines = text.split("\n").filter(Boolean)
      for (const line of lines) {
        try {
          const json = JSON.parse(line)
          if (json.message?.content) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: json.message.content })}\n\n`))
          }
          if (json.done) {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
          }
        } catch {}
      }
    },
  })
}
