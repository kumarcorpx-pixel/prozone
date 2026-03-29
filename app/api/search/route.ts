import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
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

    // Client scoping: restrict search results to client's companies
    const companyFilter = await getClientCompanyFilter(auth.user)
    const companyScope = companyFilter ? { id: { in: companyFilter } } : {}
    const employeeScope = companyFilter ? { companyId: { in: companyFilter } } : {}
    const documentScope = companyFilter ? { companyId: { in: companyFilter } } : {}

    const [companies, employees, documents] = await Promise.all([
      prisma.company.findMany({
        where: {
          AND: [
            companyScope,
            {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { licenseNumber: { contains: q, mode: "insensitive" } },
              ],
            },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.findMany({
        where: {
          AND: [
            employeeScope,
            { fullName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.findMany({
        where: {
          AND: [
            documentScope,
            {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { documentType: { contains: q, mode: "insensitive" } },
              ],
            },
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
