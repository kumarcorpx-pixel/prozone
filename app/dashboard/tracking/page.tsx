"use client"

import { demoRequests, demoTimeline } from "@/lib/demo-data"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  CheckCircle,
  Clock,
  Circle,
  AlertCircle,
  ArrowRight,
  FileText,
  Loader2,
  CheckCircle2,
  Timer,
} from "lucide-react"

// ─── Progress Tracker ────────────────────────────────────────────────────────

const stepOrder = ["pending", "in_progress", "under_review", "completed"]
const stepLabels: Record<string, string> = {
  pending: "Submitted",
  in_progress: "In Progress",
  under_review: "Under Review",
  completed: "Completed",
}

function ProgressTracker({ currentStatus }: { currentStatus: string }) {
  const isRejected = currentStatus === "rejected"
  const currentIndex = isRejected ? -1 : stepOrder.indexOf(currentStatus)

  return (
    <div className="flex items-center w-full">
      {stepOrder.map((step, index) => {
        const isCompleted = !isRejected && index < currentIndex
        const isCurrent = !isRejected && index === currentIndex
        const isLast = index === stepOrder.length - 1

        return (
          <div key={step} className="flex items-center flex-1">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors ${
                  isRejected && index === 0
                    ? "border-red-500 bg-red-50"
                    : isCompleted
                    ? "border-green-500 bg-green-500"
                    : isCurrent
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isRejected && index === 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1.5 text-center font-medium whitespace-nowrap ${
                  isRejected && index === 0
                    ? "text-red-600"
                    : isCompleted
                    ? "text-green-600"
                    : isCurrent
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {isRejected && index === 0 ? "Rejected" : stepLabels[step]}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div className="flex-1 mx-1 sm:mx-2">
                <div
                  className={`h-0.5 w-full rounded ${
                    isRejected
                      ? "bg-gray-200"
                      : isCompleted
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function TrackingPage() {
  const totalRequests = demoRequests.length
  const inProgressCount = demoRequests.filter(
    (r) => r.status === "in_progress" || r.status === "under_review"
  ).length
  const completedCount = demoRequests.filter((r) => r.status === "completed").length
  const pendingCount = demoRequests.filter((r) => r.status === "pending").length

  const activeRequests = demoRequests.filter(
    (r) => r.status !== "completed" && r.status !== "rejected"
  )
  const completedRequests = demoRequests.filter(
    (r) => r.status === "completed" || r.status === "rejected"
  )

  function getLatestActivity(requestId: string) {
    const entries = demoTimeline
      .filter((t) => t.request_id === requestId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return entries[0] || null
  }

  // Completeness percentages
  const completedPct = totalRequests > 0 ? Math.round((completedCount / totalRequests) * 100) : 0
  const inProgressPct = totalRequests > 0 ? Math.round((inProgressCount / totalRequests) * 100) : 0
  const pendingPct = totalRequests > 0 ? Math.round((pendingCount / totalRequests) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Tracking</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor the progress of all your service requests.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={totalRequests} icon={FileText} />
        <StatCard title="In Progress" value={inProgressCount} icon={Loader2} />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle2} />
        <StatCard title="Pending" value={pendingCount} icon={Timer} />
      </div>

      {/* Completeness Bars */}
      <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Status Overview</h2>
        <div className="space-y-3">
          {[
            { label: "Completed", pct: completedPct, color: "bg-green-500" },
            { label: "In Progress", pct: inProgressPct, color: "bg-blue-500" },
            { label: "Pending", pct: pendingPct, color: "bg-yellow-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>{item.label}</span>
                <span className="font-medium">{item.pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Requests */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-[#1a3a6b]" />
          Active Requests
        </h2>
        <div className="space-y-4">
          {activeRequests.map((request) => {
            const latestActivity = getLatestActivity(request.id)
            return (
              <div
                key={request.id}
                className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4"
              >
                {/* Request header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.service_type}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>
                        Submitted:{" "}
                        {new Date(request.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {request.assignee && (
                        <span>Assigned to: {request.assignee.full_name}</span>
                      )}
                      {request.company && (
                        <span>{request.company.name}</span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                {/* Progress Tracker */}
                <div className="py-2">
                  <ProgressTracker currentStatus={request.status} />
                </div>

                {/* Latest Activity */}
                {latestActivity && (
                  <div className="bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-500 mb-0.5">Latest Activity</p>
                    <p className="text-sm text-gray-700">{latestActivity.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(latestActivity.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {latestActivity.creator && ` by ${latestActivity.creator.full_name}`}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Completed / Rejected Requests */}
      {completedRequests.length > 0 && (
        <div className="opacity-75">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completed Requests
          </h2>
          <div className="space-y-4">
            {completedRequests.map((request) => {
              const latestActivity = getLatestActivity(request.id)
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.service_type}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span>
                          Submitted:{" "}
                          {new Date(request.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {request.assignee && (
                          <span>Assigned to: {request.assignee.full_name}</span>
                        )}
                        {request.company && <span>{request.company.name}</span>}
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="py-2">
                    <ProgressTracker currentStatus={request.status} />
                  </div>

                  {latestActivity && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-xs text-gray-500 mb-0.5">Latest Activity</p>
                      <p className="text-sm text-gray-700">{latestActivity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(latestActivity.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {latestActivity.creator && ` by ${latestActivity.creator.full_name}`}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
