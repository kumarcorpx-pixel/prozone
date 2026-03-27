import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { runNewRequestWorkflow } from "@/lib/workflow-engine"
import { withAuth } from "@/lib/auth-middleware"
import { serviceRequestSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"
import { cached, CK, TTL, onRequestChange } from "@/lib/cache"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const validation = validateBody(serviceRequestSchema, {
      companyId: body.company_id || body.companyId,
      serviceType: body.service_type || body.serviceType,
      description: body.description,
      priority: body.priority,
    })
    if (!validation.success) return validation.response

    const r = await prisma.serviceRequest.create({
      data: {
        ...(body.client_id || body.clientId ? { client: { connect: { id: body.client_id || body.clientId } } } : {}),
        ...(validation.data.companyId ? { company: { connect: { id: validation.data.companyId } } } : {}),
        serviceType: validation.data.serviceType,
        description: validation.data.description,
        status: body.status || "pending",
        priority: validation.data.priority,
        ...(body.assigned_to || body.assignedToId ? { assignedTo: { connect: { id: body.assigned_to || body.assignedToId } } } : {}),
        notes: body.notes,
        dueDate: body.due_date || body.dueDate,
      },
    })

    const mapped = {
      id: r.id,
      client_id: r.clientId,
      company_id: r.companyId,
      service_type: r.serviceType,
      description: r.description,
      status: r.status,
      priority: r.priority,
      assigned_to: r.assignedToId,
      notes: r.notes,
      due_date: r.dueDate,
      completed_date: r.completedDate,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }

    // Trigger automated workflow (auto-assign, notify, etc.)
    runNewRequestWorkflow(r.id).catch((err: any) =>
      console.error("[Workflow] Background error:", err.message)
    )

    await onRequestChange()
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response
  const user = auth.user

  try {
    const isAdminOrStaff = user.role === "admin" || user.role === "pro_staff"

    const mapRequest = (r: any) => ({
      id: r.id,
      client_id: r.clientId,
      company_id: r.companyId,
      service_type: r.serviceType,
      description: r.description,
      status: r.status,
      priority: r.priority,
      assigned_to: r.assignedToId,
      notes: r.notes,
      due_date: r.dueDate,
      completed_date: r.completedDate,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    })

    if (isAdminOrStaff) {
      const mapped = await cached(CK.requests(), TTL.REQUESTS, async () => {
        const requests = await prisma.serviceRequest.findMany({
          orderBy: { createdAt: "desc" },
        })
        return requests.map(mapRequest)
      })
      return NextResponse.json(mapped)
    }

    const clientFilter = user.role === "client" ? { clientId: user.id } : undefined
    const requests = await prisma.serviceRequest.findMany({
      where: clientFilter,
      orderBy: { createdAt: "desc" },
    })
    const mapped = requests.map(mapRequest)

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
