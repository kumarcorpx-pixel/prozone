import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { category: "asc" },
    })
    return NextResponse.json(services.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      price: s.price,
      estimated_days: s.estimatedDays,
      is_active: s.isActive,
      created_at: s.createdAt,
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
