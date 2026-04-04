"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, Users, CheckCircle, Clock, FileDown, FileBarChart, Loader2, X, ChevronDown, ChevronUp } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"
import { toast } from "sonner"

interface SummaryStats {
  totalRevenue: number
  activeClients: number
  completionRate: number
  avgProcessingDays: number
}

interface ReportDataMap {
  revenue: any[]
  service: any[]
  client: any[]
  staff: any[]
}

const reportTypeMap: Record<string, keyof ReportDataMap> = {
  "Revenue Report": "revenue",
  "Service Report": "service",
  "Client Report": "client",
  "Staff Report": "staff",
}

const reportCards = [
  {
    title: "Revenue Report",
    description: "Monthly revenue breakdown, total collected vs outstanding. Track payment trends and forecast future income.",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Service Report",
    description: "Requests by service type, completion rates. Identify your most popular services and processing bottlenecks.",
    icon: FileBarChart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Client Report",
    description: "New clients, active clients, client retention. Understand client growth and engagement patterns.",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Staff Report",
    description: "Requests per staff member, completion times. Evaluate workload distribution and team performance.",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[Number(m) - 1] || m} ${y}`
}

function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function escapeCSVField(value: any): string {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function downloadCSV(data: any[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0]).map(escapeCSVField).join(",")
  const rows = data.map(r => Object.values(r).map(escapeCSVField).join(",")).join("\n")
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [reportData, setReportData] = useState<ReportDataMap>({ revenue: [], service: [], client: [], staff: [] })
  const [loading, setLoading] = useState(true)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/reports?type=all")
      if (!res.ok) throw new Error("Failed to fetch reports")
      const data = await res.json()
      setSummary(data.summary || null)
      setReportData({
        revenue: data.revenue || [],
        service: data.service || [],
        client: data.client || [],
        staff: data.staff || [],
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to load report data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerateReport = async (title: string) => {
    const key = reportTypeMap[title]
    if (!key) return
    setGeneratingReport(title)
    try {
      const res = await fetch(`/api/admin/reports?type=${key}`)
      if (!res.ok) throw new Error("Failed to generate report")
      const data = await res.json()
      setReportData((prev) => ({ ...prev, [key]: data[key] || [] }))
      setExpandedReport(title)
      toast.success(`${title} generated`)
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report")
    } finally {
      setGeneratingReport(null)
    }
  }

  const summaryStats = summary
    ? [
        { label: "Total Revenue", value: formatAED(summary.totalRevenue), icon: AedIcon, color: "bg-[#1a3a6b]", textColor: "text-white", iconColor: "text-white/60", labelColor: "text-white/80" },
        { label: "Active Clients", value: String(summary.activeClients), icon: Users, color: "bg-blue-50", textColor: "text-blue-700", iconColor: "text-blue-400", labelColor: "text-gray-500" },
        { label: "Completion Rate", value: `${summary.completionRate}%`, icon: CheckCircle, color: "bg-green-50", textColor: "text-green-700", iconColor: "text-green-400", labelColor: "text-gray-500" },
        { label: "Avg Processing Time", value: `${summary.avgProcessingDays} days`, icon: Clock, color: "bg-orange-50", textColor: "text-orange-700", iconColor: "text-orange-400", labelColor: "text-gray-500" },
      ]
    : []

  const getReportRows = (title: string): any[] => {
    const key = reportTypeMap[title]
    return key ? reportData[key] : []
  }

  return (
    <div className="page-entrance space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and export business reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-20" />
            </div>
          ))
        ) : (
          summaryStats.map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-5 ${stat.label === "Total Revenue" ? "ring-0" : "ring-1 ring-gray-200"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${stat.labelColor}`}>{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Revenue Chart */}
      {reportData.revenue.length > 0 && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <button
              onClick={() => {
                downloadCSV(reportData.revenue, "revenue-report.csv")
                toast.success("Revenue CSV downloaded")
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
          {(() => {
            const maxRevenue = Math.max(...reportData.revenue.map((r: any) => r.revenue), 1)
            return (
              <div className="space-y-2">
                {[...reportData.revenue].reverse().map((row: any) => (
                  <div key={row.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 shrink-0 text-right">{formatMonth(row.month)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-[#1a3a6b] transition-all"
                        style={{ width: `${Math.max((row.revenue / maxRevenue) * 100, 2)}%` }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-gray-600">
                        {formatAED(row.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200">
                  <th className="text-left py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Month</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Revenue</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Collected</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Pending</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.revenue.map((row: any) => (
                  <tr key={row.month} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-3 text-gray-700">{formatMonth(row.month)}</td>
                    <td className="py-2 px-3 text-gray-700 text-right">{formatAED(row.revenue)}</td>
                    <td className="py-2 px-3 text-green-700 text-right">{formatAED(row.collected)}</td>
                    <td className="py-2 px-3 text-yellow-700 text-right">{formatAED(row.pending)}</td>
                    <td className="py-2 px-3 text-red-700 text-right">{formatAED(row.overdue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Performance */}
      {reportData.staff.length > 0 && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Staff Performance</h3>
            <button
              onClick={() => {
                downloadCSV(reportData.staff, "staff-report.csv")
                toast.success("Staff CSV downloaded")
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200">
                  <th className="text-left py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Staff Name</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Active Requests</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Completed This Month</th>
                  <th className="text-right py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">Avg Days</th>
                </tr>
              </thead>
              <tbody>
                {reportData.staff.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-3 text-gray-700 font-medium">{row.staff || "-"}</td>
                    <td className="py-2 px-3 text-gray-700 text-right">{row.active_requests ?? 0}</td>
                    <td className="py-2 px-3 text-gray-700 text-right">{row.completed_this_month ?? 0}</td>
                    <td className="py-2 px-3 text-gray-700 text-right">{row.avg_days ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report) => {
          const rows = getReportRows(report.title)
          const isExpanded = expandedReport === report.title
          const isGenerating = generatingReport === report.title

          return (
            <div key={report.title} className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className={`${report.bgColor} p-3 rounded-lg`}>
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedReport(null)
                        } else if (rows.length > 0) {
                          setExpandedReport(report.title)
                        } else {
                          handleGenerateReport(report.title)
                        }
                      }}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <FileBarChart className="h-4 w-4" />
                      )}
                      {isGenerating ? "Generating..." : isExpanded ? "Hide Report" : "Generate Report"}
                    </button>
                    <button
                      onClick={() => {
                        const data = rows.length > 0 ? rows : getReportRows(report.title)
                        if (data.length > 0) {
                          downloadCSV(data, `${report.title.toLowerCase().replace(/\s+/g, "-")}.csv`)
                          toast.success(`${report.title} CSV downloaded`)
                        } else {
                          toast.info("Generate the report first to export CSV")
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <FileDown className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Report Table */}
              {isExpanded && rows.length > 0 && (
                <div className="mt-5 border-t pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200">
                          {Object.keys(rows[0]).map((key) => (
                            <th key={key} className="text-left py-2 px-3 text-[#1a3a6b] font-bold text-xs uppercase tracking-wider">
                              {key.replace(/_/g, " ")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="py-2 px-3 text-gray-700">
                                {typeof val === "number" && val > 999
                                  ? val.toLocaleString("en-US")
                                  : String(val ?? "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No data available</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Export All Reports */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const allData: Record<string, any[]> = {}
            for (const key of Object.keys(reportData) as (keyof ReportDataMap)[]) {
              if (reportData[key].length > 0) allData[key] = reportData[key]
            }
            const keys = Object.keys(allData)
            if (keys.length === 0) {
              toast.info("No report data to export. Generate reports first.")
              return
            }
            for (const key of keys) {
              downloadCSV(allData[key], `${key}-report.csv`)
            }
            toast.success(`Exported ${keys.length} report(s) as CSV`)
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5"
        >
          <FileDown className="h-4 w-4" />
          Export All Reports
        </button>
      </div>
    </div>
  )
}
