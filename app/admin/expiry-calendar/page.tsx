"use client"

import { useState, useEffect } from "react"
import { fetchCompanies, fetchEmployees, fetchDocuments } from "@/lib/data-fetcher"
import { CalendarDays, AlertTriangle, Clock, CheckCircle, XCircle, Loader2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface ExpiryItem {
  id: string
  name: string
  type: string
  entity: string
  expiryDate: string
  daysLeft: number
}

function getDaysLeft(dateStr: string): number {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 9999
    return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  } catch {
    return 9999
  }
}

function getStatusColor(days: number) {
  if (days < 0) return "text-red-600 bg-red-50"
  if (days <= 30) return "text-orange-600 bg-orange-50"
  if (days <= 60) return "text-yellow-600 bg-yellow-50"
  return "text-green-600 bg-green-50"
}

function getStatusIcon(days: number) {
  if (days < 0) return XCircle
  if (days <= 30) return AlertTriangle
  if (days <= 60) return Clock
  return CheckCircle
}

export default function ExpiryCalendarPage() {
  const [items, setItems] = useState<ExpiryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncTotal, setSyncTotal] = useState(0)

  const handleSyncToCalendar = async () => {
    const itemsToSync = items.filter(i => i.daysLeft > 0 && i.daysLeft <= 90)
    if (itemsToSync.length === 0) {
      toast.info("No items expiring in the next 90 days to sync")
      return
    }
    setSyncing(true)
    setSyncTotal(itemsToSync.length)
    let synced = 0

    for (const item of itemsToSync) {
      try {
        await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `EXPIRY: ${item.name}`,
            description: `${item.type} - ${item.entity}\nExpires: ${item.expiryDate}`,
            start: { date: item.expiryDate },
            end: { date: item.expiryDate },
            reminders: { useDefault: false, overrides: [
              { method: "popup", minutes: 30 * 24 * 60 },
              { method: "popup", minutes: 14 * 24 * 60 },
              { method: "popup", minutes: 7 * 24 * 60 },
            ]},
          }),
        })
        synced++
      } catch {}
      setSyncProgress(synced)
    }

    setSyncing(false)
    toast.success(`Synced ${synced} expiry events to Google Calendar`)
  }

  useEffect(() => {
    async function load() {
      try {
        const [companies, employees, documents] = await Promise.all([
          fetchCompanies(),
          fetchEmployees(),
          fetchDocuments(),
        ])

        const collected: ExpiryItem[] = []

        // Company expiry fields
        const companyFields = [
          { key: "license_expiry", label: "Trade License" },
          { key: "establishment_card_expiry", label: "Establishment Card" },
          { key: "chamber_commerce_expiry", label: "Chamber of Commerce" },
          { key: "ejari_tawtheeq_expiry", label: "Ejari/Tawtheeq" },
          { key: "lease_expiry", label: "Office Lease" },
        ]
        for (const c of (companies || [])) {
          for (const f of companyFields) {
            const val = c[f.key]
            if (val) {
              const days = getDaysLeft(val)
              if (days < 9999) {
                collected.push({ id: `${f.key}-${c.id}`, name: f.label, type: "Company", entity: c.name, expiryDate: val, daysLeft: days })
              }
            }
          }
        }

        // Employee expiry fields
        const employeeFields = [
          { key: "visa_expiry", label: "Visa" },
          { key: "emirates_id_expiry", label: "Emirates ID" },
          { key: "passport_expiry", label: "Passport" },
          { key: "labor_card_expiry", label: "Labor Card" },
          { key: "work_permit_expiry", label: "Work Permit" },
          { key: "health_insurance_expiry", label: "Health Insurance" },
        ]
        for (const e of (employees || [])) {
          for (const f of employeeFields) {
            const val = e[f.key]
            if (val) {
              const days = getDaysLeft(val)
              if (days < 9999) {
                collected.push({ id: `${f.key}-${e.id}`, name: f.label, type: "Employee", entity: `${e.full_name || "Unknown"} (${e.company_name || ""})`, expiryDate: val, daysLeft: days })
              }
            }
          }
        }

        // Document expiry dates
        for (const d of (documents || [])) {
          const exp = d.expiry_date || d.expiryDate
          if (exp) {
            const days = getDaysLeft(exp)
            if (days < 9999) {
              collected.push({ id: `doc-${d.id}`, name: d.name || "Document", type: "Document", entity: d.company_name || d.employee_name || "", expiryDate: exp, daysLeft: days })
            }
          }
        }

        collected.sort((a, b) => a.daysLeft - b.daysLeft)
        setItems(collected)
      } catch (err) {
        console.error("Expiry calendar error:", err)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>
  }

  const expired = items.filter(i => i.daysLeft < 0)
  const expiring30 = items.filter(i => i.daysLeft >= 0 && i.daysLeft <= 30)
  const expiring60 = items.filter(i => i.daysLeft > 30 && i.daysLeft <= 60)
  const valid = items.filter(i => i.daysLeft > 60)

  const byStatus = filter === "all" ? items : filter === "expired" ? expired : filter === "30" ? expiring30 : filter === "60" ? expiring60 : valid
  const byType = typeFilter === "all" ? byStatus : byStatus.filter(i => i.type === typeFilter)
  const filtered = search ? byType.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.entity.toLowerCase().includes(search.toLowerCase())) : byType

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#1a3a6b]" />
            Expiry Calendar
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Track all expiring documents, visas, and licenses</p>
        </div>
        <button
          onClick={handleSyncToCalendar}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          {syncing ? `Syncing ${syncProgress}/${syncTotal}...` : "Sync to Calendar"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-red-50 rounded-xl px-3 py-2 ring-1 ring-red-200">
          <p className="text-xl font-bold text-red-600">{expired.length}</p>
          <p className="text-xs text-red-500">Expired</p>
        </div>
        <div className="bg-orange-50 rounded-xl px-3 py-2 ring-1 ring-orange-200">
          <p className="text-xl font-bold text-orange-600">{expiring30.length}</p>
          <p className="text-xs text-orange-500">Expiring 30d</p>
        </div>
        <div className="bg-yellow-50 rounded-xl px-3 py-2 ring-1 ring-yellow-200">
          <p className="text-xl font-bold text-yellow-600">{expiring60.length}</p>
          <p className="text-xs text-yellow-500">Expiring 60d</p>
        </div>
        <div className="bg-green-50 rounded-xl px-3 py-2 ring-1 ring-green-200">
          <p className="text-xl font-bold text-green-600">{valid.length}</p>
          <p className="text-xs text-green-500">Valid</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all", label: `All (${items.length})` },
          { id: "expired", label: `Expired (${expired.length})` },
          { id: "30", label: `30 Days (${expiring30.length})` },
          { id: "60", label: `60 Days (${expiring60.length})` },
          { id: "valid", label: `Valid (${valid.length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 text-xs font-medium rounded-full ${filter === f.id ? "bg-[#1a3a6b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Type filter + search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "Company", "Employee", "Document"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1 text-xs font-medium rounded-full ${typeFilter === t ? "bg-[#c9a96e] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or entity..."
          className="px-2.5 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 sm:ml-auto sm:w-60"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No expiry items found</p>
          <p className="text-xs text-gray-400 mt-1">Add expiry dates to your company licenses, employee visas, and documents</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
          {filtered.map(item => {
            const Icon = getStatusIcon(item.daysLeft)
            const color = getStatusColor(item.daysLeft)
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 truncate">{item.entity}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color} hidden sm:inline`}>{item.type}</span>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${item.daysLeft < 0 ? "text-red-600" : item.daysLeft <= 30 ? "text-orange-600" : "text-gray-700"}`}>
                    {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d ago` : `${item.daysLeft}d left`}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(item.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
