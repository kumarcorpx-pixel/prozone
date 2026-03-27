import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    })

    const mapped = services.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      price: s.price,
      estimated_days: s.estimatedDays,
      is_active: s.isActive,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}
