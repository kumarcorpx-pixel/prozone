import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { serviceRequestSchema } from "@/lib/validation/schemas"

const demoRequests = [
  {
    id: "req-1",
    serviceType: "Visa Renewal",
    status: "in_progress",
    priority: "high",
    companyName: "ABC Trading LLC",
    clientName: "Ahmed Hassan",
    assignedTo: "Sarah Admin",
    description: "Employment visa renewal for 3 employees",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "req-2",
    serviceType: "Trade License Renewal",
    status: "pending",
    priority: "medium",
    companyName: "XYZ Services",
    clientName: "Mohammed Ali",
    assignedTo: null,
    description: "Annual trade license renewal",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "req-3",
    serviceType: "Company Formation - Mainland",
    status: "completed",
    priority: "low",
    companyName: "New Venture LLC",
    clientName: "Fatima Khalid",
    assignedTo: "Sarah Admin",
    description: "New mainland company formation",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

async function checkAdminAuth() {
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

  if (!profile || profile.role !== "admin") {
    return { authorized: false, noSupabase: false, user, supabase }
  }

  return { authorized: true, noSupabase: false, user, supabase }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkAdminAuth()

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
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")
    const assignedTo = url.searchParams.get("assignedTo")

    let query = supabase
      .from("service_requests")
      .select(
        `
        *,
        client:profiles!client_id(full_name),
        company:companies!company_id(name),
        assignee:profiles!assigned_to(full_name)
      `
      )
      .order("created_at", { ascending: false })

    if (status) query = query.eq("status", status)
    if (priority) query = query.eq("priority", priority)
    if (assignedTo) query = query.eq("assigned_to", assignedTo)

    const { data: requests, error } = await query

    if (error) throw error

    return NextResponse.json({
      requests: (requests || []).map((r: any) => ({
        ...r,
        clientName: r.client?.full_name,
        companyName: r.company?.name,
        assignedToName: r.assignee?.full_name,
      })),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkAdminAuth()

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
    const result = serviceRequestSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = auth.supabase!
    const { data: newRequest, error } = await supabase
      .from("service_requests")
      .insert({
        ...result.data,
        service_type: result.data.serviceType,
        company_id: result.data.companyId,
        created_by: auth.user!.id,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create request" },
      { status: 500 }
    )
  }
}
