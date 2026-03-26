"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchCompanies, fetchEmployees } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Building2, Users, FileText, Shield, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

function getExpiryInfo(date: string | null) {
  if (!date) return { label: "N/A", color: "text-gray-400", days: null }
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: "text-red-600", days }
  if (days <= 30) return { label: `${days}d left`, color: "text-red-600", days }
  if (days <= 60) return { label: `${days}d left`, color: "text-yellow-600", days }
  return { label: `${days}d left`, color: "text-green-600", days }
}

export default function CompanyPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, e] = await Promise.all([
        fetchCompanies(),
        fetchEmployees(),
      ])
      setCompanies(c)
      setAllEmployees(e)
      const myCompanies = c.filter((co: any) => co.id === user?.company_id || co.id === "comp-002")
      if (myCompanies.length > 0) setSelectedId(myCompanies[0].id)
      setLoading(false)
    }
    load()
  }, [user?.company_id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  const myCompanies = companies.filter(c => c.id === user?.company_id || c.id === "comp-002")
  const company = myCompanies.find(c => c.id === selectedId) || myCompanies[0]
  const employees = allEmployees.filter(e => e.company_id === selectedId)
  const licenseExpiry = getExpiryInfo(company?.license_expiry)

  const complianceItems = [
    { label: "Trade License", ok: licenseExpiry.days !== null && licenseExpiry.days > 0 },
    { label: "Employee Visas", ok: employees.filter(e => e.visa_status === "valid").length === employees.length },
    { label: "Emirates IDs", ok: employees.filter(e => e.emirates_id_expiry && new Date(e.emirates_id_expiry) > new Date()).length === employees.length },
    { label: "Labor Cards", ok: employees.filter(e => e.labor_card_expiry && new Date(e.labor_card_expiry) > new Date()).length === employees.length },
  ]
  const complianceScore = Math.round((complianceItems.filter(i => i.ok).length / complianceItems.length) * 100)

  if (!company) return <div className="p-12 text-center text-gray-500">No company linked to your account.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Company</h1>
        <p className="text-sm text-gray-500 mt-1">View your company details and compliance status</p>
      </div>

      {myCompanies.length > 1 && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {myCompanies.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className={`px-4 py-2 rounded-md text-sm font-medium ${selectedId === c.id ? "bg-white text-[#1a3a6b] shadow-sm" : "text-gray-600"}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* License & Registration */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Building2 className="h-5 w-5" /> License & Registration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Company Name", value: company.name },
                { label: "License #", value: company.license_number || "N/A" },
                { label: "License Expiry", value: company.license_expiry ? `${new Date(company.license_expiry).toLocaleDateString("en-GB")}` : "N/A", extra: licenseExpiry.label, extraColor: licenseExpiry.color },
                { label: "Emirate", value: company.emirate || "N/A" },
                { label: "License Type", value: company.license_type || "Mainland" },
                { label: "Legal Form", value: company.legal_form || "LLC" },
                { label: "Status", value: company.status },
                { label: "Industry", value: company.industry || "N/A" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                  <p className="font-medium text-gray-900 mt-0.5">{item.value}
                    {"extra" in item && item.extra && <span className={`ml-2 text-xs ${item.extraColor}`}>({item.extra})</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Employees */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Users className="h-5 w-5" /> Employees ({employees.length})</h3>
            {employees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No employees found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50">
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Name</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium hidden sm:table-cell">Designation</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium">Visa</th>
                    <th className="text-left px-3 py-2 text-gray-500 font-medium hidden md:table-cell">Visa Expiry</th>
                  </tr></thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-gray-50">
                        <td className="px-3 py-2 font-medium">{emp.full_name}</td>
                        <td className="px-3 py-2 text-gray-500 hidden sm:table-cell">{emp.designation || "N/A"}</td>
                        <td className="px-3 py-2"><StatusBadge status={emp.visa_status || "processing"} /></td>
                        <td className="px-3 py-2 text-gray-500 hidden md:table-cell">
                          {emp.visa_expiry ? (
                            <span className={getExpiryInfo(emp.visa_expiry).color}>{new Date(emp.visa_expiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}</span>
                          ) : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Scorecard */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Shield className="h-5 w-5" /> Compliance</h3>
            <div className="text-center mb-4">
              <div className={`text-4xl font-bold ${complianceScore >= 75 ? "text-green-600" : complianceScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>{complianceScore}%</div>
              <p className="text-xs text-gray-500 mt-1">Overall Compliance</p>
            </div>
            <div className="space-y-3">
              {complianceItems.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  {item.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {company.visa_quota_total && (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <h3 className="font-semibold text-[#1a3a6b] mb-3">Visa Quota</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>Used</span>
                <span className="font-medium">{company.visa_quota_used || employees.length}/{company.visa_quota_total}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-[#1a3a6b] rounded-full" style={{ width: `${((company.visa_quota_used || employees.length) / company.visa_quota_total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
