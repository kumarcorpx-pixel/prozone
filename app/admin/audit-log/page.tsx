"use client"

import { useState } from "react"
import { Plus, Pencil, Upload, UserPlus, AlertTriangle, CheckSquare, ScrollText } from "lucide-react"

const demoAuditLog = [
  { id: "al1", user: "Sarah Admin", action: "Updated request status", entity: "Trade License Renewal", details: "Changed from 'pending' to 'in_progress'", time: "2 hours ago", type: "update" },
  { id: "al2", user: "Mohammed PRO", action: "Uploaded document", entity: "Trade_License_Copy.pdf", details: "Uploaded for Gulf Trading LLC", time: "3 hours ago", type: "upload" },
  { id: "al3", user: "Ahmed Al Mansoori", action: "Created service request", entity: "New Employment Visa", details: "For Gulf Trading LLC, Priority: High", time: "5 hours ago", type: "create" },
  { id: "al4", user: "Sarah Admin", action: "Assigned staff", entity: "Visa Renewal", details: "Assigned to Mohammed PRO", time: "Yesterday", type: "assign" },
  { id: "al5", user: "Sarah Admin", action: "Created invoice", entity: "INV-2026-001", details: "AED 12,600 for Trade License Renewal", time: "Yesterday", type: "create" },
  { id: "al6", user: "Mohammed PRO", action: "Completed checklist item", entity: "Verify tenancy contract", details: "Trade License Renewal - Gulf Trading", time: "2 days ago", type: "checklist" },
  { id: "al7", user: "System", action: "Expiry alert sent", entity: "Trade License", details: "Gulf Trading LLC - expires in 5 days", time: "2 days ago", type: "alert" },
  { id: "al8", user: "Ahmed Al Mansoori", action: "Uploaded document", entity: "Passport_Copy.pdf", details: "Employee document upload", time: "3 days ago", type: "upload" },
]

const typeConfig: Record<string, { icon: typeof Plus; color: string; bgColor: string }> = {
  create: { icon: Plus, color: "text-green-600", bgColor: "bg-green-100" },
  update: { icon: Pencil, color: "text-blue-600", bgColor: "bg-blue-100" },
  upload: { icon: Upload, color: "text-purple-600", bgColor: "bg-purple-100" },
  assign: { icon: UserPlus, color: "text-orange-600", bgColor: "bg-orange-100" },
  alert: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100" },
  checklist: { icon: CheckSquare, color: "text-teal-600", bgColor: "bg-teal-100" },
}

const uniqueUsers = Array.from(new Set(demoAuditLog.map((entry) => entry.user)))
const uniqueTypes = Array.from(new Set(demoAuditLog.map((entry) => entry.type)))

export default function AuditLogPage() {
  const [userFilter, setUserFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filtered = demoAuditLog.filter((entry) => {
    const matchesUser = userFilter === "all" || entry.user === userFilter
    const matchesType = typeFilter === "all" || entry.type === typeFilter
    return matchesUser && matchesType
  })

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
