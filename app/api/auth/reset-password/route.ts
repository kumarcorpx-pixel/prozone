import { NextResponse } from "next/server"
import { resetPasswordSchema } from "@/lib/validation/schemas"
import { rateLimit } from "@/lib/rate-limit"

const resetPasswordRateLimit = { maxRequests: 5, windowMs: 15 * 60 * 1000 }

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message)
      return NextResponse.json({ error: errors[0] }, { status: 400 })
    }

    const { token } = result.data

    // Rate limit by token
    const rateLimitResult = rateLimit(`reset-password:${token}`, resetPasswordRateLimit)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Placeholder for actual password reset logic
    // In production, this would verify the token and update the password
    // via Supabase or your auth provider

    return NextResponse.json({ message: "Password has been reset successfully." })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
