import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    const user = token ? await getUserFromToken(token) : null
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all messages grouped by conversation partner
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
      },
    })

    // Group messages by conversation partner (non-admin user)
    const conversationMap = new Map<string, any>()

    for (const msg of messages) {
      const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId
      const partner = msg.senderId === user.id ? msg.receiver : msg.sender

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          id: partnerId,
          name: partner.fullName,
          role: partner.role === "pro_staff" ? "Staff" : "Client",
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
        isAdmin: msg.senderId === user.id,
      })

      if (!msg.isRead && msg.receiverId === user.id) {
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

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) {
    return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
