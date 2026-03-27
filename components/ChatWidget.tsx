"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const suggestions = [
  "What documents do I need?",
  "Visa processing time?",
  "Track my request",
  "Trade license renewal",
  "Payment methods",
  "Contact support",
]

export function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput("")
    setError("")

    const newMessages: Message[] = [...messages, { role: "user", content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch("/api/chat/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: msg,
          userRole: user?.role || "client",
          userName: user?.full_name || "User",
        }),
      })

      if (res.status === 429) {
        setError("You've reached the message limit. Please try again later.")
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error("Failed")

      const data = await res.json()
      setMessages([...newMessages, { role: "assistant", content: data.response }])
    } catch {
      setError("Something went wrong. Try again.")
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <>
      {/* Chat Bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#1a3a6b] text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Open AI chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">YA</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">YABS Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-300">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <>
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">YA</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-800">Hi {user?.full_name?.split(" ")[0] || "there"}! 👋 I'm your YABS Assistant. Ask me anything about PRO services, visas, documents, or your account.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => sendMessage(s)} className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-[#1a3a6b] rounded-full hover:bg-blue-100 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">YA</span>
                  </div>
                )}
                <div className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-[#1a3a6b] text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">YA</span>
                </div>
                <div className="bg-gray-100 rounded-lg rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 inline-block">{error}</p>
              </div>
            )}

            {messages.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.slice(0, 3).map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="px-2 py-1 text-[10px] font-medium bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value.substring(0, 500))}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1a3a6b] disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="h-9 w-9 rounded-lg bg-[#1a3a6b] text-white flex items-center justify-center hover:bg-[#15305a] disabled:opacity-50 disabled:hover:bg-[#1a3a6b] flex-shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-right mt-1">{input.length}/500</p>
          </div>
        </div>
      )}
    </>
  )
}
