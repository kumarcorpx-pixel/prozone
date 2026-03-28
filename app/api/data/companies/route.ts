import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import { companySchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"
import { cached, CK, TTL, onCompanyChange } from "@/lib/cache"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const validation = validateBody(companySchema, body)
    if (!validation.success) return validation.response

    const company = await prisma.company.create({
      data: {
        name: validation.data.name,
        tradeName: body.trade_name || body.tradeName,
        licenseNumber: body.license_number || body.licenseNumber,
        licenseType: validation.data.licenseType,
        emirate: validation.data.emirate,
        phone: validation.data.phone,
        email: validation.data.email,
        status: body.status || "active",
        jurisdiction: body.jurisdiction,
        freeZone: body.free_zone || body.freeZone,
        address: body.address,
        industry: body.industry,
        notes: body.notes,
        legalForm: body.legal_form || body.legalForm,
        visaQuotaTotal: body.visa_quota_total != null ? body.visa_quota_total : body.visaQuotaTotal,
        visaQuotaUsed: body.visa_quota_used != null ? body.visa_quota_used : body.visaQuotaUsed,
      },
    })

    const mapped = {
      id: company.id,
      name: company.name,
      trade_name: company.tradeName,
      license_number: company.licenseNumber,
      license_type: company.licenseType,
      license_expiry: company.licenseExpiry,
      legal_form: company.legalForm,
      status: company.status,
      emirate: company.emirate,
      jurisdiction: company.jurisdiction,
      free_zone: company.freeZone,
      address: company.address,
      phone: company.phone,
      email: company.email,
      industry: company.industry,
      activities: company.activities,
      notes: company.notes,
      visa_quota_total: company.visaQuotaTotal,
      visa_quota_used: company.visaQuotaUsed,
      created_at: company.createdAt,
    }

    await onCompanyChange()
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response
  const user = auth.user

  try {
    const companyFilter = await getClientCompanyFilter(user)
    const isAdminOrStaff = user.role === "admin" || user.role === "pro_staff"

    const mapCompany = (c: any) => ({
      id: c.id,
      name: c.name,
      trade_name: c.tradeName,
      license_number: c.licenseNumber,
      license_type: c.licenseType,
      license_expiry: c.licenseExpiry,
      legal_form: c.legalForm,
      status: c.status,
      emirate: c.emirate,
      jurisdiction: c.jurisdiction,
      free_zone: c.freeZone,
      address: c.address,
      phone: c.phone,
      email: c.email,
      industry: c.industry,
      activities: c.activities,
      notes: c.notes,
      visa_quota_total: c.visaQuotaTotal,
      visa_quota_used: c.visaQuotaUsed,
      created_at: c.createdAt,
      created_by: c.createdById,
      owner_name: c.createdBy?.fullName || null,
    })

    if (isAdminOrStaff) {
      const mapped = await cached(CK.companies(), TTL.COMPANIES, async () => {
        const companies = await prisma.company.findMany({
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { fullName: true } } },
        })
        return companies.map(mapCompany)
      })
      return NextResponse.json(mapped)
    }

    const companies = await prisma.company.findMany({
      where: companyFilter ? { id: { in: companyFilter } } : undefined,
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { fullName: true } } },
    })
    const mapped = companies.map(mapCompany)

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
