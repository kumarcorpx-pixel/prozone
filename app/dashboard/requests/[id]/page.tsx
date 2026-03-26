"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { demoRequests, demoTimeline, demoRequestDocuments } from "@/lib/demo-data"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { getNotes, addNote } from "@/lib/demo-store"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ArrowLeft, FileText, DollarSign, MessageSquare, CheckCircle2, Circle, Clock, Download } from "lucide-react"

const demoFees = [
  { type: "MOHRE Work Permit", amount: 3500, status: "Paid", receipt: "MOHRE-2025-789" },
  { type: "GDRFA Entry Permit", amount: 1500, status: "Paid", receipt: "GDRFA-2025-456" },
  { type: "Medical Fitness", amount: 350, status: "Paid", receipt: "MED-2025-123" },
  { type: "Typing / Amer", amount: 200, status: "Paid", receipt: "AMR-2025-678" },
  { type: "YABS Service Fee", amount: 2500, status: "Pending", receipt: "YABS-INV-001" },
]

const demoMessages = [
  { id: "m1", sender: "Sarah Admin", role: "admin", message: "Request received. We'll begin processing shortly.", time: "2 days ago" },
  { id: "m2", sender: "Mohammed PRO", role: "staff", message: "Documents verified. Submitting to DED tomorrow.", time: "1 day ago" },
  { id: "m3", sender: "Sarah Admin", role: "admin", message: "Application submitted. Reference: DED-2025-4567.", time: "5 hours ago" },
]

export default function ClientRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string
  const request = demoRequests.find(r => r.id === requestId) || demoRequests[0]
  const [activeTab, setActiveTab] = useState("progress")
  const [messageInput, setMessageInput] = useState("")

  const steps = getChecklistForServiceType(request.service_type)
  const completedSteps = Math.min(Math.floor(steps.length * 0.4), steps.length)
  const reqDocs = demoRequestDocuments.filter(d => d.request_id === request.id)
  const savedNotes = getNotes(request.id)

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    addNote(request.id, "Ahmed Al Mansoori", "client", messageInput)
    setMessageInput("")
  }

  const tabs = [
    { id: "progress", label: "Progress", icon: CheckCircle2 },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "fees", label: "Fees", icon: DollarSign },
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
          <p className="text-sm text-gray-500">{request.company?.name} &middot; {new Date(request.created_at).toLocaleDateString()}</p>
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
              <p className="text-sm text-[#1a3a6b]">PRO Officer: <strong>{request.assignee?.full_name || "Assigned Staff"}</strong></p>
              <p className="text-xs text-gray-500 mt-1">Last updated: {new Date(request.updated_at || request.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3">
            {reqDocs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No documents attached yet.</p>
            ) : (
              reqDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1a3a6b]" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${docTypeBadge[doc.doc_type] || docTypeBadge.general}`}>{doc.doc_type}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-[#1a3a6b]"><Download className="h-4 w-4" /></button>
                </div>
              ))
            )}
            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b]">
              + Upload Document
            </button>
          </div>
        )}

        {activeTab === "fees" && (
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Fee Type</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Amount (AED)</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Receipt</th>
            </tr></thead>
            <tbody>
              {demoFees.map((fee, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-3">{fee.type}</td>
                  <td className="px-4 py-3 text-right">{fee.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fee.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{fee.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{fee.receipt}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">AED {demoFees.reduce((s, f) => s + f.amount, 0).toLocaleString()}</td>
              <td colSpan={2} />
            </tr></tfoot>
          </table>
        )}

        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[...demoMessages, ...savedNotes.map(n => ({ id: n.id, sender: n.user_name, role: n.user_role, message: n.content, time: new Date(n.created_at).toLocaleDateString() }))].map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "client" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-white ${msg.role === "client" ? "bg-green-600" : msg.role === "admin" ? "bg-purple-600" : "bg-blue-600"}`}>
                    {msg.sender.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === "client" ? "bg-[#1a3a6b] text-white" : "bg-gray-100"}`}>
                    <p className={`text-xs font-medium mb-1 ${msg.role === "client" ? "text-blue-200" : "text-gray-500"}`}>{msg.sender}</p>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.role === "client" ? "text-blue-300" : "text-gray-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
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
