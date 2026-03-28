import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const companies = await prisma.company.findMany({
      where: { createdById: auth.user.id },
      orderBy: { name: "asc" },
    })
    const mapped = companies.map((c: any) => ({
      id: c.id,
      name: c.name,
      trade_name: c.tradeName,
      license_number: c.licenseNumber,
      license_type: c.licenseType,
      license_expiry: c.licenseExpiry,
      legal_form: c.legalForm,
      status: c.status,
      emirate: c.emirate,
      phone: c.phone,
      email: c.email,
      industry: c.industry,
      visa_quota_total: c.visaQuotaTotal,
      visa_quota_used: c.visaQuotaUsed,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
