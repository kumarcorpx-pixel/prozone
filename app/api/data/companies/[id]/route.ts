import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response
  const user = auth.user

  try {
    const { id } = await params

    // For clients, verify company belongs to them
    const companyFilter = await getClientCompanyFilter(user)
    if (companyFilter && !companyFilter.includes(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const c = await prisma.company.findUnique({
      where: { id },
    })

    if (!c) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    const mapped = {
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
    }

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.trade_name !== undefined || body.tradeName !== undefined) data.tradeName = body.trade_name || body.tradeName
    if (body.license_number !== undefined || body.licenseNumber !== undefined) data.licenseNumber = body.license_number || body.licenseNumber
    if (body.license_type !== undefined || body.licenseType !== undefined) data.licenseType = body.license_type || body.licenseType
    if (body.license_expiry !== undefined || body.licenseExpiry !== undefined) data.licenseExpiry = body.license_expiry || body.licenseExpiry
    if (body.legal_form !== undefined || body.legalForm !== undefined) data.legalForm = body.legal_form || body.legalForm
    if (body.status !== undefined) data.status = body.status
    if (body.emirate !== undefined) data.emirate = body.emirate
    if (body.jurisdiction !== undefined) data.jurisdiction = body.jurisdiction
    if (body.free_zone !== undefined || body.freeZone !== undefined) data.freeZone = body.free_zone || body.freeZone
    if (body.address !== undefined) data.address = body.address
    if (body.phone !== undefined) data.phone = body.phone
    if (body.email !== undefined) data.email = body.email
    if (body.industry !== undefined) data.industry = body.industry
    if (body.notes !== undefined) data.notes = body.notes
    if (body.visa_quota_total !== undefined) data.visaQuotaTotal = body.visa_quota_total
    if (body.visa_quota_used !== undefined) data.visaQuotaUsed = body.visa_quota_used

    const c = await prisma.company.update({
      where: { id },
      data,
    })

    const mapped = {
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
    }

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
