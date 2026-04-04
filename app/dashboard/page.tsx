"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { StatusBadge } from "@/components/dashboard/status-badge"
import Link from "next/link"
import {
  FileText, CheckCircle2, FolderOpen, CreditCard, Bell, Info,
  AlertTriangle, AlertCircle, Users, Building2, ArrowRight, Calendar,
  Clock, Shield, XCircle, HelpCircle, MessageSquare, Phone, Settings,
  Plus, Upload, Video, Eye, Briefcase
} from "lucide-react"

function getProgressColor(percent: number) {
  if (percent >= 75) return "bg-[#D4A843]"
  if (percent >= 50) return "bg-[#1a3a6b]"
  if (percent >= 25) return "bg-amber-500"
  return "bg-gray-300"
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending": return "Pending Review"
    case "assigned": return "Assigned to PRO"
    case "in_progress": return "Processing Application"
    case "completed": return "Completed"
    case "on_hold": return "On Hold"
    default: return status?.replace(/_/g, " ") || "Pending"
  }
}

function getProgress(status: string) {
  switch (status) {
    case "pending": return 15
    case "assigned": return 30
    case "in_progress": return 60
    case "on_hold": return 50
    case "completed": return 100
    default: return 10
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsCount, setDocumentsCount] = useState(0)
  const [requests, setRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.role === "admin"
  const apiPrefix = isAdmin ? "/api/data" : "/api/client"

  useEffect(() => {
    async function load() {
      try {
        if (isAdmin) {
          // Admin: use individual endpoints
          const [companiesRes, employeesRes, documentsRes, requestsRes, notifsRes] = await Promise.all([
            fetch(`${apiPrefix}/companies`),
            fetch(`${apiPrefix}/employees`),
            fetch(`${apiPrefix}/documents`),
            fetch(`${apiPrefix}/requests`),
            fetch("/api/notifications"),
          ])
          if (companiesRes.ok) setCompanies(await companiesRes.json())
          if (employeesRes.ok) setEmployees(await employeesRes.json())
          if (documentsRes.ok) { const docs = await documentsRes.json(); const arr = Array.isArray(docs) ? docs : []; setDocuments(arr); setDocumentsCount(arr.length) }
          if (requestsRes.ok) setRequests(await requestsRes.json())
          if (notifsRes.ok) {
            const d = await notifsRes.json()
            setNotifications((d.notifications || []).map((n: any) => ({
              id: n.id, title: n.title, message: n.message, type: n.type || "info",
              is_read: n.isRead ?? n.is_read ?? false, created_at: n.createdAt || n.created_at || "",
            })))
          }
        } else {
          // Client: use aggregated dashboard endpoint + requests list + notifications
          const [dashRes, requestsRes, notifsRes, employeesRes, docsRes] = await Promise.all([
            fetch("/api/client/dashboard"),
            fetch("/api/client/requests"),
            fetch("/api/notifications"),
            fetch("/api/client/employees"),
            fetch("/api/client/documents"),
          ])
          if (dashRes.ok) {
            const dash = await dashRes.json()
            setCompanies(dash.companies || [])
            setDocumentsCount(dash.documents || 0)
          }
          if (requestsRes.ok) setRequests(await requestsRes.json())
          if (employeesRes.ok) setEmployees(await employeesRes.json())
          if (docsRes.ok) { const docs = await docsRes.json(); setDocuments(Array.isArray(docs) ? docs : []) }
          if (notifsRes.ok) {
            const d = await notifsRes.json()
            setNotifications((d.notifications || []).map((n: any) => ({
              id: n.id, title: n.title, message: n.message, type: n.type || "info",
              is_read: n.isRead ?? n.is_read ?? false, created_at: n.createdAt || n.created_at || "",
            })))
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data. Please try again.")
      }
      setLoading(false)
    }
    load()
  }, [apiPrefix, isAdmin])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-900">Something went wrong</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); window.location.reload() }}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  const activeRequests = requests.filter(r => r.status !== "completed" && r.status !== "rejected")
  const company = companies[0] ?? null

  // Welcome wizard for new clients with no companies and no requests
  if (!isAdmin && companies.length === 0 && requests.length === 0) {
    return (
      <div className="space-y-6 page-entrance">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to CorporatePRO, {user?.full_name}!</h1>
          <p className="text-sm text-gray-500 mt-1">Let's get you started in just a few steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Set up company */}
          <div className="bg-white rounded-2xl border-2 border-[#1a3a6b]/20 p-8 hover:border-[#1a3a6b]/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center">
                <span className="text-white text-lg font-bold">1</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Set Up Your Company</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Add your company details so we can manage your PRO services, licenses, and government transactions.
            </p>
            <Link
              href="/dashboard/company"
              className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Building2 className="h-4 w-4" />
              Add Company
            </Link>
          </div>

          {/* Step 2: Submit first request */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg font-bold">2</span>
              </div>
              <h2 className="text-lg font-bold text-gray-400">Submit Your First Request</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Need a PRO service? Submit your first request for visa processing, trade license renewal, or company formation.
            </p>
            <Link
              href="/dashboard/requests"
              className="inline-flex items-center gap-2 w-full justify-center bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Start New Request
            </Link>
          </div>
        </div>

        {/* Contact PRO card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help Getting Started?</h2>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">Y</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">YABS PRO Team</p>
              <p className="text-sm text-gray-500">Our team is here to help you set everything up.</p>
              <a href="tel:+971565204844" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" /> +971 56 520 4844
              </a>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Link href="/dashboard/messages" className="flex-1 text-center bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5">
              Send Message
            </Link>
            <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  // --- Portfolio helpers (client only) ---
  const totalEmployees = employees.length
  const totalDocuments = isAdmin ? documentsCount : (documents.length || documentsCount)

  function getCompanyEmployeeCount(companyId: string) {
    return employees.filter((e: any) => e.company_id === companyId).length
  }

  function getCompanyDocCount(companyId: string) {
    return documents.filter((d: any) => d.company_id === companyId).length
  }

  function getLicenseExpiryInfo(expiryDate: string | null | undefined) {
    if (!expiryDate) return { label: "Not set", color: "text-gray-400", bg: "bg-gray-100" }
    const now = new Date()
    const expiry = new Date(expiryDate)
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return { label: `Expired ${Math.abs(daysLeft)}d ago`, color: "text-red-700", bg: "bg-red-50" }
    if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: "text-amber-700", bg: "bg-amber-50" }
    return { label: `${daysLeft}d left`, color: "text-green-700", bg: "bg-green-50" }
  }

  function getCompanyCompliance(company: any) {
    // Compliance based on how many key expiry dates are populated
    const fields = [
      company.licenseExpiry || company.license_expiry,
      company.establishmentCardExpiry || company.establishment_card_expiry,
      company.chamberCommerceExpiry || company.chamber_commerce_expiry,
      company.ejariTawtheeqExpiry || company.ejari_tawtheeq_expiry,
      company.leaseExpiry || company.lease_expiry,
    ]
    const set = fields.filter(Boolean).length
    return Math.round((set / fields.length) * 100)
  }

  function getLicenseTypeBadge(licenseType: string | null | undefined) {
    const lt = (licenseType || "").toLowerCase()
    if (lt.includes("free") || lt.includes("zone")) return { label: "Free Zone", bg: "bg-blue-50", text: "text-blue-700" }
    if (lt.includes("mainland") || lt.includes("llc") || lt.includes("local")) return { label: "Mainland", bg: "bg-emerald-50", text: "text-emerald-700" }
    if (lt.includes("offshore")) return { label: "Offshore", bg: "bg-purple-50", text: "text-purple-700" }
    return { label: licenseType || "N/A", bg: "bg-gray-50", text: "text-gray-600" }
  }

  // --- Admin dashboard (unchanged) ---
  if (isAdmin) {
    return (
      <div className="space-y-6 page-entrance">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1"><Building2 className="h-4 w-4 text-[#1a3a6b]" /><span className="text-xs text-gray-500">Companies</span></div>
            <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-green-600" /><span className="text-xs text-gray-500">Employees</span></div>
            <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1"><FolderOpen className="h-4 w-4 text-purple-600" /><span className="text-xs text-gray-500">Documents</span></div>
            <p className="text-2xl font-bold text-gray-900">{documentsCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1"><Briefcase className="h-4 w-4 text-amber-600" /><span className="text-xs text-gray-500">Active Requests</span></div>
            <p className="text-2xl font-bold text-gray-900">{activeRequests.length}</p>
          </div>
        </div>

        {activeRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Active Requests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRequests.slice(0, 6).map(req => {
                const progress = getProgress(req.status)
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{req.service_type}</h3>
                        {req.company_name && <p className="text-xs text-gray-500 mt-0.5">{req.company_name}</p>}
                      </div>
                      <span className="text-xs font-semibold text-[#1a3a6b]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                      <div className={`h-1.5 rounded-full transition-all ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{getStatusLabel(req.status)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- Client Portfolio Dashboard ---
  return (
    <div className="space-y-6 page-entrance">

      {/* Row 1: Welcome Banner */}
      <div className="rounded-2xl p-6 md:p-8" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #15305a 60%, #0f2440 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back, {user?.full_name}</h1>
            <p className="text-sm text-white/70 mt-1">
              Managing {companies.length} {companies.length === 1 ? "company" : "companies"} &middot; {totalEmployees} {totalEmployees === 1 ? "employee" : "employees"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Companies", value: companies.length, icon: Building2 },
              { label: "Employees", value: totalEmployees, icon: Users },
              { label: "Documents", value: totalDocuments, icon: FolderOpen },
              { label: "Active Requests", value: activeRequests.length, icon: Briefcase },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 min-w-[120px]">
                <stat.icon className="h-4 w-4 text-[#D4A843]" />
                <div>
                  <p className="text-lg font-bold text-white leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: My Companies Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">My Companies</h2>
          <Link href="/dashboard/company" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((co: any) => {
            const empCount = getCompanyEmployeeCount(co.id)
            const docCount = getCompanyDocCount(co.id)
            const licenseExpiry = co.licenseExpiry || co.license_expiry
            const expiryInfo = getLicenseExpiryInfo(licenseExpiry)
            const licenseType = co.licenseType || co.license_type
            const badge = getLicenseTypeBadge(licenseType)
            const compliance = getCompanyCompliance(co)
            const emirate = co.emirate || "UAE"

            return (
              <div key={co.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#1a3a6b]/30 hover:shadow-sm transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-bold text-gray-900 text-base truncate" title={co.name}>{co.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{emirate}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Employees</p>
                    <p className="text-sm font-bold text-gray-900">{empCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">Documents</p>
                    <p className="text-sm font-bold text-gray-900">{docCount}</p>
                  </div>
                </div>

                {/* License expiry */}
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-3 ${expiryInfo.bg}`}>
                  <Calendar className={`h-3.5 w-3.5 ${expiryInfo.color}`} />
                  <span className={`text-xs font-medium ${expiryInfo.color}`}>
                    License: {expiryInfo.label}
                  </span>
                </div>

                {/* Compliance bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500">Compliance</span>
                    <span className="text-[11px] font-semibold text-gray-700">{compliance}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${compliance >= 80 ? "bg-green-500" : compliance >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                      style={{ width: `${compliance}%` }}
                    />
                  </div>
                </div>

                {/* View Details */}
                <Link
                  href={`/dashboard/company?id=${co.id}`}
                  className="block w-full text-center bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
                >
                  View Details
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 3: Active Requests + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Requests — 2/3 */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Active Requests</h2>
          {activeRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">No active requests</p>
              <p className="text-xs text-gray-400 mb-4">Submit a new request to get started</p>
              <Link href="/dashboard/requests" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5">
                <Plus className="h-4 w-4" /> New Request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRequests.slice(0, 6).map(req => {
                const progress = getProgress(req.status)
                return (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1a3a6b]/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{req.service_type}</h3>
                          {req.priority === "urgent" && (
                            <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 uppercase">Urgent</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {req.company_name && (
                            <>
                              <Building2 className="h-3 w-3" />
                              <span className="truncate">{req.company_name}</span>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          <span>{getStatusLabel(req.status)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-semibold text-[#1a3a6b]">{progress}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div className={`h-1.5 rounded-full ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <Link href={`/dashboard/requests/${req.id}`} className="text-[#1a3a6b] hover:text-[#15305a] transition-colors">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
              {activeRequests.length > 6 && (
                <Link href="/dashboard/requests" className="block text-center text-sm text-[#1a3a6b] hover:underline py-2">
                  View all {activeRequests.length} requests
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions — 1/3 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/requests"
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5">
              <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm">New Request</span>
            </Link>
            <Link href="/dashboard/documents"
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl hover:border-[#1a3a6b]/30 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
                <Upload className="h-4 w-4 text-[#1a3a6b]" />
              </div>
              <span className="font-semibold text-sm">Upload Document</span>
            </Link>
            <Link href="/dashboard/messages"
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl hover:border-[#1a3a6b]/30 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-[#1a3a6b]" />
              </div>
              <span className="font-semibold text-sm">Messages</span>
            </Link>
            <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl hover:border-green-300 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-semibold text-sm">WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">Updates will appear here as your services progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentNotifications.map(n => {
                const iconColors: Record<string, string> = {
                  info: "bg-blue-100 text-blue-600",
                  success: "bg-green-100 text-green-600",
                  warning: "bg-amber-100 text-amber-600",
                  error: "bg-red-100 text-red-600",
                }
                const icons: Record<string, typeof Info> = {
                  info: FileText,
                  success: CheckCircle2,
                  warning: AlertTriangle,
                  error: AlertCircle,
                }
                const Icon = icons[n.type] || FileText
                return (
                  <div key={n.id} className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[n.type] || iconColors.info}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                      {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>}
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
