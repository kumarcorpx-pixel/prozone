import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["admin", "pro_staff"] },
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
      },
      orderBy: { fullName: "asc" },
    })

    const mapped = users.map((u: any) => ({
      id: u.id,
      full_name: u.fullName,
      phone: u.phone,
      role: u.role,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
