import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role")
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
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
    console.error("Failed to fetch users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
