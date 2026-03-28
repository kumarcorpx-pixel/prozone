"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ComplianceScore } from "@/components/dashboard/compliance-score"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { documentCategories } from "@/lib/company-data"
import { toast } from "sonner"
import {
  Building2, Users, FileText, Shield, CheckCircle2, XCircle, HelpCircle,
  Upload, ChevronDown, ChevronRight, MapPin, Calendar, Phone, Mail, Loader2,
  Download, AlertTriangle, Search, Briefcase, Globe
} from "lucide-react"
import Link from "next/link"

function getExpiryInfo(date: string | null) {
  if (!date) return { label: "Not set", color: "text-gray-400", days: null }
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: "text-red-600", days }
  if (days <= 30) return { label: `${days} days left`, color: "text-red-600", days }
  if (days <= 90) return { label: `${days} days left`, color: "text-yellow-600", days }
  return { label: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), color: "text-green-600", days }
}

export default function CompanyPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "documents">("overview")
  const [uploading, setUploading] = useState(false)
  const [empSearch, setEmpSearch] = useState("")
  const [docSearch, setDocSearch] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [companiesRes, employeesRes, documentsRes] = await Promise.all([
          fetch("/api/client/companies"),
          fetch("/api/client/employees"),
          fetch("/api/client/documents"),
        ])
        const c = companiesRes.ok ? await companiesRes.json() : []
        const e = employeesRes.ok ? await employeesRes.json() : []
        const d = documentsRes.ok ? await documentsRes.json() : []
        setCompanies(c)
        setAllEmployees(e)
        setDocuments(d)
        if (c.length > 0) setSelectedId(c[0].id)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedId) return
    if (file.size > 25 * 1024 * 1024) { toast.error("File too large (max 25MB)"); return }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("name", file.name)
      fd.append("companyId", selectedId)
      fd.append("documentType", "other")
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Upload failed") }
      toast.success("Document uploaded successfully")
      const updatedRes = await fetch("/api/client/documents")
      if (updatedRes.ok) setDocuments(await updatedRes.json())
    } catch (err: any) {
      toast.error(err?.message || "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  const company = companies.find(c => c.id === selectedId) || companies[0]
  const employees = allEmployees.filter(e => e.company_id === selectedId)
  const companyDocs = documents.filter(d => d.company_id === selectedId)
  const licenseExpiry = getExpiryInfo(company?.license_expiry)

  const filteredEmps = empSearch
    ? employees.filter(e => e.full_name?.toLowerCase().includes(empSearch.toLowerCase()))
    : employees

  const filteredDocs = docSearch
    ? companyDocs.filter(d => d.name?.toLowerCase().includes(docSearch.toLowerCase()) || d.document_type?.toLowerCase().includes(docSearch.toLowerCase()))
    : companyDocs

  // Count employees with document gaps
  const empDocStatus = (empId: string) => {
    const empDocs = companyDocs.filter(d => d.employee_id === empId)
    const hasVisa = empDocs.some(d => d.document_type === "visa")
    const hasEid = empDocs.some(d => d.document_type === "emirates_id")
    const hasPassport = empDocs.some(d => d.document_type === "passport")
    const hasLabor = empDocs.some(d => d.document_type === "labor_card")
    const total = [hasVisa, hasEid, hasPassport, hasLabor].filter(Boolean).length
    return { hasVisa, hasEid, hasPassport, hasLabor, total, of: 4 }
  }

  if (!company) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Building2 className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">No Company Linked</h2>
      <p className="text-gray-500 mt-2">Contact your PRO administrator to link your company.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Company</h1>
          <p className="text-sm text-gray-500 mt-1">View company details, employees, and documents</p>
        </div>
        {companies.length > 1 && (
          <div className="relative">
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center"><Building2 className="h-5 w-5 text-[#1a3a6b]" /></div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-semibold text-gray-900 capitalize">{company.status}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center"><Users className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Employees</p>
              <p className="font-semibold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center"><FileText className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Documents</p>
              <p className="font-semibold text-gray-900">{companyDocs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center"><Calendar className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-xs text-gray-500">License Expiry</p>
              <p className={`font-semibold text-sm ${licenseExpiry.color}`}>{licenseExpiry.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["overview", "employees", "documents"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? "border-[#1a3a6b] text-[#1a3a6b]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab === "employees" ? `Employees (${employees.length})` : tab === "documents" ? `Documents (${companyDocs.length})` : "Overview"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-5"><Building2 className="h-5 w-5" /> Company Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {[
                  { icon: Building2, label: "Company Name", value: company.name },
                  { icon: FileText, label: "License Number", value: company.license_number || "Not provided" },
                  { icon: Calendar, label: "License Expiry", value: licenseExpiry.label, color: licenseExpiry.color },
                  { icon: MapPin, label: "Emirate", value: company.emirate || "Not provided" },
                  { icon: Briefcase, label: "License Type", value: company.license_type || "Commercial" },
                  { icon: Building2, label: "Legal Form", value: company.legal_form || "LLC" },
                  { icon: Globe, label: "Jurisdiction", value: company.jurisdiction || "Mainland" },
                  { icon: Phone, label: "Phone", value: company.phone ? <a href={`tel:${company.phone}`} className="text-[#1a3a6b] hover:underline">{company.phone}</a> : "Not provided" },
                  { icon: Mail, label: "Email", value: company.email ? <a href={`mailto:${company.email}`} className="text-[#1a3a6b] hover:underline">{company.email}</a> : "Not provided" },
                  { icon: MapPin, label: "Address", value: company.address || "Not provided" },
                  { icon: Briefcase, label: "Industry", value: company.industry || "Not provided" },
                  ...(company.sponsor_name ? [{ icon: Users, label: "Sponsor", value: company.sponsor_name }] : []),
                  ...(company.establishment_card_number ? [{ icon: FileText, label: "Establishment Card #", value: company.establishment_card_number }] : []),
                  ...(company.ejari_tawtheeq_number ? [{ icon: FileText, label: "Ejari/Tawtheeq #", value: company.ejari_tawtheeq_number }] : []),
                  ...(company.mohre_company_number ? [{ icon: Shield, label: "MOHRE Company #", value: company.mohre_company_number }] : []),
                  ...(company.vat_trn ? [{ icon: FileText, label: "VAT TRN", value: company.vat_trn }] : []),
                ].map((item: any) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className={`text-sm font-medium ${item.color || "text-gray-900"}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance — uses shared component */}
            <div>
              <ComplianceScore company={company} employees={employees} documents={companyDocs} />
            </div>
          </div>

          {/* Expiry dates summary */}
          {(() => {
            const estabExpiry = getExpiryInfo(company.establishment_card_expiry)
            const ejariExpiry = getExpiryInfo(company.ejari_tawtheeq_expiry)
            const leaseExpiry = getExpiryInfo(company.lease_expiry)
            const items = [
              { label: "Trade License", expiry: licenseExpiry },
              ...(company.establishment_card_expiry ? [{ label: "Establishment Card", expiry: estabExpiry }] : []),
              ...(company.ejari_tawtheeq_expiry ? [{ label: "Ejari / Tawtheeq", expiry: ejariExpiry }] : []),
              ...(company.lease_expiry ? [{ label: "Lease", expiry: leaseExpiry }] : []),
            ].filter(i => i.expiry.days !== null && (i.expiry.days as number) <= 90)
            if (items.length === 0) return null
            return (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5" /> Upcoming Expirations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map(item => (
                    <div key={item.label} className="bg-white rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${(item.expiry.days as number) <= 30 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {(item.expiry.days as number) < 0 ? "Expired" : `${item.expiry.days}d left`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          {employees.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search employees..." value={empSearch} onChange={e => setEmpSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" />
            </div>
          )}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
            {filteredEmps.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{empSearch ? "No employees match your search." : "No employees found."}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredEmps.map(emp => {
                  const visaExp = getExpiryInfo(emp.visa_expiry)
                  const docStatus = empDocStatus(emp.id)
                  const empDocs = companyDocs.filter(d => d.employee_id === emp.id)
                  return (
                    <div key={emp.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">{emp.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{emp.full_name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {emp.designation && <span>{emp.designation}</span>}
                              {emp.nationality && <><span>·</span><span>{emp.nationality}</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="hidden sm:flex items-center gap-1.5 text-xs">
                            {docStatus.hasVisa ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                            <span className="text-gray-500">Visa</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 text-xs">
                            {docStatus.hasEid ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                            <span className="text-gray-500">Emirates ID</span>
                          </div>
                          <div className="hidden md:flex items-center gap-1.5 text-xs">
                            {docStatus.hasPassport ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                            <span className="text-gray-500">Passport</span>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visaExp.color === "text-red-600" ? "bg-red-50 text-red-700" : visaExp.color === "text-yellow-600" ? "bg-yellow-50 text-yellow-700" : visaExp.color === "text-green-600" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {visaExp.label}
                          </span>
                          <span className="text-xs text-gray-400">{empDocs.length} docs</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search documents..." value={docSearch} onChange={e => setDocSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" />
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#15305a] transition-colors flex-shrink-0">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload"}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{docSearch ? "No documents match your search." : "No documents uploaded yet."}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
              {filteredDocs.map(doc => {
                const expiry = getExpiryInfo(doc.expiry_date)
                const cat = documentCategories[doc.document_type] || documentCategories.other
                const empName = doc.employee_id ? employees.find(e => e.id === doc.employee_id)?.full_name : null
                return (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-[#1a3a6b]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                          {empName && <span className="text-gray-400">{empName}</span>}
                          {doc.expiry_date && (
                            <span className={`flex items-center gap-1 ${expiry.color}`}>
                              <Calendar className="h-3 w-3" /> {expiry.label}
                            </span>
                          )}
                          {!doc.expiry_date && <span className="text-gray-300">No expiry set</span>}
                        </div>
                      </div>
                    </div>
                    {doc.file_url && (
                      <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-[#1a3a6b] transition-colors flex-shrink-0">
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
