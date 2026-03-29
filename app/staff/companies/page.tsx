"use client"

import { useState, useEffect } from "react"
// Staff sees only companies from their assigned requests
import { Building2, MapPin, FileText, Users, Calendar } from "lucide-react"

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

  useEffect(() => {
    async function load() {
      // Fetch staff's assigned requests to get their companies
      const reqRes = await fetch("/api/staff/requests")
      const reqData = reqRes.ok ? await reqRes.json() : { requests: [] }
      const requests = reqData.requests || []
      // Extract unique companies from assigned requests
      const companyMap = new Map()
      for (const r of requests) {
        if (r.companyId && !companyMap.has(r.companyId)) {
          companyMap.set(r.companyId, {
            id: r.companyId,
            name: r.companyName || r.company?.name || "Unknown",
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
      setEmployees([])
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
        {companies.filter(c => c.status === "active").map(company => {
          const empCount = employees.filter(e => e.company_id === company.id).length
          return (
            <div key={company.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-[#1a3a6b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{company.emirate}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.license_type === "freezone" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {company.license_type || "Mainland"}
                    </span>
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
          )
        })}
      </div>
    </div>
  )
}
