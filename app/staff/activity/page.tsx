"use client"

import { useState, useEffect } from "react"
import { Activity, FileText, CheckSquare, MessageSquare, RefreshCw } from "lucide-react"

const typeIcons: Record<string, typeof Activity> = {
  status: RefreshCw,
  upload: FileText,
  checklist: CheckSquare,
  note: MessageSquare,
}

const typeColors: Record<string, string> = {
  status: "bg-blue-100 text-blue-600",
  upload: "bg-green-100 text-green-600",
  checklist: "bg-purple-100 text-purple-600",
  note: "bg-yellow-100 text-yellow-600",
}

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

export default function ActivityPage() {
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Staff cannot access /api/admin/activity (admin-only), so fetch assigned requests instead
        const res = await fetch("/api/staff/requests")
        if (res.ok) {
          const data = await res.json()
          const requests = data.requests || data || []
          setActivity(requests.map((r: any) => ({
            id: r.id,
            type: "status",
            message: `${r.service_type || r.serviceType || "Request"} — ${r.status || "pending"}`,
            request: r.service_type || r.serviceType || "Service Request",
            company: r.company?.name || r.companyName || "",
            time: r.updated_at || r.updatedAt ? getRelativeTime(r.updated_at || r.updatedAt) : "",
          })))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#1a3a6b]" />
          My Activity
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your assigned requests and recent actions</p>
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
        {activity.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p>No activity yet. Your assigned requests will appear here.</p>
          </div>
        ) : (
          activity.map(entry => {
            const Icon = typeIcons[entry.type] || Activity
            const colorClass = typeColors[entry.type] || "bg-gray-100 text-gray-600"
            return (
              <div key={entry.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{entry.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#1a3a6b] font-medium">{entry.request}</span>
                    {entry.company && (
                      <>
                        <span className="text-xs text-gray-400">&middot;</span>
                        <span className="text-xs text-gray-500">{entry.company}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{entry.time}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
