"use client"

import { useState, useMemo, useEffect } from "react"
import { fetchCompanies, fetchEmployees, fetchDocuments } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isSameDay } from "date-fns"
import {
  CalendarDays,
  List,
  LayoutGrid,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface ExpiryItem {
  id: string
  name: string
  type: "License" | "Visa" | "EID" | "Passport" | "Labor Card" | "Document"
  entityName: string
  expiryDate: Date
  daysRemaining: number
  status: "expired" | "critical" | "warning" | "upcoming" | "valid"
}

function getExpiryStatus(days: number): ExpiryItem["status"] {
  if (days < 0) return "expired"
  if (days <= 30) return "critical"
  if (days <= 60) return "warning"
  if (days <= 90) return "upcoming"
  return "valid"
}

function getStatusColor(status: ExpiryItem["status"]): string {
  switch (status) {
    case "expired":
      return "text-red-600"
    case "critical":
      return "text-orange-600"
    case "warning":
      return "text-yellow-600"
    case "upcoming":
      return "text-blue-600"
    case "valid":
      return "text-green-600"
  }
}

function getStatusBg(status: ExpiryItem["status"]): string {
  switch (status) {
    case "expired":
      return "bg-red-100 text-red-800"
    case "critical":
      return "bg-orange-100 text-orange-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "upcoming":
      return "bg-blue-100 text-blue-800"
    case "valid":
      return "bg-green-100 text-green-800"
  }
}

function getTypeBadgeColor(type: ExpiryItem["type"]): string {
  switch (type) {
    case "License":
      return "bg-blue-100 text-blue-800"
    case "Visa":
      return "bg-purple-100 text-purple-800"
    case "EID":
      return "bg-teal-100 text-teal-800"
    case "Passport":
      return "bg-indigo-100 text-indigo-800"
    case "Labor Card":
      return "bg-orange-100 text-orange-800"
    case "Document":
      return "bg-gray-100 text-gray-800"
  }
}

function getDotColor(status: ExpiryItem["status"]): string {
  switch (status) {
    case "expired":
      return "bg-red-500"
    case "critical":
      return "bg-orange-500"
    case "warning":
      return "bg-yellow-500"
    case "upcoming":
      return "bg-blue-500"
    case "valid":
      return "bg-green-500"
  }
}

export default function ExpiryCalendarPage() {
  const [view, setView] = useState<"list" | "calendar">("list")
  const [typeFilter, setTypeFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, e, d] = await Promise.all([
        fetchCompanies(),
        fetchEmployees(),
        fetchDocuments(),
      ])
      setCompanies(c)
      setEmployees(e)
      setDocuments(d)
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()

  function getCompanyName(companyId: string): string {
    return companies.find((c) => c.id === companyId)?.name || "Unknown"
  }

  // Collect all expiry items
  const allItems = useMemo(() => {
    const items: ExpiryItem[] = []

    function safeDate(d: any): Date | null {
      if (!d) return null
      const date = new Date(d)
      return isNaN(date.getTime()) ? null : date
    }

    // Company license expiries
    companies.forEach((company: any) => {
      const expDate = safeDate(company.license_expiry)
      if (expDate) {
        const days = differenceInDays(expDate, now)
        items.push({
          id: `license-${company.id}`,
          name: `Trade License - ${company.name}`,
          type: "License",
          entityName: company.name,
          expiryDate: expDate,
          daysRemaining: days,
          status: getExpiryStatus(days),
        })
      }
    })

    // Employee visa, EID, passport, labor card expiries
    employees.forEach((emp: any) => {
      const companyName = getCompanyName(emp.company_id)
      const fields = [
        { key: "visa_expiry", type: "Visa" as const, prefix: "visa" },
        { key: "emirates_id_expiry", type: "EID" as const, prefix: "eid" },
        { key: "passport_expiry", type: "Passport" as const, prefix: "passport" },
        { key: "labor_card_expiry", type: "Labor Card" as const, prefix: "labor" },
      ]
      for (const f of fields) {
        const expDate = safeDate(emp[f.key])
        if (expDate) {
          const days = differenceInDays(expDate, now)
          items.push({
            id: `${f.prefix}-${emp.id}`,
            name: `${f.type} - ${emp.full_name}`,
            type: f.type,
            entityName: `${emp.full_name} (${companyName})`,
            expiryDate: expDate,
            daysRemaining: days,
            status: getExpiryStatus(days),
          })
        }
      }
    })

    // Document expiries
    documents.forEach((doc: any) => {
      const expDate = safeDate(doc.expiry_date || doc.expiryDate)
      if (expDate) {
        const days = differenceInDays(expDate, now)
        items.push({
          id: `doc-${doc.id}`,
          name: doc.name,
          type: "Document",
          entityName: getCompanyName(doc.company_id),
          expiryDate: expDate,
          daysRemaining: days,
          status: getExpiryStatus(days),
        })
      }
    })

    // Sort by urgency: expired first, then soonest expiry
    items.sort((a, b) => a.daysRemaining - b.daysRemaining)
    return items
  }, [companies, employees, documents])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  // Filtered items
  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false
      if (companyFilter !== "all" && !item.entityName.includes(getCompanyName(companyFilter)))
        return false
      if (statusFilter === "expired" && item.status !== "expired") return false
      if (statusFilter === "30d" && (item.daysRemaining < 0 || item.daysRemaining > 30))
        return false
      if (statusFilter === "60d" && (item.daysRemaining < 0 || item.daysRemaining > 60))
        return false
      if (statusFilter === "90d" && (item.daysRemaining < 0 || item.daysRemaining > 90))
        return false
      if (statusFilter === "valid" && item.status !== "valid") return false
      return true
    })
  }, [allItems, typeFilter, companyFilter, statusFilter])

  // Summary counts
  const expiredCount = allItems.filter((i) => i.status === "expired").length
  const critical30Count = allItems.filter((i) => i.status === "critical").length
  const warning60Count = allItems.filter((i) => i.status === "warning").length
  const validCount = allItems.filter((i) => i.status === "valid").length

  // Group by urgency for list view
  const groups = useMemo(() => {
    const g: Record<string, ExpiryItem[]> = {
      Expired: [],
      "Expiring in 30 Days": [],
      "Expiring in 60 Days": [],
      "Expiring in 90 Days": [],
      Valid: [],
    }
    filtered.forEach((item) => {
      if (item.daysRemaining < 0) g["Expired"].push(item)
      else if (item.daysRemaining <= 30) g["Expiring in 30 Days"].push(item)
      else if (item.daysRemaining <= 60) g["Expiring in 60 Days"].push(item)
      else if (item.daysRemaining <= 90) g["Expiring in 90 Days"].push(item)
      else g["Valid"].push(item)
    })
    return g
  }, [filtered])

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)

  const itemsByDate = useMemo(() => {
    const map: Record<string, ExpiryItem[]> = {}
    filtered.forEach((item) => {
      const key = format(item.expiryDate, "yyyy-MM-dd")
      if (!map[key]) map[key] = []
      map[key].push(item)
    })
    return map
  }, [filtered])

  const selectedDayItems = selectedDay
    ? filtered.filter((item) => isSameDay(item.expiryDate, selectedDay))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Expiry Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all license, visa, and document expirations
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-white text-[#1a3a6b] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "calendar"
                ? "bg-white text-[#1a3a6b] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Expired</p>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600">{expiredCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Expiring 30d</p>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-orange-600">{critical30Count}</p>
        </div>
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Expiring 60d</p>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{warning60Count}</p>
        </div>
        <div className="bg-white rounded-xl p-4 ring-1 ring-gray-200 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Valid</p>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">{validCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Types</option>
          <option value="License">License</option>
          <option value="Visa">Visa</option>
          <option value="EID">EID</option>
          <option value="Passport">Passport</option>
          <option value="Labor Card">Labor Card</option>
          <option value="Document">Document</option>
        </select>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Companies</option>
          {companies.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        >
          <option value="all">All Statuses</option>
          <option value="expired">Expired</option>
          <option value="30d">Within 30 Days</option>
          <option value="60d">Within 60 Days</option>
          <option value="90d">Within 90 Days</option>
          <option value="valid">Valid</option>
        </select>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupName, items]) => {
            if (items.length === 0) return null
            return (
              <div key={groupName}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {groupName} ({items.length})
                </h3>
                <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Item</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">
                            Company / Employee
                          </th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">
                            Expiry Date
                          </th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">
                            Days Remaining
                          </th>
                          <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}
                              >
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{item.entityName}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {format(item.expiryDate, "dd MMM yyyy")}
                            </td>
                            <td className={`py-3 px-4 font-medium ${getStatusColor(item.status)}`}>
                              {item.daysRemaining < 0
                                ? `${Math.abs(item.daysRemaining)}d overdue`
                                : `${item.daysRemaining}d left`}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBg(item.status)}`}
                              >
                                {item.status === "expired"
                                  ? "Expired"
                                  : item.status === "critical"
                                    ? "Critical"
                                    : item.status === "warning"
                                      ? "Warning"
                                      : item.status === "upcoming"
                                        ? "Upcoming"
                                        : "Valid"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl ring-1 ring-gray-200">
              <CalendarDays className="h-8 w-8 text-gray-300 mb-2" />
              No expiry items found matching your filters.
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="space-y-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between bg-white rounded-xl ring-1 ring-gray-200 p-4">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-[#1a3a6b]">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 p-4">
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month start */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 min-h-[80px]" />
              ))}

              {/* Day cells */}
              {daysInMonth.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd")
                const dayItems = itemsByDate[dateKey] || []
                const isSelected = selectedDay && isSameDay(day, selectedDay)
                const isToday = isSameDay(day, now)

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`p-2 min-h-[80px] rounded-lg text-left transition-colors ${
                      isSelected
                        ? "bg-[#1a3a6b]/10 ring-2 ring-[#1a3a6b]"
                        : isToday
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isToday ? "text-[#1a3a6b]" : "text-gray-700"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayItems.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {dayItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className={`h-2 w-2 rounded-full ${getDotColor(item.status)}`}
                            title={item.name}
                          />
                        ))}
                        {dayItems.length > 3 && (
                          <span className="text-[10px] text-gray-500">
                            +{dayItems.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day details */}
          {selectedDay && (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-4">
              <h3 className="font-semibold text-[#1a3a6b] mb-3">
                {format(selectedDay, "EEEE, dd MMMM yyyy")}
              </h3>
              {selectedDayItems.length === 0 ? (
                <p className="text-sm text-gray-500">No expiry items on this date.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.entityName}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}
                        >
                          {item.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg(item.status)}`}
                        >
                          {item.daysRemaining < 0
                            ? `${Math.abs(item.daysRemaining)}d overdue`
                            : `${item.daysRemaining}d left`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
