import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request)
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q) {
      return NextResponse.json(
        { error: "Search query parameter 'q' is required" },
        { status: 400 }
      )
    }

    const [companies, employees, documents] = await Promise.all([
      prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { licenseNumber: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.findMany({
        where: {
          fullName: { contains: q, mode: "insensitive" },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { documentType: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({ companies, employees, documents })
  } catch (error) {
    return handleApiError(error)
  }
}
