"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchDocuments, fetchCompanies, fetchEmployees } from "@/lib/data-fetcher"
import { createCompanyDocument, uploadFile, getFileUrl } from "@/lib/supabase/api"
import { documentCategories } from "@/lib/company-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, FileText, Loader2, Plus, X, Upload } from "lucide-react"
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

  const handleAddDocument = async () => {
    if (!formData.name.trim()) {
      toast.error("Document name is required")
      return
    }
    if (!formData.company_id) {
      toast.error("Please select a company")
      return
    }
    setSaving(true)
    try {
      let fileUrl: string | null = null
      if (selectedFile) {
        const path = `documents/${Date.now()}-${selectedFile.name}`
        const uploadedPath = await uploadFile("documents", path, selectedFile)
        fileUrl = getFileUrl("documents", uploadedPath)
      }

      await createCompanyDocument({
        company_id: formData.company_id,
        employee_id: formData.employee_id || null,
        name: formData.name,
        document_type: formData.document_type,
        file_url: fileUrl,
        file_size: selectedFile?.size || null,
        expiry_date: formData.expiry_date || null,
        status: "valid",
        uploaded_by: null,
        notes: formData.notes || null,
        issue_date: null,
        issuing_authority: null,
        reference_number: null,
        reminder_days: 30,
      })
      toast.success("Document uploaded successfully")
      setShowAddForm(false)
      setFormData(defaultDocForm)
      setSelectedFile(null)
      const updated = await fetchDocuments()
      setDocuments(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload document")
    } finally {
      setSaving(false)
    }
  }

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Document Management</h1>
          <p className="text-sm text-gray-500 mt-1">All documents across companies with expiry tracking</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#1a3a6b]/10 file:text-[#1a3a6b]"
                />
              </div>
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
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Employee</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Expiry Date</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
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
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{company?.name || "Unknown"}</td>
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
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No documents found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
