"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchEmployees, fetchCompanies } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, Plus, Users, UserCheck, AlertTriangle, XCircle, Eye, Loader2 } from "lucide-react"

function getExpiryLabel(dateStr: string | null): { text: string; color: string } {
  if (!dateStr) return { text: "N/A", color: "text-gray-400" }
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-red-600" }
  if (diffDays <= 30) return { text: `${diffDays}d left`, color: "text-yellow-600" }
  return { text: new Date(dateStr).toLocaleDateString(), color: "text-green-600" }
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [nationalityFilter, setNationalityFilter] = useState("all")
  const [visaStatusFilter, setVisaStatusFilter] = useState("all")
  const [expiryFilter, setExpiryFilter] = useState("all")
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [emps, comps] = await Promise.all([
        fetchEmployees(),
        fetchCompanies(),
      ])
      setAllEmployees(emps)
      setCompanies(comps)
      setLoading(false)
    }
    load()
  }, [])

  function getCompanyName(companyId: string): string {
    return companies.find((c) => c.id === companyId)?.name || "Unknown"
  }

  const nationalities = useMemo(
    () => [...new Set(allEmployees.map((e) => e.nationality).filter(Boolean))].sort(),
    [allEmployees]
  )

  const filtered = useMemo(() => {
    const now = new Date()
    return allEmployees.filter((emp) => {
      // Search
      if (search) {
        const q = search.toLowerCase()
        const companyName = getCompanyName(emp.company_id).toLowerCase()
        if (
          !emp.full_name.toLowerCase().includes(q) &&
          !companyName.includes(q) &&
          !(emp.nationality && emp.nationality.toLowerCase().includes(q)) &&
          !(emp.designation && emp.designation.toLowerCase().includes(q))
        ) {
          return false
        }
      }
      // Company filter
      if (companyFilter !== "all" && emp.company_id !== companyFilter) return false
      // Nationality filter
      if (nationalityFilter !== "all" && emp.nationality !== nationalityFilter) return false
      // Visa status filter
      if (visaStatusFilter !== "all" && emp.visa_status !== visaStatusFilter) return false
      // Expiry filter
      if (expiryFilter !== "all" && emp.visa_expiry) {
        const diffDays = Math.ceil(
          (new Date(emp.visa_expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (expiryFilter === "expired" && diffDays >= 0) return false
        if (expiryFilter === "30d" && (diffDays < 0 || diffDays > 30)) return false
        if (expiryFilter === "60d" && (diffDays < 0 || diffDays > 60)) return false
      }
      if (expiryFilter !== "all" && !emp.visa_expiry) return false
      return true
    })
  }, [search, companyFilter, nationalityFilter, visaStatusFilter, expiryFilter, allEmployees, companies])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading employees...</p>
        </div>
      </div>
    )
  }

  // Summary stats
  const totalEmployees = allEmployees.length
  const activeVisas = allEmployees.filter((e) => e.visa_status === "valid").length
  const expiringSoon = allEmployees.filter((e) => e.visa_status === "expiring_soon").length
  const expired = allEmployees.filter((e) => e.visa_status === "expired").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Employee Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employees across all companies</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Employees</p>
            <Users className="h-5 w-5 text-[#1a3a6b]" />
          </div>
          <p className="text-2xl font-bold mt-1 text-gray-900">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Active Visas</p>
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">{activeVisas}</p>
        </div>
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Expiring Soon</p>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{expiringSoon}</p>
        </div>
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Expired</p>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600">{expired}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, company, nationality, designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={nationalityFilter}
          onChange={(e) => setNationalityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Nationalities</option>
          {nationalities.map((n) => (
            <option key={n} value={n!}>
              {n}
            </option>
          ))}
        </select>

        <select
          value={visaStatusFilter}
          onChange={(e) => setVisaStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Visa Statuses</option>
          <option value="valid">Valid</option>
          <option value="expired">Expired</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="processing">Processing</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={expiryFilter}
          onChange={(e) => setExpiryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Expiry</option>
          <option value="30d">Expiring in 30d</option>
          <option value="60d">Expiring in 60d</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Nationality</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Designation</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Visa Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Visa Expiry</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">EID Expiry</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Labor Card</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const visaExpiry = getExpiryLabel(emp.visa_expiry)
                const eidExpiry = getExpiryLabel(emp.emirates_id_expiry)
                const laborExpiry = getExpiryLabel(emp.labor_card_expiry)

                return (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{emp.full_name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{getCompanyName(emp.company_id)}</td>
                    <td className="py-3 px-4 text-gray-600">{emp.nationality || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-600">{emp.designation || "N/A"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={emp.visa_status} />
                    </td>
                    <td className={`py-3 px-4 font-medium ${visaExpiry.color}`}>
                      {visaExpiry.text}
                    </td>
                    <td className={`py-3 px-4 font-medium ${eidExpiry.color}`}>
                      {eidExpiry.text}
                    </td>
                    <td className={`py-3 px-4 font-medium ${laborExpiry.color}`}>
                      {laborExpiry.text}
                    </td>
                    <td className="py-3 px-4">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a3a6b] bg-[#1a3a6b]/10 rounded-lg hover:bg-[#1a3a6b]/20 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="h-8 w-8 text-gray-300 mb-2" />
            No employees found matching your filters.
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((emp) => {
          const visaExpiry = getExpiryLabel(emp.visa_expiry)
          const eidExpiry = getExpiryLabel(emp.emirates_id_expiry)
          const laborExpiry = getExpiryLabel(emp.labor_card_expiry)

          return (
            <div key={emp.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{emp.full_name}</h3>
                  <p className="text-xs text-gray-500">{getCompanyName(emp.company_id)}</p>
                </div>
                <StatusBadge status={emp.visa_status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Nationality</span>
                  <p className="text-gray-700">{emp.nationality || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Designation</span>
                  <p className="text-gray-700">{emp.designation || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm border-t border-gray-100 pt-3">
                <div>
                  <span className="text-gray-500 text-xs">Visa Expiry</span>
                  <p className={`font-medium ${visaExpiry.color}`}>{visaExpiry.text}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">EID Expiry</span>
                  <p className={`font-medium ${eidExpiry.color}`}>{eidExpiry.text}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Labor Card</span>
                  <p className={`font-medium ${laborExpiry.color}`}>{laborExpiry.text}</p>
                </div>
              </div>

              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1a3a6b] bg-[#1a3a6b]/10 rounded-lg hover:bg-[#1a3a6b]/20 transition-colors">
                <Eye className="h-3.5 w-3.5" />
                View Details
              </button>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="h-8 w-8 text-gray-300 mb-2" />
            No employees found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}
