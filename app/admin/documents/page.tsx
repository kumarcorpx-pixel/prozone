"use client"

import { useState, useMemo } from "react"
import { companyDocuments, demoCompanies, documentCategories } from "@/lib/company-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { FileText, Search, Filter } from "lucide-react"

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "valid", label: "Valid" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function expiryColor(dateStr: string | null): string {
  if (!dateStr) return "text-gray-500"
  const now = new Date()
  const expiry = new Date(dateStr)
  if (expiry < now) return "text-red-600 font-medium"
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 30) return "text-yellow-600 font-medium"
  return "text-green-600"
}

function getComputedStatus(doc: (typeof companyDocuments)[number]): string {
  if (!doc.expiry_date) return "valid"
  const now = new Date()
  const expiry = new Date(doc.expiry_date)
  if (expiry < now) return "expired"
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 30) return "expiring_soon"
  return "valid"
}

function getDocUrgency(doc: (typeof companyDocuments)[number]): number {
  if (!doc.expiry_date) return 999999
  const now = new Date()
  const expiry = new Date(doc.expiry_date)
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
}

export default function AdminDocumentsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [search, setSearch] = useState("")

  const categoryOptions = useMemo(() => {
    const cats = Object.entries(documentCategories).map(([key, val]) => ({
      value: key,
      label: val.label,
    }))
    return [{ value: "all", label: "All Categories" }, ...cats]
  }, [])

  const filtered = useMemo(() => {
    return companyDocuments
      .filter((doc) => {
        const computedStatus = getComputedStatus(doc)
        const matchesStatus = statusFilter === "all" || computedStatus === statusFilter
        const matchesCategory = categoryFilter === "all" || doc.document_type === categoryFilter
        const matchesSearch =
          search === "" ||
          doc.name.toLowerCase().includes(search.toLowerCase()) ||
          (demoCompanies.find((c) => c.id === doc.company_id)?.name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
        return matchesStatus && matchesCategory && matchesSearch
      })
      .sort((a, b) => getDocUrgency(a) - getDocUrgency(b))
  }, [statusFilter, categoryFilter, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Management</h1>
        <p className="text-gray-500 text-sm">All documents with expiry tracking</p>
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
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white appearance-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white appearance-none"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-400">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No documents found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Document</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Expiry Date</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const company = demoCompanies.find((c) => c.id === doc.company_id)
                  const cat = documentCategories[doc.document_type] || documentCategories.other
                  const computedStatus = getComputedStatus(doc)
                  return (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{company?.name || "Unknown"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${expiryColor(doc.expiry_date)}`}>
                        {doc.expiry_date ? formatDate(doc.expiry_date) : "No expiry"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={computedStatus} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
