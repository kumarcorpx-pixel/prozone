import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: auth.user.id }, { receiverId: auth.user.id }],
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true, phone: true } },
        receiver: { select: { id: true, fullName: true, role: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    // Group by conversation partner
    const conversations = new Map<string, any>()
    messages.forEach((msg: any) => {
      const partnerId = msg.senderId === auth.user.id ? msg.receiverId : msg.senderId
      const partner = msg.senderId === auth.user.id ? msg.receiver : msg.sender
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          partnerName: partner.fullName,
          partnerRole: partner.role,
          partnerPhone: partner.phone,
          messages: [],
          lastMessage: msg.body,
          lastTime: msg.createdAt,
          unread: 0,
        })
      }
      conversations.get(partnerId)!.messages.push({
        id: msg.id,
        body: msg.body,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
      })
      if (!msg.isRead && msg.receiverId === auth.user.id) {
        conversations.get(partnerId)!.unread++
      }
    })

    // Reverse messages within each conversation so they are oldest-first
    for (const conv of conversations.values()) {
      conv.messages.reverse()
    }

    return NextResponse.json({ conversations: Array.from(conversations.values()) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["client"])
  if (!auth.success) return auth.response

  try {
    const { receiverId, body: messageBody, subject } = await request.json()
    if (!receiverId || !messageBody) {
      return NextResponse.json(
        { error: "Receiver and message required" },
        { status: 400 }
      )
    }

    // Clients can only message admin or pro_staff
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true },
    })

    if (!receiver || (receiver.role !== "admin" && receiver.role !== "pro_staff")) {
      return NextResponse.json(
        { error: "You can only message admin or staff" },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        senderId: auth.user.id,
        receiverId,
        body: messageBody,
        subject: subject || null,
      },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    return handleApiError(error)
  }
}
