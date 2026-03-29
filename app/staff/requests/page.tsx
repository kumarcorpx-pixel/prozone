"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
// Uses staff-scoped endpoint instead of admin data-fetcher
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { StatusBadge } from "@/components/dashboard/status-badge"

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
}

const tabs = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
] as const

type TabKey = (typeof tabs)[number]["key"]

export default function StaffRequestsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/staff/requests")
      const data = res.ok ? await res.json() : { requests: [] }
      setRequests(data.requests || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  // Show all requests as if assigned to current staff
  const allRequests = requests

  const filteredRequests =
    activeTab === "all"
      ? allRequests
      : allRequests.filter((r) => r.status === activeTab)

  function getChecklistProgress(request: any) {
    const items = getChecklistForServiceType(request.service_type)
    const total = items.length
    if (total === 0) return null
    const completed = 0 // No persistent checklist state yet
    return { completed, total }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track your assigned service requests.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#1a3a6b] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((request) => {
          const progress = getChecklistProgress(request)
          return (
            <Link
              key={request.id}
              href={`/staff/requests/${request.id}`}
              className="bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-[#1a3a6b] transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{request.service_type}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{request.company?.name}</p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={request.status} />
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    priorityColors[request.priority] || priorityColors.low
                  }`}
                >
                  {request.priority}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Created{" "}
                {new Date(request.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {progress && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Checklist</span>
                    <span>
                      {progress.completed}/{progress.total} items completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-[#1a3a6b] h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(progress.completed / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No requests found</p>
          <p className="text-sm mt-1">No requests match the selected filter.</p>
        </div>
      )}
    </div>
  )
}
