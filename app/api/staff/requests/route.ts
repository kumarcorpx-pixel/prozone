import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"

const demoRequests = [
  {
    id: "req-s1",
    serviceType: "Visa Renewal",
    status: "in_progress",
    priority: "high",
    companyName: "ABC Trading LLC",
    clientName: "Ahmed Hassan",
    description: "Employment visa renewal for 3 employees",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "req-s2",
    serviceType: "MOHRE Work Permit - New",
    status: "pending",
    priority: "medium",
    companyName: "XYZ Services",
    clientName: "Mohammed Ali",
    description: "New work permit application",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

async function checkStaffAuth() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { authorized: false, noSupabase: true, user: null, supabase: null }
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false, noSupabase: false, user: null, supabase }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return { authorized: false, noSupabase: false, user, supabase }
  }

  return { authorized: true, noSupabase: false, user, supabase }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`staff-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkStaffAuth()

    if (auth.noSupabase) {
      return NextResponse.json({ requests: demoRequests, demo: true })
    }

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.user ? "Forbidden" : "Not authenticated" },
        { status: auth.user ? 403 : 401 }
      )
    }

    const supabase = auth.supabase!
    const { data: requests, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        client:profiles!client_id(full_name),
        company:companies!company_id(name)
      `
      )
      .eq("assigned_to", auth.user!.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({
      requests: (requests || []).map((r: any) => ({
        ...r,
        clientName: r.client?.full_name,
        companyName: r.company?.name,
      })),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`staff-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkStaffAuth()

    if (auth.noSupabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.user ? "Forbidden" : "Not authenticated" },
        { status: auth.user ? 403 : 401 }
      )
    }

    const body = await request.json()
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "Request id and status are required" },
        { status: 400 }
      )
    }

    const validStatuses = ["pending", "in_progress", "under_review", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const supabase = auth.supabase!

    // Verify the request is assigned to this staff member
    const { data: existing, error: fetchError } = await supabase
      .from("service_requests")
      .select("id, assigned_to")
      .eq("id", id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (existing.assigned_to !== auth.user!.id) {
      return NextResponse.json(
        { error: "You can only update requests assigned to you" },
        { status: 403 }
      )
    }

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (notes) updateData.notes = notes

    const { data: updated, error: updateError } = await supabase
      .from("service_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ request: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update request" },
      { status: 500 }
    )
  }
}
