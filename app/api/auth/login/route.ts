import { NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { rateLimit, loginRateLimit } from "@/lib/rate-limit"
import { loginSchema } from "@/lib/validation/schemas"
import { logAudit } from "@/lib/audit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`login:${ip}`, loginRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    const { token, user } = await authenticateUser(result.data.email, result.data.password)

    logAudit(user.id, "LOGIN", "user", user.id, { email: user.email }).catch(() => {})

    const response = NextResponse.json({ success: true, user, token })
    // Set HTTP-only cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours — matches JWT expiry
    })

    return response
  } catch (err: any) {
    const message = err.message === "Invalid credentials" ? "Invalid credentials" : "Authentication failed"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
