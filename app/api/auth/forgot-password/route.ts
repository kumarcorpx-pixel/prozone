import { NextResponse } from "next/server"
import { forgotPasswordSchema } from "@/lib/validation/schemas"
import { rateLimit } from "@/lib/rate-limit"
import prisma from "@/lib/prisma"
import crypto from "crypto"

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

    // Generate a password reset token and store it
    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken,
            resetTokenExpiry: resetExpiry,
          },
        })

        // Send email via Resend if configured
        if (process.env.RESEND_API_KEY) {
          try {
            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY)
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://corporatepro.cloud"

            await resend.emails.send({
              from: process.env.EMAIL_FROM || "YABS PRO <noreply@yabspro.com>",
              to: email,
              subject: "Reset Your Password",
              html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${siteUrl}/reset-password?token=${resetToken}">Reset Password</a>
                <p>This link expires in 1 hour.</p>
              `,
            })
          } catch {
            // Silently fail email send
          }
        }
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
