import { NextResponse } from "next/server"
import { forgotPasswordSchema } from "@/lib/validation/schemas"
import { rateLimit } from "@/lib/rate-limit"

const forgotPasswordRateLimit = { maxRequests: 3, windowMs: 15 * 60 * 1000 }

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      // Still return success to prevent email enumeration
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
    }

    const { email } = result.data

    // Rate limit by email
    const rateLimitResult = rateLimit(`forgot-password:${email}`, forgotPasswordRateLimit)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Attempt to send reset email via Supabase if configured
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://corporatepro.cloud"}/reset-password`,
        })
      }
    } catch {
      // Silently fail - don't reveal if email exists
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
  } catch {
    return NextResponse.json({ message: "If an account exists, a reset link has been sent." })
  }
}
