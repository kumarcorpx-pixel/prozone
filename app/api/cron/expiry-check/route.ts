import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { dispatchExpiryAlert } from "@/lib/notify-dispatch"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "default-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { checked: 0, alerts: 0, expired: 0, notified: 0 }

  try {
    const employees = await prisma.employee.findMany({
      select: { id: true, fullName: true, companyId: true, visaExpiry: true, emiratesIdExpiry: true, passportExpiry: true, laborCardExpiry: true },
    })

    const companies = await prisma.company.findMany({
      select: { id: true, name: true, licenseExpiry: true, establishmentCardExpiry: true, chamberCommerceExpiry: true, ejariTawtheeqExpiry: true, leaseExpiry: true },
    })

    const documents = await prisma.document.findMany({
      where: { expiryDate: { not: null } },
      select: { id: true, name: true, expiryDate: true, companyId: true },
    })

    const now = new Date()
    const allItems: { name: string; type: string; expiryDate: Date; companyId?: string }[] = []

    employees.forEach((emp: any) => {
      if (emp.visaExpiry) allItems.push({ name: `${emp.fullName} - Visa`, type: "visa", expiryDate: emp.visaExpiry, companyId: emp.companyId })
      if (emp.emiratesIdExpiry) allItems.push({ name: `${emp.fullName} - Emirates ID`, type: "emirates_id", expiryDate: emp.emiratesIdExpiry, companyId: emp.companyId })
      if (emp.passportExpiry) allItems.push({ name: `${emp.fullName} - Passport`, type: "passport", expiryDate: emp.passportExpiry, companyId: emp.companyId })
      if (emp.laborCardExpiry) allItems.push({ name: `${emp.fullName} - Labor Card`, type: "labor_card", expiryDate: emp.laborCardExpiry, companyId: emp.companyId })
    })

    companies.forEach((comp: any) => {
      if (comp.licenseExpiry) allItems.push({ name: `${comp.name} - Trade License`, type: "license", expiryDate: comp.licenseExpiry, companyId: comp.id })
      if (comp.establishmentCardExpiry) allItems.push({ name: `${comp.name} - Establishment Card`, type: "establishment_card", expiryDate: comp.establishmentCardExpiry, companyId: comp.id })
      if (comp.chamberCommerceExpiry) allItems.push({ name: `${comp.name} - Chamber of Commerce`, type: "chamber", expiryDate: comp.chamberCommerceExpiry, companyId: comp.id })
      if (comp.ejariTawtheeqExpiry) allItems.push({ name: `${comp.name} - Ejari/Tawtheeq`, type: "ejari", expiryDate: comp.ejariTawtheeqExpiry, companyId: comp.id })
      if (comp.leaseExpiry) allItems.push({ name: `${comp.name} - Lease`, type: "lease", expiryDate: comp.leaseExpiry, companyId: comp.id })
    })

    documents.forEach((doc: any) => {
      if (doc.expiryDate) allItems.push({ name: doc.name, type: "document", expiryDate: doc.expiryDate, companyId: doc.companyId ?? undefined })
    })

    results.checked = allItems.length

    // Only send notifications at key thresholds: 90, 60, 30, 14, 7, 3, 1 days
    const alertThresholds = [90, 60, 30, 14, 7, 3, 1]

    for (const item of allItems) {
      const expiry = new Date(item.expiryDate)
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil < 0) {
        results.expired++
      }

      // Send notification at threshold days
      if (alertThresholds.includes(daysUntil) || daysUntil < 0) {
        results.alerts++
        try {
          await dispatchExpiryAlert({
            name: item.name,
            daysRemaining: Math.max(daysUntil, 0),
            companyId: item.companyId,
            type: item.type,
          })
          results.notified++
        } catch (err: any) {
          console.error("[Cron] Expiry dispatch error:", err.message)
        }
      }
    }

    // Auto-mark expired documents
    await prisma.document.updateMany({
      where: { expiryDate: { lt: new Date(now.toISOString().split("T")[0]) }, status: { not: "expired" } },
      data: { status: "expired" },
    })

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
