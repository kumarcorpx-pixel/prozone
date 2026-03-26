import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"

const demoDashboard = {
  assignedRequests: 8,
  pendingTasks: 3,
  completedToday: 2,
  recentActivity: [
    { id: "act-1", type: "status_updated", description: "Visa renewal moved to In Progress", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: "act-2", type: "document_reviewed", description: "Reviewed passport copy for ABC Corp", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: "act-3", type: "request_completed", description: "Trade name reservation completed", createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  ],
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`staff-dashboard:${ip}`, apiRateLimit)
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || !["staff", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [assignedRes, pendingRes, completedTodayRes] = await Promise.all([
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to", user.id)
        .in("status", ["pending", "in_progress", "under_review"]),
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to", user.id)
        .eq("status", "pending"),
      supabase
        .from("service_requests")
        .select("id", { count: "exact", head: true })
        .eq("assigned_to", user.id)
        .eq("status", "completed")
        .gte("updated_at", todayStart.toISOString()),
    ])

    // Recent activity for this staff member
    const { data: recentActivity } = await supabase
      .from("activity_log")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      assignedRequests: assignedRes.count || 0,
      pendingTasks: pendingRes.count || 0,
      completedToday: completedTodayRes.count || 0,
      recentActivity: recentActivity || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch dashboard" },
      { status: 500 }
    )
  }
}
