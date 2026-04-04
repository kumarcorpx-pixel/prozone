import { NextResponse } from "next/server"
import { resetPasswordSchema } from "@/lib/validation/schemas"
import { rateLimit } from "@/lib/rate-limit"
import prisma from "@/lib/prisma"
const bcrypt = require("bcryptjs")

const resetPasswordRateLimit = { maxRequests: 5, windowMs: 15 * 60 * 1000 }

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.issues.map((e: any) => e.message)
      return NextResponse.json({ error: errors[0] }, { status: 400 })
    }

    const { token, password } = result.data

    // Rate limit by token
    const rateLimitResult = rateLimit(`reset-password:${token}`, resetPasswordRateLimit)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      )
    }

    // Verify token hasn't expired
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: "Password has been reset successfully." })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
