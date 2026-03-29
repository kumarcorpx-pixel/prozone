import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { cached, CK, TTL, onUserChange } from "@/lib/cache"
import { logAudit } from "@/lib/audit"

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
    const { id, fullName, phone, isActive, password, role } = body

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const data: any = {}
    if (fullName !== undefined) data.fullName = fullName
    if (phone !== undefined) data.phone = phone
    if (isActive !== undefined) data.isActive = isActive
    if (password) {
      if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
      data.password = await bcrypt.hash(password, 12)
    }
    if (role && ["admin", "pro_staff", "client"].includes(role)) data.role = role

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

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { email, password, fullName, phone, role } = body

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (!["admin", "pro_staff", "client"].includes(role)) {
      return NextResponse.json({ error: "Role must be admin, pro_staff, or client" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        fullName,
        phone: phone || null,
        role: role as any,
        isActive: true,
      },
    })

    await onUserChange()
    logAudit(auth.user.id, "CREATE_USER", "user", user.id, { email, role }).catch(() => {})

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
      is_active: user.isActive,
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "User id is required" }, { status: 400 })

    if (id === auth.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { email: true, role: true } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await prisma.user.delete({ where: { id } })
    await onUserChange()
    logAudit(auth.user.id, "DELETE_USER", "user", id, { email: user.email, role: user.role }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
