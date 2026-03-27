"use client"

import { useState, useEffect } from "react"
import { Send, MessageSquare } from "lucide-react"

interface Message {
  id: string
  sender: string
  text: string
  time: string
  isAdmin: boolean
}

interface Conversation {
  id: string
  name: string
  role: string
  lastMessage: string
  time: string
  unread: number
  messages: Message[]
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<string>("")
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/messages")
        if (res.ok) {
          const data = await res.json()
          const convs = data.conversations || []
          setConversations(convs)
          if (convs.length > 0) setSelectedConversation(convs[0].id)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const activeConversation = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Internal messaging and client communication</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Messages will appear when clients or staff send inquiries.</p>
        </div>
      ) : (
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden flex" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {conv.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{conv.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                    </div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide mt-0.5 ${
                      conv.role === "Staff" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {conv.role}
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
            ))}
          </div>
        </div>

        {/* Right Panel - Message Thread */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#1a3a6b] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {activeConversation.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activeConversation.name}</p>
                  <p className="text-xs text-gray-500">{activeConversation.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConversation.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.isAdmin
                          ? "bg-[#1a3a6b] text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.isAdmin ? "text-white/60" : "text-gray-400"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
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
                      if (e.key === "Enter" && newMessage.trim()) {
                        setNewMessage("")
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                  />
                  <button
                    onClick={() => {
                      if (newMessage.trim()) {
                        setNewMessage("")
                      }
                    }}
                    className="inline-flex items-center justify-center h-10 w-10 bg-[#1a3a6b] text-white rounded-lg hover:bg-[#15305a] transition-colors"
                  >
                    <Send className="h-4 w-4" />
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
    </div>
  )
}
