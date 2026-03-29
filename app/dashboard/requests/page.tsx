"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { serviceCatalog, getCategories } from "@/lib/service-catalog"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Plus, Calendar, User, ArrowRight, X, Loader2, Upload, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const tabs = ["all", "active", "completed", "cancelled"] as const
const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700", low: "bg-gray-100 text-gray-600",
}


const defaultRequestForm = {
  companyId: "",
  serviceType: "",
  description: "",
  priority: "medium" as const,
}

export default function ClientRequestsPage() {
  const [tab, setTab] = useState<string>("all")
  const [requests, setRequests] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultRequestForm)
  const [attachments, setAttachments] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [requestsRes, companiesRes] = await Promise.all([
          fetch("/api/client/requests"),
          fetch("/api/client/companies"),
        ])
        if (requestsRes.ok) {
          const reqs = await requestsRes.json()
          setRequests(reqs)
        }
        if (companiesRes.ok) setCompanies(await companiesRes.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleAddRequest = async () => {
    if (!formData.serviceType) {
      toast.error("Please select a service type")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/client/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          ...(formData.companyId ? { companyId: formData.companyId } : {}),
          ...(formData.description ? { description: formData.description } : {}),
          priority: formData.priority,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to submit request")
      }
      const newReq = await res.json()
      // Upload attachments if any (don't block on failure)
      if (attachments.length > 0) {
        const reqId = newReq.request?.id || newReq.id
        const compId = formData.companyId || "general"
        for (const file of attachments) {
          try {
            const fd = new FormData()
            fd.append("file", file)
            fd.append("name", file.name)
            fd.append("companyId", compId)
            fd.append("documentType", "other")
            const upRes = await fetch("/api/documents/upload", { method: "POST", body: fd })
            if (!upRes.ok) console.error("Upload failed:", await upRes.text())
          } catch (e) {
            console.error("Upload error:", e)
          }
        }
      }
      toast.success("Request submitted successfully")
      setShowAddForm(false)
      setFormData(defaultRequestForm)
      setAttachments([])
      const updatedRes = await fetch("/api/client/requests")
      if (updatedRes.ok) setRequests(await updatedRes.json())
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  const filtered = requests.filter(r => {
    if (tab === "active") return ["pending", "assigned", "in_progress", "under_review"].includes(r.status)
    if (tab === "completed") return r.status === "completed"
    if (tab === "cancelled") return ["cancelled", "rejected"].includes(r.status)
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track all your PRO service requests</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "New Request"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Submit New Request</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="">Select a company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="">Select a service</option>
                {getCategories().map((cat) => (
                  <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                    {serviceCatalog.filter(s => s.category === cat).map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Describe what you need..."
              />
            </div>
          </div>
          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (optional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4" /> Choose Files
                <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={(e) => { if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]) }} />
              </label>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {attachments.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {f.name.length > 20 ? f.name.substring(0, 20) + "..." : f.name}
                      <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-blue-400 hover:text-blue-700">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultRequestForm); setAttachments([]) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRequest}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map(t => {
          const tabLabels: Record<string, string> = { all: "All", active: "Active", completed: "Completed", cancelled: "Cancelled/Rejected" }
          return (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === t ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600"}`}>
              {tabLabels[t] || t}
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {filtered.map(req => {
          const progressMap: Record<string, number> = {
            pending: 10, assigned: 25, in_progress: 50, under_review: 80, completed: 100, rejected: 0, cancelled: 0,
          }
          const pct = progressMap[req.status] ?? 0
          const progressLabel: Record<string, string> = {
            pending: "Pending", assigned: "Assigned", in_progress: "In Progress", under_review: "Under Review", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled",
          }
          return (
            <Link key={req.id} href={`/dashboard/requests/${req.id}`} className="block bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-[#1a3a6b]/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{req.service_type}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{req.company_name || "N/A"}</p>
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
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.assignee_name || "Unassigned"}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-[#1a3a6b]">{pct}% &middot; {progressLabel[req.status] || req.status}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div className={`h-1.5 rounded-full ${["rejected", "cancelled"].includes(req.status) ? "bg-red-400" : "bg-[#1a3a6b]"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
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
