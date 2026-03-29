"use client"

import { useState, useEffect } from "react"
// Staff sees only companies from their assigned requests
import { Building2, MapPin, FileText, Users, Calendar, ChevronDown, ChevronUp } from "lucide-react"

function getExpiryColor(date: string | null) {
  if (!date) return "text-gray-400"
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return "text-red-600"
  if (days <= 30) return "text-yellow-600"
  return "text-green-600"
}

export default function StaffCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Fetch staff's assigned requests to get their companies
      const reqRes = await fetch("/api/staff/requests")
      const reqData = reqRes.ok ? await reqRes.json() : { requests: [] }
      const requests = reqData.requests || []
      // Extract unique companies from assigned requests
      const companyMap = new Map()
      for (const r of requests) {
        const cid = r.company_id || r.companyId
        if (cid && !companyMap.has(cid)) {
          companyMap.set(cid, {
            id: cid,
            name: r.company_name || r.companyName || r.company?.name || "Unknown",
            ...r.company,
          })
        }
      }
      // Fetch full company details for each
      const companyDetails = []
      for (const [id] of companyMap) {
        try {
          const cRes = await fetch(`/api/data/companies/${id}`)
          if (cRes.ok) companyDetails.push(await cRes.json())
        } catch {}
      }
      setCompanies(companyDetails.length > 0 ? companyDetails : Array.from(companyMap.values()))
      try {
        const empRes = await fetch("/api/data/employees")
        if (empRes.ok) {
          const empData = await empRes.json()
          setEmployees(empData.employees || empData || [])
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Companies</h1>
        <p className="text-sm text-gray-500 mt-1">Companies linked to your assigned requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(company => {
          const empCount = employees.filter(e => e.company_id === company.id).length
          const isExpanded = expandedId === company.id
          const companyEmps = employees.filter(e => e.company_id === company.id)
          return (
            <div key={company.id} className="bg-white rounded-xl ring-1 ring-gray-200">
              <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : company.id)}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{company.name}</h3>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{company.emirate}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.license_type === "freezone" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {company.license_type || "Mainland"}
                      </span>
                      {company.status && company.status !== "active" && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 capitalize">{company.status}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <FileText className="h-3 w-3" /> License
                    </div>
                    <p className="text-xs font-mono mt-0.5">{company.license_number || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" /> Expiry
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${getExpiryColor(company.license_expiry)}`}>
                      {company.license_expiry ? new Date(company.license_expiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" /> Staff
                    </div>
                    <p className="text-xs font-medium mt-0.5">{empCount}</p>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {company.trade_name && <div><span className="text-gray-500 text-xs">Trade Name</span><p className="font-medium text-gray-900">{company.trade_name}</p></div>}
                    {company.establishment_date && <div><span className="text-gray-500 text-xs">Established</span><p className="font-medium text-gray-900">{new Date(company.establishment_date).toLocaleDateString("en-GB")}</p></div>}
                    {company.phone && <div><span className="text-gray-500 text-xs">Phone</span><p className="font-medium text-gray-900">{company.phone}</p></div>}
                    {company.email && <div><span className="text-gray-500 text-xs">Email</span><p className="font-medium text-gray-900">{company.email}</p></div>}
                  </div>
                  {companyEmps.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Employees ({companyEmps.length})</p>
                      <div className="space-y-1">
                        {companyEmps.slice(0, 5).map((emp: any) => (
                          <div key={emp.id} className="flex items-center justify-between text-sm py-1">
                            <span className="text-gray-900">{emp.full_name || emp.name}</span>
                            <span className="text-xs text-gray-400">{emp.position || emp.role || ""}</span>
                          </div>
                        ))}
                        {companyEmps.length > 5 && <p className="text-xs text-gray-400">+{companyEmps.length - 5} more</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
