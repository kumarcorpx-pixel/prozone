"use client"

import { useState, useEffect } from "react"
import { fetchCompanies, fetchEmployees, fetchDocuments, fetchRequests, fetchAdminStats } from "@/lib/data-fetcher"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { AedIcon } from "@/components/ui/aed-icon"

function getDaysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">CEO-level overview of all operations</p>
      </div>

      {/* Revenue Cards Row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Revenue Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/invoices" prefetch={false} className="block">
            <StatCard title="Total Revenue" value={`AED ${revenue.total.toLocaleString()}`} icon={AedIcon} description="All time revenue" />
          </Link>
          <Link href="/admin/invoices?status=paid" prefetch={false} className="block bg-white rounded-xl p-6 ring-1 ring-gray-200 hover:ring-green-400 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Paid</p>
              <AedIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">AED {revenue.paid.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{revenue.total > 0 ? Math.round(revenue.paid / revenue.total * 100) : 0}% collection rate</p>
          </Link>
          <Link href="/admin/invoices?status=sent" prefetch={false} className="block bg-white rounded-xl p-6 ring-1 ring-gray-200 hover:ring-yellow-400 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">AED {revenue.pending.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{revenue.total > 0 ? Math.round(revenue.pending / revenue.total * 100) : 0}% of total</p>
          </Link>
          <Link href="/admin/invoices?status=overdue" prefetch={false} className="block bg-white rounded-xl p-6 ring-1 ring-gray-200 hover:ring-red-400 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Overdue</p>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">AED {revenue.overdue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{revenue.total > 0 ? Math.round(revenue.overdue / revenue.total * 100) : 0}% of total</p>
          </Link>
        </div>
      </div>

      {/* Company Portfolio Row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/companies" prefetch={false} className="block">
            <StatCard title="Total Companies" value={stats.companies} icon={Building2} description="Managed companies" />
          </Link>
          <Link href="/admin/companies" prefetch={false} className="block bg-white rounded-xl p-6 ring-1 ring-gray-200 hover:ring-[#1a3a6b] transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active</p>
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{activeCompanies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Fully operational</p>
          </Link>
          <Link href="/admin/companies" prefetch={false} className="block bg-white rounded-xl p-6 ring-1 ring-gray-200 hover:ring-[#1a3a6b] transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Expired License</p>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">{expiredCompanies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Needs renewal</p>
          </Link>
          <Link href="/admin/employees" prefetch={false} className="block">
            <StatCard title="Total Employees" value={stats.employees} icon={Users} description="Across all companies" />
          </Link>
        </div>
      </div>

      {/* Expiry Alerts + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiry Alerts Widget */}
        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Expiry Alerts
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
              {expiringItems.length} items
            </span>
          </div>
          <div className="space-y-3">
            {expiringItems.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type}</p>
                </div>
                <span className={`text-xs font-medium ml-2 whitespace-nowrap ${item.daysLeft < 0 ? "text-red-600" : item.daysLeft <= 7 ? "text-red-500" : item.daysLeft <= 30 ? "text-yellow-600" : "text-green-600"}`}>
                  {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : `${item.daysLeft}d left`}
                </span>
              </div>
            ))}
            {expiringItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No expiring items in the next 30 days</p>
            )}
          </div>
          <Link href="/admin/expiry-calendar" prefetch={false} className="block mt-4 text-sm text-[#1a3a6b] hover:underline font-medium text-center">
            View All Expiry Alerts
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 lg:col-span-2">
          <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#1a3a6b]" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/employees" prefetch={false} className="block bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors">
              <p className="text-sm text-gray-600">Visa Compliance Rate</p>
              <p className="text-2xl font-bold text-[#1a3a6b] mt-1">{complianceRate}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#1a3a6b] h-2 rounded-full" style={{ width: `${complianceRate}%` }} />
              </div>
            </Link>
            <Link href="/admin/requests" prefetch={false} className="block bg-orange-50 rounded-lg p-4 hover:bg-orange-100 transition-colors">
              <p className="text-sm text-gray-600">Active Requests</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{activeRequests.length}</p>
              <p className="text-xs text-gray-500 mt-2">{requests.filter((r) => r.status === "pending").length} pending assignment</p>
            </Link>
            <Link href="/admin/documents" prefetch={false} className="block bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors">
              <p className="text-sm text-gray-600">Pending Documents</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{pendingDocs.length}</p>
              <p className="text-xs text-gray-500 mt-2">Expired or expiring soon</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Requests + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1a3a6b]" />
              Recent Requests
            </h3>
            <Link href="/admin/requests" className="text-sm text-[#1a3a6b] hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Client</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Service</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => window.location.href = `/admin/requests/${req.id}`}
                  >
                    <td className="py-2.5 text-gray-900">{req.company?.name || "N/A"}</td>
                    <td className="py-2.5 text-gray-600">{req.service_type}</td>
                    <td className="py-2.5"><StatusBadge status={req.status} /></td>
                    <td className="py-2.5 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
          <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-[#1a3a6b]" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activityFeed.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
            {activityFeed.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#1a3a6b] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
