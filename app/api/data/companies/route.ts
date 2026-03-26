import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
    })
    // Map to match existing frontend field names
    return NextResponse.json(companies.map(c => ({
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
      establishment_card_number: c.establishmentCardNumber,
      establishment_card_expiry: c.establishmentCardExpiry,
      immigration_file_number: c.immigrationFileNumber,
      mohre_company_number: c.mohreCompanyNumber,
      ejari_tawtheeq_number: c.ejariTawtheeqNumber,
      ejari_tawtheeq_expiry: c.ejariTawtheeqExpiry,
      vat_trn: c.vatTrn,
      sponsor_name: c.sponsorName,
      visa_quota_total: c.visaQuotaTotal,
      visa_quota_used: c.visaQuotaUsed,
      created_at: c.createdAt,
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
