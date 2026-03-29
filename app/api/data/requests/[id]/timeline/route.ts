import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params

    // Verify request exists and client can access it
    const sr = await prisma.serviceRequest.findUnique({ where: { id }, select: { clientId: true } })
    if (!sr) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    if (auth.user.role === "client" && sr.clientId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const timeline = await prisma.requestTimeline.findMany({
      where: { requestId: id },
      orderBy: { createdAt: "asc" },
      include: { createdBy: { select: { fullName: true, role: true } } },
    })

    return NextResponse.json({
      timeline: timeline.map((t: any) => ({
        id: t.id,
        status: t.status,
        message: t.message,
        created_by: t.createdBy?.fullName || "System",
        created_by_role: t.createdBy?.role || "system",
        created_at: t.createdAt,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { message, status } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Verify request exists and client can access it
    const sr = await prisma.serviceRequest.findUnique({ where: { id }, select: { clientId: true } })
    if (!sr) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    if (auth.user.role === "client" && sr.clientId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const entry = await prisma.requestTimeline.create({
      data: {
        requestId: id,
        message,
        status: status || null,
        createdById: auth.user.id,
      },
      include: { createdBy: { select: { fullName: true, role: true } } },
    })

    return NextResponse.json({
      id: entry.id,
      status: entry.status,
      message: entry.message,
      created_by: entry.createdBy?.fullName || "System",
      created_by_role: entry.createdBy?.role || "system",
      created_at: entry.createdAt,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
