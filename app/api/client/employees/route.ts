import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const companyId = request.nextUrl.searchParams.get("companyId")

    // Get client's company IDs
    const clientCompanies = await prisma.company.findMany({
      where: { createdById: auth.user.id },
      select: { id: true },
    })
    const companyIds = clientCompanies.map((c: any) => c.id)

    if (companyIds.length === 0) return NextResponse.json([])

    const where: any = { companyId: { in: companyIds } }
    if (companyId && companyIds.includes(companyId)) {
      where.companyId = companyId
    }

    const employees = await prisma.employee.findMany({
      where,
      include: { company: { select: { name: true } } },
      orderBy: { fullName: "asc" },
    })

    const mapped = employees.map((e: any) => ({
      id: e.id,
      company_id: e.companyId,
      company_name: e.company?.name,
      full_name: e.fullName,
      email: e.email,
      phone: e.phone,
      designation: e.designation,
      department: e.department,
      nationality: e.nationality,
      visa_status: e.visaStatus,
      visa_expiry: e.visaExpiry,
      emirates_id: e.emiratesId,
      emirates_id_expiry: e.emiratesIdExpiry,
      passport_number: e.passportNumber,
      passport_expiry: e.passportExpiry,
      status: e.status,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
