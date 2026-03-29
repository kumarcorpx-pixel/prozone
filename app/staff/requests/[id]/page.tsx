"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { fetchDocuments } from "@/lib/data-fetcher"
import { addTimelineEntry, getRequestTimeline } from "@/lib/api"
import type { ServiceRequest, RequestTimeline } from "@/lib/types"
import { toast } from "sonner"
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
  Loader2,
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

/** Valid status transitions for PRO staff */
const staffTransitions: Record<string, { value: string; label: string }[]> = {
  assigned: [{ value: "in_progress", label: "In Progress" }],
  in_progress: [
    { value: "under_review", label: "Under Review" },
    { value: "completed", label: "Completed" },
  ],
}

/** Notification targets after status change */
const notifyTargets: Record<string, string> = {
  in_progress: "Client will be notified that work has started.",
  under_review: "Admin will be notified for review.",
  completed: "Client and admin will be notified of completion.",
}

export default function StaffRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [statusNote, setStatusNote] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [lastNotification, setLastNotification] = useState("")
  const [noteText, setNoteText] = useState("")
  const [timelineNote, setTimelineNote] = useState("")
  const [checklistItems, setChecklistItems] = useState<RequestChecklist[]>([])
  const [uploadDocType, setUploadDocType] = useState<string>("submitted")
  const [realTimeline, setRealTimeline] = useState<any[]>([])
  const [realDocs, setRealDocs] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch the single request directly by ID
      let req: any = null
      try {
        const reqRes = await fetch(`/api/data/requests/${requestId}`)
        if (reqRes.ok) {
          req = await reqRes.json()
        }
      } catch {}
      setRequest(req)
      if (req) {
        // Pre-select first valid transition, if any
        const transitions = staffTransitions[req.status] || []
        setSelectedStatus(transitions.length > 0 ? transitions[0].value : "")
        // Build checklist from service type template
        const templateItems = getChecklistForServiceType(req.service_type)
        setChecklistItems(templateItems.map((item, i) => ({
          id: `checklist-${i}`,
          request_id: requestId,
          item,
          is_completed: false,
          completed_by: null,
          completed_at: null,
          sort_order: i + 1,
          created_at: new Date().toISOString(),
        })))
        // Fetch real documents for this company
        try {
          const docs = await fetchDocuments(req.company_id)
          setRealDocs(docs)
        } catch {}
      }
      // Try to load real timeline
      try {
        const timeline = await getRequestTimeline(requestId)
        setRealTimeline(timeline)
      } catch {
        // Fallback: no real timeline
      }
      setLoading(false)
    }
    load()
  }, [requestId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
      </div>
    )
  }

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

  const requestDocs = realDocs.filter((d: any) => d.company_id === request.company_id)
  const completedItems = checklistItems.filter((c) => c.is_completed).length
  const totalItems = checklistItems.length

  // Merge real timeline with demo timeline entries
  const mergedTimeline = [
    ...realTimeline.map(t => ({
      id: t.id,
      request_id: t.request_id,
      message: t.message,
      status: t.status,
      created_at: t.created_at,
      creator: t.creator || null,
      created_by: t.created_by,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  function handleToggleChecklistItem(itemId: string) {
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

  const handleStatusUpdate = async () => {
    if (!statusNote.trim()) {
      toast.error("Please add a note explaining what was done before updating the status.")
      return
    }
    if (!selectedStatus) return
    setUpdatingStatus(true)
    try {
      // Use the staff-scoped PATCH endpoint (not admin data endpoint)
      const res = await fetch("/api/staff/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          status: selectedStatus,
          notes: statusNote.trim(),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update status")
      }
      // Also add a timeline entry with the note
      await addTimelineEntry({
        request_id: request.id,
        status: selectedStatus,
        message: statusNote.trim(),
        created_by: "staff",
      })
      const statusLabel = (staffTransitions[request.status] || []).find(t => t.value === selectedStatus)?.label || selectedStatus
      toast.success(`Status updated to ${statusLabel}`)
      setLastNotification(notifyTargets[selectedStatus] || "")
      setStatusNote("")
      // Refresh request and timeline
      const reqRes = await fetch(`/api/data/requests/${requestId}`)
      if (reqRes.ok) {
        const updated = await reqRes.json()
        setRequest(updated)
        const transitions = staffTransitions[updated.status] || []
        setSelectedStatus(transitions.length > 0 ? transitions[0].value : "")
      }
      const timeline = await getRequestTimeline(requestId)
      setRealTimeline(timeline)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddNote = async () => {
    if (!timelineNote.trim()) return
    try {
      await addTimelineEntry({
        request_id: request.id,
        status: "",
        message: timelineNote,
        created_by: "staff",
      })
      setTimelineNote("")
      toast.success("Note added")
      // Refresh real timeline
      try {
        const timeline = await getRequestTimeline(requestId)
        setRealTimeline(timeline)
      } catch {}
    } catch {
      toast.error("Failed to add note")
      setTimelineNote("")
    }
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
              {request.company_name || "N/A"} &middot; {request.id}
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
        {/* Overview Tab */}
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
                  <p className="text-sm font-medium text-gray-900">{request.company_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Client</p>
                  <p className="text-sm font-medium text-gray-900">{request.client_name || "N/A"}</p>
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
              {(() => {
                const transitions = staffTransitions[request.status] || []
                if (request.status === "under_review") {
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <p className="text-sm text-purple-800">
                        This request is waiting for admin review. You will be notified when an update is available.
                      </p>
                    </div>
                  )
                }
                if (request.status === "completed") {
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-800">This request has been completed.</p>
                    </div>
                  )
                }
                if (request.status === "cancelled") {
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">This request has been cancelled.</p>
                    </div>
                  )
                }
                if (transitions.length === 0) {
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">No status transitions available from the current status.</p>
                    </div>
                  )
                }
                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                        >
                          {transitions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Describe what was done or why the status is changing..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleStatusUpdate}
                        disabled={updatingStatus || !statusNote.trim()}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors disabled:opacity-50"
                      >
                        {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {updatingStatus ? "Updating..." : "Update Status"}
                      </button>
                      {selectedStatus && notifyTargets[selectedStatus] && (
                        <p className="text-xs text-gray-500">{notifyTargets[selectedStatus]}</p>
                      )}
                    </div>
                    {lastNotification && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <p className="text-xs text-blue-700">{lastNotification}</p>
                      </div>
                    )}
                  </div>
                )
              })()}
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
              <div className="mt-3 flex justify-end">
                <button
                  disabled={!noteText.trim()}
                  onClick={async () => {
                    if (!noteText.trim()) return
                    try {
                      await addTimelineEntry({
                        request_id: request.id,
                        status: "",
                        message: noteText.trim(),
                        created_by: "staff",
                      })
                      toast.success("Note saved")
                      setNoteText("")
                      const timeline = await getRequestTimeline(requestId)
                      setRealTimeline(timeline)
                    } catch {
                      toast.error("Failed to save note")
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
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
                          {doc.file_name || doc.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(doc.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          docTypeColors[doc.doc_type || doc.document_type] || docTypeColors.general
                        }`}
                      >
                        {doc.doc_type || doc.document_type || "general"}
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
                  {selectedFile ? selectedFile.name : "Choose File"}
                  <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
                <button
                  disabled={!selectedFile || uploading}
                  onClick={async () => {
                    if (!selectedFile) return
                    setUploading(true)
                    try {
                      const formData = new FormData()
                      formData.append("file", selectedFile)
                      formData.append("request_id", request.id)
                      formData.append("company_id", request.company_id || "")
                      formData.append("doc_type", uploadDocType)
                      const res = await fetch("/api/documents/upload", { method: "POST", body: formData })
                      if (!res.ok) throw new Error("Upload failed")
                      toast.success("Document uploaded")
                      setSelectedFile(null)
                      // Refresh docs
                      try {
                        const docs = await fetchDocuments(request.company_id)
                        setRealDocs(docs)
                      } catch {}
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to upload document")
                    } finally {
                      setUploading(false)
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
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
                          onClick={() => handleToggleChecklistItem(item.id)}
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

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
              </div>
              <div className="px-6 py-4">
                {mergedTimeline.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-6">
                      {mergedTimeline.map((entry) => (
                          <div key={entry.id} className="relative flex gap-4 pl-10">
                            <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-white ring-2 ring-gray-200 flex items-center justify-center">
                              <Clock className="h-3 w-3 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {entry.status && <StatusBadge status={entry.status} />}
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
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
                >
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
