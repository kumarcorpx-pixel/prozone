"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  demoCompanies,
  demoEmployees,
  companyDocuments,
  documentCategories,
  statusColors,
  demoWPSData,
  demoMonthlyUploads,
  demoPersonExpiry,
} from "@/lib/company-data"
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
  Check,
  X,
  ChevronDown,
  ChevronRight,
  DollarSign,
  ClipboardCheck,
} from "lucide-react"
import Link from "next/link"

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
  { id: "fees", label: "Fees", icon: DollarSign },
  { id: "wps", label: "WPS", icon: Shield },
  { id: "uploads", label: "Monthly Uploads", icon: Upload },
  { id: "shareholders", label: "Shareholders", icon: UserCheck },
]

const demoFees = [
  { id: "fee-1", service: "New Employment Visa", fee_type: "MOHRE Work Permit", amount: 2310, status: "paid", date: "2025-03-13" },
  { id: "fee-2", service: "New Employment Visa", fee_type: "GDRFA Entry Permit", amount: 1170, status: "paid", date: "2025-03-16" },
  { id: "fee-3", service: "New Employment Visa", fee_type: "Medical Fitness Test", amount: 320, status: "pending", date: null },
  { id: "fee-4", service: "New Employment Visa", fee_type: "Emirates ID Typing", amount: 370, status: "pending", date: null },
  { id: "fee-5", service: "Trade License Renewal", fee_type: "DED Renewal Fee", amount: 3500, status: "paid", date: "2025-02-28" },
  { id: "fee-6", service: "Ejari Registration", fee_type: "Ejari Typing Fee", amount: 220, status: "paid", date: "2025-01-15" },
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

  const company = demoCompanies.find((c) => c.id === companyId)
  const employees = demoEmployees.filter((e) => e.company_id === companyId)
  const documents = companyDocuments.filter((d) => d.company_id === companyId)
  const wpsData = demoWPSData[companyId]
  const monthlyUploads = demoMonthlyUploads[companyId]
  const personExpiry = demoPersonExpiry[companyId]

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

  const extendedCompany = {
    ...company,
    establishment_card_number: "2/1/1052492",
    establishment_card_expiry: "2026-08-21",
    immigration_file_number: "601/2023/1222123",
    computer_card_number: "CC-2023-789012",
    mohre_company_number: "49301980",
    chamber_commerce_number: "CHM-2023-456789",
    chamber_commerce_expiry: "2026-12-31",
    ejari_tawtheeq_number: "0120250181000",
    ejari_tawtheeq_type: "ejari" as const,
    ejari_tawtheeq_expiry: "2026-08-17",
    lease_expiry: "2026-08-17",
    vat_trn: "100234567890003",
    corporate_tax_number: "CT-2024-123456",
    sponsor_name: "Ahmed Al Mansoori",
    sponsor_eid: "784-1989-4259296-9",
    local_service_agent: null as string | null,
    poa_status: "active",
    visa_quota_total: 6,
    visa_quota_used: 4,
    free_zone_authority: null as string | null,
  }

  const ec = extendedCompany

  const companyDocs = documents.filter((d) => !d.employee_id)
  const employeeDocs = documents.filter((d) => d.employee_id)
  const employeeDocGroups: Record<string, typeof documents> = {}
  employeeDocs.forEach((doc) => {
    const emp = employees.find((e) => e.id === doc.employee_id)
    const name = emp ? emp.full_name : "Unknown Employee"
    if (!employeeDocGroups[name]) employeeDocGroups[name] = []
    employeeDocGroups[name].push(doc)
  })

  const feesTotal = demoFees.reduce((sum, f) => sum + f.amount, 0)

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
                  {company.activities.map((activity, i) => (
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
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
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
                      // Placeholder demo logic for extra columns
                      const medicalOk = emp.status === "active" && emp.visa_status !== "processing"
                      const insured = emp.status === "active" && emp.full_name !== "Ravi Patel"
                      const wpsOk = emp.status === "active" && emp.visa_status === "valid"
                      return (
                        <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{emp.full_name}</td>
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
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
                <Plus className="h-4 w-4" />
                Upload Document
              </button>
            </div>

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
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className={`text-sm ${getExpiryColor(doc.expiry_date)}`}>{formatDate(doc.expiry_date)}</span>
                          <StatusBadge status={doc.status} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No company-level documents</p>
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
          <ComplianceScore company={extendedCompany} employees={employees} documents={documents} />
        )}

        {/* ──── Fees Tab ──── */}
        {activeTab === "fees" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{demoFees.length} fee record(s)</p>
            </div>
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Service</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Fee Type</th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">Amount (AED)</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoFees.map((fee) => (
                      <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{fee.service}</td>
                        <td className="px-4 py-3 text-gray-600">{fee.fee_type}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 font-mono">{fee.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${feeStatusColors[fee.status] || "bg-gray-100 text-gray-600"}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{fee.date ? formatDate(fee.date) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={2} className="px-4 py-3 font-semibold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-[#1a3a6b] font-mono">{feesTotal.toLocaleString()}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──── WPS Tab ──── */}
        {activeTab === "wps" && (
          <div className="space-y-6">
            {wpsData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-sm text-gray-500">Total Employees</p>
                    <p className="text-2xl font-bold text-[#1a3a6b] mt-1">{wpsData.total_employees}</p>
                  </div>
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-sm text-gray-500">WPS Covered</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{wpsData.wps_covered}</p>
                  </div>
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-sm text-gray-500">Not Covered</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{wpsData.not_covered}</p>
                  </div>
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-sm text-gray-500">Compliance</p>
                    <p className="text-2xl font-bold text-[#1a3a6b] mt-1">{wpsData.compliance_percentage}%</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${wpsData.compliance_percentage >= 80 ? "bg-green-500" : wpsData.compliance_percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${wpsData.compliance_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                  <h3 className="font-semibold text-[#1a3a6b] mb-4">Salary Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Monthly</p>
                      <p className="text-lg font-bold text-gray-900">AED {wpsData.total_monthly_salary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paid</p>
                      <p className="text-lg font-bold text-green-600">AED {wpsData.salary_paid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-lg font-bold text-yellow-600">AED {wpsData.salary_pending.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average</p>
                      <p className="text-lg font-bold text-gray-700">AED {wpsData.average_salary.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Employee Breakdown */}
                <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                  <h3 className="font-semibold text-[#1a3a6b] mb-4">Employee Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Male</p>
                      <p className="text-xl font-bold text-[#1a3a6b]">{wpsData.male_employees}</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Female</p>
                      <p className="text-xl font-bold text-pink-700">{wpsData.female_employees}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Skilled</p>
                      <p className="text-xl font-bold text-green-700">{wpsData.skilled_workers}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">Unskilled</p>
                      <p className="text-xl font-bold text-orange-700">{wpsData.unskilled_workers}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
                <Shield className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No WPS data available for this company.</p>
              </div>
            )}
          </div>
        )}

        {/* ──── Monthly Uploads Tab ──── */}
        {activeTab === "uploads" && (
          <div className="space-y-4">
            {monthlyUploads ? (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">Month</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">Employee List</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">WPS Report</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">Company Report</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">GDRFAD Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyUploads.map((upload) => (
                        <tr key={upload.month} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{upload.month} {upload.year}</td>
                          <td className="px-4 py-3 text-center">
                            {upload.employee_list ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {upload.wps_report ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {upload.company_report ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {upload.gdrfad_report ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No monthly upload records for this company.</p>
              </div>
            )}
          </div>
        )}

        {/* ──── Shareholders Tab ──── */}
        {activeTab === "shareholders" && (
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
            <UserCheck className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No shareholders added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Shareholder information will appear here once added.</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
              <Plus className="h-4 w-4" />
              Add Shareholder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
