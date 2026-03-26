import { NextResponse } from "next/server"
import { serviceCatalog } from "@/lib/service-catalog"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Try database first
    const services = await prisma.service.findMany({
      orderBy: { category: "asc" },
    })

    if (services && services.length > 0) {
      return NextResponse.json({ services })
    }

    // Fallback to service catalog
    return NextResponse.json({ services: serviceCatalog })
  } catch {
    // Fallback to service catalog on any error
    return NextResponse.json({ services: serviceCatalog })
  }
}
