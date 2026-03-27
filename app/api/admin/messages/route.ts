import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    // Get all messages grouped by conversation partner
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, fullName: true, role: true, phone: true } },
        receiver: { select: { id: true, fullName: true, role: true, phone: true } },
      },
    })

    // Group messages by conversation partner (non-admin user)
    const conversationMap = new Map<string, any>()

    for (const msg of messages) {
      const partnerId = msg.senderId === auth.user.id ? msg.receiverId : msg.senderId
      const partner = msg.senderId === auth.user.id ? msg.receiver : msg.sender

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          id: partnerId,
          name: partner.fullName,
          role: partner.role === "pro_staff" ? "Staff" : "Client",
          phone: partner.phone,
          lastMessage: msg.body,
          time: formatTime(msg.createdAt),
          unread: 0,
          messages: [],
        })
      }

      const conv = conversationMap.get(partnerId)!
      conv.messages.push({
        id: msg.id,
        sender: msg.sender.fullName,
        text: msg.body,
        time: formatTime(msg.createdAt),
        isAdmin: msg.senderId === auth.user.id,
      })

      if (!msg.isRead && msg.receiverId === auth.user.id) {
        conv.unread++
      }
    }

    // Sort messages within each conversation by time ascending
    for (const conv of conversationMap.values()) {
      conv.messages.reverse()
    }

    const conversations = Array.from(conversationMap.values())

    return NextResponse.json({ conversations })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const { receiverId, body: messageBody, subject } = await request.json()
    if (!receiverId || !messageBody) {
      return NextResponse.json(
        { error: "Receiver and message required" },
        { status: 400 }
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

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
