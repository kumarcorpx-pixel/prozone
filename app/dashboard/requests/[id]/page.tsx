"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { addTimelineEntry } from "@/lib/api"
import { toast } from "sonner"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ArrowLeft, FileText, MessageSquare, CheckCircle2, Circle, Clock, Download, Loader2, Phone, UserCheck } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"

export default function ClientRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("progress")
  const [messageInput, setMessageInput] = useState("")
  const [reqDocs, setReqDocs] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const loadRequest = async () => {
    try {
      const res = await fetch(`/api/client/requests/${requestId}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setRequest(data)
      setTimeline(data.timeline || [])
      setFees(data.fees || data.government_fees || [])
      // Load documents for this request's company
      try {
        const docsRes = await fetch("/api/client/documents")
        if (docsRes.ok) {
          const docs = await docsRes.json()
          setReqDocs(docs.filter((d: any) => d.request_id === data.id || d.company_id === data.company_id))
        }
      } catch {}
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadRequest()
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
        <Link href="/dashboard/requests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Link>
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900">Request not found</p>
        </div>
      </div>
    )
  }

  const lifecycleSteps = [
    { key: "pending", label: "Submitted" },
    { key: "assigned", label: "Assigned" },
    { key: "in_progress", label: "In Progress" },
    { key: "under_review", label: "Under Review" },
    { key: "completed", label: "Completed" },
  ]
  const statusOrder = ["pending", "assigned", "in_progress", "under_review", "completed"]
  const currentIdx = statusOrder.indexOf(request.status)

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return
    try {
      await addTimelineEntry({
        request_id: request.id,
        status: "",
        message: messageInput,
        created_by: "client",
      })
      setMessageInput("")
      toast.success("Message sent")
      // Refresh request data (includes timeline)
      try {
        const res = await fetch(`/api/client/requests/${requestId}`)
        if (res.ok) {
          const data = await res.json()
          setTimeline(data.timeline || [])
        }
      } catch {}
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message")
    }
  }

  const tabs = [
    { id: "progress", label: "Progress", icon: CheckCircle2 },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "fees", label: "Fees", icon: AedIcon },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ]

  const docTypeBadge: Record<string, string> = {
    required: "bg-blue-100 text-blue-700", submitted: "bg-yellow-100 text-yellow-700",
    processed: "bg-purple-100 text-purple-700", final: "bg-green-100 text-green-700",
    general: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/requests" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-500" /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{request.service_type}</h1>
          <p className="text-sm text-gray-500">{request.company_name || "N/A"} &middot; {new Date(request.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Large status banner */}
      {(() => {
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
          assigned: "bg-indigo-50 border-indigo-200 text-indigo-800",
          in_progress: "bg-blue-50 border-blue-200 text-blue-800",
          under_review: "bg-purple-50 border-purple-200 text-purple-800",
          completed: "bg-green-50 border-green-200 text-green-800",
          rejected: "bg-red-50 border-red-200 text-red-800",
          cancelled: "bg-gray-50 border-gray-200 text-gray-800",
        }
        const statusLabels: Record<string, string> = {
          pending: "Pending Review", assigned: "Assigned to PRO Officer", in_progress: "Work In Progress",
          under_review: "Under Review", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled",
        }
        const progressMap: Record<string, number> = { pending: 10, assigned: 25, in_progress: 50, under_review: 80, completed: 100 }
        const pct = progressMap[request.status] ?? 0
        return (
          <div className={`rounded-xl border p-4 ${statusColors[request.status] || "bg-gray-50 border-gray-200 text-gray-800"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{statusLabels[request.status] || request.status}</p>
                <p className="text-sm opacity-75 mt-0.5">Last updated: {new Date(request.updated_at || request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              {pct > 0 && <span className="text-2xl font-bold">{pct}%</span>}
            </div>
            {pct > 0 && (
              <div className="h-2 bg-white/50 rounded-full mt-3">
                <div className="h-2 bg-current rounded-full opacity-60" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        )
      })()}

      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#1a3a6b] text-[#1a3a6b]" : "border-transparent text-gray-500"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        {activeTab === "progress" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-900">Request Lifecycle</h3>

            {/* Lifecycle stepper */}
            {["rejected", "cancelled"].includes(request.status) ? (
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-sm font-medium text-red-700">This request has been {request.status}.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {lifecycleSteps.map((step, i) => {
                  const done = i < currentIdx || (i === currentIdx && request.status === "completed")
                  const current = i === currentIdx && request.status !== "completed"
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500 text-white" : current ? "bg-[#1a3a6b] text-white" : "bg-gray-200 text-gray-400"}`}>
                          {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </div>
                        {i < lifecycleSteps.length - 1 && <div className={`w-0.5 h-8 ${done ? "bg-green-500" : "bg-gray-200"}`} />}
                      </div>
                      <div className="pb-6">
                        <p className={`text-sm font-medium ${done ? "text-green-700" : current ? "text-[#1a3a6b]" : "text-gray-500"}`}>{step.label}</p>
                        {done && <p className="text-xs text-gray-400 mt-0.5">Completed</p>}
                        {current && <p className="text-xs text-[#1a3a6b] mt-0.5">Current Step</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Your PRO Officer card */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your PRO Officer</p>
                  <p className="text-sm font-semibold text-gray-900">{request.assignee_name || "Not yet assigned"}</p>
                </div>
              </div>
              {request.assignee_phone && (
                <div className="flex items-center gap-2 mt-2 ml-[52px]">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <a href={`tel:${request.assignee_phone}`} className="text-sm text-[#1a3a6b] hover:underline">{request.assignee_phone}</a>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 ml-[52px]">Last updated: {new Date(request.updated_at || request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3">
            {reqDocs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No documents attached yet.</p>
            ) : (
              reqDocs.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1a3a6b]" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name || doc.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${docTypeBadge[doc.doc_type || doc.document_type] || docTypeBadge.general}`}>{doc.doc_type || doc.document_type || "general"}</span>
                    </div>
                  </div>
                  {doc.file_url && (
                    <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#1a3a6b]"><Download className="h-4 w-4" /></a>
                  )}
                </div>
              ))
            )}
            <label className={`w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b] flex items-center justify-center cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  try {
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("request_id", request.id)
                    if (request.company_id) formData.append("company_id", request.company_id)
                    const res = await fetch("/api/documents/upload", { method: "POST", body: formData })
                    if (!res.ok) throw new Error("Upload failed")
                    toast.success("Document uploaded")
                    // Refresh documents
                    const docsRes = await fetch("/api/client/documents")
                    if (docsRes.ok) {
                      const docs = await docsRes.json()
                      setReqDocs(docs.filter((d: any) => d.request_id === request.id || d.company_id === request.company_id))
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to upload document")
                  }
                  setUploading(false)
                  e.target.value = ""
                }}
              />
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {uploading ? "Uploading..." : "+ Upload Document"}
            </label>
          </div>
        )}

        {activeTab === "fees" && (
          fees.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Fee Type</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Amount (AED)</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Receipt</th>
              </tr></thead>
              <tbody>
                {fees.map((fee: any, i: number) => (
                  <tr key={fee.id || i} className="border-b border-gray-50">
                    <td className="px-4 py-3">{fee.fee_type || fee.type}</td>
                    <td className="px-4 py-3 text-right">{Number(fee.amount).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(fee.payment_status || fee.status) === "paid" || (fee.payment_status || fee.status) === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{fee.payment_status || fee.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{fee.receipt_number || fee.receipt || "---"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">AED {fees.reduce((s: number, f: any) => s + Number(f.amount), 0).toLocaleString()}</td>
                <td colSpan={2} />
              </tr></tfoot>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AedIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>No fees recorded for this request yet.</p>
            </div>
          )
        )}

        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timeline.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet. Send the first message below.</p>
              ) : (
                timeline.map((entry: any) => {
                  const sender = entry.creator?.full_name || (typeof entry.created_by === "string" ? entry.created_by : "System")
                  const role = entry.created_by_role || (typeof entry.created_by === "string" ? entry.created_by : "system")
                  const isClient = role === "client"
                  const isProStaff = role === "pro_staff"
                  const roleLabel = isClient ? "You" : isProStaff ? "PRO Staff" : role === "admin" ? "Admin" : "System"
                  return (
                    <div key={entry.id} className={`flex gap-3 ${isClient ? "flex-row-reverse" : ""}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-white ${isClient ? "bg-blue-600" : isProStaff ? "bg-indigo-600" : "bg-gray-500"}`}>
                        {sender.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className={`max-w-[70%] p-3 rounded-lg ${isClient ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                        <p className={`text-xs font-medium mb-1 ${isClient ? "text-blue-200" : "text-gray-500"}`}>{sender} <span className="font-normal">({roleLabel})</span></p>
                        {entry.status && <p className={`text-[10px] mb-1 font-medium ${isClient ? "text-blue-200" : "text-gray-400"}`}>Status: {entry.status}</p>}
                        <p className="text-sm">{entry.message}</p>
                        <p className={`text-[10px] mt-1 ${isClient ? "text-blue-300" : "text-gray-400"}`}>{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="flex gap-2 pt-3 border-t">
              <input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" onKeyDown={e => e.key === "Enter" && handleSendMessage()} />
              <button onClick={handleSendMessage} className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
