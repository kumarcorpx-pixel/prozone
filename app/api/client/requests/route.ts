import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { serviceRequestSchema, sanitize } from "@/lib/validation/schemas"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { runNewRequestWorkflow } from "@/lib/workflow-engine"
import { handleApiError } from "@/lib/api-error-handler"

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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
      const requests = await prisma.serviceRequest.findMany({
        where: { clientId: user.id },
        include: {
          company: { select: { name: true } },
          assignedTo: { select: { fullName: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      const mapped = requests.map((r: any) => ({
        id: r.id,
        client_id: r.clientId,
        company_id: r.companyId,
        company_name: r.company?.name || null,
        service_type: r.serviceType,
        description: r.description,
        status: r.status,
        priority: r.priority,
        assigned_to: r.assignedToId,
        assignee_name: r.assignedTo?.fullName || null,
        assignee_phone: r.assignedTo?.phone || null,
        notes: r.notes,
        due_date: r.dueDate,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }))

      return NextResponse.json(mapped)
    } catch {
      return NextResponse.json([])
    }
  } catch (error) {
    return handleApiError(error)
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

    const createData: any = {
      serviceType: sanitize(result.data.serviceType),
      description: result.data.description ? sanitize(result.data.description) : null,
      priority: result.data.priority,
      status: "pending",
    }

    // Use connect for relations
    if (user.id) createData.client = { connect: { id: user.id } }
    if (result.data.companyId) createData.company = { connect: { id: result.data.companyId } }

    const newRequest = await prisma.serviceRequest.create({ data: createData }).catch(async (err: any) => {
      // Retry with direct IDs if connect fails
      if (err.message?.includes("client") || err.message?.includes("company")) {
        return prisma.serviceRequest.create({
          data: {
            serviceType: createData.serviceType,
            description: createData.description,
            priority: createData.priority,
            status: "pending",
            clientId: user.id,
            companyId: result.data.companyId || null,
          },
        })
      }
      throw err
    })

    runNewRequestWorkflow(newRequest.id).catch((err: any) =>
      console.error("[Workflow] Background error:", err.message)
    )

    // Notify admins of new request
    try {
      const admins = await prisma.user.findMany({ where: { role: "admin" as any }, select: { id: true } })
      console.log(`[Notify] Found ${admins.length} admins to notify about new request`)
      for (const admin of admins) {
        await prisma.notification.create({
          data: { userId: admin.id, title: "New Service Request", message: `${result.data.serviceType} request submitted`, type: "info", isRead: false, link: `/admin/requests` }
        })
      }
    } catch (err: any) {
      console.error("[Notify] Failed to notify admins:", err.message)
    }

    // Create initial timeline entry
    try {
      await prisma.requestTimeline.create({
        data: { requestId: newRequest.id, status: "pending", message: "Request submitted by client", createdById: user.id }
      })
    } catch (err: any) {
      console.error("[Timeline] Failed to create initial entry:", err.message)
    }

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
