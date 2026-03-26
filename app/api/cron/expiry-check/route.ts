import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "default-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { checked: 0, alerts90: 0, alerts60: 0, alerts30: 0, alerts7: 0, expired: 0 }

  try {
    // Check employees table for visa/EID/passport/labor card expiry
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        fullName: true,
        companyId: true,
        visaExpiry: true,
        emiratesIdExpiry: true,
        passportExpiry: true,
        laborCardExpiry: true,
      },
    })

    // Check companies table for license expiry
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        licenseExpiry: true,
      },
    })

    // Check documents table for document expiry
    const documents = await prisma.document.findMany({
      where: { expiryDate: { not: null } },
      select: {
        id: true,
        name: true,
        expiryDate: true,
        companyId: true,
      },
    })

    const now = new Date()
    const allItems: { name: string; type: string; expiryDate: Date; companyId?: string; entityName?: string }[] = []

    // Collect all expiry items
    employees.forEach((emp: any) => {
      if (emp.visaExpiry) allItems.push({ name: `${emp.fullName} - Visa`, type: "visa", expiryDate: emp.visaExpiry, companyId: emp.companyId, entityName: emp.fullName })
      if (emp.emiratesIdExpiry) allItems.push({ name: `${emp.fullName} - Emirates ID`, type: "emirates_id", expiryDate: emp.emiratesIdExpiry, companyId: emp.companyId, entityName: emp.fullName })
      if (emp.passportExpiry) allItems.push({ name: `${emp.fullName} - Passport`, type: "passport", expiryDate: emp.passportExpiry, companyId: emp.companyId, entityName: emp.fullName })
      if (emp.laborCardExpiry) allItems.push({ name: `${emp.fullName} - Labor Card`, type: "labor_card", expiryDate: emp.laborCardExpiry, companyId: emp.companyId, entityName: emp.fullName })
    })

    companies.forEach((comp: any) => {
      if (comp.licenseExpiry) allItems.push({ name: `${comp.name} - Trade License`, type: "license", expiryDate: comp.licenseExpiry, companyId: comp.id, entityName: comp.name })
    })

    documents.forEach((doc: any) => {
      if (doc.expiryDate) allItems.push({ name: doc.name, type: "document", expiryDate: doc.expiryDate, companyId: doc.companyId ?? undefined })
    })

    results.checked = allItems.length

    // Check each item and create notifications
    for (const item of allItems) {
      const expiry = new Date(item.expiryDate)
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      let alertLevel: string | null = null
      if (daysUntil < 0) { results.expired++; alertLevel = "expired" }
      else if (daysUntil <= 7) { results.alerts7++; alertLevel = "critical" }
      else if (daysUntil <= 30) { results.alerts30++; alertLevel = "warning" }
      else if (daysUntil <= 60) { results.alerts60++; alertLevel = "notice" }
      else if (daysUntil <= 90) { results.alerts90++; alertLevel = "info" }

      if (alertLevel) {
        // Create notification for admin
        await prisma.notification.create({
          data: {
            userId: null as any, // null = admin notification
            title: daysUntil < 0 ? `EXPIRED: ${item.name}` : `Expiry Alert: ${item.name}`,
            message: daysUntil < 0
              ? `${item.name} expired ${Math.abs(daysUntil)} days ago. Immediate action required.`
              : `${item.name} expires in ${daysUntil} days.`,
            type: daysUntil <= 7 ? "error" : daysUntil <= 30 ? "warning" : "info",
            isRead: false,
          },
        })
      }
    }

    // Auto-mark expired documents
    await prisma.document.updateMany({
      where: {
        expiryDate: { lt: new Date(now.toISOString().split("T")[0]) },
        status: { not: "expired" },
      },
      data: { status: "expired" },
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
