import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const requests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
    })

    const mapped = requests.map((r) => ({
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
