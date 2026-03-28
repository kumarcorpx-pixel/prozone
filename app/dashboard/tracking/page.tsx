"use client"

import { useState, useEffect } from "react"
import { getChecklistForServiceType } from "@/lib/checklist-templates"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { CheckCircle2, Circle, Clock, User, MessageSquare } from "lucide-react"

export default function TrackingPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/requests")
        if (res.ok) setRequests(await res.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  const activeRequests = requests.filter(r => !["completed", "rejected"].includes(r.status))
  const completedRequests = requests.filter(r => r.status === "completed")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track Your Services</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time progress of all your active services</p>
      </div>

      {activeRequests.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center text-gray-500">No active services to track.</div>
      ) : (
        <div className="space-y-6">
          {activeRequests.map(req => {
            const steps = getChecklistForServiceType(req.service_type)
            // Calculate actual progress based on request status
            const statusProgress: Record<string, number> = {
              pending: 0,
              in_progress: 0.3,
              under_review: 0.6,
              approved: 0.8,
              completed: 1,
              rejected: 0,
            }
            const progress = statusProgress[req.status] ?? 0
            const completedSteps = Math.min(Math.round(steps.length * progress), steps.length)
            const currentStep = steps[completedSteps] || "Processing"

            return (
              <div key={req.id} className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{req.service_type}</h3>
                      <p className="text-sm text-gray-500">{req.company?.name}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                {steps.length > 0 && (
                  <div className="p-5">
                    {/* Desktop: Horizontal stepper */}
                    <div className="hidden md:flex items-start gap-0">
                      {steps.map((step, i) => {
                        const done = i < completedSteps
                        const current = i === completedSteps
                        return (
                          <div key={i} className="flex items-start flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500 text-white" : current ? "bg-[#1a3a6b] text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-400"}`}>
                                {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                              </div>
                              <p className={`text-[10px] text-center mt-1.5 max-w-[80px] leading-tight ${done ? "text-green-700 font-medium" : current ? "text-[#1a3a6b] font-medium" : "text-gray-400"}`}>{step.length > 30 ? step.substring(0, 28) + "..." : step}</p>
                            </div>
                            {i < steps.length - 1 && (
                              <div className={`h-0.5 flex-1 mt-4 ${done ? "bg-green-500" : "bg-gray-200"}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Mobile: Vertical stepper */}
                    <div className="md:hidden space-y-0">
                      {steps.map((step, i) => {
                        const done = i < completedSteps
                        const current = i === completedSteps
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-500 text-white" : current ? "bg-[#1a3a6b] text-white" : "bg-gray-200 text-gray-400"}`}>
                                {done ? <CheckCircle2 className="h-3 w-3" /> : current ? <Clock className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                              </div>
                              {i < steps.length - 1 && <div className={`w-0.5 h-6 ${done ? "bg-green-500" : "bg-gray-200"}`} />}
                            </div>
                            <p className={`text-xs pb-4 ${done ? "text-green-700" : current ? "text-[#1a3a6b] font-medium" : "text-gray-400"}`}>{step}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.assignee?.full_name || "Assigned"}</span>
                    <span>Updated: {new Date(req.updated_at || req.created_at).toLocaleDateString()}</span>
                  </div>
                  <button className="text-xs text-[#1a3a6b] hover:underline flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Contact PRO
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {completedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Completed</h2>
          <div className="space-y-3 opacity-75">
            {completedRequests.map(req => (
              <div key={req.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{req.service_type}</h3>
                  <p className="text-xs text-gray-500">{req.company?.name}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
