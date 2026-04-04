"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { fetchEmployees, fetchCompanies } from "@/lib/data-fetcher"
import { createEmployee } from "@/lib/api"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, Plus, Users, UserCheck, AlertTriangle, XCircle, Eye, Loader2, X, Upload, FileSpreadsheet, Download, Building2, Pencil } from "lucide-react"
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
  department: "",
  passport_number: "",
  phone: "",
  email: "",
  visa_status: "valid" as const,
  emirates_id: "",
  labor_card_number: "",
  mohre_work_permit: "",
  person_code: "",
}

function extractPersonCode(notes: string | null): string {
  if (!notes) return ""
  const match = notes.match(/code:([^\s,;]+)/)
  return match ? match[1] : ""
}

export default function EmployeesPage() {
  const searchParams = useSearchParams()
  const preselectedCompanyId = searchParams.get("companyId") || ""
  const preselectedCompanyName = searchParams.get("companyName") || ""

  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState(preselectedCompanyId || "all")
  const [nationalityFilter, setNationalityFilter] = useState("all")
  const [visaStatusFilter, setVisaStatusFilter] = useState("all")
  const [expiryFilter, setExpiryFilter] = useState("all")
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(!!preselectedCompanyId)
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    ...defaultEmployeeForm,
    company_id: preselectedCompanyId,
  })
  const [saving, setSaving] = useState(false)
  const [ocrProcessing, setOcrProcessing] = useState(false)

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
        notes: formData.person_code ? `code:${formData.person_code}` : null,
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
    <div className="space-y-6 page-entrance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Employee Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employees across all companies</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"><Users className="h-3 w-3" /> {totalEmployees} Employees</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><UserCheck className="h-3 w-3" /> {activeVisas} Active</span>
            {companies.length > 0 && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full"><Building2 className="h-3 w-3" /> {companies.length} Companies</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(!showImport)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? "Cancel" : "Add Employee"}
          </button>
        </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Person Code</label>
              <input
                type="text"
                value={formData.person_code}
                onChange={(e) => setFormData({ ...formData, person_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="e.g. EMP001"
              />
            </div>
          </div>

          {/* Upload Document to Auto-Fill */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Upload Document to Auto-Fill Employee Details</h3>
            <p className="text-xs text-gray-500 mb-3">Upload a passport, Emirates ID, or visa document (PDF/JPG/PNG) to auto-fill fields.</p>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                {ocrProcessing ? "Processing..." : "Choose File"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={ocrProcessing}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setOcrProcessing(true)
                    try {
                      const fd = new FormData()
                      fd.append("file", file)
                      const controller = new AbortController()
                      const timeout = setTimeout(() => controller.abort(), 15000)
                      const res = await fetch("/api/ocr/process", { method: "POST", body: fd, signal: controller.signal })
                      clearTimeout(timeout)
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || "OCR processing failed")
                      const updates: Partial<typeof formData> = {}
                      const docType = data.document_type || data.documentType || ""
                      if (docType === "passport" || data.passport_number) {
                        if (data.passport_number) updates.passport_number = data.passport_number
                        if (data.full_name) updates.full_name = data.full_name
                        if (data.nationality) updates.nationality = data.nationality
                      }
                      if (docType === "emirates-id" || docType === "emirates_id" || data.emirates_id) {
                        if (data.emirates_id) updates.emirates_id = data.emirates_id
                        if (data.full_name) updates.full_name = data.full_name
                        if (data.nationality) updates.nationality = data.nationality
                      }
                      if (docType === "visa" || data.visa_status) {
                        if (data.visa_status) updates.visa_status = data.visa_status
                      }
                      setFormData((prev) => ({ ...prev, ...updates }))
                      const fields = Object.keys(updates)
                      toast.success(`Extracted ${fields.length} field(s): ${fields.join(", ")}`)
                    } catch (err: any) {
                      if (err.name === "AbortError") {
                        toast.error("OCR timed out. You can still add the employee manually.")
                      } else {
                        toast.error(err.message || "Failed to process document. Add employee manually.")
                      }
                    } finally {
                      setOcrProcessing(false)
                      e.target.value = ""
                    }
                  }}
                />
              </label>
              {ocrProcessing && <><Loader2 className="h-4 w-4 animate-spin text-[#1a3a6b]" /><button type="button" onClick={() => setOcrProcessing(false)} className="text-xs text-red-500 hover:underline">Cancel</button></>}
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Add Employee"}
            </button>
          </div>
        </div>
      )}

      {/* Import Employees Panel */}
      {showImport && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Import Employees</h2>
            <button onClick={() => { setShowImport(false); setImportResult(null) }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">CSV Format — Required columns:</p>
            <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">full_name,company_name,designation,department,nationality,phone,email</code>
            <p className="mt-2 text-xs">Use <strong>company_name</strong> (exact match) or <strong>company_id</strong>. <strong>full_name</strong> is required.</p>
            <p className="mt-1 text-xs">Supports CSV and MOHRE PDF employee lists.</p>
            <a href="data:text/csv;charset=utf-8,full_name,company_name,designation,department,nationality,phone,email%0AJohn Doe,ALBA CLEANING SERVICES L.L.C,Cleaner,Operations,Indian,+971501234567,john@example.com" download="employee-template.csv" className="inline-flex items-center gap-1 mt-2 text-xs text-[#1a3a6b] font-medium hover:underline">
              <Download className="h-3 w-3" /> Download Template CSV
            </a>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1a3a6b]/50 transition-colors cursor-pointer" onClick={() => document.getElementById("csv-file-input")?.click()}>
            {importFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#1a3a6b]" />
                <span className="text-sm font-medium text-gray-900">{importFile.name}</span>
                <span className="text-xs text-gray-400">({(importFile.size / 1024).toFixed(0)} KB)</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to select CSV or PDF file</p>
              </>
            )}
            <input id="csv-file-input" type="file" className="hidden" accept=".csv,.pdf" onChange={e => { setImportFile(e.target.files?.[0] || null); setImportResult(null) }} />
          </div>
          {importResult && (
            <div className={`rounded-lg p-4 text-sm ${importResult.summary?.errors?.length > 0 ? "bg-yellow-50 text-yellow-800" : "bg-green-50 text-green-800"}`}>
              <p className="font-medium">Import Complete</p>
              <p>Created: {importResult.summary?.created || 0} | Updated: {importResult.summary?.updated || 0} | Skipped: {importResult.summary?.skipped || 0} | Total: {importResult.summary?.total || 0}</p>
              {importResult.summary?.errors?.length > 0 && (
                <div className="mt-2 text-xs space-y-1">
                  {importResult.summary.errors.slice(0, 5).map((err: any, i: number) => (
                    <p key={i}>Row {err.row}: {err.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            disabled={!importFile || importing}
            onClick={async () => {
              if (!importFile) return
              setImporting(true)
              try {
                const fd = new FormData()
                fd.append("file", importFile)
                const res = await fetch("/api/admin/employees/import", { method: "POST", body: fd })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Import failed")
                setImportResult(data)
                toast.success(`Imported ${data.summary?.created || 0} employees`)
                const emps = await fetchEmployees()
                setAllEmployees(emps)
              } catch (err: any) { toast.error(err.message || "Import failed") }
              setImporting(false)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] disabled:opacity-50"
          >
            {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing...</> : <><Upload className="h-4 w-4" /> Import Employees</>}
          </button>
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
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 shadow-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
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
              <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200">
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Sr No</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Person Code</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Person Name</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Company</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Job</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Passport</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Emirates ID</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Visa</th>
                <th className="text-left py-3 px-4 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, index) => {
                const passportExpiry = getExpiryLabel(emp.passport_expiry)
                const eidExpiry = getExpiryLabel(emp.emirates_id_expiry)
                const visaExpiry = getExpiryLabel(emp.visa_expiry)
                const personCode = extractPersonCode(emp.notes) || emp.id?.substring(0, 8) || "-"

                return (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{personCode}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/employees/${emp.id}`} className="font-medium text-[#1a3a6b] hover:underline cursor-pointer">
                        {emp.full_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{getCompanyName(emp.company_id)}</td>
                    <td className="py-3 px-4 text-gray-600">{emp.designation || "N/A"}</td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700 text-xs">{emp.passport_number || "N/A"}</div>
                      <div className={`text-xs font-medium ${passportExpiry.color}`}>{passportExpiry.text}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700 text-xs">{emp.emirates_id || "N/A"}</div>
                      <div className={`text-xs font-medium ${eidExpiry.color}`}>{eidExpiry.text}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={emp.visa_status} />
                      <div className={`text-xs font-medium mt-0.5 ${visaExpiry.color}`}>{visaExpiry.text}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/employees/${emp.id}`} prefetch={false}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/admin/employees/${emp.id}`} prefetch={false}
                          className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <label className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer" title="Upload Document">
                          <Upload className="h-4 w-4" />
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                const fd = new FormData()
                                fd.append("file", file)
                                fd.append("name", file.name.replace(/\.[^.]+$/, ""))
                                fd.append("companyId", emp.company_id)
                                fd.append("employeeId", emp.id)
                                fd.append("documentType", "other")
                                const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
                                if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Upload failed") }
                                toast.success(`Document uploaded for ${emp.full_name}`)
                              } catch (err: any) { toast.error(err?.message || "Upload failed") }
                              e.target.value = ""
                            }}
                          />
                        </label>
                      </div>
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
        {filtered.map((emp, index) => {
          const passportExpiry = getExpiryLabel(emp.passport_expiry)
          const eidExpiry = getExpiryLabel(emp.emirates_id_expiry)
          const visaExpiry = getExpiryLabel(emp.visa_expiry)
          const personCode = extractPersonCode(emp.notes) || emp.id?.substring(0, 8) || "-"

          return (
            <div key={emp.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                    <span className="text-xs text-gray-500 font-mono">{personCode}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    <Link href={`/admin/employees/${emp.id}`} className="text-[#1a3a6b] hover:underline">
                      {emp.full_name}
                    </Link>
                  </h3>
                  <p className="text-xs text-gray-500">{getCompanyName(emp.company_id)}</p>
                </div>
                <StatusBadge status={emp.visa_status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Job</span>
                  <p className="text-gray-700">{emp.designation || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm border-t border-gray-100 pt-3">
                <div>
                  <span className="text-gray-500 text-xs">Passport</span>
                  <p className="text-gray-700 text-xs">{emp.passport_number || "N/A"}</p>
                  <p className={`text-xs font-medium ${passportExpiry.color}`}>{passportExpiry.text}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Emirates ID</span>
                  <p className="text-gray-700 text-xs">{emp.emirates_id || "N/A"}</p>
                  <p className={`text-xs font-medium ${eidExpiry.color}`}>{eidExpiry.text}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Visa</span>
                  <p className={`text-xs font-medium ${visaExpiry.color}`}>{visaExpiry.text}</p>
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
