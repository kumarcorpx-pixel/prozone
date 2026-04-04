"use client"

import { useState, useEffect } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    if (isOpen) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Update Status Modal
export function UpdateStatusModal({ isOpen, onClose, requests }: { isOpen: boolean; onClose: () => void; requests: any[] }) {
  const [requestId, setRequestId] = useState("")
  const [status, setStatus] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!requestId || !status) { toast.error("Select a request and status"); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/data/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: note || undefined }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Status updated")
      onClose()
      setRequestId(""); setStatus(""); setNote("")
    } catch { toast.error("Failed to update status") }
    setSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Request Status">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Request *</label>
          <select value={requestId} onChange={e => setRequestId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
            <option value="">Choose a request...</option>
            {requests.map(r => <option key={r.id} value={r.id}>{r.service_type} — {r.company_name || "N/A"}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
            <option value="">Select status...</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" placeholder="Add a status note..." />
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#1a3a6b] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#15305a] disabled:opacity-50">
          {saving ? "Updating..." : "Update Status"}
        </button>
      </div>
    </Modal>
  )
}

// Upload Document Modal
export function UploadDocumentModal({ isOpen, onClose, companies, employees }: { isOpen: boolean; onClose: () => void; companies: any[]; employees: any[] }) {
  const [companyId, setCompanyId] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [docType, setDocType] = useState("other")
  const [expiryDate, setExpiryDate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const filteredEmployees = companyId ? employees.filter(e => e.company_id === companyId) : []

  const handleSubmit = async () => {
    if (!companyId || !file) { toast.error("Select a company and file"); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("name", file.name.replace(/\.[^.]+$/, ""))
      fd.append("companyId", companyId)
      if (employeeId) fd.append("employeeId", employeeId)
      fd.append("documentType", docType)
      if (expiryDate) fd.append("expiryDate", expiryDate)
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Upload failed") }
      toast.success("Document uploaded!")
      onClose()
      setCompanyId(""); setEmployeeId(""); setDocType("other"); setExpiryDate(""); setFile(null)
    } catch (err: any) { toast.error(err.message || "Upload failed") }
    setUploading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <select value={companyId} onChange={e => { setCompanyId(e.target.value); setEmployeeId("") }} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
            <option value="">Select company...</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee (or Company Document)</label>
          <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
            <option value="">Company Document</option>
            {filteredEmployees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white">
              <option value="trade_license">Trade License</option>
              <option value="establishment_card">Establishment Card</option>
              <option value="ejari">Ejari / Tawtheeq</option>
              <option value="visa">Visa</option>
              <option value="emirates_id">Emirates ID</option>
              <option value="passport">Passport</option>
              <option value="labor_card">Labor Card</option>
              <option value="moa">Memorandum of Association</option>
              <option value="poa">Power of Attorney</option>
              <option value="noc">No Objection Certificate</option>
              <option value="medical_insurance">Medical Insurance</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1a3a6b]/50 transition-colors cursor-pointer" onClick={() => document.getElementById("modal-file-input")?.click()}>
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <Upload className="h-5 w-5 text-[#1a3a6b]" />
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to select file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOCX (max 25MB)</p>
              </>
            )}
            <input id="modal-file-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        <button onClick={handleSubmit} disabled={uploading} className="w-full bg-[#1a3a6b] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#15305a] disabled:opacity-50 flex items-center justify-center gap-2">
          {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload Document</>}
        </button>
      </div>
    </Modal>
  )
}
