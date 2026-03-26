"use client"

import { useState } from "react"
import { demoRequests } from "@/lib/demo-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, FileText, Filter } from "lucide-react"

const statusOptions = ["all", "pending", "in_progress", "under_review", "completed", "rejected"]
const priorityOptions = ["all", "urgent", "high", "medium", "low"]

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
}

export default function RequestsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filtered = demoRequests.filter((r) => {
    const matchesSearch =
      (r.company?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      r.service_type.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Service Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all service requests across clients</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          {priorityOptions.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Service Type</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Priority</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Assigned To</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{req.client?.full_name || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-600">{req.company?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-700">{req.service_type}</td>
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[req.priority] || "bg-gray-100 text-gray-600"}`}>
                      {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{req.assignee?.full_name || "Unassigned"}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No requests found matching your filters.
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
