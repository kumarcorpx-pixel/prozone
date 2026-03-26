"use client"

import { demoCompanies, demoEmployees, companyDocuments } from "@/lib/company-data"
import { demoRequests, demoNotifications } from "@/lib/demo-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react"
import Link from "next/link"

function getDaysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function AdminDashboard() {
  const activeCompanies = demoCompanies.filter((c) => c.status === "active")
  const expiredCompanies = demoCompanies.filter((c) => c.status === "expired")
  const totalEmployees = demoEmployees.length

  // Expiry alerts: docs/visas expiring within 30 days
  const expiringItems: { name: string; type: string; expiryDate: string; daysLeft: number }[] = []

  companyDocuments.forEach((doc) => {
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

  demoEmployees.forEach((emp) => {
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

  const activeRequests = demoRequests.filter(
    (r) => r.status !== "completed" && r.status !== "rejected"
  )
  const pendingDocs = companyDocuments.filter(
    (d) => d.status === "expiring_soon" || d.status === "expired"
  )
  const complianceRate = 85

  const activityFeed = [
    { id: 1, message: "Admin updated Gulf Trading LLC trade license renewal", time: "2 hours ago" },
    { id: 2, message: "New visa request from Gulf Trading for Mohammad Khan", time: "5 hours ago" },
    { id: 3, message: "VAT return filing submitted for Emirates Zone Group", time: "1 day ago" },
    { id: 4, message: "Document attestation completed for Gulf Trading LLC", time: "2 days ago" },
    { id: 5, message: "Tech Ventures FZCO initial approval received from DSO", time: "4 days ago" },
  ]

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
          <StatCard title="Total Revenue" value="AED 245,000" icon={DollarSign} description="All time revenue" trend={{ value: 12, positive: true }} />
          <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Paid</p>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">AED 198,000</p>
            <p className="text-xs text-gray-500 mt-1">80.8% collection rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">AED 35,000</p>
            <p className="text-xs text-gray-500 mt-1">14.3% of total</p>
          </div>
          <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Overdue</p>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">AED 12,000</p>
            <p className="text-xs text-gray-500 mt-1">4.9% of total</p>
          </div>
        </div>
      </div>

      {/* Company Portfolio Row */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Companies" value={demoCompanies.length} icon={Building2} description="Managed companies" />
          <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active</p>
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{activeCompanies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Fully operational</p>
          </div>
          <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Expired License</p>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">{expiredCompanies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Needs renewal</p>
          </div>
          <StatCard title="Total Employees" value={totalEmployees} icon={Users} description="Across all companies" />
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
          <Link href="/admin/documents" className="block mt-4 text-sm text-[#1a3a6b] hover:underline font-medium text-center">
            View All Documents
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 lg:col-span-2">
          <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-[#1a3a6b]" />
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Visa Compliance Rate</p>
              <p className="text-2xl font-bold text-[#1a3a6b] mt-1">{complianceRate}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#1a3a6b] h-2 rounded-full" style={{ width: `${complianceRate}%` }} />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Active Requests</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{activeRequests.length}</p>
              <p className="text-xs text-gray-500 mt-2">{demoRequests.filter((r) => r.status === "pending").length} pending assignment</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Pending Documents</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{pendingDocs.length}</p>
              <p className="text-xs text-gray-500 mt-2">Expired or expiring soon</p>
            </div>
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
                {demoRequests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="border-b border-gray-50">
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
