import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const r = await prisma.serviceRequest.create({
      data: {
        clientId: body.client_id || body.clientId,
        companyId: body.company_id || body.companyId,
        serviceType: body.service_type || body.serviceType,
        description: body.description,
        status: body.status || "pending",
        priority: body.priority || "medium",
        assignedToId: body.assigned_to || body.assignedToId,
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

    return NextResponse.json(mapped)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const requests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
    })

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
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}
