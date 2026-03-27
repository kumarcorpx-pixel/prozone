import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { serviceRequestSchema } from "@/lib/validation/schemas"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

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

async function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const user = token ? await getUserFromToken(token) : null

  if (!user) {
    return { authorized: false, user: null }
  }

  if (user.role !== "admin") {
    return { authorized: false, user }
  }

  return { authorized: true, user }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkAdminAuth(request)

    if (!auth.user) {
      return NextResponse.json({ requests: demoRequests, demo: true })
    }

    if (!auth.authorized) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")
    const assignedTo = url.searchParams.get("assignedTo")

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedTo) where.assignedTo = assignedTo

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        client: { select: { fullName: true } },
        company: { select: { name: true } },
        assignee: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      requests: requests.map((r: any) => ({
        ...r,
        clientName: r.client?.fullName,
        companyName: r.company?.name,
        assignedToName: r.assignee?.fullName,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`admin-requests:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const auth = await checkAdminAuth(request)

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
    const result = serviceRequestSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        serviceType: result.data.serviceType,
        companyId: result.data.companyId,
        createdBy: auth.user.id,
        status: "pending",
      },
    })

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
