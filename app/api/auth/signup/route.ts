import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { signupSchema } from "@/lib/validation/schemas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
    }

    await createUser(result.data.email, result.data.password, result.data.fullName, "client")
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
