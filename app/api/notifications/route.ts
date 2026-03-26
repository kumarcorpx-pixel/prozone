import { NextRequest, NextResponse } from "next/server"
import { rateLimit, apiRateLimit } from "@/lib/rate-limit"
import { getUserFromToken } from "@/lib/auth"
import prisma from "@/lib/prisma"

const demoNotifications = [
  {
    id: "notif-1",
    title: "Visa Application Approved",
    message: "Your employment visa application has been approved.",
    type: "success",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    title: "Document Expiring Soon",
    message: "Trade license for ABC Corp expires in 30 days.",
    type: "warning",
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    title: "New Service Request",
    message: "A new visa renewal request has been submitted.",
    type: "info",
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`notifications:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return NextResponse.json({ notifications: demoNotifications, demo: true })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ notifications: notifications || [] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`notifications:${ip}`, apiRateLimit)
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { id, isRead } = body

    if (!id || typeof isRead !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request. Provide id and isRead." },
        { status: 400 }
      )
    }

    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update notification" },
      { status: 500 }
    )
  }
}
