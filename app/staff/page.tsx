"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchRequests } from "@/lib/data-fetcher"
import { demoChecklist } from "@/lib/demo-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { FileText, CheckCircle2, Clock, ClipboardList, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function StaffDashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const r = await fetchRequests()
      setRequests(r)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  // Show all requests as assigned to current staff
  const assignedRequests = requests.filter(
    (r) => r.status !== "rejected"
  )
  const inProgressCount = assignedRequests.filter((r) => r.status === "in_progress").length
  const completedToday = 2 // placeholder
  const pendingChecklistItems = demoChecklist.filter((item) => !item.is_completed).length

  const activeRequests = assignedRequests.filter(
    (r) => r.status !== "completed" && r.status !== "rejected"
  )

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.full_name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">PRO Staff Dashboard</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Assigned Requests"
          value={assignedRequests.length}
          icon={FileText}
          description={`${assignedRequests.length} total assigned`}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          description="Currently working on"
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          icon={CheckCircle2}
          description="Finished today"
        />
        <StatCard
          title="Pending Actions"
          value={pendingChecklistItems}
          icon={ClipboardList}
          description="Checklist items remaining"
        />
      </div>

      {/* My Active Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Active Requests</h2>
          <Link
            href="/staff/requests"
            className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRequests.map((request) => (
            <Link
              key={request.id}
              href={`/staff/requests/${request.id}`}
              className="bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-[#1a3a6b] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{request.service_type}</h3>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{request.company?.name}</p>
              <p className="text-xs text-gray-400">
                {new Date(request.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
            <Clock className="h-4 w-4" />
            Update Status
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium ring-1 ring-gray-200 hover:bg-gray-50 transition-colors">
            <FileText className="h-4 w-4" />
            Upload Document
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium ring-1 ring-gray-200 hover:bg-gray-50 transition-colors">
            <ClipboardList className="h-4 w-4" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}
