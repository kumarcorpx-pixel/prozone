import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"

const demoDashboard = {
  companies: [
    { id: "comp-1", name: "My Trading LLC", emirate: "Dubai", licenseType: "mainland", status: "active" },
  ],
  activeRequests: 3,
  completedRequests: 12,
  documents: 8,
  expiryAlerts: [
    { id: "alert-1", type: "Trade License", companyName: "My Trading LLC", expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), daysLeft: 30 },
    { id: "alert-2", type: "Employment Visa", employeeName: "John Doe", expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), daysLeft: 15 },
  ],
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`client-dashboard:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ...demoDashboard, demo: true })
    }

    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Fetch client data in parallel
    const [companiesRes, activeReqRes, completedReqRes, documentsRes] =
      await Promise.all([
        supabase
          .from("companies")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("service_requests")
          .select("id", { count: "exact", head: true })
          .eq("client_id", user.id)
          .in("status", ["pending", "in_progress", "under_review"]),
        supabase
          .from("service_requests")
          .select("id", { count: "exact", head: true })
          .eq("client_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", user.id),
      ])

    // Get expiry alerts (documents/visas expiring within 60 days)
    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    const { data: expiryAlerts } = await supabase
      .from("documents")
      .select("id, document_type, company:companies(name), employee:employees(full_name), expires_at")
      .eq("owner_id", user.id)
      .not("expires_at", "is", null)
      .lte("expires_at", sixtyDaysFromNow)
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true })

    return NextResponse.json({
      companies: companiesRes.data || [],
      activeRequests: activeReqRes.count || 0,
      completedRequests: completedReqRes.count || 0,
      documents: documentsRes.count || 0,
      expiryAlerts: (expiryAlerts || []).map((alert: any) => ({
        id: alert.id,
        type: alert.document_type,
        companyName: alert.company?.name,
        employeeName: alert.employee?.full_name,
        expiresAt: alert.expires_at,
        daysLeft: Math.ceil(
          (new Date(alert.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch dashboard" },
      { status: 500 }
    )
  }
}
