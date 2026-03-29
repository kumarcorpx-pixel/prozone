import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { cached, CK, TTL, onUserChange } from "@/lib/cache"

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

export async function PATCH(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { id, fullName, phone, isActive } = body

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const data: any = {}
    if (fullName !== undefined) data.fullName = fullName
    if (phone !== undefined) data.phone = phone
    if (isActive !== undefined) data.isActive = isActive

    const updated = await prisma.user.update({
      where: { id },
      data,
    })

    await onUserChange()

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName,
      phone: updated.phone,
      role: updated.role,
      is_active: updated.isActive,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
