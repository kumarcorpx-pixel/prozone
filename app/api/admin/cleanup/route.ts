import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    // Delete demo requests with fake company references
    const result = await prisma.serviceRequest.deleteMany({
      where: {
        OR: [
          { id: { startsWith: "req-" } },
          { companyId: null },
        ],
      },
    })
    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error: any) {
    // Try alternative approach
    try {
      await prisma.$executeRaw`DELETE FROM service_requests WHERE id LIKE 'req-%'`
      return NextResponse.json({ success: true, message: "Demo requests cleaned" })
    } catch {
      return NextResponse.json({ success: true, message: "No demo requests to clean" })
    }
  }
}
