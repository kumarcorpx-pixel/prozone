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
  const [requests, setRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.role === "admin"
  const apiPrefix = isAdmin ? "/api/data" : "/api/client"

  useEffect(() => {
    async function load() {
      try {
        const [companiesRes, employeesRes, documentsRes, requestsRes, notifsRes] = await Promise.all([
          fetch(`${apiPrefix}/companies`),
          fetch(`${apiPrefix}/employees`),
          fetch(`${apiPrefix}/documents`),
          fetch(`${apiPrefix}/requests`),
          fetch("/api/notifications"),
        ])
        if (companiesRes.ok) setCompanies(await companiesRes.json())
        if (employeesRes.ok) setEmployees(await employeesRes.json())
        if (documentsRes.ok) setDocuments(await documentsRes.json())
        if (requestsRes.ok) setRequests(await requestsRes.json())
        if (notifsRes.ok) {
          const d = await notifsRes.json()
          setNotifications((d.notifications || []).map((n: any) => ({
            id: n.id, title: n.title, message: n.message, type: n.type || "info",
            is_read: n.isRead ?? n.is_read ?? false, created_at: n.createdAt || n.created_at || "",
          })))
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load dashboard data. Please try again.")
      }
      setLoading(false)
    }
    load()
  }, [apiPrefix])

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
          className="mt-4 px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  const activeRequests = requests.filter(r => r.status !== "completed" && r.status !== "rejected")
  const company = companies[0] ?? null

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
          {company && <p className="text-sm text-gray-500 mt-0.5">{company.name}{company.emirate ? ` · ${company.emirate}` : ""}</p>}
        </div>
      </div>

      {/* Main Grid: Active Services + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Services — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Active Services Overview</h2>

          {activeRequests.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Empty state service cards */}
              {["Trade License Renewal", "Visa Processing", "Company Formation"].map((name, i) => (
                <div key={name} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6">
                  <h3 className="font-bold text-gray-400 text-base">{name}</h3>
                  <div className="mt-6">
                    <Link href="/dashboard/requests" className="block w-full text-center bg-[#1a3a6b] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15305a] transition-colors">
                      Start New Request
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRequests.slice(0, 4).map(req => {
                const progress = getProgress(req.status)
                return (
                  <div key={req.id} className="bg-white rounded-2xl border-2 border-[#1a3a6b]/20 p-6 hover:border-[#1a3a6b]/40 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-gray-900 text-base">{req.service_type}</h3>
                      <span className="text-sm font-semibold text-[#1a3a6b]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full transition-all ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{getStatusLabel(req.status)}</p>
                    <Link href={`/dashboard/requests/${req.id}`}
                      className="block w-full text-center bg-[#1a3a6b] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15305a] transition-colors">
                      View Details
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions + Recent Activity */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/requests"
                className="flex items-center gap-3 w-full px-4 py-3 bg-[#1a3a6b] text-white rounded-xl hover:bg-[#15305a] transition-colors">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Start New Service</span>
              </Link>
              <Link href="/dashboard/documents"
                className="flex items-center gap-3 w-full px-4 py-3 bg-[#1a3a6b] text-white rounded-xl hover:bg-[#15305a] transition-colors">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Upload className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Upload Document</span>
              </Link>
              <Link href="/consultation"
                className="flex items-center gap-3 w-full px-4 py-3 bg-[#1a3a6b] text-white rounded-xl hover:bg-[#15305a] transition-colors">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Book Consultation</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            {recentNotifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">Updates will appear here when your services progress</p>
              </div>
            ) : (
              <div className="space-y-4">
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
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Company Info + Compliance */}
      {company && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Company</h2>
              <Link href="/dashboard/company" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-[#1a3a6b]" />
                  <span className="text-xs text-gray-500">Company</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{company.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-500">Employees</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{employees.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-gray-500">Documents</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{documents.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-gray-500">Active Requests</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{activeRequests.length}</p>
              </div>
            </div>
          </div>

          {/* Contact PRO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Your PRO</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">Y</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">YABS PRO Team</p>
                <p className="text-sm text-gray-500">Public Relations Management LLC</p>
                <a href="tel:+971565204844" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" /> +971 56 520 4844
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/messages" className="flex-1 text-center bg-[#1a3a6b] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#15305a] transition-colors">
                Send Message
              </Link>
              <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
