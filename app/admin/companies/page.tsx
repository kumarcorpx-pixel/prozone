"use client"

import { useState } from "react"
import { demoCompanies, demoEmployees } from "@/lib/company-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, Plus, Building2, MapPin, Calendar } from "lucide-react"
import Link from "next/link"

function getExpiryLabel(dateStr: string | null): { text: string; color: string } {
  if (!dateStr) return { text: "N/A", color: "text-gray-400" }
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-red-600" }
  if (diffDays <= 30) return { text: `${diffDays}d left`, color: "text-yellow-600" }
  return { text: new Date(dateStr).toLocaleDateString(), color: "text-green-600" }
}

export default function CompaniesPage() {
  const [search, setSearch] = useState("")

  const filtered = demoCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.emirate && c.emirate.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all companies and their documents</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company name, trade name, or emirate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((company) => {
          const employeeCount = demoEmployees.filter((e) => e.company_id === company.id).length
          const expiry = getExpiryLabel(company.license_expiry)

          return (
            <Link
              key={company.id}
              href={`/admin/companies/${company.id}`}
              className="block bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-[#1a3a6b]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{company.trade_name || company.name}</p>
                  </div>
                </div>
                <StatusBadge status={company.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {company.emirate || "N/A"}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${company.license_type === "freezone" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {company.license_type === "freezone" ? "Free Zone" : "Mainland"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">License #</span>
                  <span className="text-gray-700 font-mono text-xs">{company.license_number || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Expiry
                  </span>
                  <span className={`font-medium ${expiry.color}`}>{expiry.text}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Employees</span>
                  <span className="font-medium text-gray-900">{employeeCount}</span>
                </div>
              </div>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Building2 className="h-8 w-8 text-gray-300 mb-2" />
            No companies found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
