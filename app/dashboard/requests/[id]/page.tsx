"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { addTimelineEntry, getRequestTimeline } from "@/lib/api"
import { toast } from "sonner"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ArrowLeft, FileText, MessageSquare, CheckCircle2, Circle, Clock, Download, Loader2 } from "lucide-react"
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

  useEffect(() => {
    async function load() {
      try {
        const requestsRes = await fetch("/api/client/requests")
        const requests = requestsRes.ok ? await requestsRes.json() : []
        const found = requests.find((r: any) => r.id === requestId)
        if (!found) { setLoading(false); return }
        const req = found
        setRequest(req)
        if (req) {
          // Load documents for this request's company
          try {
            const docsRes = await fetch("/api/client/documents")
            if (docsRes.ok) {
              const docs = await docsRes.json()
              setReqDocs(docs.filter((d: any) => d.request_id === req.id || d.company_id === req.company_id))
            }
          } catch {}
          // Load timeline/messages
          try {
            const tl = await getRequestTimeline(requestId)
            setTimeline(tl)
          } catch {}
          // Load fees
          try {
            const feeRes = await fetch(`/api/client/requests/${requestId}`)
            if (feeRes.ok) {
              const feeData = await feeRes.json()
              if (feeData.government_fees) setFees(feeData.government_fees)
            }
          } catch {}
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

  const steps = getChecklistForServiceType(request.service_type)
  const completedSteps = Math.min(timeline.length, steps.length)

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
      // Refresh timeline
      try {
        const tl = await getRequestTimeline(requestId)
        setTimeline(tl)
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
        <StatusBadge status={request.status} />
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#1a3a6b] text-[#1a3a6b]" : "border-transparent text-gray-500"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Service Progress</h3>
              <span className="text-sm text-[#1a3a6b] font-medium">{completedSteps}/{steps.length} completed</span>
            </div>
            {steps.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No workflow steps available for this service type.</p>
            ) : (
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const done = i < completedSteps
                  const current = i === completedSteps
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500 text-white" : current ? "bg-[#1a3a6b] text-white" : "bg-gray-200 text-gray-400"}`}>
                          {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </div>
                        {i < steps.length - 1 && <div className={`w-0.5 h-8 ${done ? "bg-green-500" : "bg-gray-200"}`} />}
                      </div>
                      <div className="pb-6">
                        <p className={`text-sm font-medium ${done ? "text-green-700" : current ? "text-[#1a3a6b]" : "text-gray-500"}`}>{step}</p>
                        {done && <p className="text-xs text-gray-400 mt-0.5">Completed</p>}
                        {current && <p className="text-xs text-[#1a3a6b] mt-0.5">In Progress</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-[#1a3a6b]">PRO Officer: <strong>{request.assignee_name || "Assigned Staff"}</strong></p>
              {request.assignee_phone && <p className="text-xs text-gray-500 mt-0.5">Contact: {request.assignee_phone}</p>}
              <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(request.updated_at || request.created_at).toLocaleDateString()}</p>
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
            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b]">
              + Upload Document
            </button>
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
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {timeline.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No messages yet. Send the first message below.</p>
              ) : (
                timeline.map((entry: any) => {
                  const sender = entry.creator?.full_name || (typeof entry.created_by === "string" ? entry.created_by : "System")
                  const role = entry.created_by === "client" ? "client" : "admin"
                  return (
                    <div key={entry.id} className={`flex gap-3 ${role === "client" ? "flex-row-reverse" : ""}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-white ${role === "client" ? "bg-green-600" : "bg-purple-600"}`}>
                        {sender.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className={`max-w-[70%] p-3 rounded-lg ${role === "client" ? "bg-[#1a3a6b] text-white" : "bg-gray-100"}`}>
                        <p className={`text-xs font-medium mb-1 ${role === "client" ? "text-blue-200" : "text-gray-500"}`}>{sender}</p>
                        <p className="text-sm">{entry.message}</p>
                        <p className={`text-[10px] mt-1 ${role === "client" ? "text-blue-300" : "text-gray-400"}`}>{new Date(entry.created_at).toLocaleString()}</p>
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
