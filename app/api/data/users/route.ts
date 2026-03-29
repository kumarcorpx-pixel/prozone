import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { cached, CK, TTL } from "@/lib/cache"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const role = request.nextUrl.searchParams.get("role")

    const fetchUsers = async () => {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      })
      return users.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        phone: u.phone,
        role: u.role,
        is_active: u.isActive,
        created_at: u.createdAt,
        updated_at: u.updatedAt,
      }))
    }

    if (!role) {
      const mapped = await cached(CK.users(), TTL.USERS, fetchUsers)
      return NextResponse.json(mapped)
    }

    const users = await prisma.user.findMany({
      where: { role: role as any },
      orderBy: { createdAt: "desc" },
    })
    const mapped = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.fullName,
      phone: u.phone,
      role: u.role,
      is_active: u.isActive,
      created_at: u.createdAt,
      updated_at: u.updatedAt,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
