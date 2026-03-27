"use client"

import { useState, useEffect } from "react"
import { fetchCompanies, fetchEmployees } from "@/lib/data-fetcher"
import { createCompany } from "@/lib/supabase/api"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, Plus, Building2, MapPin, Calendar, Loader2, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function getExpiryLabel(dateStr: string | null): { text: string; color: string } {
  if (!dateStr) return { text: "N/A", color: "text-gray-400" }
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-red-600" }
  if (diffDays <= 30) return { text: `${diffDays}d left`, color: "text-yellow-600" }
  return { text: new Date(dateStr).toLocaleDateString(), color: "text-green-600" }
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

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.emirate && c.emirate.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all companies and their documents</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Company"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company name, trade name, or emirate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((company) => {
          const employeeCount = employees.filter((e) => e.company_id === company.id).length
          const expiry = getExpiryLabel(company.license_expiry)

          return (
            <Link
              key={company.id}
              href={`/admin/companies/${company.id}`}
              className="block bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-[#1a3a6b]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{company.trade_name || company.name}</p>
                  </div>
                </div>
                <StatusBadge status={company.status} />
                {(!company.license_number || !company.license_expiry) && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Incomplete</span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.emirate || "N/A"}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${company.license_type === "freezone" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {company.license_type === "freezone" ? "Free Zone" : "Mainland"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">License #</span>
                  <span className="text-gray-700 font-mono text-xs">{company.license_number || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Expiry
                  </span>
                  <span className={`font-medium ${expiry.color}`}>{expiry.text}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Employees</span>
                  <span className="font-medium text-gray-900">{employeeCount}</span>
                </div>
              </div>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Building2 className="h-8 w-8 text-gray-300 mb-2" />
            No companies found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
