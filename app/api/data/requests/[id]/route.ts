import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { dispatchStatusUpdate, dispatchStaffAssignment } from "@/lib/notify-dispatch"
import { withAuth } from "@/lib/auth-middleware"
import { requestUpdateSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response
  const user = auth.user

  try {
    const { id } = await params

    const r = await prisma.serviceRequest.findUnique({
      where: { id },
    })

    if (!r) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    // Clients can only view their own requests
    if (user.role === "client" && r.clientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const validation = validateBody(requestUpdateSchema, body)
    if (!validation.success) return validation.response

    const data: any = {}
    if (body.client_id !== undefined || body.clientId !== undefined) data.clientId = body.client_id || body.clientId
    if (body.company_id !== undefined || body.companyId !== undefined) data.companyId = body.company_id || body.companyId
    if (body.service_type !== undefined || body.serviceType !== undefined) data.serviceType = body.service_type || body.serviceType
    if (body.description !== undefined) data.description = body.description
    if (body.status !== undefined) data.status = body.status
    if (body.priority !== undefined) data.priority = body.priority
    if (body.assigned_to !== undefined || body.assignedToId !== undefined) data.assignedToId = body.assigned_to || body.assignedToId
    if (body.notes !== undefined) data.notes = body.notes
    if (body.due_date !== undefined || body.dueDate !== undefined) data.dueDate = body.due_date || body.dueDate
    if (body.completed_date !== undefined || body.completedDate !== undefined) data.completedDate = body.completed_date || body.completedDate

    // Get old request to detect changes
    const old = await prisma.serviceRequest.findUnique({ where: { id }, select: { status: true, assignedToId: true } })

    const r = await prisma.serviceRequest.update({
      where: { id },
      data,
      include: { company: { select: { name: true } } },
    })

    // Dispatch notifications on status change
    if (body.status && old && body.status !== old.status) {
      dispatchStatusUpdate({
        id: r.id,
        serviceType: r.serviceType || "PRO Service",
        status: r.status,
        clientId: r.clientId,
      }).catch(err => console.error("[Notify] Status dispatch error:", err))
    }

    // Dispatch notifications on staff assignment
    if ((body.assigned_to || body.assignedToId) && r.assignedToId && r.assignedToId !== old?.assignedToId) {
      dispatchStaffAssignment({
        id: r.id,
        serviceType: r.serviceType || "PRO Service",
        companyName: r.company?.name || "N/A",
        staffId: r.assignedToId,
        clientId: r.clientId,
      }).catch(err => console.error("[Notify] Assignment dispatch error:", err))
    }

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

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
