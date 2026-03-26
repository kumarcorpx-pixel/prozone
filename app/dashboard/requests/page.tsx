"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchRequests } from "@/lib/data-fetcher"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Plus, Calendar, User, ArrowRight } from "lucide-react"

const tabs = ["all", "active", "completed", "cancelled"] as const
const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700", low: "bg-gray-100 text-gray-600",
}

export default function ClientRequestsPage() {
  const [tab, setTab] = useState<string>("all")
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

  const filtered = requests.filter(r => {
    if (tab === "active") return ["pending", "in_progress", "under_review"].includes(r.status)
    if (tab === "completed") return r.status === "completed"
    if (tab === "cancelled") return r.status === "rejected"
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track all your PRO service requests</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]">
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${tab === t ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(req => {
          const steps = getChecklistForServiceType(req.service_type)
          const completedSteps = Math.min(Math.floor(steps.length * 0.4), steps.length)
          return (
            <Link key={req.id} href={`/dashboard/requests/${req.id}`} className="block bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-[#1a3a6b]/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{req.service_type}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{req.company?.name || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[req.priority] || "bg-gray-100"}`}>
                    {req.priority}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.assignee?.full_name || "Unassigned"}</span>
              </div>
              {steps.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-[#1a3a6b]">{completedSteps}/{steps.length} steps</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div className="h-1.5 bg-[#1a3a6b] rounded-full" style={{ width: `${(completedSteps / steps.length) * 100}%` }} />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end mt-3 text-xs text-[#1a3a6b]">
                View Details <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center text-gray-500">
            No requests found in this category.
          </div>
        )}
      </div>
    </div>
  )
}
