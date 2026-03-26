"use client"

import { useState } from "react"
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"

const typeIcons: Record<string, typeof Info> = { info: Info, warning: AlertTriangle, error: AlertCircle, success: CheckCircle2 }
const typeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-600",
  warning: "bg-yellow-100 text-yellow-600",
  error: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-600",
}

const initialNotifications = [
  { id: "n1", title: "New Request Assigned", message: "Trade License Renewal for Gulf Trading LLC has been assigned to you", type: "info", read: false, time: "1 hour ago" },
  { id: "n2", title: "Admin Note Added", message: "Sarah Admin added a note on your visa request: 'Please expedite this'", type: "warning", read: false, time: "3 hours ago" },
  { id: "n3", title: "Document Expiry Warning", message: "Emirates ID for Rajesh Kumar (Gulf Trading) expires in 25 days", type: "error", read: false, time: "Yesterday" },
  { id: "n4", title: "Checklist Reminder", message: "3 overdue checklist items on Company Formation request for Al Noor", type: "warning", read: true, time: "2 days ago" },
  { id: "n5", title: "Request Completed", message: "VAT Registration for Tech Ventures FZCO marked as completed", type: "success", read: true, time: "3 days ago" },
  { id: "n6", title: "New Request Assigned", message: "Visa Cancellation for Emirates Zone Group assigned to you", type: "info", read: true, time: "4 days ago" },
]

export default function StaffNotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [tab, setTab] = useState<"all" | "unread">("all")

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = tab === "unread" ? notifications.filter(n => !n.read) : notifications

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

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

      <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
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
              <div key={n.id} onClick={() => markRead(n.id)} className={`flex gap-4 p-4 cursor-pointer transition-colors ${n.read ? "hover:bg-gray-50" : "bg-blue-50/30 hover:bg-blue-50/50"}`}>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
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
