import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"


async function checkStaffAuth(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const user = token ? await getUserFromToken(token) : null

  if (!user) {
    return { authorized: false, user: null }
  }

  if (!["pro_staff", "admin"].includes(user.role)) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const requests = await prisma.serviceRequest.findMany({
      where: { assignedToId: auth.user.id },
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
  } catch (error) {
    return handleApiError(error)
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
      select: { id: true, assignedToId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (existing.assignedToId !== auth.user.id) {
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
  } catch (error) {
    return handleApiError(error)
  }
}
