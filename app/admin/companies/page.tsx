"use client"

import { useState, useEffect } from "react"
import { fetchCompanies, fetchEmployees } from "@/lib/data-fetcher"
import { createCompany } from "@/lib/api"
import { Search, Plus, Building2, MapPin, Calendar, Loader2, X, Users, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const AVATAR_COLORS = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-violet-500 to-violet-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
  "from-cyan-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
  "from-teal-500 to-teal-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
]

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase()
}

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getExpiryInfo(dateStr: string | null): { text: string; color: string; bgColor: string; urgent: boolean } {
  if (!dateStr) return { text: "No expiry set", color: "text-gray-400", bgColor: "bg-gray-50", urgent: false }
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-red-700", bgColor: "bg-red-50 border-red-200", urgent: true }
  if (diffDays <= 30) return { text: `${diffDays}d left`, color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200", urgent: true }
  if (diffDays <= 90) return { text: `${diffDays}d left`, color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", urgent: false }
  const d = expiry.getDate().toString().padStart(2, "0")
  const m = (expiry.getMonth() + 1).toString().padStart(2, "0")
  const y = expiry.getFullYear()
  return { text: `${d}/${m}/${y}`, color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200", urgent: false }
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  expired: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  closed: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  on_hold: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
}

const defaultCompanyForm = {
  name: "",
  license_number: "",
  emirate: "Dubai",
  license_type: "mainland",
  phone: "",
  email: "",
  status: "active" as const,
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultCompanyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [comps, emps] = await Promise.all([
        fetchCompanies(),
        fetchEmployees(),
      ])
      setCompanies(comps)
      setEmployees(emps)
      setLoading(false)
    }
    load()
  }, [])

  const handleAddCompany = async () => {
    if (!formData.name.trim()) {
      toast.error("Company name is required")
      return
    }
    if (!formData.license_number.trim()) {
      toast.error("Trade License Number is required")
      return
    }
    setSaving(true)
    try {
      await createCompany({
        name: formData.name,
        trade_name: null,
        license_number: formData.license_number || null,
        license_type: formData.license_type || null,
        license_expiry: null,
        legal_form: null,
        status: formData.status as any,
        emirate: formData.emirate || null,
        jurisdiction: null,
        free_zone: null,
        address: null,
        po_box: null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: null,
        industry: null,
        activities: [],
        capital: null,
        incorporation_date: null,
        notes: null,
        establishment_card_number: null,
        establishment_card_expiry: null,
        immigration_file_number: null,
        computer_card_number: null,
        mohre_company_number: null,
        chamber_commerce_number: null,
        chamber_commerce_expiry: null,
        ejari_tawtheeq_number: null,
        ejari_tawtheeq_type: null,
        ejari_tawtheeq_expiry: null,
        lease_expiry: null,
        vat_trn: null,
        corporate_tax_number: null,
        sponsor_name: null,
        sponsor_eid: null,
        local_service_agent: null,
        poa_status: "not_required",
        visa_quota_total: 0,
        visa_quota_used: 0,
        free_zone_authority: null,
      })
      toast.success("Company added successfully")
      setShowAddForm(false)
      setFormData(defaultCompanyForm)
      const updated = await fetchCompanies()
      setCompanies(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to add company")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading companies...</p>
        </div>
      </div>
    )
  }

  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.emirate && c.emirate.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    if (!a.license_expiry) return 1
    if (!b.license_expiry) return -1
    return new Date(a.license_expiry).getTime() - new Date(b.license_expiry).getTime()
  })

  const totalEmployees = employees.length
  const activeCompanies = companies.filter(c => c.status === "active").length
  const expiringCount = companies.filter(c => {
    if (!c.license_expiry) return false
    const diff = Math.ceil((new Date(c.license_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 30
  }).length

  return (
    <div className="space-y-6 page-entrance">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all companies and their documents</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              <Building2 className="h-3 w-3" /> {companies.length} Companies
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Users className="h-3 w-3" /> {totalEmployees} Employees
            </span>
            {expiringCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                <AlertTriangle className="h-3 w-3" /> {expiringCount} Expiring Soon
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Company"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 space-y-4 ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add New Company</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade License Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter license number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
              <select
                value={formData.emirate}
                onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Dubai">Dubai</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="RAK">RAK</option>
                <option value="Fujairah">Fujairah</option>
                <option value="UAQ">UAQ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
              <select
                value={formData.license_type}
                onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="mainland">Mainland</option>
                <option value="freezone">Free Zone</option>
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultCompanyForm) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCompany}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Add Company"}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name, trade name, or emirate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Company Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((company, index) => {
          const employeeCount = employees.filter((e) => e.company_id === company.id).length
          const expiry = getExpiryInfo(company.license_expiry)
          const initials = getInitials(company.name)
          const avatarColor = getAvatarColor(company.name)
          const st = STATUS_STYLES[company.status] || STATUS_STYLES.active
          const isIncomplete = !company.license_number || !company.license_expiry

          return (
            <Link
              key={company.id}
              href={`/admin/companies/${company.id}`}
              prefetch={false}
              className="group block bg-white rounded-2xl ring-1 ring-gray-200 hover:ring-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Top accent bar */}
              <div className={`h-1 bg-gradient-to-r ${avatarColor}`} />

              <div className="p-4">
                {/* Header: Avatar + Name + Status */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-white font-bold text-sm">{initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#1a3a6b] transition-colors">{company.name}</h3>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{company.trade_name || company.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                    {isIncomplete && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-600">
                        <AlertTriangle className="h-2.5 w-2.5" /> Incomplete
                      </span>
                    )}
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {company.emirate || "N/A"}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${company.license_type === "freezone" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                      {company.license_type === "freezone" ? "Free Zone" : "Mainland"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      License #
                    </span>
                    <span className="text-gray-700 font-mono text-xs font-medium">{company.license_number || "N/A"}</span>
                  </div>
                </div>

                {/* Expiry + Employees footer */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border ${expiry.bgColor}`}>
                    <Calendar className={`h-3 w-3 ${expiry.color}`} />
                    <span className={expiry.color}>{expiry.text}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-semibold">
                    <Users className="h-3 w-3" />
                    {employeeCount} {employeeCount === 1 ? "Employee" : "Employees"}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {sorted.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Building2 className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No companies found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
