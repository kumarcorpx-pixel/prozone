"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchDocuments } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  FileText, CheckCircle2, Clock, ClipboardList, ArrowRight, Building2, Users,
  AlertTriangle, Upload, Calendar, Activity, Loader2, FolderOpen
} from "lucide-react"
import Link from "next/link"
import { UpdateStatusModal, UploadDocumentModal } from "@/components/dashboard/quick-action-modals"

function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function StaffDashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    async function load() {
      // Use staff-scoped endpoints instead of admin data-fetcher
      const [reqRes, d] = await Promise.all([
        fetch("/api/staff/requests").then(r => r.ok ? r.json() : { requests: [] }),
        fetchDocuments(),
      ])
      const staffRequests = reqRes.requests || []
      setRequests(staffRequests)

      // Extract unique companies and employees from assigned requests
      const companyIds = new Set(staffRequests.map((r: any) => r.company_id || r.companyId).filter(Boolean))
      const companyList = staffRequests
        .filter((r: any) => (r.company_id || r.companyId) && (r.company_name || r.companyName || r.company?.name))
        .reduce((acc: any[], r: any) => {
          const cid = r.company_id || r.companyId
          if (!acc.find((c: any) => c.id === cid)) {
            acc.push({ id: cid, name: r.company_name || r.companyName || r.company?.name })
          }
          return acc
        }, [])
      setCompanies(companyList)
      setEmployees([]) // Employees loaded per-company when needed
      setDocuments(d.filter((doc: any) => !doc.company_id || companyIds.has(doc.company_id)))

      try {
        const actRes = await fetch("/api/staff/dashboard")
        if (actRes.ok) { const a = await actRes.json(); setActivityFeed(a.recentActivity || []) }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  )

  const assignedRequests = requests.filter(r => r.status !== "rejected")
  const inProgressCount = assignedRequests.filter(r => r.status === "in_progress").length
  const completedCount = assignedRequests.filter(r => r.status === "completed").length
  const pendingCount = requests.filter(r => r.status === "pending" || r.status === "assigned").length
  const activeRequests = assignedRequests.filter(r => r.status !== "completed" && r.status !== "rejected")

  // Expiring documents across all companies
  const expiringDocs = documents
    .filter(d => d.expiry_date && getDaysUntil(d.expiry_date) > -30 && getDaysUntil(d.expiry_date) <= 60)
    .map(d => ({ ...d, daysLeft: getDaysUntil(d.expiry_date) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)

  return (
    <div className="space-y-6 bg-[#f8f9fb] min-h-screen -m-6 p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1a3a6b] via-[#1e4a7e] to-[#234d85] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">Welcome back</p>
            <h1 className="text-2xl font-bold mt-1">{user?.full_name}</h1>
            <p className="text-blue-200 mt-1 text-sm">PRO Staff Dashboard</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{companies.length}</p>
              <p className="text-xs text-blue-200">Companies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{activeRequests.length}</p>
              <p className="text-xs text-blue-200">Active Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{documents.filter(d => !d.expiry_date).length}</p>
              <p className="text-xs text-blue-200">Pending Docs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/staff/requests" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{assignedRequests.length}</p>
            </div>
          </div>
        </Link>
        <Link href="/staff/requests?status=in_progress" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
          </div>
        </Link>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center"><ClipboardList className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Active Requests + Expiring Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active Requests (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="h-5 w-5 text-[#1a3a6b]" /> My Active Requests</h3>
            <Link href="/staff/requests" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          {activeRequests.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No active requests</p>
              <Link href="/staff/requests" className="text-xs text-[#1a3a6b] font-medium mt-2 inline-block hover:underline">View All Requests &rarr;</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold">Company</th>
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold">Service</th>
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold">Status</th>
                  <th className="text-left py-2.5 text-xs text-gray-400 font-semibold hidden sm:table-cell">Date</th>
                </tr></thead>
                <tbody>
                  {activeRequests.slice(0, 8).map(req => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-900"><Link href={`/staff/requests/${req.id}`} className="hover:text-[#1a3a6b]">{req.company_name || "N/A"}</Link></td>
                      <td className="py-3 text-gray-500">{req.service_type}</td>
                      <td className="py-3"><StatusBadge status={req.status} /></td>
                      <td className="py-3 text-gray-400 text-xs hidden sm:table-cell">{new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expiring Soon (2/5) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-5"><AlertTriangle className="h-5 w-5 text-amber-500" /> Expiring Soon</h3>
          {expiringDocs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No expiry dates set</p>
              <p className="text-xs text-gray-400 mt-1">Add expiry dates when uploading documents</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringDocs.map((doc, i) => (
                <div key={doc.id || i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.company_name || "Company"}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                    doc.daysLeft < 0 ? "bg-red-50 text-red-600" : doc.daysLeft <= 7 ? "bg-red-50 text-red-500" : doc.daysLeft <= 30 ? "bg-amber-50 text-amber-600" : "bg-yellow-50 text-yellow-600"
                  }`}>
                    {doc.daysLeft < 0 ? `${Math.abs(doc.daysLeft)}d overdue` : `${doc.daysLeft}d left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: My Companies + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* My Companies (3/5) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Building2 className="h-5 w-5 text-[#1a3a6b]" /> My Companies</h3>
            <Link href="/staff/companies" className="text-sm text-[#1a3a6b] hover:underline flex items-center gap-1">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No companies assigned</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companies.slice(0, 6).map(company => {
                const empCount = employees.filter(e => e.company_id === company.id).length
                const docCount = documents.filter(d => d.company_id === company.id).length
                return (
                  <Link key={company.id} href={`/staff/companies`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#1a3a6b]/30 hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-[#1a3a6b]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {empCount}</span>
                        <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" /> {docCount}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions (2/5) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => setStatusModalOpen(true)} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a3a6b] text-white hover:bg-[#15305a] transition-colors w-full text-left">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Update Status</p>
                <p className="text-xs text-blue-200">Change request status</p>
              </div>
            </button>
            <button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors w-full text-left">
              <Upload className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Upload Document</p>
                <p className="text-xs text-gray-400">Add company or employee docs</p>
              </div>
            </button>
            <Link href="/staff/schedule" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">My Schedule</p>
                <p className="text-xs text-gray-400">View today&apos;s tasks</p>
              </div>
            </Link>
            <Link href="/staff/activity" className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <Activity className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Activity Log</p>
                <p className="text-xs text-gray-400">View recent actions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Activity className="h-5 w-5 text-[#c9a96e]" /> Recent Activity</h3>
          <Link href="/staff/activity" className="text-sm text-[#1a3a6b] hover:underline">View All</Link>
        </div>
        {activityFeed.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">Your actions will appear here as you work</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activityFeed.slice(0, 10).map((item, index) => (
              <div key={item.id || index} className="flex items-start gap-3 relative">
                {index < Math.min(activityFeed.length, 10) - 1 && (
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
        )}
      </div>

      {/* Quick Action Modals */}
      <UpdateStatusModal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} requests={activeRequests} />
      <UploadDocumentModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} companies={companies} employees={employees} />
    </div>
  )
}
