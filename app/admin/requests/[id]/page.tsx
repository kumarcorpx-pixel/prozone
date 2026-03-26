"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { demoRequests, demoTimeline, demoRequestDocuments, demoProfiles } from "@/lib/demo-data"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { isChecklistItemCompleted, toggleChecklistItem, addNote, getNotes, getTimelineEntries, setRequestStatus, getRequestStatus } from "@/lib/demo-store"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ArrowLeft, FileText, CheckSquare, Clock, DollarSign, Upload, Plus, ChevronDown, MessageSquare, User } from "lucide-react"

const statusOptions = ["pending", "in_progress", "under_review", "completed", "rejected"]

const demoFees = [
  { type: "MOHRE Work Permit", amount: 3500, status: "paid_by_yabs", receipt: "MOHRE-2025-78901", date: "2025-03-15" },
  { type: "GDRFA Entry Permit", amount: 1500, status: "paid_by_yabs", receipt: "GDRFA-2025-45678", date: "2025-03-16" },
  { type: "Medical Fitness", amount: 350, status: "paid_by_yabs", receipt: "MED-2025-12345", date: "2025-03-18" },
  { type: "Typing / Amer Center", amount: 200, status: "paid_by_yabs", receipt: "AMR-2025-67890", date: "2025-03-15" },
  { type: "YABS Service Fee", amount: 2500, status: "pending_reimbursement", receipt: "YABS-INV-2025-001", date: "2025-03-14" },
]

const feeStatusColors: Record<string, string> = {
  paid_by_yabs: "bg-green-100 text-green-800",
  reimbursed: "bg-blue-100 text-blue-800",
  pending_reimbursement: "bg-yellow-100 text-yellow-800",
  pending: "bg-gray-100 text-gray-600",
}

export default function AdminRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string
  const request = demoRequests.find(r => r.id === requestId) || demoRequests[0]

  const [activeTab, setActiveTab] = useState("overview")
  const [status, setStatus] = useState(getRequestStatus(request.id, request.status))
  const [noteInput, setNoteInput] = useState("")
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [extraItems, setExtraItems] = useState<string[]>([])

  const checklistItems = [...getChecklistForServiceType(request.service_type), ...extraItems]
  const reqDocs = demoRequestDocuments.filter(d => d.request_id === request.id)
  const timeline = [...demoTimeline.filter(t => t.request_id === request.id), ...getTimelineEntries(request.id)]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const notes = getNotes(request.id)
  const completedCount = checklistItems.filter(item => isChecklistItemCompleted(request.id, item) === true).length

  const handleStatusUpdate = () => {
    setRequestStatus(request.id, status, "Sarah Admin")
  }

  const handleAddNote = () => {
    if (!noteInput.trim()) return
    addNote(request.id, "Sarah Admin", "admin", noteInput)
    setNoteInput("")
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
    { id: "fees", label: "Fees", icon: DollarSign },
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
      <div className="flex items-center gap-3">
        <Link href="/admin/requests" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{request.service_type}</h1>
          <p className="text-sm text-gray-500">{request.company?.name} &middot; {new Date(request.created_at).toLocaleDateString()}</p>
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
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Service Type", value: request.service_type },
                { label: "Company", value: request.company?.name || "N/A" },
                { label: "Client", value: request.client?.full_name || "N/A" },
                { label: "Priority", value: request.priority },
                { label: "Assigned To", value: request.assignee?.full_name || "Unassigned" },
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
            <div className="border-t pt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Update Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleStatusUpdate} className="px-4 py-2 bg-[#1a3a6b] text-white text-sm rounded-lg hover:bg-[#15305a]">
                Update
              </button>
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
                      <p className="text-sm font-medium">{doc.file_name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${docTypeBadge[doc.doc_type] || docTypeBadge.general}`}>
                        {doc.doc_type}
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
                  const completed = isChecklistItemCompleted(request.id, item) === true
                  return (
                    <label key={i} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${completed ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                      <input
                        type="checkbox"
                        checked={completed}
                        onChange={() => toggleChecklistItem(request.id, item, !completed, "Sarah Admin")}
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
            {[...timeline, ...notes.map(n => ({ id: n.id, request_id: n.request_id, message: `Note: ${n.content}`, created_by: n.user_name, created_at: n.created_at, status: undefined }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(entry => (
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
                {demoFees.map((fee, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{fee.type}</td>
                    <td className="px-4 py-3 text-right">{fee.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feeStatusColors[fee.status] || "bg-gray-100"}`}>
                        {fee.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{fee.receipt}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(fee.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">AED {demoFees.reduce((s, f) => s + f.amount, 0).toLocaleString()}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
