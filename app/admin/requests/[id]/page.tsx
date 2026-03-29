"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { fetchDocuments } from "@/lib/data-fetcher"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { updateServiceRequest, addTimelineEntry, getRequestTimeline } from "@/lib/api"
import type { ServiceRequest, RequestTimeline } from "@/lib/types"
import { toast } from "sonner"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ArrowLeft, FileText, CheckSquare, Clock, Upload, Plus, ChevronDown, MessageSquare, User, Loader2 } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"

const statusTransitions: Record<string, string[]> = {
  pending: ["assigned", "in_progress", "rejected", "cancelled"],
  assigned: ["in_progress", "cancelled"],
  in_progress: ["under_review", "completed", "cancelled"],
  under_review: ["completed", "in_progress", "rejected"],
  completed: [],
  rejected: ["pending"],
  cancelled: ["pending"],
}


const feeStatusColors: Record<string, string> = {
  paid_by_yabs: "bg-green-100 text-green-800",
  reimbursed: "bg-blue-100 text-blue-800",
  pending_reimbursement: "bg-yellow-100 text-yellow-800",
  pending: "bg-gray-100 text-gray-600",
}

export default function AdminRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [status, setStatus] = useState("")
  const [noteInput, setNoteInput] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [extraItems, setExtraItems] = useState<string[]>([])
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})
  const [realTimeline, setRealTimeline] = useState<any[]>([])
  const [governmentFees, setGovernmentFees] = useState<any[]>([])
  const [realDocs, setRealDocs] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [statusNote, setStatusNote] = useState("")

  useEffect(() => {
    async function load() {
      // Fetch the single request directly by ID
      try {
        const reqRes = await fetch(`/api/data/requests/${requestId}`)
        if (reqRes.ok) {
          const reqData = await reqRes.json()
          setRequest(reqData)
          setStatus(reqData.status)
          setAssignedTo(reqData.assigned_to || "")
          if (reqData.government_fees) setGovernmentFees(reqData.government_fees)
          // Fetch real documents for this request's company
          try {
            const docs = await fetchDocuments(reqData.company_id)
            setRealDocs(docs)
          } catch {}
        }
      } catch {}
      // Load real timeline
      try {
        const timeline = await getRequestTimeline(requestId)
        setRealTimeline(timeline)
      } catch {}
      // Load staff list for assignment dropdown
      try {
        const staffRes = await fetch("/api/data/users?role=pro_staff")
        if (staffRes.ok) {
          const staffData = await staffRes.json()
          setStaffList(Array.isArray(staffData) ? staffData : staffData.users || [])
        }
      } catch {}
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
        <Link href="/admin/requests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900">Request not found</p>
        </div>
      </div>
    )
  }

  const checklistItems = [...getChecklistForServiceType(request.service_type), ...extraItems]
  const reqDocs = realDocs.filter((d: any) => d.request_id === request.id || d.company_id === request.company_id)
  const completedCount = checklistItems.filter(item => checklistState[item] === true).length

  const allTimeline = realTimeline.map(t => ({
    id: t.id,
    request_id: t.request_id,
    message: t.message,
    created_by: t.creator?.full_name || t.created_by || "System",
    created_at: t.created_at,
    status: t.status,
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleStatusUpdate = async () => {
    try {
      const newStatusLabel = status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
      const noteText = statusNote.trim()
      const message = noteText
        ? `Status changed to ${status}. Note: ${noteText}`
        : `Status changed to ${status}`
      await updateServiceRequest(request.id, { status: status as ServiceRequest["status"] })
      await addTimelineEntry({
        request_id: request.id,
        status,
        message,
        created_by: "admin",
      } as Omit<RequestTimeline, "id" | "created_at" | "creator">)
      toast.success(`Status updated to ${newStatusLabel}`)
      setStatusNote("")
      // Refresh
      const reqRes = await fetch(`/api/data/requests/${requestId}`)
      if (reqRes.ok) {
        const reqData = await reqRes.json()
        setRequest(reqData)
        setStatus(reqData.status)
      }
      const timeline = await getRequestTimeline(requestId)
      setRealTimeline(timeline)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    }
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    try {
      await addTimelineEntry({
        request_id: request.id,
        status: "",
        message: noteInput,
        created_by: "admin",
      })
      setNoteInput("")
      toast.success("Note added")
      // Refresh timeline
      try {
        const timeline = await getRequestTimeline(requestId)
        setRealTimeline(timeline)
      } catch {}
    } catch (err: any) {
      toast.error(err?.message || "Failed to add note")
    }
  }

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    setExtraItems(prev => [...prev, newChecklistItem])
    setNewChecklistItem("")
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "documents", label: "Documents", icon: Upload },
    { id: "checklist", label: `Checklist (${completedCount}/${checklistItems.length})`, icon: CheckSquare },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "fees", label: "Fees", icon: AedIcon },
  ]

  const docTypeBadge: Record<string, string> = {
    required: "bg-blue-100 text-blue-700",
    submitted: "bg-yellow-100 text-yellow-700",
    processed: "bg-purple-100 text-purple-700",
    final: "bg-green-100 text-green-700",
    general: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/requests" prefetch={false}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/admin/requests" prefetch={false} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{request.service_type}</h1>
          <p className="text-sm text-gray-500">{request.company_name || "N/A"} &middot; {new Date(request.created_at).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#1a3a6b] text-[#1a3a6b]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Service Type", value: request.service_type },
                { label: "Company", value: request.company_name || "N/A" },
                { label: "Client", value: request.client_name || "N/A" },
                { label: "Priority", value: request.priority },
                { label: "Assigned To", value: request.assignee_name || "Unassigned" },
                { label: "Created", value: new Date(request.created_at).toLocaleDateString() },
                { label: "Due Date", value: request.due_date ? new Date(request.due_date).toLocaleDateString() : "Not set" },
                { label: "Description", value: request.description || "No description" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              {(statusTransitions[request.status]?.length ?? 0) === 0 ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1"><StatusBadge status={request.status} /></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Update Status</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value={request.status}>{request.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} (current)</option>
                        {(statusTransitions[request.status] || []).map((s: string) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={status === request.status}
                      className="px-4 py-2 bg-[#1a3a6b] text-white text-sm rounded-lg hover:bg-[#15305a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update
                    </button>
                  </div>
                  {status !== request.status && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Note / Reason (optional)</label>
                      <input
                        value={statusNote}
                        onChange={e => setStatusNote(e.target.value)}
                        placeholder="Add a reason or comment for this status change..."
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Assign Staff</label>
                  <select
                    value={assignedTo}
                    onChange={async (e) => {
                      const staffId = e.target.value
                      setAssignedTo(staffId)
                      try {
                        await updateServiceRequest(request.id, { assigned_to: staffId || null })
                        toast.success("Staff assignment updated")
                        const reqRes = await fetch(`/api/data/requests/${requestId}`)
                        if (reqRes.ok) setRequest(await reqRes.json())
                      } catch (err: any) {
                        toast.error(err?.message || "Failed to assign staff")
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            {reqDocs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No documents attached</p>
            ) : (
              reqDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1a3a6b]" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name || doc.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${docTypeBadge[doc.doc_type || doc.document_type] || docTypeBadge.general}`}>
                        {doc.doc_type || doc.document_type || "general"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
            <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b] w-full justify-center">
              <Upload className="h-4 w-4" /> Upload Document
            </button>
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-4">
            {checklistItems.length > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{completedCount}/{checklistItems.length}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${checklistItems.length ? (completedCount / checklistItems.length) * 100 : 0}%` }} />
                </div>
              </div>
            )}
            {checklistItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No checklist items. Template not found for &quot;{request.service_type}&quot;.</p>
            ) : (
              <div className="space-y-2">
                {checklistItems.map((item, i) => {
                  const completed = checklistState[item] === true
                  return (
                    <label key={i} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${completed ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => setChecklistState(prev => ({ ...prev, [item]: !completed }))}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1a3a6b]"
                      />
                      <span className={`text-sm ${completed ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
                    </label>
                  )
                })}
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t">
              <input
                value={newChecklistItem}
                onChange={e => setNewChecklistItem(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                onKeyDown={e => e.key === "Enter" && handleAddChecklistItem()}
              />
              <button onClick={handleAddChecklistItem} className="px-3 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-4">
            {allTimeline.map(entry => (
              <div key={entry.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{entry.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {typeof entry.created_by === "string" ? entry.created_by : "System"} &middot; {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {allTimeline.length === 0 && (
              <p className="text-center text-gray-500 py-8">No timeline entries yet.</p>
            )}
            <div className="flex gap-2 pt-4 border-t">
              <input
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                onKeyDown={e => e.key === "Enter" && handleAddNote()}
              />
              <button onClick={handleAddNote} className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm">Send</button>
            </div>
          </div>
        )}

        {activeTab === "fees" && (
          <div>
            {governmentFees.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Fee Type</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Amount (AED)</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Receipt #</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {governmentFees.map((fee: any, i: number) => (
                    <tr key={fee.id || i} className="border-b border-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{fee.fee_type || fee.feeType}</td>
                      <td className="px-4 py-3 text-right">{Number(fee.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feeStatusColors[fee.payment_status || fee.paymentStatus] || "bg-gray-100"}`}>
                          {(fee.payment_status || fee.paymentStatus || "pending").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{fee.receipt_number || fee.receiptNumber || "---"}</td>
                      <td className="px-4 py-3 text-gray-500">{fee.paid_date || fee.paidDate ? new Date(fee.paid_date || fee.paidDate).toLocaleDateString() : "---"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">AED {governmentFees.reduce((s: number, f: any) => s + Number(f.amount), 0).toLocaleString()}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-8">No government fees recorded for this request.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
