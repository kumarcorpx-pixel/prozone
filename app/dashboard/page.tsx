"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import Link from "next/link"
import {
  FileText, CheckCircle2, FolderOpen, CreditCard, Bell, Info,
  AlertTriangle, AlertCircle, Users, Building2, ArrowRight, Calendar,
  Search, Clock
} from "lucide-react"
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from "@/components/ui/motion"

const notificationIcons: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

const notificationColors: Record<string, string> = {
  info: "text-blue-500 bg-blue-50",
  success: "text-green-500 bg-green-50",
  warning: "text-yellow-500 bg-yellow-50",
  error: "text-red-500 bg-red-50",
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ companies: 0, employees: 0, documents: 0, activeRequests: 0 })
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === "admin"
  const apiPrefix = isAdmin ? "/api/data" : "/api/client"

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, companiesRes, employeesRes, documentsRes, requestsRes, notifsRes, invoicesRes] = await Promise.all([
          fetch(`${apiPrefix}/stats`),
          fetch(`${apiPrefix}/companies`),
          fetch(`${apiPrefix}/employees`),
          fetch(`${apiPrefix}/documents`),
          fetch(`${apiPrefix}/requests`),
          fetch("/api/notifications"),
          fetch("/api/invoices"),
        ])

        if (statsRes.ok) { const d = await statsRes.json(); setStats(d) }
        if (companiesRes.ok) { setCompanies(await companiesRes.json()) }
        if (employeesRes.ok) { setEmployees(await employeesRes.json()) }
        if (documentsRes.ok) { setDocuments(await documentsRes.json()) }
        if (requestsRes.ok) { setRequests(await requestsRes.json()) }
        if (notifsRes.ok) {
          const d = await notifsRes.json()
          setNotifications((d.notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || "info",
            is_read: n.isRead ?? n.is_read ?? false,
            created_at: n.createdAt || n.created_at || "",
          })))
        }
        if (invoicesRes.ok) { const d = await invoicesRes.json(); setPayments(d.invoices || []) }
      } catch {}
      setLoading(false)
    }
    load()
  }, [apiPrefix])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  const myCompanies = companies
  const myEmployees = employees
  const myDocuments = documents
  const myRequests = requests
  const activeRequests = myRequests.filter(r => r.status !== "completed" && r.status !== "rejected")
  const completedRequests = myRequests.filter(r => r.status === "completed")
  const pendingPayments = payments.filter((p: any) => p.status === "pending" || p.status === "unpaid" || p.status === "overdue")

  // Expiring documents
  const expiringDocs = myDocuments.filter(d => {
    if (!d.expiry_date) return false
    const days = Math.ceil((new Date(d.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 60
  })

  // Expiring employee visas
  const expiringVisas = myEmployees.filter(e => {
    if (!e.visa_expiry) return false
    const days = Math.ceil((new Date(e.visa_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 60
  })

  const recentRequests = [...myRequests]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

  const expiringItems = [
    ...expiringDocs.map(doc => ({
      id: doc.id,
      label: doc.name,
      sub: "Document",
      days: Math.ceil((new Date(doc.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })),
    ...expiringVisas.map(emp => ({
      id: emp.id,
      label: emp.full_name,
      sub: "Visa expiry",
      days: Math.ceil((new Date(emp.visa_expiry!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    })),
  ].sort((a, b) => a.days - b.days)

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

  const company = myCompanies[0] ?? null

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <FadeIn>
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2847] rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Welcome back</p>
              <h1 className="text-2xl font-bold mt-1">{user?.full_name}</h1>
              {user?.role === "admin" ? (
                <p className="text-blue-300 text-sm mt-1">YABS PRO Services &middot; Managing {stats.companies} companies</p>
              ) : company ? (
                <p className="text-blue-300 text-sm mt-1">{company.name}{company.emirate ? ` \u00b7 ${company.emirate}` : ""}{company.license_number ? ` \u00b7 License: ${company.license_number}` : ""}</p>
              ) : (
                <p className="text-blue-300 text-sm mt-1">YABS PRO Services</p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">{activeRequests.length}</p>
                <p className="text-xs text-blue-200">Active Requests</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl font-bold">{myDocuments.length}</p>
                <p className="text-xs text-blue-200">Documents</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl font-bold">{myEmployees.length}</p>
                <p className="text-xs text-blue-200">Employees</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Welcome Checklist */}
      {user?.role !== "admin" && (stats.companies === 0 || stats.documents === 0) && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-[#1a3a6b] mb-1">Getting Started</h3>
          <p className="text-sm text-gray-500 mb-4">Complete these steps to set up your account</p>
          <div className="space-y-3">
            {[
              { label: "Create your account", done: true, href: "#" },
              { label: "Company assigned by admin", done: stats.companies > 0, href: "/dashboard/company" },
              { label: "Upload trade license", done: stats.documents > 0, href: "/dashboard/documents" },
              { label: "Submit your first request", done: requests.length > 0, href: "/dashboard/requests" },
            ].map((step, i) => (
              <a key={i} href={step.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${step.done ? "text-gray-500 line-through" : "text-gray-900 font-medium"}`}>{step.label}</span>
              </a>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700">Need help? Contact your PRO administrator at <strong>support@yabs.ae</strong> or call <strong>+971 56 520 4844</strong></p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "New Request", count: `${requests.length} total`, icon: FileText, href: "/dashboard/requests", color: "bg-blue-50 text-blue-600" },
          { label: "Documents", count: `${documents.length} files`, icon: FolderOpen, href: "/dashboard/documents", color: "bg-purple-50 text-purple-600" },
          { label: "My Company", count: `${stats.companies} linked`, icon: Building2, href: "/dashboard/company", color: "bg-green-50 text-green-600" },
          { label: "Payments", count: `${payments.length} invoices`, icon: CreditCard, href: "/dashboard/payments", color: "bg-amber-50 text-amber-600" },
        ].map(item => (
          <StaggerItem key={item.label}>
            <Link href={item.href} prefetch={false}
              className="block">
              <HoverScale>
                <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className={`h-10 w-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#1a3a6b]">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.count}</p>
                </div>
              </HoverScale>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Recent Requests + Notifications */}
      <FadeIn delay={0.2}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <Link href="/dashboard/requests" prefetch={false} className="text-sm text-[#1a3a6b] hover:text-[#c9a96e] transition-colors flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRequests.length === 0 ? (
              <div className="p-10 text-center">
                <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Need PRO Services?</p>
                <p className="text-sm text-gray-400 mt-1">Submit your first service request and we&apos;ll handle the rest.</p>
                <Link href="/dashboard/requests" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]">
                  <FileText className="h-4 w-4" /> Submit New Request
                </Link>
                <p className="text-xs text-gray-400 mt-3">Or <Link href="/dashboard/messages" className="text-[#1a3a6b] hover:underline">message your PRO team directly</Link></p>
              </div>
            ) : (
              recentRequests.map((request) => (
                <Link key={request.id} href={`/dashboard/requests/${request.id}`} prefetch={false}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#f8f9fb] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.service_type}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                        {request.assignee && (
                          <span className="text-xs text-gray-400">
                            &middot; {request.assignee.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Notifications (1/3) */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            {notifications.length > 4 && (
              <Link href="/dashboard/notifications" prefetch={false} className="text-sm text-[#1a3a6b] hover:text-[#c9a96e] transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              recentNotifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type] || Info
                const colorClass = notificationColors[notification.type] || notificationColors.info
                return (
                  <div key={notification.id} className="px-6 py-4 hover:bg-[#f8f9fb] transition-colors">
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${colorClass}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 leading-snug">{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-[#1a3a6b] mt-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      </FadeIn>

      {/* Expiring Documents / Visas */}
      {expiringItems.length > 0 && (
        <FadeIn delay={0.3}>
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5" /> Expiring Soon
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringItems.map(item => (
              <div key={`${item.sub}-${item.id}`} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.days <= 30 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {item.days}d left
                </span>
              </div>
            ))}
          </div>
        </div>
        </FadeIn>
      )}
    </div>
  )
}
