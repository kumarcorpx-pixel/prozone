import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { serviceRequestSchema, sanitize } from "@/lib/validation/schemas"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return NextResponse.json({ requests: demoRequests, demo: true })
    }

    const requests = await prisma.serviceRequest.findMany({
      where: { clientId: user.id },
      include: {
        company: { select: { name: true } },
        assignee: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      requests: requests.map((r: any) => ({
        ...r,
        companyName: r.company?.name,
        assignedToName: r.assignee?.fullName,
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
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
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

    const newRequest = await prisma.serviceRequest.create({
      data: {
        serviceType: sanitize(result.data.serviceType),
        description: result.data.description ? sanitize(result.data.description) : null,
        priority: result.data.priority,
        companyId: result.data.companyId || null,
        clientId: user.id,
        status: "pending",
      },
    })

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create request" },
      { status: 500 }
    )
  }
}
