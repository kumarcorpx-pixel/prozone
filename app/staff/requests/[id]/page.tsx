"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  demoRequests,
  demoTimeline,
  demoChecklist,
  demoRequestDocuments,
} from "@/lib/demo-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  ArrowLeft,
  FileText,
  CheckSquare,
  Clock,
  Upload,
  Plus,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import type { RequestChecklist } from "@/lib/types"

const tabItems = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "checklist", label: "Checklist", icon: CheckSquare },
  { key: "timeline", label: "Timeline", icon: Clock },
] as const

type TabKey = (typeof tabItems)[number]["key"]

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
}

const docTypeColors: Record<string, string> = {
  required: "bg-blue-100 text-blue-800",
  submitted: "bg-yellow-100 text-yellow-800",
  processed: "bg-purple-100 text-purple-800",
  final: "bg-green-100 text-green-800",
  general: "bg-gray-100 text-gray-600",
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "under_review", label: "Under Review" },
  { value: "completed", label: "Completed" },
]

export default function StaffRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  const request = demoRequests.find((r) => r.id === requestId)
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [selectedStatus, setSelectedStatus] = useState<string>(request?.status || "pending")
  const [noteText, setNoteText] = useState("")
  const [timelineNote, setTimelineNote] = useState("")
  const [checklistItems, setChecklistItems] = useState<RequestChecklist[]>(
    demoChecklist.filter((c) => c.request_id === requestId)
  )
  const [uploadDocType, setUploadDocType] = useState<string>("submitted")

  if (!request) {
    return (
      <div className="space-y-6">
        <Link
          href="/staff/requests"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900">Request not found</p>
          <p className="text-sm text-gray-500 mt-1">
            The request you are looking for does not exist.
          </p>
        </div>
      </div>
    )
  }

  const requestDocs = demoRequestDocuments.filter((d) => d.request_id === requestId)
  const requestTimeline = demoTimeline.filter((t) => t.request_id === requestId)
  const completedItems = checklistItems.filter((c) => c.is_completed).length
  const totalItems = checklistItems.length

  function toggleChecklistItem(itemId: string) {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            is_completed: !item.is_completed,
            completed_by: !item.is_completed ? "Mohammed PRO" : null,
            completed_at: !item.is_completed ? new Date().toISOString() : null,
          }
        }
        return item
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/staff/requests"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      {/* Request header */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{request.service_type}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {request.company?.name} &middot; {request.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                priorityColors[request.priority] || priorityColors.low
              }`}
            >
              {request.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px">
          {tabItems.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[#1a3a6b] text-[#1a3a6b]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* ─── Overview Tab ──────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Request info grid */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Service Type</p>
                  <p className="text-sm font-medium text-gray-900">{request.service_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Company</p>
                  <p className="text-sm font-medium text-gray-900">{request.company?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Client</p>
                  <p className="text-sm font-medium text-gray-900">{request.client?.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <StatusBadge status={request.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      priorityColors[request.priority] || priorityColors.low
                    }`}
                  >
                    {request.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(request.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {request.due_date && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Due Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(request.due_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
              {request.description && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700">{request.description}</p>
                </div>
              )}
            </div>

            {/* Status update */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
                  Update Status
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              {request.notes && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">{request.notes}</p>
                </div>
              )}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* ─── Documents Tab ─────────────────────────────────────────── */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Request Documents</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {requestDocs.length > 0 ? (
                  requestDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Uploaded by {doc.uploaded_by === "demo-client-001" ? "Client" : "Staff"} &middot;{" "}
                          {new Date(doc.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          docTypeColors[doc.doc_type] || docTypeColors.general
                        }`}
                      >
                        {doc.doc_type}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents attached to this request.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload section */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                  >
                    <option value="required">Required</option>
                    <option value="submitted">Submitted</option>
                    <option value="processed">Processed</option>
                    <option value="final">Final</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium ring-1 ring-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Choose File
                  <input type="file" className="hidden" />
                </label>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Checklist Tab ─────────────────────────────────────────── */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Checklist Progress</h2>
                <span className="text-sm font-medium text-gray-600">
                  {completedItems}/{totalItems} completed
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-[#1a3a6b] h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: totalItems > 0 ? `${(completedItems / totalItems) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {checklistItems.length > 0 ? (
                  checklistItems
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.is_completed
                              ? "bg-[#1a3a6b] border-[#1a3a6b]"
                              : "border-gray-300 hover:border-[#1a3a6b]"
                          }`}
                        >
                          {item.is_completed && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              item.is_completed
                                ? "text-gray-400 line-through"
                                : "text-gray-900 font-medium"
                            }`}
                          >
                            {item.item}
                          </p>
                          {item.is_completed && item.completed_by && (
                            <p className="text-xs text-gray-400 mt-1">
                              Completed by {item.completed_by} at{" "}
                              {new Date(item.completed_at!).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No checklist items for this request.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Timeline Tab ──────────────────────────────────────────── */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
              </div>
              <div className="px-6 py-4">
                {requestTimeline.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-6">
                      {requestTimeline
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        )
                        .map((entry) => (
                          <div key={entry.id} className="relative flex gap-4 pl-10">
                            <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-white ring-2 ring-gray-200 flex items-center justify-center">
                              <Clock className="h-3 w-3 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <StatusBadge status={entry.status} />
                                <span className="text-xs text-gray-400">
                                  {new Date(entry.created_at).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{entry.message}</p>
                              {entry.creator && (
                                <p className="text-xs text-gray-400 mt-1">
                                  by {entry.creator.full_name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No timeline entries yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add note */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={timelineNote}
                    onChange={(e) => setTimelineNote(e.target.value)}
                    placeholder="Add a note to the timeline..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                  />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
