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

function getRoleContext(userRole: string): string {
  switch (userRole) {
    case "admin":
      return "The user is an admin. They can manage companies, employees, documents, requests, invoices, staff, and clients. Help them with admin tasks like assigning requests to staff, managing users, generating invoices, and tracking expiry dates."
    case "pro_staff":
      return "The user is a PRO staff member. They handle assigned service requests. Help them with status updates, document requirements for specific services, government department processes, and checklist items."
    case "client":
      return "The user is a client. They can view their companies, submit service requests, upload documents, and track progress. Help them understand their request status, what documents they need to provide, and how to use the portal."
    default:
      return ""
  }
}

function getFallbackResponse(userRole: string): string {
  switch (userRole) {
    case "admin":
      return `I'm currently offline, but here are some quick actions you can take:\n\n- [Manage Requests](/admin/requests) - View and assign service requests\n- [Manage Companies](/admin/companies) - Add or edit companies\n- [Expiry Calendar](/admin/expiry-calendar) - Check upcoming expirations\n- [Invoices](/admin/invoices) - Generate and manage invoices\n- [Staff Management](/admin/staff) - Manage PRO staff assignments\n\nFor urgent issues, contact support@yabs.ae`
    case "pro_staff":
      return `I'm currently offline, but here are some quick actions you can take:\n\n- [My Assigned Requests](/staff/requests) - View your assigned requests\n- [Update Request Status](/staff/requests) - Update progress on requests\n- [Document Checklist](/staff/requests) - Check required documents\n\nFor urgent issues, contact support@yabs.ae`
    case "client":
      return `I'm currently offline, but here are some quick actions you can take:\n\n- [My Requests](/client/requests) - Track your service requests\n- [Submit New Request](/client/requests/new) - Create a new service request\n- [My Documents](/client/documents) - Upload or view documents\n- [My Companies](/client/companies) - View your company details\n\nFor urgent issues, contact support@yabs.ae`
    default:
      return `I'm currently offline. Please try again later or contact support@yabs.ae`
  }
}

export async function chatWithAI(
  messages: { role: string; content: string }[],
  userRole: string = "client",
  userName: string = "User"
): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const roleContext = getRoleContext(userRole)
    const systemContent = `${YABS_SYSTEM_PROMPT}\n\nThe user is ${userName}, logged in as ${userRole}.${roleContext ? `\n\n${roleContext}` : ""}`

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemContent },
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
    return getFallbackResponse(userRole)
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
        { role: "system", content: `${YABS_SYSTEM_PROMPT}\n\nThe user is ${userName}, logged in as ${userRole}.${getRoleContext(userRole) ? `\n\n${getRoleContext(userRole)}` : ""}` },
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
