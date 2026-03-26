"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchDocuments, fetchCompanies, fetchEmployees } from "@/lib/data-fetcher"
import { documentCategories } from "@/lib/company-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, FileText, Loader2 } from "lucide-react"

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

export default function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [documents, setDocuments] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const sorted = useMemo(() => {
    const filtered = documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter
      const matchesCategory = categoryFilter === "all" || doc.document_type === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })

    return [...filtered].sort((a, b) => {
      // Expired and expiring first
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
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Document Management</h1>
        <p className="text-sm text-gray-500 mt-1">All documents across companies with expiry tracking</p>
      </div>

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
