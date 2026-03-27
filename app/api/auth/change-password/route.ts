// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"
const bcrypt = require("bcryptjs")

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) return NextResponse.json({ error: "Both passwords required" }, { status: 400 })
    if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, dbUser.password)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

    const hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } })

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch (error) { return handleApiError(error) }
}
