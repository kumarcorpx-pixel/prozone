"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { documentCategories } from "@/lib/company-data"
import { toast } from "sonner"
import {
  Building2, Users, FileText, Shield, CheckCircle2, XCircle,
  Upload, MapPin, Calendar, Phone, Mail, Loader2,
  Download, AlertTriangle, Search, Briefcase, Globe, Eye,
  ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { DocumentPreview } from "@/components/ui/document-preview"

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
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [autoPlay, setAutoPlay] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const switchCompany = useCallback((id: string) => {
    setTransitioning(true)
    setTimeout(() => {
      setSelectedId(id)
      setTransitioning(false)
    }, 200)
  }, [])

  const goNext = useCallback(() => {
    if (companies.length <= 1) return
    const idx = companies.findIndex((c: any) => c.id === selectedId)
    const nextIdx = (idx + 1) % companies.length
    switchCompany(companies[nextIdx].id)
  }, [companies, selectedId, switchCompany])

  const goPrev = useCallback(() => {
    if (companies.length <= 1) return
    const idx = companies.findIndex((c: any) => c.id === selectedId)
    const prevIdx = (idx - 1 + companies.length) % companies.length
    switchCompany(companies[prevIdx].id)
  }, [companies, selectedId, switchCompany])

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (!autoPlay || companies.length <= 1) return
    autoPlayRef.current = setInterval(goNext, 8000)
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current) }
  }, [autoPlay, goNext, companies.length])

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

  // Compliance data for inline display
  const complianceItems = (() => {
    const getStatus = (dateStr: string | null | undefined): "valid" | "expiring" | "expired" | "not_set" => {
      if (!dateStr) return "not_set"
      const diffDays = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return "expired"
      if (diffDays <= 30) return "expiring"
      return "valid"
    }
    const tradeLicenseStatus = getStatus(company.license_expiry)
    const hasEstabDoc = companyDocs.some((d: any) => d.document_type === "establishment_card" && !d.employee_id)
    const establishmentCardStatus = company.establishment_card_expiry ? getStatus(company.establishment_card_expiry) : hasEstabDoc ? "unknown" as const : "not_set" as const
    const hasEjariDoc = companyDocs.some((d: any) => (d.document_type === "ejari" || d.document_type === "tawtheeq") && !d.employee_id)
    const ejariStatus = company.ejari_tawtheeq_expiry ? getStatus(company.ejari_tawtheeq_expiry) : hasEjariDoc ? "unknown" as const : "not_set" as const
    const empsWithVisa = employees.filter((e: any) => e.visa_expiry)
    const visaExpired = empsWithVisa.filter((e: any) => getStatus(e.visa_expiry) === "expired").length
    const visaExpiring = empsWithVisa.filter((e: any) => getStatus(e.visa_expiry) === "expiring").length
    const visaStatus = employees.length === 0 ? "not_set" : empsWithVisa.length === 0 ? "unknown" : visaExpired > 0 ? "expired" : visaExpiring > 0 ? "expiring" : (employees.length - empsWithVisa.length) > 0 ? "unknown" : "valid"
    const empsWithEid = employees.filter((e: any) => e.emirates_id_expiry)
    const eidExpired = empsWithEid.filter((e: any) => getStatus(e.emirates_id_expiry) === "expired").length
    const eidExpiring = empsWithEid.filter((e: any) => getStatus(e.emirates_id_expiry) === "expiring").length
    const eidStatus = employees.length === 0 ? "not_set" : empsWithEid.length === 0 ? "unknown" : eidExpired > 0 ? "expired" : eidExpiring > 0 ? "expiring" : (employees.length - empsWithEid.length) > 0 ? "unknown" : "valid"
    const empsWithLc = employees.filter((e: any) => e.labor_card_expiry)
    const lcExpired = empsWithLc.filter((e: any) => getStatus(e.labor_card_expiry) === "expired").length
    const lcExpiring = empsWithLc.filter((e: any) => getStatus(e.labor_card_expiry) === "expiring").length
    const lcStatus = employees.length === 0 ? "not_set" : empsWithLc.length === 0 ? "unknown" : lcExpired > 0 ? "expired" : lcExpiring > 0 ? "expiring" : (employees.length - empsWithLc.length) > 0 ? "unknown" : "valid"
    const insuredEmployeeIds = new Set(companyDocs.filter((d: any) => d.document_type === "medical_insurance" && d.employee_id).map((d: any) => d.employee_id))
    const uninsured = employees.length - insuredEmployeeIds.size
    const insuranceStatus = employees.length === 0 ? "not_set" : uninsured === 0 ? "valid" : insuredEmployeeIds.size === 0 ? "unknown" : "expired"
    return [
      { label: "Trade License", status: tradeLicenseStatus },
      { label: "Establishment Card", status: establishmentCardStatus },
      { label: "Ejari/Tawtheeq", status: ejariStatus },
      { label: "Employee Visas", status: visaStatus },
      { label: "Emirates IDs", status: eidStatus },
      { label: "Labor Cards", status: lcStatus },
      { label: "Health Insurance", status: insuranceStatus },
    ]
  })()
  const complianceGreen = complianceItems.filter(i => i.status === "valid").length
  const compliancePercent = complianceItems.length > 0 ? Math.round((complianceGreen / complianceItems.length) * 100) : 0

  return (
    <div className="space-y-6">
      <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
      {/* Back link */}
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1a3a6b] mb-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Company</h1>
          <p className="text-sm text-gray-500 mt-1">View company details, employees, and documents</p>
        </div>
      </div>

      {/* Multi-Company Navigation */}
      {companies.length > 1 && (
        <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700">Your Companies</h3>
              <span className="text-xs text-gray-400">({companies.findIndex(c => c.id === selectedId) + 1} of {companies.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setAutoPlay(!autoPlay) }}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${autoPlay ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                {autoPlay ? "Auto ●" : "Auto ○"}
              </button>
              <button onClick={() => { setAutoPlay(false); goPrev() }}
                className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button onClick={() => { setAutoPlay(false); goNext() }}
                className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {companies.map((c, i) => {
              const empCount = allEmployees.filter((e: any) => e.company_id === c.id).length
              const docCount = documents.filter((d: any) => d.company_id === c.id).length
              const isActive = c.id === selectedId
              return (
                <button key={c.id} onClick={() => { setAutoPlay(false); switchCompany(c.id) }}
                  className={`relative flex-shrink-0 px-4 py-2.5 rounded-xl text-left transition-all duration-300 ${isActive ? "bg-[#1a3a6b] text-white shadow-lg scale-[1.02]" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
                  style={{ minWidth: "160px" }}>
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : ""}`}>{c.name}</p>
                  <div className={`flex items-center gap-3 mt-1 text-xs ${isActive ? "text-blue-200" : "text-gray-400"}`}>
                    <span>{empCount} emp</span>
                    <span>{docCount} docs</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.status === "active" ? "bg-green-400" : "bg-gray-400"}`} />
                  </div>
                  {/* Active indicator bar */}
                  {isActive && autoPlay && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white/70 rounded-full animate-[progress_8s_linear]" style={{ animation: "progress 8s linear forwards" }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {companies.map((c, i) => (
              <button key={c.id} onClick={() => { setAutoPlay(false); switchCompany(c.id) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${c.id === selectedId ? "w-6 bg-[#1a3a6b]" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards — fade on company switch */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${transitioning ? "opacity-0" : "opacity-100"}`}>
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
          {/* Company Header Card */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
              {company.license_type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{company.license_type}</span>
              )}
              {company.emirate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{company.emirate}</span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${company.status === "active" ? "bg-green-50 text-green-700" : company.status === "inactive" ? "bg-gray-100 text-gray-500" : "bg-yellow-50 text-yellow-700"}`}>{company.status}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              {company.license_number && <span>License # {company.license_number}</span>}
              {company.jurisdiction && <span>{company.jurisdiction}</span>}
              {company.legal_form && <span>{company.legal_form}</span>}
            </div>
          </div>

          {/* Key Dates Row */}
          {(() => {
            const estabExpiry = getExpiryInfo(company.establishment_card_expiry)
            const ejariExpiry = getExpiryInfo(company.ejari_tawtheeq_expiry)
            const leaseExpiry = getExpiryInfo(company.lease_expiry)
            const dateItems = [
              { label: "License Expiry", expiry: licenseExpiry, hasValue: true },
              { label: "Establishment Card Expiry", expiry: estabExpiry, hasValue: !!company.establishment_card_expiry },
              { label: "Ejari Expiry", expiry: ejariExpiry, hasValue: !!company.ejari_tawtheeq_expiry },
              { label: "Lease Expiry", expiry: leaseExpiry, hasValue: !!company.lease_expiry },
            ].filter(i => i.hasValue)
            if (dateItems.length === 0) return null
            const cols = dateItems.length <= 2 ? "grid-cols-2" : dateItems.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
            return (
              <div className={`grid ${cols} gap-4`}>
                {dateItems.map(item => (
                  <div key={item.label} className="bg-white rounded-xl ring-1 ring-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.expiry.color}`}>{item.expiry.label}</p>
                    {item.expiry.days !== null && (item.expiry.days as number) <= 90 && (
                      <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${(item.expiry.days as number) <= 30 ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {(item.expiry.days as number) < 0 ? "Expired" : `${item.expiry.days}d left`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Contact & Details - only fields with values */}
          {(() => {
            const detailItems: { icon: any; label: string; value: any }[] = [
              ...(company.phone ? [{ icon: Phone, label: "Phone", value: <a href={`tel:${company.phone}`} className="text-[#1a3a6b] hover:underline">{company.phone}</a> }] : []),
              ...(company.email ? [{ icon: Mail, label: "Email", value: <a href={`mailto:${company.email}`} className="text-[#1a3a6b] hover:underline">{company.email}</a> }] : []),
              ...(company.address ? [{ icon: MapPin, label: "Address", value: company.address }] : []),
              ...(company.industry ? [{ icon: Briefcase, label: "Industry", value: company.industry }] : []),
              ...(company.sponsor_name ? [{ icon: Users, label: "Sponsor", value: company.sponsor_name }] : []),
              ...(company.vat_trn ? [{ icon: FileText, label: "VAT TRN", value: company.vat_trn }] : []),
              ...(company.establishment_card_number ? [{ icon: FileText, label: "Establishment Card #", value: company.establishment_card_number }] : []),
              ...(company.ejari_tawtheeq_number ? [{ icon: FileText, label: "Ejari/Tawtheeq #", value: company.ejari_tawtheeq_number }] : []),
              ...(company.mohre_company_number ? [{ icon: Shield, label: "MOHRE Company #", value: company.mohre_company_number }] : []),
            ]
            if (detailItems.length === 0) return null
            return (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-5"><Building2 className="h-5 w-5" /> Contact & Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {detailItems.map((item: any) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <item.icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Compact Compliance Checklist */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2"><Shield className="h-5 w-5" /> Compliance</h3>
              <span className={`text-sm font-semibold ${compliancePercent > 80 ? "text-green-600" : compliancePercent >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                {compliancePercent}% ({complianceGreen}/{complianceItems.length})
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-5">
              <div
                className={`h-2.5 rounded-full transition-all ${compliancePercent > 80 ? "bg-green-500" : compliancePercent >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${Math.min(compliancePercent, 100)}%` }}
              />
            </div>
            {/* Items in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {complianceItems.map(item => (
                <div key={item.label} className="flex items-center gap-2.5 py-1">
                  {item.status === "valid" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : item.status === "expiring" ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  ) : item.status === "expired" ? (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {doc.file_url && (
                        <button onClick={() => setPreviewDoc(doc)} className="p-2 text-gray-400 hover:text-[#1a3a6b] transition-colors" title="Preview">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {doc.file_url && (
                        <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-[#1a3a6b] transition-colors" title="Download">
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {previewDoc && (
        <DocumentPreview
          docId={previewDoc.id}
          docName={previewDoc.name}
          mimeType={previewDoc.mime_type || previewDoc.notes?.match?.(/mime:(\S+)/)?.[1]}
          fileUrl={previewDoc.file_url}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
