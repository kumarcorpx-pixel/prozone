"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchDocuments, fetchCompanies, fetchEmployees } from "@/lib/data-fetcher"
import { documentCategories } from "@/lib/company-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { OCRConfirmModal } from "@/components/OCRConfirmModal"
import { Search, FileText, Loader2, Plus, X, Upload, ScanLine, Download, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"

const statusOptions = ["all", "valid", "expiring_soon", "expired"]
const categoryKeys = ["all", ...Object.keys(documentCategories)]

function getExpiryColor(dateStr: string | null): string {
  if (!dateStr) return "text-gray-400"
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "text-red-600 font-medium"
  if (diffDays <= 30) return "text-yellow-600 font-medium"
  return "text-green-600"
}

const defaultDocForm = {
  name: "",
  company_id: "",
  employee_id: "",
  document_type: "trade_license",
  expiry_date: "",
  notes: "",
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [documents, setDocuments] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultDocForm)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [ocrScanning, setOcrScanning] = useState(false)
  const [ocrModal, setOcrModal] = useState<{
    isOpen: boolean
    documentType: "Trade License" | "Passport" | "Emirates ID" | "Visa"
    extractedData: Record<string, { value: string | null; confidence: "high" | "low" | null }>
    rawText: string
  }>({ isOpen: false, documentType: "Trade License", extractedData: {}, rawText: "" })

  useEffect(() => {
    async function load() {
      const [docs, comps, emps] = await Promise.all([
        fetchDocuments(),
        fetchCompanies(),
        fetchEmployees(),
      ])
      setDocuments(docs)
      setCompanies(comps)
      setEmployees(emps)
      setLoading(false)
    }
    load()
  }, [])

  const ocrDocTypeMap: Record<string, "Trade License" | "Passport" | "Emirates ID" | "Visa"> = {
    trade_license: "Trade License",
    passport: "Passport",
    emirates_id: "Emirates ID",
    visa: "Visa",
  }

  const handleOCRScan = async () => {
    if (!selectedFile) return
    const ocrDocType = ocrDocTypeMap[formData.document_type]
    if (!ocrDocType) {
      toast.info("OCR is available for Trade License, Passport, Emirates ID, and Visa documents")
      return
    }
    setOcrScanning(true)
    try {
      const fd = new FormData()
      fd.append("file", selectedFile)
      fd.append("documentType", ocrDocType)
      const res = await fetch("/api/ocr/process", { method: "POST", body: fd })
      if (!res.ok) throw new Error("OCR processing failed")
      const data = await res.json()
      setOcrModal({
        isOpen: true,
        documentType: ocrDocType,
        extractedData: data.extractedData || {},
        rawText: data.rawText || "",
      })
    } catch (err: any) {
      toast.error(err?.message || "OCR scan failed")
    } finally {
      setOcrScanning(false)
    }
  }

  const handleOCRConfirm = (data: Record<string, string>) => {
    // Auto-fill form fields from OCR data
    if (data.expiryDate || data.expiry_date) {
      setFormData(prev => ({ ...prev, expiry_date: data.expiryDate || data.expiry_date || prev.expiry_date }))
    }
    if (data.companyName || data.company_name) {
      const name = data.companyName || data.company_name || ""
      const match = companies.find(c => c.name.toLowerCase().includes(name.toLowerCase()))
      if (match) setFormData(prev => ({ ...prev, company_id: match.id }))
    }
    if (data.licenseNumber || data.passportNumber || data.eidNumber || data.visaNumber) {
      const ref = data.licenseNumber || data.passportNumber || data.eidNumber || data.visaNumber || ""
      setFormData(prev => ({ ...prev, notes: ref ? `Ref: ${ref}${prev.notes ? `\n${prev.notes}` : ""}` : prev.notes }))
    }
    if (!formData.name && (data.documentType || data.holderName)) {
      setFormData(prev => ({ ...prev, name: data.holderName ? `${formData.document_type} - ${data.holderName}` : prev.name }))
    }
    setOcrModal(prev => ({ ...prev, isOpen: false }))
    toast.success("OCR data applied to form")
  }

  const handleAddDocument = async () => {
    if (!formData.name.trim()) {
      toast.error("Document name is required")
      return
    }
    if (!formData.company_id) {
      toast.error("Please select a company")
      return
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("file", selectedFile)
      fd.append("name", formData.name)
      fd.append("companyId", formData.company_id)
      if (formData.employee_id) fd.append("employeeId", formData.employee_id)
      fd.append("documentType", formData.document_type)
      if (formData.expiry_date) fd.append("expiryDate", formData.expiry_date)
      if (formData.notes) fd.append("notes", formData.notes)

      const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }

      toast.success("Document uploaded successfully")
      setShowAddForm(false)
      setFormData(defaultDocForm)
      setSelectedFile(null)
      // Refresh documents list
      const updated = await fetchDocuments()
      setDocuments(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload document")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Delete failed") }
      toast.success("Document deleted")
      const updated = await fetchDocuments()
      setDocuments(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete document")
    }
  }

  const stats = useMemo(() => {
    const total = documents.length
    const valid = documents.filter(d => d.status === "valid").length
    const expiringSoon = documents.filter(d => d.status === "expiring_soon").length
    const expired = documents.filter(d => d.status === "expired").length
    return { total, valid, expiringSoon, expired }
  }, [documents])

  const sorted = useMemo(() => {
    const filtered = documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter
      const matchesCategory = categoryFilter === "all" || doc.document_type === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })

    return [...filtered].sort((a, b) => {
      const aExpiry = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity
      const bExpiry = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity
      return aExpiry - bExpiry
    })
  }, [search, statusFilter, categoryFilter, documents])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-entrance space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Document Management</h1>
          <p className="text-sm text-gray-500 mt-1">All documents across companies with expiry tracking</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{stats.total} Total</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">{stats.valid} Valid</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">{stats.expiringSoon} Expiring Soon</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">{stats.expired} Expired</span>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Upload Document"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload New Document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter document name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    if (file && file.size > 25 * 1024 * 1024) {
                      toast.error("File size must be less than 25MB")
                      return
                    }
                    setSelectedFile(file)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#1a3a6b]/10 file:text-[#1a3a6b]"
                />
              </div>
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
              {selectedFile && ocrDocTypeMap[formData.document_type] && (
                <button
                  type="button"
                  onClick={handleOCRScan}
                  disabled={ocrScanning}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                >
                  {ocrScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanLine className="h-3.5 w-3.5" />}
                  {ocrScanning ? "Scanning..." : "Auto-fill with OCR"}
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="">Select a company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee (optional)</label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="">None (company document)</option>
                {employees
                  .filter((e) => !formData.company_id || e.company_id === formData.company_id)
                  .map((e) => (
                    <option key={e.id} value={e.id}>{e.full_name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                {Object.entries(documentCategories).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultDocForm); setSelectedFile(null) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocument}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {saving ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          {categoryKeys.map((key) => (
            <option key={key} value={key}>
              {key === "all" ? "All Categories" : (documentCategories[key]?.label || key)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s === "expiring_soon" ? "Expiring Soon" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200">
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Name</th>
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Company</th>
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Employee</th>
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Type</th>
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Expiry Date</th>
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Status</th>
                <th className="text-left px-6 py-3 text-[#1a3a6b] font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((doc) => {
                const company = companies.find((c) => c.id === doc.company_id)
                const employee = doc.employee_id ? employees.find((e) => e.id === doc.employee_id) : null
                const cat = documentCategories[doc.document_type] || documentCategories.other

                return (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-[10px] font-bold ${cat.color}`}>{cat.icon}</span>
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{company?.name || "Unassigned"}</td>
                    <td className="px-6 py-4 text-gray-600">{employee?.full_name || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat?.color || "bg-gray-100 text-gray-700"}`}>
                        {cat?.label || doc.document_type || "Other"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${getExpiryColor(doc.expiry_date)}`}>
                      {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {doc.file_url ? (
                          <>
                            <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Download">
                              <Download className="h-4 w-4" />
                            </a>
                            <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Preview">
                              <Eye className="h-4 w-4" />
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">No file</span>
                        )}
                        <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No documents found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OCRConfirmModal
        isOpen={ocrModal.isOpen}
        documentType={ocrModal.documentType}
        extractedData={ocrModal.extractedData}
        rawText={ocrModal.rawText}
        onConfirm={handleOCRConfirm}
        onSkip={() => setOcrModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
