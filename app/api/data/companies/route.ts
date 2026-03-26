import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const company = await prisma.company.create({
      data: {
        name: body.name,
        tradeName: body.trade_name || body.tradeName,
        licenseNumber: body.license_number || body.licenseNumber,
        licenseType: body.license_type || body.licenseType,
        emirate: body.emirate,
        phone: body.phone,
        email: body.email,
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

    return NextResponse.json(mapped)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
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
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch companies:", error)
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}
