"use client"

import { useAuth } from "@/lib/auth-context"
import { demoRequests, demoNotifications, demoPayments } from "@/lib/demo-data"
import { companyDocuments } from "@/lib/company-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { FileText, CheckCircle2, FolderOpen, CreditCard, Bell, Info, AlertTriangle, AlertCircle } from "lucide-react"

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

  const activeRequests = demoRequests.filter((r) => r.status !== "completed" && r.status !== "rejected")
  const completedRequests = demoRequests.filter((r) => r.status === "completed")
  const pendingPayments = demoPayments.filter((p) => p.status === "pending")
  const recentRequests = [...demoRequests]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
  const recentNotifications = [...demoNotifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is an overview of your account activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Requests"
          value={activeRequests.length}
          icon={FileText}
          description={`${activeRequests.length} request${activeRequests.length !== 1 ? "s" : ""} in progress`}
        />
        <StatCard
          title="Completed"
          value={completedRequests.length}
          icon={CheckCircle2}
          description="Successfully processed"
        />
        <StatCard
          title="Documents"
          value={companyDocuments.length}
          icon={FolderOpen}
          description="Total uploaded documents"
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments.length}
          icon={CreditCard}
          description={`AED ${pendingPayments.reduce((sum, p) => sum + p.total_amount, 0).toLocaleString()} outstanding`}
        />
      </div>

      {/* Recent Requests & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.service_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{request.company?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                      {new Date(request.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type] || Info
              const colorClass = notificationColors[notification.type] || notificationColors.info
              return (
                <div key={notification.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0 mt-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500 block" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
