"use client"

import { useState } from "react"
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

const demoConversations: Conversation[] = [
  {
    id: "c1",
    name: "Ahmed Al Mansoori",
    role: "Client",
    lastMessage: "We're processing it with DED now. Expected 2-3 days.",
    time: "10:30 AM",
    unread: 1,
    messages: [
      { id: "m1", sender: "Ahmed Al Mansoori", text: "Hi, I wanted to check on the status of my trade license renewal.", time: "9:15 AM", isAdmin: false },
      { id: "m2", sender: "Admin", text: "Hello Ahmed, let me check the current status for you.", time: "9:20 AM", isAdmin: true },
      { id: "m3", sender: "Ahmed Al Mansoori", text: "When will my trade license be ready?", time: "10:00 AM", isAdmin: false },
      { id: "m4", sender: "Admin", text: "We're processing it with DED now. Expected 2-3 days.", time: "10:30 AM", isAdmin: true },
    ],
  },
  {
    id: "c2",
    name: "Mohammed PRO",
    role: "Staff",
    lastMessage: "Good, please update the request status",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: "m5", sender: "Mohammed PRO", text: "Just wanted to update you - I submitted the visa application to MOHRE this morning.", time: "Yesterday 2:00 PM", isAdmin: false },
      { id: "m6", sender: "Admin", text: "Great work, Mohammed. Which client is this for?", time: "Yesterday 2:15 PM", isAdmin: true },
      { id: "m7", sender: "Mohammed PRO", text: "Submitted visa application to MOHRE", time: "Yesterday 3:00 PM", isAdmin: false },
      { id: "m8", sender: "Admin", text: "Good, please update the request status", time: "Yesterday 3:10 PM", isAdmin: true },
    ],
  },
  {
    id: "c3",
    name: "Fatima Al Hashmi",
    role: "Client",
    lastMessage: "I'll send you the required documents list",
    time: "Mar 24",
    unread: 2,
    messages: [
      { id: "m9", sender: "Fatima Al Hashmi", text: "Hello, I'm interested in setting up a new company in the free zone.", time: "Mar 24 9:00 AM", isAdmin: false },
      { id: "m10", sender: "Admin", text: "Welcome Fatima! We'd be happy to help with company formation. Which free zone are you considering?", time: "Mar 24 9:30 AM", isAdmin: true },
      { id: "m11", sender: "Fatima Al Hashmi", text: "Need help with company formation", time: "Mar 24 10:00 AM", isAdmin: false },
      { id: "m12", sender: "Admin", text: "I'll send you the required documents list", time: "Mar 24 10:15 AM", isAdmin: true },
    ],
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string>(demoConversations[0].id)
  const [newMessage, setNewMessage] = useState("")

  const activeConversation = demoConversations.find((c) => c.id === selectedConversation)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Internal messaging and client communication</p>
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden flex" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {demoConversations.map((conv) => (
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
    </div>
  )
}
