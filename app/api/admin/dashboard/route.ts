import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"

const demoStats = {
  companies: 24,
  employees: 156,
  activeRequests: 18,
  completedRequests: 243,
  documents: 412,
  revenue: {
    thisMonth: 145000,
    lastMonth: 128000,
    currency: "AED",
  },
  recentActivity: [
    { id: "act-1", type: "request_created", description: "New visa renewal request from ABC Corp", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: "act-2", type: "request_completed", description: "Trade license renewal completed for XYZ LLC", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: "act-3", type: "document_uploaded", description: "Passport copy uploaded for employee John Doe", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  ],
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-dashboard:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ...demoStats, demo: true })
    }

    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Auth check - admin only
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch counts in parallel
    const [companiesRes, employeesRes, activeReqRes, completedReqRes, documentsRes] =
      await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("employees").select("id", { count: "exact", head: true }),
        supabase
          .from("service_requests")
          .select("id", { count: "exact", head: true })
          .in("status", ["pending", "in_progress", "under_review"]),
        supabase
          .from("service_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase.from("documents").select("id", { count: "exact", head: true }),
      ])

    // Recent activity
    const { data: recentActivity } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      companies: companiesRes.count || 0,
      employees: employeesRes.count || 0,
      activeRequests: activeReqRes.count || 0,
      completedRequests: completedReqRes.count || 0,
      documents: documentsRes.count || 0,
      recentActivity: recentActivity || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
