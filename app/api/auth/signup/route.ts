import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { signupSchema } from "@/lib/validation/schemas"
import { rateLimit, loginRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`signup:${ip}`, loginRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  try {
    const body = await request.json()
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const newUser = await createUser(result.data.email, result.data.password, result.data.fullName, "client")

    // If company_name is provided, auto-create a Company record
    const companyName = body.companyName || body.company_name
    if (companyName && companyName.trim()) {
      try {
        await prisma.company.create({
          data: {
            name: companyName.trim(),
            createdById: newUser.id,
            status: "active",
          },
        })
      } catch (companyErr) {
        console.error("[Signup] Failed to create company:", companyErr)
      }
    }

    // Send welcome email if SMTP or RESEND is configured
    if (process.env.SMTP_USER || process.env.RESEND_API_KEY) {
      try {
        await sendWelcomeEmail(result.data.fullName, result.data.email, "")
      } catch (emailErr) {
        console.error("[Signup] Failed to send welcome email:", emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    const message = err.message === "Invalid credentials" ? "Invalid credentials" : "Authentication failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
