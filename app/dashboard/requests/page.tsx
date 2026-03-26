"use client"

import { useState } from "react"
import { demoRequests } from "@/lib/demo-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Plus, FileText, Calendar, User, MessageSquare } from "lucide-react"

type FilterTab = "all" | "pending" | "in_progress" | "completed"

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
]

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700" },
  high: { label: "High", className: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [showNewForm, setShowNewForm] = useState(false)

  const filteredRequests = demoRequests.filter((r) => {
    if (activeTab === "all") return true
    if (activeTab === "in_progress") return r.status === "in_progress" || r.status === "under_review"
    if (activeTab === "completed") return r.status === "completed" || r.status === "rejected"
    return r.status === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all your service requests.</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* New Request Placeholder Form */}
      {showNewForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit New Request</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a3a6b] focus:border-[#1a3a6b] outline-none">
                <option>Select a service...</option>
                <option>Trade License Renewal</option>
                <option>New Employment Visa</option>
                <option>Visa Cancellation</option>
                <option>Document Attestation</option>
                <option>VAT Return Filing</option>
                <option>Company Formation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a3a6b] focus:border-[#1a3a6b] outline-none resize-none"
                placeholder="Describe your request..."
              />
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors">
                Submit Request
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white text-[#1a3a6b] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No requests found</p>
            <p className="text-sm text-gray-400 mt-1">
              There are no requests matching the selected filter.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const priority = priorityConfig[request.priority] || priorityConfig.medium
            return (
              <div
                key={request.id}
                className="bg-white rounded-xl ring-1 ring-gray-200 p-6 hover:ring-gray-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{request.service_type}</h3>
                      <StatusBadge status={request.status} />
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </div>

                    {request.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(request.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {request.assignee && (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {request.assignee.full_name}
                        </span>
                      )}
                      {request.company && (
                        <span className="text-gray-400">{request.company.name}</span>
                      )}
                    </div>

                    {request.notes && (
                      <div className="flex items-start gap-1.5 mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{request.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
