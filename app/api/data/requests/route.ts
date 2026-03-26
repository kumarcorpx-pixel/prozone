import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId")
  const assignedTo = request.nextUrl.searchParams.get("assignedTo")
  const status = request.nextUrl.searchParams.get("status")

  try {
    const where: any = {}
    if (clientId) where.clientId = clientId
    if (assignedTo) where.assignedToId = assignedTo
    if (status) where.status = status

    const requests = await prisma.serviceRequest.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(requests.map(r => ({
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
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
