"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle2, Loader2, ChevronRight } from "lucide-react"

const typeIcons: Record<string, typeof Info> = { info: Info, warning: AlertTriangle, error: AlertCircle, success: CheckCircle2 }
const typeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-600",
  warning: "bg-yellow-100 text-yellow-600",
  error: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-600",
}

export default function StaffNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"all" | "unread">("all")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          setNotifications((data.notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || "info",
            isRead: n.isRead ?? false,
            link: n.link || null,
            createdAt: n.createdAt || n.created_at || "",
          })))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const filtered = tab === "unread" ? notifications.filter(n => !n.isRead) : notifications

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    try {
      await Promise.all(unread.map(n =>
        fetch(`/api/notifications`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id, isRead: true }),
        })
      ))
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }
  const markRead = async (id: string) => {
    const n = notifications.find(n => n.id === id)
    if (n && !n.isRead) {
      try {
        await fetch(`/api/notifications`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isRead: true }),
        })
      } catch {}
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    // Navigate to the notification's link if present
    if (n?.link) {
      router.push(n.link)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#1a3a6b]" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-[#1a3a6b] hover:underline">Mark all as read</button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["all", "unread"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600"}`}>
            {t === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p>No {tab === "unread" ? "unread " : ""}notifications</p>
          </div>
        ) : (
          filtered.map(n => {
            const Icon = typeIcons[n.type] || Info
            const colorClass = typeColors[n.type] || typeColors.info
            return (
              <div key={n.id} onClick={() => markRead(n.id)} className={`flex gap-4 p-4 cursor-pointer transition-colors ${n.isRead ? "hover:bg-gray-50" : "bg-blue-50/30 hover:bg-blue-50/50"}`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? "text-gray-700" : "text-gray-900 font-medium"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</span>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  {n.link && <ChevronRight className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
