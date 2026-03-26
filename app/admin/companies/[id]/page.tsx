"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
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
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Calendar,
  UserCheck,
  ArrowLeft,
  Plus,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react"

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "employees", label: "Employees", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "wps", label: "WPS", icon: BarChart3 },
  { id: "uploads", label: "Monthly Uploads", icon: Calendar },
  { id: "shareholders", label: "Shareholders", icon: UserCheck },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A"
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "N/A"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function expiryColor(dateStr: string | null): string {
  if (!dateStr) return "text-gray-500"
  const now = new Date()
  const expiry = new Date(dateStr)
  if (expiry < now) return "text-red-600 font-medium"
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 30) return "text-yellow-600 font-medium"
  return "text-green-600"
}

function expiryBgColor(dateStr: string | null): string {
  if (!dateStr) return "bg-gray-50"
  const now = new Date()
  const expiry = new Date(dateStr)
  if (expiry < now) return "bg-red-50"
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 30) return "bg-yellow-50"
  return "bg-green-50"
}

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string
  const [activeTab, setActiveTab] = useState("overview")

  const company = demoCompanies.find((c) => c.id === companyId)

  if (!company) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Companies
        </Link>
        <div className="bg-white rounded-xl p-12 ring-1 ring-gray-200 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600">Company not found</h2>
          <p className="text-sm text-gray-400 mt-1">The company you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  const employees = demoEmployees.filter((e) => e.company_id === company.id)
  const docs = companyDocuments.filter((d) => d.company_id === company.id)
  const companyDocs = docs.filter((d) => !d.employee_id)
  const employeeDocs = docs.filter((d) => d.employee_id)
  const wpsData = demoWPSData[company.id]
  const monthlyUploads = demoMonthlyUploads[company.id]
  const personExpiry = demoPersonExpiry[company.id]

  const licenseExpiryColor = expiryColor(company.license_expiry)

  // Group employee docs by employee name
  const employeeDocsGrouped: Record<string, typeof docs> = {}
  employeeDocs.forEach((doc) => {
    const emp = demoEmployees.find((e) => e.id === doc.employee_id)
    const name = emp ? emp.full_name : "Unknown Employee"
    if (!employeeDocsGrouped[name]) employeeDocsGrouped[name] = []
    employeeDocsGrouped[name].push(doc)
  })

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-[#1a3a6b]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-gray-500 text-sm">{company.trade_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={company.status} />
              <span className="text-xs text-gray-400">{company.emirate}</span>
              {company.license_number && (
                <>
                  <span className="text-xs text-gray-400">-</span>
                  <span className="text-xs text-gray-400">{company.license_number}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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

      {/* Tab content */}
      <div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Company info grid */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Company Name</p>
                  <p className="text-sm font-medium mt-0.5">{company.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Trade Name</p>
                  <p className="text-sm font-medium mt-0.5">{company.trade_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">License Number</p>
                  <p className="text-sm font-medium mt-0.5">{company.license_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">License Type</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">{company.license_type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Legal Form</p>
                  <p className="text-sm font-medium mt-0.5">{company.legal_form || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Emirate</p>
                  <p className="text-sm font-medium mt-0.5">{company.emirate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Jurisdiction</p>
                  <p className="text-sm font-medium mt-0.5">{company.jurisdiction || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={company.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Industry</p>
                  <p className="text-sm font-medium mt-0.5">{company.industry || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">License Expiry</p>
                  <p className={`text-sm font-medium mt-0.5 ${licenseExpiryColor}`}>
                    {formatDate(company.license_expiry)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium mt-0.5">{company.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium mt-0.5">{company.email || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Activities */}
            {company.activities.length > 0 && (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-3">Licensed Activities</h2>
                <div className="flex flex-wrap gap-2">
                  {company.activities.map((activity, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {company.notes && (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                <p className="text-sm text-gray-600">{company.notes}</p>
              </div>
            )}

            {/* Person Expiry (Owner/Manager) */}
            {personExpiry && personExpiry.length > 0 && (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#1a3a6b]" />
                  Key Person Expiry Dates
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-wide font-medium">Role</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-wide font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-wide font-medium">Passport Expiry</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-wide font-medium">EID Expiry</th>
                        <th className="text-left py-2 px-3 text-xs text-gray-400 uppercase tracking-wide font-medium">Visa Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personExpiry.map((person, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              person.role === "owner" ? "bg-indigo-100 text-indigo-800" : "bg-teal-100 text-teal-800"
                            }`}>
                              {person.role === "owner" ? "Owner" : "Manager"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium">{person.name}</td>
                          <td className={`py-2.5 px-3 ${expiryColor(person.passport_expiry)}`}>
                            {formatDate(person.passport_expiry)}
                          </td>
                          <td className={`py-2.5 px-3 ${expiryColor(person.emirates_id_expiry)}`}>
                            {formatDate(person.emirates_id_expiry)}
                          </td>
                          <td className={`py-2.5 px-3 ${expiryColor(person.visa_expiry)}`}>
                            {formatDate(person.visa_expiry)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Employees ({employees.length})</h2>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a]">
                <Plus className="h-4 w-4" /> Add Employee
              </button>
            </div>

            {employees.length === 0 ? (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No employees added yet</h3>
                <p className="text-sm text-gray-400 mt-1">Add employees to track their visa and document status.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Designation</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Nationality</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Visa Status</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Visa Expiry</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">EID Expiry</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Passport Expiry</th>
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-medium">{emp.full_name}</td>
                          <td className="py-3 px-4 text-gray-600">{emp.designation || "N/A"}</td>
                          <td className="py-3 px-4 text-gray-600">{emp.nationality || "N/A"}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={emp.visa_status} />
                          </td>
                          <td className={`py-3 px-4 ${expiryColor(emp.visa_expiry)}`}>
                            {formatDate(emp.visa_expiry)}
                          </td>
                          <td className={`py-3 px-4 ${expiryColor(emp.emirates_id_expiry)}`}>
                            {formatDate(emp.emirates_id_expiry)}
                          </td>
                          <td className={`py-3 px-4 ${expiryColor(emp.passport_expiry)}`}>
                            {formatDate(emp.passport_expiry)}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={emp.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Documents ({docs.length})</h2>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a]">
                <Upload className="h-4 w-4" /> Upload Document
              </button>
            </div>

            {/* Company Documents */}
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h3 className="text-base font-semibold mb-4">Company Documents</h3>
              {companyDocs.length === 0 ? (
                <p className="text-sm text-gray-400">No company documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {companyDocs.map((doc) => {
                    const cat = documentCategories[doc.document_type] || documentCategories.other
                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${expiryBgColor(doc.expiry_date)} ring-1 ring-gray-100`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                                {cat.label}
                              </span>
                              <span className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {doc.expiry_date ? (
                            <p className={`text-sm ${expiryColor(doc.expiry_date)}`}>
                              {formatDate(doc.expiry_date)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">No expiry</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Employee Documents */}
            {Object.keys(employeeDocsGrouped).length > 0 && (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                <h3 className="text-base font-semibold mb-4">Employee Documents</h3>
                <div className="space-y-5">
                  {Object.entries(employeeDocsGrouped).map(([empName, empDocs]) => (
                    <div key={empName}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        {empName}
                      </h4>
                      <div className="space-y-2 ml-6">
                        {empDocs.map((doc) => {
                          const cat = documentCategories[doc.document_type] || documentCategories.other
                          return (
                            <div
                              key={doc.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${expiryBgColor(doc.expiry_date)} ring-1 ring-gray-100`}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
                                      {cat.label}
                                    </span>
                                    <span className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                {doc.expiry_date ? (
                                  <p className={`text-sm ${expiryColor(doc.expiry_date)}`}>
                                    {formatDate(doc.expiry_date)}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-400">No expiry</p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WPS Tab */}
        {activeTab === "wps" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">WPS Compliance</h2>

            {!wpsData ? (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No WPS data available</h3>
                <p className="text-sm text-gray-400 mt-1">WPS data will appear here once available.</p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Total Employees</p>
                    <p className="text-2xl font-bold mt-1">{wpsData.total_employees}</p>
                  </div>
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">WPS Covered</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">{wpsData.wps_covered}</p>
                  </div>
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Not Covered</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{wpsData.not_covered}</p>
                  </div>
                  <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Compliance</p>
                    <p className="text-2xl font-bold mt-1">{wpsData.compliance_percentage}%</p>
                  </div>
                </div>

                {/* Compliance progress bar */}
                <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                  <h3 className="text-base font-semibold mb-3">Compliance Rate</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        wpsData.compliance_percentage >= 90
                          ? "bg-green-500"
                          : wpsData.compliance_percentage >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${wpsData.compliance_percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {wpsData.compliance_percentage}% of employees covered by WPS - Last updated: {formatDate(wpsData.last_updated)}
                  </p>
                </div>

                {/* Salary breakdown */}
                <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                  <h3 className="text-base font-semibold mb-4">Salary Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 ring-1 ring-gray-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Total Monthly</p>
                      <p className="text-lg font-bold mt-0.5">AED {wpsData.total_monthly_salary.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 ring-1 ring-green-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Paid</p>
                      <p className="text-lg font-bold mt-0.5 text-green-700">AED {wpsData.salary_paid.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 ring-1 ring-red-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Pending</p>
                      <p className="text-lg font-bold mt-0.5 text-red-700">AED {wpsData.salary_pending.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 ring-1 ring-blue-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Average</p>
                      <p className="text-lg font-bold mt-0.5 text-blue-700">AED {wpsData.average_salary.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Employee breakdown */}
                <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
                  <h3 className="text-base font-semibold mb-4">Employee Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 ring-1 ring-blue-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Male</p>
                      <p className="text-lg font-bold mt-0.5">{wpsData.male_employees}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-pink-50 ring-1 ring-pink-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Female</p>
                      <p className="text-lg font-bold mt-0.5">{wpsData.female_employees}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Skilled</p>
                      <p className="text-lg font-bold mt-0.5">{wpsData.skilled_workers}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 ring-1 ring-orange-100">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Unskilled</p>
                      <p className="text-lg font-bold mt-0.5">{wpsData.unskilled_workers}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Monthly Uploads Tab */}
        {activeTab === "uploads" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Monthly Uploads - 2026</h2>

            {!monthlyUploads ? (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No upload data available</h3>
                <p className="text-sm text-gray-400 mt-1">Monthly upload records will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Month</th>
                        <th className="text-center py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Employee List</th>
                        <th className="text-center py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">WPS Report</th>
                        <th className="text-center py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">Company Report</th>
                        <th className="text-center py-3 px-4 text-xs text-gray-400 uppercase tracking-wide font-medium">GDRFAD Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyUploads.map((upload) => (
                        <tr key={upload.month} className="border-b border-gray-50 hover:bg-gray-50/30">
                          <td className="py-3 px-4 font-medium">{upload.month} {upload.year}</td>
                          <td className="py-3 px-4 text-center">
                            {upload.employee_list ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {upload.wps_report ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {upload.company_report ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {upload.gdrfad_report ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shareholders Tab */}
        {activeTab === "shareholders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shareholders</h2>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a]">
                <Plus className="h-4 w-4" /> Add Shareholder
              </button>
            </div>
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No shareholders added yet</h3>
              <p className="text-sm text-gray-400 mt-1">
                Add shareholders to track ownership and share distribution.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a]">
                <Plus className="h-4 w-4" /> Add Shareholder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
