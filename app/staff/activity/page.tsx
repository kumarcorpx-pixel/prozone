"use client"

import { Activity, FileText, CheckSquare, MessageSquare, RefreshCw } from "lucide-react"

const typeIcons: Record<string, typeof Activity> = {
  status: RefreshCw,
  upload: FileText,
  checklist: CheckSquare,
  note: MessageSquare,
}

const typeColors: Record<string, string> = {
  status: "bg-blue-100 text-blue-600",
  upload: "bg-green-100 text-green-600",
  checklist: "bg-purple-100 text-purple-600",
  note: "bg-yellow-100 text-yellow-600",
}

const demoActivity = [
  { id: "a1", type: "status", message: "Changed status to In Progress", request: "Trade License Renewal", company: "Gulf Trading LLC", time: "2 hours ago" },
  { id: "a2", type: "upload", message: "Uploaded Trade_License_Copy.pdf", request: "Trade License Renewal", company: "Gulf Trading LLC", time: "3 hours ago" },
  { id: "a3", type: "checklist", message: "Completed: Verify tenancy contract validity", request: "Trade License Renewal", company: "Gulf Trading LLC", time: "Yesterday" },
  { id: "a4", type: "note", message: "Added note: Submitted application to DED office, ref #DED-2025-789", request: "Trade License Renewal", company: "Gulf Trading LLC", time: "Yesterday" },
  { id: "a5", type: "status", message: "Changed status to Under Review", request: "Visa Renewal", company: "Emirates Zone Group", time: "2 days ago" },
  { id: "a6", type: "upload", message: "Uploaded Medical_Fitness_Certificate.pdf", request: "New Employment Visa", company: "Tech Ventures FZCO", time: "3 days ago" },
  { id: "a7", type: "checklist", message: "Completed: Book and complete medical fitness test", request: "New Employment Visa", company: "Tech Ventures FZCO", time: "3 days ago" },
  { id: "a8", type: "note", message: "Added note: Waiting for MOHRE approval, expected 2 working days", request: "New Employment Visa", company: "Tech Ventures FZCO", time: "4 days ago" },
]

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#1a3a6b]" />
          My Activity
        </h1>
        <p className="text-sm text-gray-500 mt-1">Log of all your recent actions</p>
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 divide-y divide-gray-100">
        {demoActivity.map(entry => {
          const Icon = typeIcons[entry.type] || Activity
          const colorClass = typeColors[entry.type] || "bg-gray-100 text-gray-600"
          return (
            <div key={entry.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{entry.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#1a3a6b] font-medium">{entry.request}</span>
                  <span className="text-xs text-gray-400">&middot;</span>
                  <span className="text-xs text-gray-500">{entry.company}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{entry.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
