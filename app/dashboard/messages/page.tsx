"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Send,
  MessageSquare,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Video,
  X,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  body: string
  senderId: string
  createdAt: string
  isRead: boolean
}

interface Conversation {
  partnerId: string
  partnerName: string
  partnerRole: string
  partnerPhone: string | null
  messages: ChatMessage[]
  lastMessage: string
  lastTime: string
  unread: number
}

interface StaffUser {
  id: string
  full_name: string
  phone: string | null
  role: string
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPartner, setSelectedPartner] = useState<string>("")
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sending, setSending] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [selectedNewUser, setSelectedNewUser] = useState<string>("")
  const [staffSearch, setStaffSearch] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedPartner, conversations, scrollToBottom])

  async function loadConversations() {
    try {
      const res = await fetch("/api/client/messages")
      if (res.ok) {
        const data = await res.json()
        const convs: Conversation[] = data.conversations || []
        setConversations(convs)
        if (convs.length > 0 && !selectedPartner) {
          setSelectedPartner(convs[0].partnerId)
        }
      }
      // Fetch current user id for message alignment
      const meRes = await fetch("/api/auth/me")
      if (meRes.ok) {
        const meData = await meRes.json()
        setCurrentUserId(meData.user?.id || meData.id || "")
      }
    } catch {
      toast.error("Failed to load conversations")
    }
    setLoading(false)
  }

  async function loadStaffUsers() {
    setLoadingStaff(true)
    try {
      const res = await fetch("/api/client/messages/staff")
      if (res.ok) {
        const data = await res.json()
        setStaffUsers(data)
      }
    } catch {
      toast.error("Failed to load staff")
    }
    setLoadingStaff(false)
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedPartner) return
    setSending(true)
    try {
      const res = await fetch("/api/client/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedPartner,
          body: newMessage.trim(),
        }),
      })
      if (res.ok) {
        setNewMessage("")
        await loadConversations()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send message")
      }
    } catch {
      toast.error("Failed to send message")
    }
    setSending(false)
  }

  async function handleStartNewConversation() {
    if (!selectedNewUser || !newMessage.trim()) {
      toast.error("Select a recipient and type a message")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/client/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedNewUser,
          body: newMessage.trim(),
        }),
      })
      if (res.ok) {
        setNewMessage("")
        setShowNewMessage(false)
        setSelectedNewUser("")
        setStaffSearch("")
        setSelectedPartner(selectedNewUser)
        await loadConversations()
        toast.success("Message sent")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send message")
      }
    } catch {
      toast.error("Failed to send message")
    }
    setSending(false)
  }

  const activeConversation = conversations.find((c) => c.partnerId === selectedPartner)

  const filteredConversations = conversations.filter(
    (c) =>
      c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStaff = staffUsers.filter((u) =>
    u.full_name.toLowerCase().includes(staffSearch.toLowerCase())
  )

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    }
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Contact our team directly</p>
        </div>
        <button
          onClick={() => {
            setShowNewMessage(true)
            if (staffUsers.length === 0) loadStaffUsers()
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Message
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div
          className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden flex"
          style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
        >
          {/* Left Sidebar - Conversation List */}
          <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  {searchQuery
                    ? "No conversations match your search"
                    : "No conversations yet. Start one!"}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartner(conv.partnerId)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedPartner === conv.partnerId ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {conv.partnerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {conv.partnerName}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(conv.lastTime)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide mt-0.5 ${
                            conv.partnerRole === "pro_staff"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {conv.partnerRole === "pro_staff" ? "Staff" : "Admin"}
                        </span>
                        <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#1a3a6b] text-white text-[10px] font-bold flex-shrink-0">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Message Thread */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#1a3a6b] flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {activeConversation.partnerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activeConversation.partnerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activeConversation.partnerRole === "pro_staff" ? "Staff" : "Admin"}
                      </p>
                    </div>
                  </div>
                  {activeConversation.partnerPhone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${activeConversation.partnerPhone}`}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Phone Call"
                      >
                        <Phone className="h-4 w-4 text-gray-600" />
                      </a>
                      <a
                        href={`https://wa.me/${activeConversation.partnerPhone.replace(/[\s+\-()]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-green-50"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </a>
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-blue-50"
                        title="Video Call"
                      >
                        <Video className="h-4 w-4 text-blue-600" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeConversation.messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? "bg-[#1a3a6b] text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{msg.body}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-white/60" : "text-gray-400"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMessage.trim() && !sending) {
                          handleSendMessage()
                        }
                      }}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="inline-flex items-center justify-center h-10 w-10 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl ring-1 ring-gray-200 w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
              <button
                onClick={() => {
                  setShowNewMessage(false)
                  setSelectedNewUser("")
                  setStaffSearch("")
                  setNewMessage("")
                }}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                />
                {loadingStaff ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredStaff.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedNewUser(u.id)
                          setStaffSearch(u.full_name)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                          selectedNewUser === u.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <span className="font-medium text-gray-900">{u.full_name}</span>
                        <span
                          className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                            u.role === "pro_staff"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {u.role === "pro_staff" ? "Staff" : "Admin"}
                        </span>
                      </button>
                    ))}
                    {filteredStaff.length === 0 && (
                      <p className="px-4 py-3 text-sm text-gray-400 text-center">
                        No staff found
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] resize-none"
                />
              </div>
              <button
                onClick={handleStartNewConversation}
                disabled={!selectedNewUser || !newMessage.trim() || sending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
