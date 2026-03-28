"use client"

import { useState, useEffect } from "react"
import { fetchCompanies, fetchEmployees, fetchDocuments, fetchRequests, fetchAdminStats } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Activity,
  Clock,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { AedIcon } from "@/components/ui/aed-icon"
import { FadeIn, StaggerContainer, StaggerItem, HoverScale } from "@/components/ui/motion"

function getDaysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Morning"
  if (hour < 17) return "Afternoon"
  return "Evening"
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [stats, setStats] = useState({ companies: 0, employees: 0, requests: 0, documents: 0, isReal: false })
  const [revenue, setRevenue] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 })
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [comps, emps, docs, reqs, st] = await Promise.all([
        fetchCompanies(),
        fetchEmployees(),
        fetchDocuments(),
        fetchRequests(),
        fetchAdminStats(),
      ])
      setCompanies(comps)
      setEmployees(emps)
      setDocuments(docs)
      setRequests(reqs)
      setStats(st)

      // Fetch revenue from admin dashboard API (aggregated from invoices table)
      try {
        const dashRes = await fetch("/api/admin/dashboard")
        if (dashRes.ok) {
          const dashData = await dashRes.json()
          if (dashData.revenue) {
            setRevenue({
              total: dashData.revenue.total || 0,
              paid: dashData.revenue.paid || 0,
              pending: dashData.revenue.pending || 0,
              overdue: dashData.revenue.overdue || 0,
            })
          }
        }
      } catch {}

      // Fetch recent activity
      try {
        const actRes = await fetch("/api/admin/activity")
        if (actRes.ok) {
          const actData = await actRes.json()
          setActivityFeed(actData.activities || [])
        }
      } catch {}

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const activeCompanies = companies.filter((c) => c.status === "active")
  const expiredCompanies = companies.filter((c) => c.status === "expired")
  const totalEmployees = employees.length

  // Expiry alerts: docs/visas expiring within 30 days
  const expiringItems: { name: string; type: string; expiryDate: string; daysLeft: number }[] = []

  documents.forEach((doc) => {
    if (doc.expiry_date) {
      const daysLeft = getDaysUntil(doc.expiry_date)
      if (daysLeft <= 30 && daysLeft >= -30) {
        expiringItems.push({
          name: doc.name,
          type: "Document",
          expiryDate: doc.expiry_date,
          daysLeft,
        })
      }
    }
  })

  employees.forEach((emp) => {
    if (emp.visa_expiry) {
      const daysLeft = getDaysUntil(emp.visa_expiry)
      if (daysLeft <= 30 && daysLeft >= -30) {
        expiringItems.push({
          name: `${emp.full_name} - Visa`,
          type: "Visa",
          expiryDate: emp.visa_expiry,
          daysLeft,
        })
      }
    }
  })

  expiringItems.sort((a, b) => a.daysLeft - b.daysLeft)

  const activeRequests = requests.filter(
    (r) => r.status !== "completed" && r.status !== "rejected"
  )
  const pendingDocs = documents.filter(
    (d) => d.status === "expiring_soon" || d.status === "expired"
  )
  const complianceRate = 85

  return (
    <div className="space-y-6 bg-[#f8f9fb] min-h-screen -m-6 p-6">
      {/* Welcome Banner */}
      <FadeIn>
        <div className="bg-gradient-to-r from-[#1a3a6b] via-[#1e4a7e] to-[#234d85] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="relative">
            <p className="text-blue-200 text-sm font-medium">Good {getTimeOfDay()}</p>
            <h1 className="text-3xl font-bold mt-1">Admin Dashboard</h1>
            <p className="text-blue-200 mt-2">Managing {companies.length} companies &middot; {totalEmployees} employees</p>
          </div>
        </div>
      </FadeIn>

      {/* Revenue Row */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <Link href="/admin/invoices" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">AED {revenue.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">All time</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center">
                    <AedIcon className="h-6 w-6 text-[#c9a96e]" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/admin/invoices?status=paid" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Paid</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">AED {revenue.paid.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{revenue.total > 0 ? Math.round(revenue.paid / revenue.total * 100) : 0}% collection rate</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/admin/invoices?status=sent" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">AED {revenue.pending.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{revenue.total > 0 ? Math.round(revenue.pending / revenue.total * 100) : 0}% of total</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/admin/invoices?status=overdue" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Overdue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">AED {revenue.overdue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">{revenue.total > 0 ? Math.round(revenue.overdue / revenue.total * 100) : 0}% of total</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>
      </StaggerContainer>

      {/* Company Portfolio Row */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <Link href="/admin/companies" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Companies</p>
                    <p className="text-3xl font-bold text-[#1a3a6b] mt-1">{stats.companies}</p>
                    <p className="text-xs text-gray-400 mt-1">Managed companies</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#1a3a6b]" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/admin/companies" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Active</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCompanies.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Fully operational</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/admin/companies" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Expired License</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{expiredCompanies.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Needs renewal</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/admin/employees" prefetch={false} className="block">
            <HoverScale>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Employees</p>
                    <p className="text-3xl font-bold text-[#1a3a6b] mt-1">{stats.employees}</p>
                    <p className="text-xs text-gray-400 mt-1">Across all companies</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#1a3a6b]" />
                  </div>
                </div>
              </div>
            </HoverScale>
          </Link>
        </StaggerItem>
      </StaggerContainer>

      {/* Quick Stats + Expiry Alerts */}
      <FadeIn delay={0.2}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats (2/3) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-[#1a3a6b]" />
            </div>
            <h3 className="font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/employees" prefetch={false} className="block group">
              <div className="rounded-xl p-5 bg-gradient-to-br from-[#1a3a6b]/5 to-[#1a3a6b]/10 group-hover:from-[#1a3a6b]/10 group-hover:to-[#1a3a6b]/15 transition-colors">
                <p className="text-sm text-gray-500 font-medium">Visa Compliance</p>
                <p className="text-3xl font-bold text-[#1a3a6b] mt-2">{complianceRate}%</p>
                <div className="mt-3 w-full bg-white/60 rounded-full h-2">
                  <div className="bg-[#1a3a6b] h-2 rounded-full transition-all" style={{ width: `${complianceRate}%` }} />
                </div>
              </div>
            </Link>
            <Link href="/admin/requests" prefetch={false} className="block group">
              <div className="rounded-xl p-5 bg-gradient-to-br from-amber-50 to-amber-100/60 group-hover:from-amber-100/60 group-hover:to-amber-100 transition-colors">
                <p className="text-sm text-gray-500 font-medium">Active Requests</p>
                <p className="text-3xl font-bold text-amber-700 mt-2">{activeRequests.length}</p>
                <p className="text-xs text-gray-400 mt-3">{requests.filter((r) => r.status === "pending").length} pending assignment</p>
              </div>
            </Link>
            <Link href="/admin/documents" prefetch={false} className="block group">
              <div className="rounded-xl p-5 bg-gradient-to-br from-red-50 to-red-100/60 group-hover:from-red-100/60 group-hover:to-red-100 transition-colors">
                <p className="text-sm text-gray-500 font-medium">Pending Documents</p>
                <p className="text-3xl font-bold text-red-700 mt-2">{pendingDocs.length}</p>
                <p className="text-xs text-gray-400 mt-3">Expired or expiring soon</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Expiry Alerts (1/3) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Expiry Alerts</h3>
            </div>
            <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              {expiringItems.length}
            </span>
          </div>
          <div className="space-y-1">
            {expiringItems.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>
                </div>
                <span className={`text-xs font-semibold ml-3 whitespace-nowrap px-2 py-1 rounded-full ${
                  item.daysLeft < 0
                    ? "bg-red-50 text-red-600"
                    : item.daysLeft <= 7
                    ? "bg-red-50 text-red-500"
                    : item.daysLeft <= 30
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}>
                  {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : `${item.daysLeft}d left`}
                </span>
              </div>
            ))}
            {expiringItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No expiring items in the next 30 days</p>
            )}
          </div>
          <Link href="/admin/expiry-calendar" prefetch={false} className="block mt-4 text-sm text-[#1a3a6b] hover:text-[#c9a96e] font-medium text-center transition-colors">
            View All Expiry Alerts &rarr;
          </Link>
        </div>
      </div>
      </FadeIn>

      {/* Recent Requests + Activity Feed */}
      <FadeIn delay={0.3}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#1a3a6b]" />
              </div>
              <h3 className="font-semibold text-gray-900">Recent Requests</h3>
            </div>
            <Link href="/admin/requests" prefetch={false} className="text-sm text-[#1a3a6b] hover:text-[#c9a96e] font-medium transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">Client</th>
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">Service</th>
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => window.location.href = `/admin/requests/${req.id}`}
                  >
                    <td className="py-3 text-gray-900 font-medium">{req.company?.name || "N/A"}</td>
                    <td className="py-3 text-gray-500">{req.service_type}</td>
                    <td className="py-3"><StatusBadge status={req.status} /></td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-[#c9a96e]" />
            </div>
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {activityFeed.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
            )}
            {activityFeed.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3 relative">
                {index < activityFeed.length - 1 && (
                  <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-100" />
                )}
                <div className="mt-1.5 h-[9px] w-[9px] rounded-full bg-[#1a3a6b] flex-shrink-0 ring-2 ring-white" />
                <div className="min-w-0 pb-1">
                  <p className="text-sm text-gray-700">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
