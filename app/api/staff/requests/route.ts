import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

async function checkStaffAuth(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const user = token ? await getUserFromToken(token) : null

  if (!user) {
    return { authorized: false, user: null }
  }

  if (!["staff", "admin"].includes(user.role)) {
    return { authorized: false, user }
  }

  return { authorized: true, user }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`staff-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkStaffAuth(request)

    if (!auth.user) {
      return NextResponse.json({ requests: demoRequests, demo: true })
    }

    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const requests = await prisma.serviceRequest.findMany({
      where: { assignedTo: auth.user.id },
      include: {
        client: { select: { fullName: true } },
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      requests: requests.map((r: any) => ({
        ...r,
        clientName: r.client?.fullName,
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
    const auth = await checkStaffAuth(request)

    if (!auth.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
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

    // Verify the request is assigned to this staff member
    const existing = await prisma.serviceRequest.findUnique({
      where: { id },
      select: { id: true, assignedTo: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (existing.assignedTo !== auth.user.id) {
      return NextResponse.json(
        { error: "You can only update requests assigned to you" },
        { status: 403 }
      )
    }

    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date(),
    }
    if (notes) updateData.notes = notes

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ request: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update request" },
      { status: 500 }
    )
  }
}
