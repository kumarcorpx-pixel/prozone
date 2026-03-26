import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const c = await prisma.company.findUnique({ where: { id } })
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({
      id: c.id, name: c.name, trade_name: c.tradeName, license_number: c.licenseNumber,
      license_type: c.licenseType, license_expiry: c.licenseExpiry, legal_form: c.legalForm,
      status: c.status, emirate: c.emirate, jurisdiction: c.jurisdiction, free_zone: c.freeZone,
      address: c.address, phone: c.phone, email: c.email, industry: c.industry,
      activities: c.activities, notes: c.notes, visa_quota_total: c.visaQuotaTotal,
      visa_quota_used: c.visaQuotaUsed, created_at: c.createdAt,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
