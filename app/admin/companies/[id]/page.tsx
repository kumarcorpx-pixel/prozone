"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchCompany, fetchEmployees, fetchDocuments } from "@/lib/data-fetcher"
import { documentCategories } from "@/lib/company-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ComplianceScore } from "@/components/dashboard/compliance-score"
import {
  Building2,
  Users,
  FileText,
  Shield,
  Upload,
  UserCheck,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Plus,
  ChevronRight,
  ClipboardCheck,
  AlertTriangle,
  Download,
  X,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { AedIcon } from "@/components/ui/aed-icon"

function getExpiryColor(dateStr: string | null): string {
  if (!dateStr) return "text-gray-400"
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "text-red-600 font-medium"
  if (diffDays <= 30) return "text-yellow-600 font-medium"
  return "text-green-600"
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString()
}

const visaTypeBadge: Record<string, string> = {
  valid: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  expiring_soon: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-600",
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h3 className="font-semibold text-[#1a3a6b]">{title}</h3>
        <ChevronRight
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  )
}

function LabelValue({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <div className={`font-medium text-gray-900 text-sm ${className || ""}`}>{value || "-"}</div>
    </div>
  )
}

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "employees", label: "Employees", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "compliance", label: "Compliance", icon: ClipboardCheck },
  { id: "fees", label: "Fees", icon: AedIcon },
  { id: "wps", label: "WPS", icon: Shield },
  { id: "uploads", label: "Monthly Uploads", icon: Upload },
  { id: "shareholders", label: "Shareholders", icon: UserCheck },
]

const feeStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string
  const [activeTab, setActiveTab] = useState("overview")
  const [company, setCompany] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [feeForm, setFeeForm] = useState({ description: "", amount: "", date: "", status: "pending", receipt_number: "" })
  const [shareholders, setShareholders] = useState<any[]>([])
  const [showShareholderForm, setShowShareholderForm] = useState(false)
  const [shareholderForm, setShareholderForm] = useState({ name: "", nationality: "", share_percentage: "", passport_number: "" })

  useEffect(() => {
    async function load() {
      const [c, e, d] = await Promise.all([
        fetchCompany(companyId),
        fetchEmployees(companyId),
        fetchDocuments(companyId),
      ])
      setCompany(c)
      if (c) setEditData({
        name: c.name || "", trade_name: c.trade_name || "", license_number: c.license_number || "",
        license_expiry: c.license_expiry?.split("T")[0] || "", license_type: c.license_type || "",
        legal_form: c.legal_form || "", emirate: c.emirate || "", phone: c.phone || "",
        email: c.email || "", address: c.address || "", industry: c.industry || "",
        status: c.status || "active", visa_quota_total: c.visa_quota_total || 0,
        mohre_company_number: c.mohre_company_number || "", establishment_card_number: c.establishment_card_number || "",
        immigration_file_number: c.immigration_file_number || "", computer_card_number: c.computer_card_number || "",
        chamber_commerce_number: c.chamber_commerce_number || "", ejari_tawtheeq_number: c.ejari_tawtheeq_number || "",
        vat_trn: c.vat_trn || "", sponsor_name: c.sponsor_name || "",
        created_by: c.created_by || "",
      })
      setEmployees(e)
      setDocuments(d)

      try {
        const notesData = c?.notes ? JSON.parse(c.notes) : {}
        if (notesData.fees) setFees(notesData.fees)
        if (notesData.shareholders) setShareholders(notesData.shareholders)
      } catch {}

      try {
        const clientsRes = await fetch("/api/data/users?role=client")
        if (clientsRes.ok) setClients(await clientsRes.json())
      } catch {}

      setLoading(false)
    }
    load()
  }, [companyId])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">Company not found</h2>
        <p className="text-sm text-gray-500 mt-1">The company you are looking for does not exist.</p>
        <Link href="/admin/companies" className="mt-4 text-sm text-[#1a3a6b] hover:underline font-medium">
          Back to Companies
        </Link>
      </div>
    )
  }

  const ec = company

  const companyDocs = documents.filter((d) => !d.employee_id)
  const employeeDocs = documents.filter((d) => d.employee_id)
  const employeeDocGroups: Record<string, typeof documents> = {}
  employeeDocs.forEach((doc) => {
    const emp = employees.find((e) => e.id === doc.employee_id)
    const name = emp ? emp.full_name : "Unknown Employee"
    if (!employeeDocGroups[name]) employeeDocGroups[name] = []
    employeeDocGroups[name].push(doc)
  })

  const feesTotal = fees.reduce((sum: number, f: any) => sum + Number(f.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-[#1a3a6b]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a6b]">{company.name}</h1>
            <p className="text-sm text-gray-500">{company.trade_name || company.name}</p>
          </div>
        </div>
        <StatusBadge status={company.status} />
      </div>

      {/* Edit Company Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab("edit")} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
          <FileText className="h-4 w-4" /> Edit Company Details
        </button>
        <Link href="/admin/documents" prefetch={false} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Upload className="h-4 w-4" /> Upload Document
        </Link>
        <Link href="/admin/employees" prefetch={false} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Users className="h-4 w-4" /> Add Employee
        </Link>
      </div>

      {(!company.license_number || !company.license_expiry) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Incomplete Company Information</p>
            <p className="text-xs text-yellow-600 mt-0.5">Please update the trade license number and expiry date for compliance tracking.</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-0 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#1a3a6b] text-[#1a3a6b]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* ──── Overview Tab ──── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Contact & Activities row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h3 className="font-semibold text-[#1a3a6b] mb-4">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{company.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{company.email || "No email"}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{company.address || "No address"}{company.po_box ? `, P.O. Box ${company.po_box}` : ""}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h3 className="font-semibold text-[#1a3a6b] mb-4">Business Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {(company.activities || []).map((activity: string, i: number) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {activity}
                    </span>
                  ))}
                  {company.activities.length === 0 && (
                    <p className="text-sm text-gray-500">No activities listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible sections */}
            <CollapsibleSection title="License & Registration" defaultOpen>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <LabelValue label="Trade License #" value={ec.license_number} className="font-mono" />
                <LabelValue label="License Expiry" value={<span className={getExpiryColor(ec.license_expiry)}>{formatDate(ec.license_expiry)}</span>} />
                <LabelValue label="License Type" value={
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ec.license_type === "freezone" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {ec.license_type === "freezone" ? "Free Zone" : "Mainland"}
                  </span>
                } />
                <LabelValue label="Legal Form" value={ec.legal_form} />
                <LabelValue label="DED/Free Zone Authority" value={ec.free_zone_authority || ec.jurisdiction} />
                <LabelValue label="Status" value={<StatusBadge status={ec.status} />} />
                <LabelValue label="Capital" value={ec.capital ? `AED ${ec.capital.toLocaleString()}` : "-"} />
                <LabelValue label="Emirate" value={ec.emirate} />
                <LabelValue label="Jurisdiction" value={ec.jurisdiction} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Immigration & Labor">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <LabelValue label="Establishment Card #" value={ec.establishment_card_number} className="font-mono" />
                <LabelValue label="Establishment Card Expiry" value={<span className={getExpiryColor(ec.establishment_card_expiry)}>{formatDate(ec.establishment_card_expiry)}</span>} />
                <LabelValue label="Immigration File #" value={ec.immigration_file_number} className="font-mono" />
                <LabelValue label="Computer Card #" value={ec.computer_card_number} className="font-mono" />
                <LabelValue label="MOHRE Company #" value={ec.mohre_company_number} className="font-mono" />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Office & Lease">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <LabelValue label="Ejari/Tawtheeq #" value={ec.ejari_tawtheeq_number} className="font-mono" />
                <LabelValue label="Ejari/Tawtheeq Type" value={
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                    {ec.ejari_tawtheeq_type}
                  </span>
                } />
                <LabelValue label="Ejari/Tawtheeq Expiry" value={<span className={getExpiryColor(ec.ejari_tawtheeq_expiry)}>{formatDate(ec.ejari_tawtheeq_expiry)}</span>} />
                <LabelValue label="Lease Expiry" value={<span className={getExpiryColor(ec.lease_expiry)}>{formatDate(ec.lease_expiry)}</span>} />
                <LabelValue label="Address" value={ec.address} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Tax & Finance">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <LabelValue label="VAT TRN" value={ec.vat_trn} className="font-mono" />
                <LabelValue label="Corporate Tax #" value={ec.corporate_tax_number} className="font-mono" />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Sponsor & Owner">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <LabelValue label="Sponsor Name" value={ec.sponsor_name} />
                <LabelValue label="Sponsor EID" value={ec.sponsor_eid} className="font-mono" />
                <LabelValue label="Local Service Agent" value={ec.local_service_agent || "N/A"} />
                <LabelValue label="POA Status" value={
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                    ec.poa_status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {ec.poa_status}
                  </span>
                } />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Visa Quota">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Used {ec.visa_quota_used} of {ec.visa_quota_total} ({ec.visa_quota_total - ec.visa_quota_used} remaining)
                  </span>
                  <span className="font-medium text-gray-900">
                    {ec.visa_quota_total > 0 ? Math.round((ec.visa_quota_used / ec.visa_quota_total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      ec.visa_quota_total > 0 && ec.visa_quota_used / ec.visa_quota_total > 0.9
                        ? "bg-red-500"
                        : ec.visa_quota_total > 0 && ec.visa_quota_used / ec.visa_quota_total > 0.7
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${ec.visa_quota_total > 0 ? (ec.visa_quota_used / ec.visa_quota_total) * 100 : 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-[#1a3a6b]">{ec.visa_quota_total}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Used</p>
                    <p className="text-lg font-bold text-orange-600">{ec.visa_quota_used}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-lg font-bold text-green-600">{ec.visa_quota_total - ec.visa_quota_used}</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Notes */}
            {company.notes && (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h3 className="font-semibold text-[#1a3a6b] mb-2">Notes</h3>
                <p className="text-sm text-gray-700">{company.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* ──── Employees Tab ──── */}
        {activeTab === "employees" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{employees.length} employee(s)</p>
              <Link href="/admin/employees" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
                <Plus className="h-4 w-4" />
                Add Employee
              </Link>
            </div>
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Designation</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Nationality</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Visa Type</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Visa Status</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Visa Expiry</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">EID Expiry</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Passport Expiry</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Medical</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Insurance</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">WPS</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => {
                      const medicalOk = emp.medical_fitness_result === "fit" || (emp.medical_fitness_date && new Date(emp.medical_fitness_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
                      const insured = !!emp.health_insurance_number && (!emp.health_insurance_expiry || new Date(emp.health_insurance_expiry) > new Date())
                      const wpsOk = emp.wps_status === "active" || emp.wps_status === "covered"
                      return (
                        <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3"><a href={`/admin/employees/${emp.id}`} className="font-medium text-[#1a3a6b] hover:underline cursor-pointer">{emp.full_name}</a></td>
                          <td className="px-4 py-3 text-gray-600">{emp.designation || "-"}</td>
                          <td className="px-4 py-3 text-gray-600">{emp.nationality || "-"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${visaTypeBadge[emp.visa_status] || "bg-gray-100 text-gray-600"}`}>
                              {emp.visa_status === "valid" ? "Employment" : emp.visa_status === "processing" ? "New Visa" : emp.visa_status === "expiring_soon" ? "Employment" : "Employment"}
                            </span>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={emp.visa_status} /></td>
                          <td className={`px-4 py-3 ${getExpiryColor(emp.visa_expiry)}`}>{formatDate(emp.visa_expiry)}</td>
                          <td className={`px-4 py-3 ${getExpiryColor(emp.emirates_id_expiry)}`}>{formatDate(emp.emirates_id_expiry)}</td>
                          <td className={`px-4 py-3 ${getExpiryColor(emp.passport_expiry)}`}>{formatDate(emp.passport_expiry)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${medicalOk ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                              {medicalOk ? "Fit" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${insured ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {insured ? "Active" : "Missing"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${wpsOk ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {wpsOk ? "Covered" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                        </tr>
                      )
                    })}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                          <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          No employees found for this company.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──── Documents Tab ──── */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{documents.length} document(s)</p>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#15305a] transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload Company Document
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 25 * 1024 * 1024) { toast.error("File too large (max 25MB)"); return }
                      try {
                        const fd = new FormData()
                        fd.append("file", file)
                        fd.append("name", file.name.replace(/\.[^.]+$/, ""))
                        fd.append("companyId", companyId)
                        fd.append("documentType", "trade_license")
                        const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
                        if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Upload failed") }
                        toast.success("Document uploaded!")
                        const updatedDocs = await fetchDocuments(companyId)
                        setDocuments(updatedDocs)
                      } catch (err: any) { toast.error(err?.message || "Upload failed") }
                      e.target.value = ""
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Upload for specific employee */}
            {employees.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Upload Employee Document</p>
                <div className="flex flex-wrap gap-2">
                  <select id="emp-select" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white flex-1 min-w-[200px]">
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                    ))}
                  </select>
                  <select id="doctype-select" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="visa">Visa</option>
                    <option value="emirates_id">Emirates ID</option>
                    <option value="passport">Passport</option>
                    <option value="labor_card">Labor Card</option>
                    <option value="contract">Contract</option>
                    <option value="medical_insurance">Medical Insurance</option>
                    <option value="photo">Photo</option>
                    <option value="other">Other</option>
                  </select>
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#1a3a6b] text-[#1a3a6b] rounded-lg text-sm font-medium cursor-pointer hover:bg-[#1a3a6b]/5 transition-colors">
                    <Upload className="h-4 w-4" />
                    Choose File
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const empId = (document.getElementById("emp-select") as HTMLSelectElement)?.value
                        const docType = (document.getElementById("doctype-select") as HTMLSelectElement)?.value || "other"
                        try {
                          const fd = new FormData()
                          fd.append("file", file)
                          fd.append("name", file.name.replace(/\.[^.]+$/, ""))
                          fd.append("companyId", companyId)
                          if (empId) fd.append("employeeId", empId)
                          fd.append("documentType", docType)
                          const res = await fetch("/api/documents/upload", { method: "POST", body: fd })
                          if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Upload failed") }
                          toast.success("Employee document uploaded!")
                          const updatedDocs = await fetchDocuments(companyId)
                          setDocuments(updatedDocs)
                        } catch (err: any) { toast.error(err?.message || "Upload failed") }
                        e.target.value = ""
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Company-level documents */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h3 className="font-semibold text-[#1a3a6b] mb-4">Company Documents</h3>
              {companyDocs.length > 0 ? (
                <div className="space-y-3">
                  {companyDocs.map((doc) => {
                    const cat = documentCategories[doc.document_type] || documentCategories.other
                    return (
                      <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs ${getExpiryColor(doc.expiry_date)}`}>{formatDate(doc.expiry_date)}</span>
                          <StatusBadge status={doc.status} />
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {doc.file_url ? (
                              <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Download">
                                <Download className="h-4 w-4" />
                              </a>
                            ) : (
                              <label className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors cursor-pointer" title="Upload file">
                                <Upload className="h-4 w-4" />
                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={async (ev) => {
                                  const f = ev.target.files?.[0]; if (!f) return
                                  const fd = new FormData(); fd.append("file", f); fd.append("name", doc.name); fd.append("companyId", companyId); fd.append("documentType", doc.document_type || "other")
                                  try { const r = await fetch("/api/documents/upload", { method: "POST", body: fd }); if (r.ok) { toast.success("File attached"); const d = await fetchDocuments(companyId); setDocuments(d) } else toast.error("Upload failed") } catch { toast.error("Upload failed") }
                                  ev.target.value = ""
                                }} />
                              </label>
                            )}
                            <button onClick={async () => {
                              if (!confirm("Delete this document?")) return
                              try { await fetch(`/api/documents/${doc.id}`, { method: "DELETE" }); toast.success("Deleted"); const d = await fetchDocuments(companyId); setDocuments(d) } catch { toast.error("Delete failed") }
                            }} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No company-level documents uploaded yet. Use the button above to upload.</p>
              )}
            </div>

            {/* Employee documents grouped */}
            {Object.entries(employeeDocGroups).map(([empName, docs]) => (
              <div key={empName} className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">{empName}</h3>
                <div className="space-y-3">
                  {docs.map((doc) => {
                    const cat = documentCategories[doc.document_type] || documentCategories.other
                    return (
                      <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className={`text-sm ${getExpiryColor(doc.expiry_date)}`}>{formatDate(doc.expiry_date)}</span>
                          <StatusBadge status={doc.status} />
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {doc.file_url ? (
                              <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Download">
                                <Download className="h-4 w-4" />
                              </a>
                            ) : (
                              <label className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors cursor-pointer" title="Upload file">
                                <Upload className="h-4 w-4" />
                                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={async (ev) => {
                                  const f = ev.target.files?.[0]; if (!f) return
                                  const fd = new FormData(); fd.append("file", f); fd.append("name", doc.name); fd.append("companyId", companyId); fd.append("documentType", doc.document_type || "other")
                                  if (doc.employee_id) fd.append("employeeId", doc.employee_id)
                                  try { const r = await fetch("/api/documents/upload", { method: "POST", body: fd }); if (r.ok) { toast.success("File attached"); const d = await fetchDocuments(companyId); setDocuments(d) } else toast.error("Upload failed") } catch { toast.error("Upload failed") }
                                  ev.target.value = ""
                                }} />
                              </label>
                            )}
                            <button onClick={async () => {
                              if (!confirm("Delete?")) return
                              try { await fetch(`/api/documents/${doc.id}`, { method: "DELETE" }); toast.success("Deleted"); const d = await fetchDocuments(companyId); setDocuments(d) } catch { toast.error("Failed") }
                            }} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
                <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ──── Compliance Tab ──── */}
        {activeTab === "compliance" && (
          <ComplianceScore company={ec} employees={employees} documents={documents} />
        )}

        {/* ──── Fees Tab ──── */}
        {activeTab === "fees" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{fees.length} fee(s) recorded</p>
              <button onClick={() => setShowFeeForm(!showFeeForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
                <Plus className="h-4 w-4" /> {showFeeForm ? "Cancel" : "Add Fee"}
              </button>
            </div>

            {showFeeForm && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Add Government Fee</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <select value={feeForm.description} onChange={e => setFeeForm({...feeForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="">Select fee type...</option>
                      <option value="Trade License Renewal">Trade License Renewal</option>
                      <option value="Establishment Card">Establishment Card</option>
                      <option value="Chamber of Commerce">Chamber of Commerce</option>
                      <option value="Ejari/Tawtheeq">Ejari/Tawtheeq</option>
                      <option value="MOHRE Fee">MOHRE Fee</option>
                      <option value="GDRFA Fee">GDRFA Fee</option>
                      <option value="Visa Fee">Visa Fee</option>
                      <option value="Medical Test">Medical Test</option>
                      <option value="Emirates ID">Emirates ID</option>
                      <option value="Typing Fee">Typing Fee</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED) *</label>
                    <input type="number" value={feeForm.amount} onChange={e => setFeeForm({...feeForm, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={feeForm.date} onChange={e => setFeeForm({...feeForm, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt #</label>
                    <input type="text" value={feeForm.receipt_number} onChange={e => setFeeForm({...feeForm, receipt_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Receipt number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={feeForm.status} onChange={e => setFeeForm({...feeForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
                <button onClick={async () => {
                  if (!feeForm.description || !feeForm.amount) { toast.error("Description and amount required"); return }
                  try {
                    const newFee = { ...feeForm, amount: Number(feeForm.amount), id: Date.now().toString(), date: feeForm.date || new Date().toISOString().split("T")[0] }
                    const updatedFees = [...fees, newFee]
                    setFees(updatedFees)
                    let existingNotes: any = {}
                    try { existingNotes = company.notes ? JSON.parse(company.notes) : {} } catch {}
                    await fetch(`/api/data/companies/${companyId}`, {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ notes: JSON.stringify({ ...existingNotes, fees: updatedFees }) }),
                    })
                    toast.success("Fee added")
                    setShowFeeForm(false)
                    setFeeForm({ description: "", amount: "", date: "", status: "pending", receipt_number: "" })
                  } catch { toast.error("Failed to add fee") }
                }} className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
                  Save Fee
                </button>
              </div>
            )}

            {fees.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Description</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Amount (AED)</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Receipt #</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {fees.map((fee: any) => (
                      <tr key={fee.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 font-medium">{fee.description}</td>
                        <td className="px-4 py-3 text-right font-semibold">{Number(fee.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{fee.date}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{fee.receipt_number || "\u2014"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${fee.status === "paid" ? "bg-green-100 text-green-800" : fee.status === "overdue" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{fee.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">AED {fees.reduce((s: number, f: any) => s + Number(f.amount), 0).toLocaleString()}</td>
                    <td colSpan={3} />
                  </tr></tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500">No fees recorded yet. Click &quot;Add Fee&quot; to track government fees.</div>
            )}
          </div>
        )}

        {/* ──── WPS Tab ──── */}
        {activeTab === "wps" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Wage Protection System</h3>
            <p className="text-sm text-gray-500 mb-4">Upload monthly WPS/SIF files to track salary payments.</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#15305a]">
              <Upload className="h-4 w-4" /> Upload WPS File
              <input type="file" className="hidden" accept=".sif,.csv,.xlsx" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return
                const fd = new FormData(); fd.append("file", file); fd.append("name", `WPS ${new Date().toLocaleDateString("en-GB", {month:"short", year:"numeric"})}`); fd.append("companyId", companyId); fd.append("documentType", "wps")
                try { const res = await fetch("/api/documents/upload", { method: "POST", body: fd }); if (res.ok) { toast.success("WPS file uploaded"); const d = await fetchDocuments(companyId); setDocuments(d) } else toast.error("Upload failed") } catch { toast.error("Upload failed") }
                e.target.value = ""
              }} />
            </label>
            <div className="mt-6 space-y-2">
              {documents.filter((d: any) => d.document_type === "wps").length > 0 ? (
                documents.filter((d: any) => d.document_type === "wps").map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div><p className="text-sm font-medium">{doc.name}</p><p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString("en-GB")}</p></div>
                    {doc.file_url && <a href={`/api/documents/${doc.id}/download`} target="_blank" className="text-[#1a3a6b] hover:underline text-sm">Download</a>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No WPS files uploaded yet</p>
              )}
            </div>
          </div>
        )}

        {/* ──── Monthly Uploads Tab ──── */}
        {activeTab === "uploads" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No monthly uploads yet</h3>
              <p className="text-sm text-gray-500">Monthly report uploads (Employee List, WPS, Company Report, GDRFAD) will appear here once submitted.</p>
            </div>
          </div>
        )}

        {/* ──── Shareholders Tab ──── */}
        {activeTab === "shareholders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{shareholders.length} shareholder(s)</p>
              <button onClick={() => setShowShareholderForm(!showShareholderForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
                <Plus className="h-4 w-4" /> {showShareholderForm ? "Cancel" : "Add Shareholder"}
              </button>
            </div>

            {showShareholderForm && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Add Shareholder</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input type="text" value={shareholderForm.name} onChange={e => setShareholderForm({...shareholderForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input type="text" value={shareholderForm.nationality} onChange={e => setShareholderForm({...shareholderForm, nationality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. UAE" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Share % *</label>
                    <input type="number" value={shareholderForm.share_percentage} onChange={e => setShareholderForm({...shareholderForm, share_percentage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport #</label>
                    <input type="text" value={shareholderForm.passport_number} onChange={e => setShareholderForm({...shareholderForm, passport_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Passport number" />
                  </div>
                </div>
                <button onClick={async () => {
                  if (!shareholderForm.name || !shareholderForm.share_percentage) { toast.error("Name and share % required"); return }
                  try {
                    const newShareholder = { ...shareholderForm, share_percentage: Number(shareholderForm.share_percentage), id: Date.now().toString() }
                    const updatedShareholders = [...shareholders, newShareholder]
                    setShareholders(updatedShareholders)
                    let existingNotes: any = {}
                    try { existingNotes = company.notes ? JSON.parse(company.notes) : {} } catch {}
                    await fetch(`/api/data/companies/${companyId}`, {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ notes: JSON.stringify({ ...existingNotes, shareholders: updatedShareholders }) }),
                    })
                    toast.success("Shareholder added")
                    setShowShareholderForm(false)
                    setShareholderForm({ name: "", nationality: "", share_percentage: "", passport_number: "" })
                  } catch { toast.error("Failed to add shareholder") }
                }} className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
                  Save Shareholder
                </button>
              </div>
            )}

            {shareholders.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Nationality</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Share %</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Passport #</th>
                  </tr></thead>
                  <tbody>
                    {shareholders.map((sh: any) => (
                      <tr key={sh.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 font-medium">{sh.name}</td>
                        <td className="px-4 py-3 text-gray-500">{sh.nationality || "\u2014"}</td>
                        <td className="px-4 py-3 text-right font-semibold">{sh.share_percentage}%</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{sh.passport_number || "\u2014"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">{shareholders.reduce((s: number, sh: any) => s + Number(sh.share_percentage), 0)}%</td>
                    <td className="px-4 py-3" />
                  </tr></tfoot>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500">No shareholders added yet. Click &quot;Add Shareholder&quot; to get started.</div>
            )}
          </div>
        )}

        {/* ──── Edit Tab ──── */}
        {activeTab === "edit" && (
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <h3 className="font-semibold text-[#1a3a6b] mb-4">Edit Company Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "name", label: "Company Name *", type: "text" },
                { key: "trade_name", label: "Trade Name", type: "text" },
                { key: "license_number", label: "License Number", type: "text" },
                { key: "license_expiry", label: "License Expiry", type: "date" },
                { key: "license_type", label: "License Type", type: "select", options: ["Commercial", "Professional", "Industrial", "Tourism", "E-Commerce", "General Trading"] },
                { key: "legal_form", label: "Legal Form", type: "select", options: ["LLC", "FZE", "FZCO", "Branch", "Sole Establishment", "Civil Company"] },
                { key: "emirate", label: "Emirate", type: "select", options: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"] },
                { key: "phone", label: "Phone", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "address", label: "Address", type: "text" },
                { key: "industry", label: "Industry", type: "text" },
                { key: "visa_quota_total", label: "Visa Quota", type: "number" },
                { key: "mohre_company_number", label: "MOHRE Company Number", type: "text" },
                { key: "establishment_card_number", label: "Establishment Card Number", type: "text" },
                { key: "immigration_file_number", label: "Immigration File Number (GDRFA)", type: "text" },
                { key: "computer_card_number", label: "Computer Card Number", type: "text" },
                { key: "chamber_commerce_number", label: "Chamber of Commerce Number", type: "text" },
                { key: "ejari_tawtheeq_number", label: "Ejari/Tawtheeq Number", type: "text" },
                { key: "vat_trn", label: "VAT TRN", type: "text" },
                { key: "sponsor_name", label: "Sponsor Name", type: "text" },
                { key: "created_by", label: "Client / Owner", type: "select-client" },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === "select" ? (
                    <select value={editData[field.key] || ""} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
                      <option value="">Select...</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === "select-client" ? (
                    <select value={editData[field.key] || ""} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
                      <option value="">No owner assigned</option>
                      {clients.map((c: any) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={editData[field.key] || ""} onChange={e => setEditData({ ...editData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20" />
                  )}
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editData.status || "active"} onChange={e => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20">
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setActiveTab("overview")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true)
                try {
                  const res = await fetch(`/api/data/companies/${companyId}`, {
                    method: "PATCH", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editData),
                  })
                  if (!res.ok) throw new Error("Save failed")
                  const updated = await fetchCompany(companyId)
                  setCompany(updated)
                  toast.success("Company updated successfully")
                  setActiveTab("overview")
                } catch { toast.error("Failed to save") }
                finally { setSaving(false) }
              }} className="px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
