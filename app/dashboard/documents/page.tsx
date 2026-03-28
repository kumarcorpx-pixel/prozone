"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { documentCategories } from "@/lib/company-data"
import { toast } from "sonner"
import { Upload, Download, FileText, Calendar, HardDrive, Filter, Link2, User, Building2 } from "lucide-react"

const allCategories = ["all", ...Object.keys(documentCategories)] as const

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "---"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExpiryStatus(expiryDate: string | null): { label: string; className: string } | null {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry < 0) return { label: "Expired", className: "text-red-600 bg-red-50" }
  if (daysUntilExpiry <= 30) return { label: `Expires in ${daysUntilExpiry}d`, className: "text-yellow-600 bg-yellow-50" }
  if (daysUntilExpiry <= 90) return { label: `Expires in ${daysUntilExpiry}d`, className: "text-orange-600 bg-orange-50" }
  return { label: "Valid", className: "text-green-600 bg-green-50" }
}

type TabType = "company" | "requests" | "employees"

export default function DocumentsPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<TabType>("company")
  const [documents, setDocuments] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", file.name)
      if (companies.length > 0) formData.append("companyId", companies[0].id)
      else if (user?.company_id) formData.append("companyId", user.company_id)
      formData.append("documentType", "other")
      const res = await fetch("/api/documents/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        toast.success("Document uploaded successfully")
        // Reload documents
        const updatedRes = await fetch("/api/client/documents")
        if (updatedRes.ok) setDocuments(await updatedRes.json())
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [documentsRes, companiesRes, employeesRes] = await Promise.all([
          fetch("/api/client/documents"),
          fetch("/api/client/companies"),
          fetch("/api/client/employees"),
        ])
        if (documentsRes.ok) setDocuments(await documentsRes.json())
        if (companiesRes.ok) setCompanies(await companiesRes.json())
        if (employeesRes.ok) setEmployees(await employeesRes.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  // Since /api/client/* already filters server-side, use ALL returned documents
  const companyIds = companies.map((c: any) => c.id)
  const myCompany = companies[0] || null

  // Company documents (no employee linked)
  const myCompanyDocs = documents.filter(d => !d.employee_id)
  // Employee documents
  const myEmployeeDocs = documents.filter(d => d.employee_id)
  // Request-linked documents
  const myRequestDocs = documents.filter(d => d.request_id)

  const getTabDocs = () => {
    switch (activeTab) {
      case "company": return myCompanyDocs
      case "employees": return myEmployeeDocs
      case "requests": return []
    }
  }

  const filteredDocs = getTabDocs().filter(doc => {
    if (selectedCategory === "all") return true
    return doc.document_type === selectedCategory
  })

  const tabs: { id: TabType; label: string; icon: typeof FileText; count: number }[] = [
    { id: "company", label: "Company Docs", icon: Building2, count: myCompanyDocs.length },
    { id: "employees", label: "Employee Docs", icon: User, count: myEmployeeDocs.length },
    { id: "requests", label: "Request Docs", icon: Link2, count: myRequestDocs.length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            {myCompany ? `${myCompany.name} — ` : ""}All documents linked to your company, employees, and service requests.
          </p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Document"}
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.docx" />
        </label>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-white text-[#1a3a6b] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? "bg-[#1a3a6b]/10 text-[#1a3a6b]" : "bg-gray-200 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Request Documents Tab */}
      {activeTab === "requests" ? (
        <div className="space-y-4">
          {(() => {
            const requestIds = [...new Set(myRequestDocs.map(d => d.request_id))]
            return requestIds.map(requestId => {
              const reqDocs = myRequestDocs.filter(d => d.request_id === requestId)
              return (
                <div key={requestId} className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1a3a6b]" />
                    <span className="font-medium text-sm">Request {requestId}</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {reqDocs.map(doc => (
                      <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-[#1a3a6b]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.file_name || doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                (doc.doc_type || doc.document_type) === "required" ? "bg-blue-100 text-blue-700" :
                                (doc.doc_type || doc.document_type) === "submitted" ? "bg-yellow-100 text-yellow-700" :
                                (doc.doc_type || doc.document_type) === "processed" ? "bg-purple-100 text-purple-700" :
                                (doc.doc_type || doc.document_type) === "final" ? "bg-green-100 text-green-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {doc.doc_type || doc.document_type || "general"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg text-gray-400 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/5">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          })()}
          {myRequestDocs.length === 0 && (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
              <Link2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents linked to requests yet</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {allCategories.map((cat) => {
              const catConfig = cat === "all" ? null : documentCategories[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#1a3a6b] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "All" : catConfig?.label || cat}
                </button>
              )
            })}
          </div>

          {/* Document Cards */}
          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => {
                const catConfig = documentCategories[doc.document_type || "other"] || documentCategories.other
                const expiryStatus = getExpiryStatus(doc.expiry_date)
                const employee = doc.employee_id ? employees.find((e: any) => e.id === doc.employee_id) : null

                return (
                  <div key={doc.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-gray-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-[#1a3a6b]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h3>
                          {employee && (
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <User className="h-3 w-3" /> {employee.full_name}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${catConfig?.color || "bg-gray-100 text-gray-800"}`}>
                              {catConfig?.label || doc.document_type}
                            </span>
                            {expiryStatus && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${expiryStatus.className}`}>
                                {expiryStatus.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-[#1a3a6b] hover:bg-[#1a3a6b]/5 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                      {doc.expiry_date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(doc.expiry_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
