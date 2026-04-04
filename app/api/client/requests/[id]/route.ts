import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params

    const r = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        company: { select: { name: true } },
        assignedTo: { select: { fullName: true, phone: true, email: true } },
        timeline: {
          orderBy: { createdAt: "asc" },
          include: { createdBy: { select: { fullName: true, role: true } } },
        },
        governmentFees: true,
      },
    })

    if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (r.clientId !== auth.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json({
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
      assignee_email: r.assignedTo?.email || null,
      notes: r.notes,
      due_date: r.dueDate,
      completed_date: r.completedDate,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      timeline: r.timeline.map((t: any) => ({
        id: t.id,
        status: t.status,
        message: t.message,
        created_by: t.createdBy?.fullName || "System",
        created_by_role: t.createdBy?.role || "system",
        created_at: t.createdAt,
      })),
      fees: r.governmentFees.map((f: any) => ({
        id: f.id,
        fee_type: f.feeType,
        description: f.description,
        amount: Number(f.amount),
        payment_status: f.paymentStatus,
        receipt_number: f.receiptNumber,
        paid_date: f.paidDate,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
