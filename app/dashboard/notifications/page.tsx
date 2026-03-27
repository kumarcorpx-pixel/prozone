"use client"

import { useState, useEffect } from "react"
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"

const typeIcons: Record<string, typeof Info> = { info: Info, warning: AlertTriangle, error: AlertCircle, success: CheckCircle2 }
const typeColors: Record<string, string> = { info: "bg-blue-100 text-blue-600", warning: "bg-yellow-100 text-yellow-600", error: "bg-red-100 text-red-600", success: "bg-green-100 text-green-600" }

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

const tabs = ["all", "expiry", "request", "payment"] as const
const tabLabels: Record<string, string> = { all: "All", expiry: "Expiry Alerts", request: "Request Updates", payment: "Payments" }

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<string>("all")

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
            read: n.isRead ?? n.is_read ?? false,
            time: n.createdAt ? getRelativeTime(n.createdAt) : (n.created_at ? getRelativeTime(n.created_at) : ""),
            category: n.category || "request",
          })))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = tab === "all" ? notifications : notifications.filter(n => n.category === tab)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-sm text-[#1a3a6b] hover:underline">Mark all as read</button>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${tab === t ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600"}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500"><Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" /><p>No notifications</p></div>
        ) : (
          filtered.map(n => {
            const Icon = typeIcons[n.type] || Info
            return (
              <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} className={`flex gap-4 p-4 cursor-pointer transition-colors ${n.read ? "hover:bg-gray-50" : "bg-blue-50/30 hover:bg-blue-50/50"}`}>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type]}`}><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? "text-gray-700" : "text-gray-900 font-medium"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{n.time}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
