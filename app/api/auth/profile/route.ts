import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const updates: any = {}
    if (body.fullName) updates.fullName = body.fullName
    if (body.phone !== undefined) updates.phone = body.phone

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      select: { id: true, email: true, fullName: true, phone: true, role: true },
    })

    return NextResponse.json({ success: true, user: {
      id: updated.id, email: updated.email, full_name: updated.fullName,
      phone: updated.phone, role: updated.role,
    }})
  } catch (error) { return handleApiError(error) }
}
