import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { serviceRequestSchema, sanitize } from "@/lib/validation/schemas"

const demoRequests = [
  {
    id: "req-c1",
    serviceType: "Visa Renewal",
    status: "in_progress",
    priority: "high",
    companyName: "My Trading LLC",
    description: "Renewal for 2 employees",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "req-c2",
    serviceType: "Trade License Renewal",
    status: "pending",
    priority: "medium",
    companyName: "My Trading LLC",
    description: "Annual license renewal",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`client-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ requests: demoRequests, demo: true })
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

    const { data: requests, error } = await supabase
      .from("service_requests")
      .select(
        `
        *,
        company:companies!company_id(name),
        assignee:profiles!assigned_to(full_name)
      `
      )
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({
      requests: (requests || []).map((r: any) => ({
        ...r,
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
  const rl = rateLimit(`client-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
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

    const body = await request.json()
    const result = serviceRequestSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { data: newRequest, error } = await supabase
      .from("service_requests")
      .insert({
        service_type: sanitize(result.data.serviceType),
        description: result.data.description ? sanitize(result.data.description) : null,
        priority: result.data.priority,
        company_id: result.data.companyId || null,
        client_id: user.id,
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
