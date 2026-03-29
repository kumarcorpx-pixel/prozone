"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Upload, UserPlus, AlertTriangle, CheckSquare, ScrollText } from "lucide-react"

const typeConfig: Record<string, { icon: typeof Plus; color: string; bgColor: string }> = {
  create: { icon: Plus, color: "text-green-600", bgColor: "bg-green-100" },
  update: { icon: Pencil, color: "text-blue-600", bgColor: "bg-blue-100" },
  upload: { icon: Upload, color: "text-purple-600", bgColor: "bg-purple-100" },
  assign: { icon: UserPlus, color: "text-orange-600", bgColor: "bg-orange-100" },
  alert: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100" },
  checklist: { icon: CheckSquare, color: "text-teal-600", bgColor: "bg-teal-100" },
}

function classifyAction(action: string): string {
  const lower = action.toLowerCase()
  if (lower.includes("creat") || lower.includes("add")) return "create"
  if (lower.includes("upload")) return "upload"
  if (lower.includes("assign")) return "assign"
  if (lower.includes("alert") || lower.includes("expir")) return "alert"
  if (lower.includes("checklist") || lower.includes("complet")) return "checklist"
  return "update"
}

function formatActionLabel(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AuditLogPage() {
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/audit-log")
        if (res.ok) {
          const data = await res.json()
          setAuditLog(((data.data || data.activities || []) as any[]).map((a: any) => ({
            id: a.id,
            user: a.user_name || "System",
            role: a.user_role || "",
            action: formatActionLabel(a.action || ""),
            entity: a.entity_type ? `${a.entity_type}${a.entity_id ? ` #${a.entity_id.substring(0, 8)}` : ""}` : "",
            details: typeof a.details === "string" ? a.details : a.details ? JSON.stringify(a.details).substring(0, 100) : a.message || "",
            time: a.time || "",
            type: classifyAction(a.action || a.message || ""),
          })))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const uniqueUsers = Array.from(new Set(auditLog.map((entry) => entry.user)))
  const uniqueTypes = Array.from(new Set(auditLog.map((entry) => entry.type)))

  const filtered = auditLog.filter((entry) => {
    const matchesUser = userFilter === "all" || entry.user === userFilter
    const matchesType = typeFilter === "all" || entry.type === typeFilter
    return matchesUser && matchesType
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Track all system activity and changes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          <option value="all">All Users</option>
          {uniqueUsers.map((user) => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          <option value="all">All Actions</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type} className="capitalize">{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium w-10"></th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Timestamp</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Action</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Entity</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const config = typeConfig[entry.type] || typeConfig.update
                const Icon = config.icon
                return (
                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{entry.time}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entry.user}</td>
                    <td className="px-6 py-4 text-gray-700">{entry.action}</td>
                    <td className="px-6 py-4 text-[#1a3a6b] font-medium">{entry.entity}</td>
                    <td className="px-6 py-4 text-gray-500">{entry.details}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <ScrollText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No audit log entries found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
