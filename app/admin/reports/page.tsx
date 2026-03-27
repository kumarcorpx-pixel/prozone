"use client"

import { TrendingUp, Users, CheckCircle, Clock, FileDown, FileBarChart } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"
import { toast } from "sonner"

const summaryStats = [
  { label: "Total Revenue", value: "AED 245,000", icon: AedIcon, color: "bg-[#1a3a6b]", textColor: "text-white", iconColor: "text-white/60", labelColor: "text-white/80" },
  { label: "Active Clients", value: "15", icon: Users, color: "bg-blue-50", textColor: "text-blue-700", iconColor: "text-blue-400", labelColor: "text-gray-500" },
  { label: "Completion Rate", value: "87%", icon: CheckCircle, color: "bg-green-50", textColor: "text-green-700", iconColor: "text-green-400", labelColor: "text-gray-500" },
  { label: "Avg Processing Time", value: "8 days", icon: Clock, color: "bg-orange-50", textColor: "text-orange-700", iconColor: "text-orange-400", labelColor: "text-gray-500" },
]

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

function downloadCSV(data: any[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0]).join(",")
  const rows = data.map(r => Object.values(r).join(",")).join("\n")
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
}

const reportData: Record<string, any[]> = {
  "Revenue Report": [
    { month: "January", revenue: 45000, collected: 38000, outstanding: 7000 },
    { month: "February", revenue: 52000, collected: 48000, outstanding: 4000 },
    { month: "March", revenue: 61000, collected: 42000, outstanding: 19000 },
  ],
  "Service Report": [
    { service: "Trade License Renewal", requests: 24, completed: 21, completion_rate: "87.5%" },
    { service: "Visa Processing", requests: 18, completed: 15, completion_rate: "83.3%" },
    { service: "Document Attestation", requests: 12, completed: 11, completion_rate: "91.7%" },
  ],
  "Client Report": [
    { client: "Gulf Trading LLC", status: "Active", requests: 8, total_billed: 45000 },
    { client: "Tech Ventures FZCO", status: "Active", requests: 5, total_billed: 31500 },
    { client: "Emirates Zone Group", status: "Active", requests: 3, total_billed: 12000 },
  ],
  "Staff Report": [
    { staff: "Mohammed PRO", active_requests: 5, completed_this_month: 12, avg_days: 6 },
    { staff: "Ali Hassan", active_requests: 3, completed_this_month: 8, avg_days: 9 },
    { staff: "Fatima Khan", active_requests: 9, completed_this_month: 15, avg_days: 7 },
  ],
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Generate and export business reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-5 ${stat.label === "Total Revenue" ? "ring-0" : "ring-1 ring-gray-200"}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${stat.labelColor}`}>{stat.label}</p>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <p className={`text-2xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report) => (
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
                    onClick={() => toast.info("Report generation coming soon")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
                  >
                    <FileBarChart className="h-4 w-4" />
                    Generate Report
                  </button>
                  <button
                    onClick={() => {
                      const data = reportData[report.title]
                      if (data) {
                        downloadCSV(data, `${report.title.toLowerCase().replace(/\s+/g, "-")}.csv`)
                        toast.success(`${report.title} CSV downloaded`)
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
          </div>
        ))}
      </div>
    </div>
  )
}
