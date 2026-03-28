"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { toast } from "sonner"
import {
  Building2, Users, FileText, Shield, CheckCircle2, XCircle,
  Upload, ChevronDown, MapPin, Calendar, Phone, Mail, Loader2,
  Download, Eye, AlertTriangle
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

  const complianceItems = [
    { label: "Trade License", ok: company?.license_expiry ? new Date(company.license_expiry) > new Date() : false },
    { label: "Employee Visas", ok: employees.length > 0 && employees.filter(e => e.visa_status === "valid").length > employees.length * 0.5 },
    { label: "Emirates IDs", ok: employees.length > 0 && employees.filter(e => e.emirates_id).length > 0 },
    { label: "Labor Cards", ok: employees.length > 0 && employees.filter(e => e.labor_card_number).length > 0 },
  ]
  const complianceScore = Math.round((complianceItems.filter(i => i.ok).length / complianceItems.length) * 100)

  if (!company) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Building2 className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">No Company Linked</h2>
      <p className="text-gray-500 mt-2">Contact your PRO administrator to link your company.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Company Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Company</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your company details, employees, and documents</p>
        </div>
        {companies.length > 1 && (
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${complianceScore >= 75 ? "bg-green-50" : complianceScore >= 50 ? "bg-yellow-50" : "bg-red-50"}`}>
              <Shield className={`h-5 w-5 ${complianceScore >= 75 ? "text-green-600" : complianceScore >= 50 ? "text-yellow-600" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Compliance</p>
              <p className={`font-semibold ${complianceScore >= 75 ? "text-green-600" : complianceScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>{complianceScore}%</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-5"><Building2 className="h-5 w-5" /> Company Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              {[
                { icon: Building2, label: "Company Name", value: company.name },
                { icon: FileText, label: "License Number", value: company.license_number || "Not provided" },
                { icon: Calendar, label: "License Expiry", value: licenseExpiry.label, color: licenseExpiry.color },
                { icon: MapPin, label: "Emirate", value: company.emirate || "Not provided" },
                { icon: FileText, label: "License Type", value: company.license_type || "Commercial" },
                { icon: Building2, label: "Legal Form", value: company.legal_form || "LLC" },
                { icon: Phone, label: "Phone", value: company.phone || "Not provided" },
                { icon: Mail, label: "Email", value: company.email || "Not provided" },
              ].map(item => (
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

          {/* Compliance Card */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Shield className="h-5 w-5" /> Compliance Status</h3>
            <div className="text-center mb-5">
              <div className={`text-5xl font-bold ${complianceScore >= 75 ? "text-green-600" : complianceScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>{complianceScore}%</div>
              <p className="text-sm text-gray-500 mt-1">Overall Score</p>
            </div>
            <div className="space-y-3">
              {complianceItems.map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  {item.ok ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-400" />}
                </div>
              ))}
            </div>
            {complianceScore < 75 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Missing documents may delay your service requests.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No employees found for this company.</p>
              <p className="text-xs text-gray-400 mt-1">Contact your PRO officer to add employees.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Designation</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Nationality</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Visa Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Visa Expiry</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Emirates ID</th>
                </tr></thead>
                <tbody>
                  {employees.map(emp => {
                    const visaExp = getExpiryInfo(emp.visa_expiry)
                    return (
                      <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{emp.full_name}</p>
                          <p className="text-xs text-gray-400 sm:hidden">{emp.designation || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{emp.designation || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{emp.nationality || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={emp.visa_status || "processing"} /></td>
                        <td className={`px-4 py-3 hidden lg:table-cell ${visaExp.color}`}>{visaExp.label}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{emp.emirates_id || "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{companyDocs.length} document{companyDocs.length !== 1 ? "s" : ""}</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#15305a] transition-colors">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload Document"}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          {companyDocs.length === 0 ? (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents uploaded yet.</p>
              <p className="text-xs text-gray-400 mt-1">Upload trade licenses, visas, contracts, and more.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
              {companyDocs.map(doc => {
                const expiry = getExpiryInfo(doc.expiry_date)
                return (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-[#1a3a6b]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{doc.document_type?.replace("_", " ") || "Other"}</span>
                          {doc.expiry_date && <><span>&middot;</span><span className={expiry.color}>{expiry.label}</span></>}
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
