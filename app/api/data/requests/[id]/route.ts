import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { dispatchStatusUpdate, dispatchStaffAssignment, dispatchRequestLifecycle } from "@/lib/notify-dispatch"
import { withAuth } from "@/lib/auth-middleware"
import { requestUpdateSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"
import { onRequestChange } from "@/lib/cache"

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
      include: {
        client: { select: { fullName: true, email: true } },
        company: { select: { name: true } },
        assignedTo: { select: { fullName: true, email: true, phone: true } },
      },
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
      client_name: (r as any).client?.fullName || null,
      client_email: (r as any).client?.email || null,
      company_name: (r as any).company?.name || null,
      assignee_name: (r as any).assignedTo?.fullName || null,
      assignee_email: (r as any).assignedTo?.email || null,
      assignee_phone: (r as any).assignedTo?.phone || null,
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

    // State machine validation for status transitions
    if (body.status && old && body.status !== old.status && auth.user.role !== "admin") {
      const VALID_TRANSITIONS: Record<string, string[]> = {
        pending: ["assigned", "in_progress", "rejected", "cancelled"],
        assigned: ["in_progress", "cancelled"],
        in_progress: ["under_review", "completed", "cancelled"],
        under_review: ["completed", "in_progress", "rejected"],
        completed: [], // terminal
        rejected: ["pending"], // can reopen
        cancelled: ["pending"], // can reopen
      }
      const allowed = VALID_TRANSITIONS[old.status] || []
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from "${old.status}" to "${body.status}". Allowed: ${allowed.join(", ") || "none"}` },
          { status: 400 }
        )
      }
    }

    const r = await prisma.serviceRequest.update({
      where: { id },
      data,
      include: { company: { select: { name: true } } },
    })

    // Auto-record timeline entry on status change
    if (body.status && old && body.status !== old.status) {
      prisma.requestTimeline.create({
        data: {
          requestId: id,
          status: body.status,
          message: `Status changed to ${body.status.replace(/_/g, " ")}`,
          createdById: auth.user.id,
        },
      }).catch(() => {})
    }

    // Auto-record timeline entry on assignment change
    if (data.assignedToId && data.assignedToId !== old?.assignedToId) {
      const staff = await prisma.user.findUnique({ where: { id: data.assignedToId }, select: { fullName: true } }).catch(() => null)
      prisma.requestTimeline.create({
        data: {
          requestId: id,
          status: "assigned",
          message: `Assigned to ${staff?.fullName || "staff member"}`,
          createdById: auth.user.id,
        },
      }).catch(() => {})
    }

    // Dispatch lifecycle notifications on status change
    if (body.status && old && body.status !== old.status) {
      dispatchRequestLifecycle({
        id: r.id,
        serviceType: r.serviceType || "PRO Service",
        oldStatus: old.status,
        newStatus: body.status,
        clientId: r.clientId,
        assignedToId: r.assignedToId,
        changedByRole: auth.user.role,
      }).catch(err => console.error("[Notify] Lifecycle dispatch error:", err))
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

    await onRequestChange()
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
