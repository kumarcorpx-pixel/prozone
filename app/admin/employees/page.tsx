"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchEmployees, fetchCompanies } from "@/lib/data-fetcher"
import { createEmployee } from "@/lib/api"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, Plus, Users, UserCheck, AlertTriangle, XCircle, Eye, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function getExpiryLabel(dateStr: string | null): { text: string; color: string } {
  if (!dateStr) return { text: "N/A", color: "text-gray-400" }
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-red-600" }
  if (diffDays <= 30) return { text: `${diffDays}d left`, color: "text-yellow-600" }
  return { text: new Date(dateStr).toLocaleDateString(), color: "text-green-600" }
}

const defaultEmployeeForm = {
  full_name: "",
  company_id: "",
  nationality: "",
  designation: "",
  passport_number: "",
  phone: "",
  email: "",
  visa_status: "valid" as const,
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

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultEmployeeForm)
  const [saving, setSaving] = useState(false)

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
      if (companyFilter !== "all" && emp.company_id !== companyFilter) return false
      if (nationalityFilter !== "all" && emp.nationality !== nationalityFilter) return false
      if (visaStatusFilter !== "all" && emp.visa_status !== visaStatusFilter) return false
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

  const handleAddEmployee = async () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required")
      return
    }
    if (!formData.company_id) {
      toast.error("Please select a company")
      return
    }
    setSaving(true)
    try {
      await createEmployee({
        full_name: formData.full_name,
        company_id: formData.company_id,
        nationality: formData.nationality || null,
        designation: formData.designation || null,
        passport_number: formData.passport_number || null,
        phone: formData.phone || null,
        email: formData.email || null,
        visa_status: formData.visa_status as any,
        department: null,
        visa_expiry: null,
        emirates_id: null,
        emirates_id_expiry: null,
        passport_expiry: null,
        labor_card_number: null,
        labor_card_expiry: null,
        salary: null,
        join_date: null,
        status: "active",
        notes: null,
        date_of_birth: null,
        gender: null,
        marital_status: null,
        religion: null,
        phone_uae: null,
        phone_home: null,
        photo_url: null,
        uae_address: null,
        employment_type: "full-time",
        visa_type: "employment",
        entry_permit_number: null,
        entry_permit_expiry: null,
        visa_uid: null,
        visa_file_number: null,
        mohre_work_permit_number: null,
        work_permit_expiry: null,
        medical_fitness_date: null,
        medical_fitness_result: null,
        health_insurance_provider: null,
        health_insurance_number: null,
        health_insurance_expiry: null,
        wps_status: "inactive",
        basic_salary: null,
        housing_allowance: null,
        transport_allowance: null,
        other_allowance: null,
      })
      toast.success("Employee added successfully")
      setShowAddForm(false)
      setFormData(defaultEmployeeForm)
      const updated = await fetchEmployees()
      setAllEmployees(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to add employee")
    } finally {
      setSaving(false)
    }
  }

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
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Employee"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New Employee</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter full name"
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="e.g. Indian, Filipino"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="e.g. Manager, Accountant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
              <input
                type="text"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter passport number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visa Status</label>
              <select
                value={formData.visa_status}
                onChange={(e) => setFormData({ ...formData, visa_status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="valid">Valid</option>
                <option value="processing">Processing</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultEmployeeForm) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEmployee}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Add Employee"}
            </button>
          </div>
        </div>
      )}

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
                      <Link href={`/admin/employees/${emp.id}`} prefetch={false} className="font-medium text-[#1a3a6b] hover:underline">
                        {emp.full_name}
                      </Link>
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
                      <Link href={`/admin/employees/${emp.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a3a6b] bg-[#1a3a6b]/10 rounded-lg hover:bg-[#1a3a6b]/20 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
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

              <Link href={`/admin/employees/${emp.id}`} prefetch={false} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1a3a6b] bg-[#1a3a6b]/10 rounded-lg hover:bg-[#1a3a6b]/20 transition-colors">
                <Eye className="h-3.5 w-3.5" />
                View Details
              </Link>
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
