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
    <div className="space-y-6">
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors disabled:opacity-50"
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
                        <tr className="border-b border-gray-200">
                          {Object.keys(rows[0]).map((key) => (
                            <th key={key} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
    </div>
  )
}
