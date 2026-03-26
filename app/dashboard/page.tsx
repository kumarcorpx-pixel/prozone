"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchCompanies, fetchEmployees, fetchDocuments, fetchRequests } from "@/lib/data-fetcher"
import { demoNotifications, demoPayments, demoRequestDocuments } from "@/lib/demo-data"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import Link from "next/link"
import {
  FileText, CheckCircle2, FolderOpen, CreditCard, Bell, Info,
  AlertTriangle, AlertCircle, Users, Building2, ArrowRight, Calendar
} from "lucide-react"

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
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, e, d, r] = await Promise.all([
        fetchCompanies(),
        fetchEmployees(),
        fetchDocuments(),
        fetchRequests(),
      ])
      setCompanies(c)
      setEmployees(e)
      setDocuments(d)
      setRequests(r)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  // Get client's company
  const myCompany = companies.find(c => c.id === user?.company_id)
  const myEmployees = employees.filter(e => e.company_id === user?.company_id)
  const myDocuments = documents.filter(d => d.company_id === user?.company_id)

  // Requests linked to client
  const myRequests = requests.filter(r => r.client_id === user?.id || r.company?.name === myCompany?.name)
  const activeRequests = myRequests.filter(r => r.status !== "completed" && r.status !== "rejected")
  const completedRequests = myRequests.filter(r => r.status === "completed")
  const pendingPayments = demoPayments.filter(p => p.status === "pending")

  // Documents linked to requests
  const myRequestDocs = demoRequestDocuments

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

  const recentNotifications = [...demoNotifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Welcome + Company Info */}
      <div className="bg-gradient-to-r from-[#1a3a6b] to-[#0f2340] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.full_name}
        </h1>
        {myCompany && (
          <p className="text-gray-300 mt-1">
            {myCompany.name} &middot; {myCompany.emirate} &middot; License: {myCompany.license_number}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <div className="text-2xl font-bold">{activeRequests.length}</div>
            <div className="text-xs text-gray-400">Active Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{myDocuments.length}</div>
            <div className="text-xs text-gray-400">Documents</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{myEmployees.length}</div>
            <div className="text-xs text-gray-400">Employees</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{expiringDocs.length + expiringVisas.length}</div>
            <div className="text-xs text-gray-400">Expiring Soon</div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/dashboard/requests" className="bg-white rounded-xl ring-1 ring-gray-200 p-4 hover:ring-[#1a3a6b] hover:shadow-md transition-all group">
          <FileText className="h-6 w-6 text-[#1a3a6b] mb-2" />
          <p className="text-sm font-medium">My Requests</p>
          <p className="text-xs text-gray-500 mt-0.5">{myRequests.length} total</p>
        </Link>
        <Link href="/dashboard/documents" className="bg-white rounded-xl ring-1 ring-gray-200 p-4 hover:ring-[#1a3a6b] hover:shadow-md transition-all group">
          <FolderOpen className="h-6 w-6 text-[#1a3a6b] mb-2" />
          <p className="text-sm font-medium">Documents</p>
          <p className="text-xs text-gray-500 mt-0.5">{myDocuments.length} files</p>
        </Link>
        <Link href="/dashboard/tracking" className="bg-white rounded-xl ring-1 ring-gray-200 p-4 hover:ring-[#1a3a6b] hover:shadow-md transition-all group">
          <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
          <p className="text-sm font-medium">Track Progress</p>
          <p className="text-xs text-gray-500 mt-0.5">{activeRequests.length} active</p>
        </Link>
        <Link href="/dashboard/payments" className="bg-white rounded-xl ring-1 ring-gray-200 p-4 hover:ring-[#1a3a6b] hover:shadow-md transition-all group">
          <CreditCard className="h-6 w-6 text-orange-500 mb-2" />
          <p className="text-sm font-medium">Payments</p>
          <p className="text-xs text-gray-500 mt-0.5">{pendingPayments.length} pending</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <Link href="/dashboard/requests" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>No requests yet</p>
              </div>
            ) : (
              recentRequests.map((request) => (
                <Link key={request.id} href={`/dashboard/requests/${request.id}`} className="block px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{request.service_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                        {request.assignee && (
                          <span className="text-xs text-gray-400">
                            &middot; Handled by {request.assignee.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Notifications + Expiry Alerts */}
        <div className="space-y-6">
          {/* Expiry Alerts */}
          {(expiringDocs.length > 0 || expiringVisas.length > 0) && (
            <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <h2 className="text-sm font-semibold text-gray-900">Expiring Soon</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {expiringDocs.map(doc => {
                  const days = Math.ceil((new Date(doc.expiry_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={doc.id} className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">{doc.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${days <= 30 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {days}d left
                        </span>
                      </div>
                    </div>
                  )
                })}
                {expiringVisas.map(emp => {
                  const days = Math.ceil((new Date(emp.visa_expiry!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={emp.id} className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-900">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">Visa expiring</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${days <= 30 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {days}d left
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentNotifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type] || Info
                const colorClass = notificationColors[notification.type] || notificationColors.info
                return (
                  <div key={notification.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${colorClass}`}>
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(notification.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
