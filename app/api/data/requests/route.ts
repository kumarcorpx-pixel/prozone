import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { runNewRequestWorkflow } from "@/lib/workflow-engine"
import { withAuth } from "@/lib/auth-middleware"
import { serviceRequestSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"
import { onRequestChange } from "@/lib/cache"

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

    // Notify admins of new request
    const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } })
    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, title: "New Service Request", message: `${validation.data.serviceType} request submitted`, type: "info", isRead: false, link: `/admin/requests` }
      }).catch(() => {})
    }

    // Notify assigned staff if any
    const assignedStaffId = body.assigned_to || body.assignedToId
    if (assignedStaffId) {
      await prisma.notification.create({
        data: { userId: assignedStaffId, title: "New Task Assigned", message: `${validation.data.serviceType} request assigned to you`, type: "info", isRead: false, link: `/staff/requests/${r.id}` }
      }).catch(() => {})
    }

    await onRequestChange()
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const user = auth.user
    const isAdminOrStaff = user.role === "admin" || user.role === "pro_staff"
    const where = isAdminOrStaff ? {} : { clientId: user.id }

    let requests: any[] = []
    try {
      requests = await prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { fullName: true } },
          company: { select: { name: true } },
          assignedTo: { select: { fullName: true } },
        },
      })
    } catch {
      // Table might not exist
      return NextResponse.json([])
    }

    const mapped = requests.map((r: any) => ({
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
      client_name: r.client?.fullName || null,
      company_name: r.company?.name || null,
      assignee_name: r.assignedTo?.fullName || null,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
