import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "default-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { checked: 0, alerts90: 0, alerts60: 0, alerts30: 0, alerts7: 0, expired: 0 }

  try {
    // If Supabase configured, check real data
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url_here") {
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()

      // Check employees table for visa/EID/passport/labor card expiry
      const { data: employees } = await supabase
        .from("employees")
        .select("id, full_name, company_id, visa_expiry, emirates_id_expiry, passport_expiry, labor_card_expiry")

      // Check companies table for license expiry
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name, license_expiry")

      // Check documents table for document expiry
      const { data: documents } = await supabase
        .from("documents")
        .select("id, name, expiry_date, company_id")
        .not("expiry_date", "is", null)

      const now = new Date()
      const allItems: { name: string; type: string; expiryDate: string; companyId?: string; entityName?: string }[] = []

      // Collect all expiry items
      employees?.forEach(emp => {
        if (emp.visa_expiry) allItems.push({ name: `${emp.full_name} - Visa`, type: "visa", expiryDate: emp.visa_expiry, companyId: emp.company_id, entityName: emp.full_name })
        if (emp.emirates_id_expiry) allItems.push({ name: `${emp.full_name} - Emirates ID`, type: "emirates_id", expiryDate: emp.emirates_id_expiry, companyId: emp.company_id, entityName: emp.full_name })
        if (emp.passport_expiry) allItems.push({ name: `${emp.full_name} - Passport`, type: "passport", expiryDate: emp.passport_expiry, companyId: emp.company_id, entityName: emp.full_name })
        if (emp.labor_card_expiry) allItems.push({ name: `${emp.full_name} - Labor Card`, type: "labor_card", expiryDate: emp.labor_card_expiry, companyId: emp.company_id, entityName: emp.full_name })
      })

      companies?.forEach(comp => {
        if (comp.license_expiry) allItems.push({ name: `${comp.name} - Trade License`, type: "license", expiryDate: comp.license_expiry, companyId: comp.id, entityName: comp.name })
      })

      documents?.forEach(doc => {
        if (doc.expiry_date) allItems.push({ name: doc.name, type: "document", expiryDate: doc.expiry_date, companyId: doc.company_id })
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
          await supabase.from("notifications").insert({
            user_id: null, // null = admin notification
            title: daysUntil < 0 ? `EXPIRED: ${item.name}` : `Expiry Alert: ${item.name}`,
            message: daysUntil < 0
              ? `${item.name} expired ${Math.abs(daysUntil)} days ago. Immediate action required.`
              : `${item.name} expires in ${daysUntil} days.`,
            type: daysUntil <= 7 ? "error" : daysUntil <= 30 ? "warning" : "info",
            is_read: false,
          }).select().maybeSingle()
        }
      }

      // Auto-mark expired documents
      await supabase.from("documents")
        .update({ status: "expired" })
        .lt("expiry_date", now.toISOString().split("T")[0])
        .neq("status", "expired")
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
