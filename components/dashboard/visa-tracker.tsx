"use client"

import { useState } from "react"
import { CheckCircle2, Clock, Circle, XCircle, PauseCircle, ChevronDown } from "lucide-react"
import { format } from "date-fns"

interface VisaStep {
  step_number: number
  step_name: string
  step_label: string
  status: "not_started" | "in_progress" | "completed" | "rejected" | "on_hold"
  started_at?: string | null
  completed_at?: string | null
  notes?: string | null
  gov_reference_number?: string | null
}

interface VisaTrackerProps {
  steps: VisaStep[]
  onUpdateStep?: (stepNumber: number, status: string, notes?: string) => void
  editable?: boolean
  serviceType?: string
}

const statusConfig: Record<
  VisaStep["status"],
  { color: string; bg: string; ring: string; icon: React.ElementType; label: string; lineColor: string }
> = {
  completed: {
    color: "text-white",
    bg: "bg-green-500",
    ring: "ring-green-200",
    icon: CheckCircle2,
    label: "Completed",
    lineColor: "bg-green-500",
  },
  in_progress: {
    color: "text-white",
    bg: "bg-blue-500",
    ring: "ring-blue-200",
    icon: Clock,
    label: "In Progress",
    lineColor: "bg-blue-300",
  },
  not_started: {
    color: "text-gray-400",
    bg: "bg-gray-200",
    ring: "ring-gray-100",
    icon: Circle,
    label: "Not Started",
    lineColor: "bg-gray-200",
  },
  rejected: {
    color: "text-white",
    bg: "bg-red-500",
    ring: "ring-red-200",
    icon: XCircle,
    label: "Rejected",
    lineColor: "bg-red-300",
  },
  on_hold: {
    color: "text-white",
    bg: "bg-yellow-500",
    ring: "ring-yellow-200",
    icon: PauseCircle,
    label: "On Hold",
    lineColor: "bg-yellow-300",
  },
}

const statusBadgeColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  not_started: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-800",
  on_hold: "bg-yellow-100 text-yellow-800",
}

function formatDateStr(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A"
  try {
    return format(new Date(dateStr), "dd MMM yyyy, HH:mm")
  } catch {
    return "N/A"
  }
}

export function VisaTracker({ steps, onUpdateStep, editable = false, serviceType }: VisaTrackerProps) {
  const [selectedStep, setSelectedStep] = useState<number>(
    () => steps.find((s) => s.status === "in_progress")?.step_number ?? steps[0]?.step_number ?? 1
  )
  const [editStatus, setEditStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const selected = steps.find((s) => s.step_number === selectedStep)

  function handleSelectStep(stepNumber: number) {
    setSelectedStep(stepNumber)
    const step = steps.find((s) => s.step_number === stepNumber)
    if (step) {
      setEditStatus(step.status)
      setEditNotes(step.notes || "")
    }
  }

  function handleUpdate() {
    if (onUpdateStep && selected) {
      onUpdateStep(selected.step_number, editStatus, editNotes)
    }
  }

  return (
    <div className="space-y-6">
      {serviceType && (
        <p className="text-sm text-gray-500 font-medium">{serviceType}</p>
      )}

      {/* Horizontal stepper - desktop */}
      <div className="hidden md:block overflow-x-auto pb-2">
        <div className="flex items-start min-w-max">
          {steps.map((step, index) => {
            const config = statusConfig[step.status]
            const isLast = index === steps.length - 1
            const isSelected = step.step_number === selectedStep
            const prevCompleted = index > 0 && steps[index - 1].status === "completed"

            return (
              <div key={step.step_number} className="flex items-start">
                <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
                  <button
                    onClick={() => handleSelectStep(step.step_number)}
                    className={`relative flex items-center justify-center h-10 w-10 rounded-full ring-2 ${config.bg} ${config.ring} ${config.color} transition-all ${
                      isSelected ? "ring-4 scale-110" : ""
                    } ${step.status === "in_progress" ? "animate-pulse" : ""}`}
                  >
                    <span className="text-sm font-bold">{step.step_number}</span>
                  </button>
                  <p
                    className={`mt-2 text-xs text-center leading-tight max-w-[80px] ${
                      isSelected ? "font-semibold text-[#1a3a6b]" : "text-gray-500"
                    }`}
                  >
                    {step.step_label}
                  </p>
                </div>
                {!isLast && (
                  <div className="flex items-center mt-5 -mx-1">
                    <div
                      className={`h-0.5 w-12 ${
                        step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vertical stepper - mobile */}
      <div className="md:hidden space-y-0">
        {steps.map((step, index) => {
          const config = statusConfig[step.status]
          const isLast = index === steps.length - 1
          const isSelected = step.step_number === selectedStep

          return (
            <div key={step.step_number} className="flex gap-3">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleSelectStep(step.step_number)}
                  className={`relative flex items-center justify-center h-8 w-8 rounded-full ring-2 ${config.bg} ${config.ring} ${config.color} transition-all ${
                    isSelected ? "ring-4 scale-110" : ""
                  } ${step.status === "in_progress" ? "animate-pulse" : ""}`}
                >
                  <span className="text-xs font-bold">{step.step_number}</span>
                </button>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 ${
                      step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <button
                onClick={() => handleSelectStep(step.step_number)}
                className={`text-sm pb-4 ${
                  isSelected ? "font-semibold text-[#1a3a6b]" : "text-gray-600"
                }`}
              >
                {step.step_label}
              </button>
            </div>
          )
        })}
      </div>

      {/* Selected step details */}
      {selected && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              Step {selected.step_number}: {selected.step_label}
            </h4>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusBadgeColors[selected.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {statusConfig[selected.status].label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Started</p>
              <p className="font-medium text-gray-900">{formatDateStr(selected.started_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Completed</p>
              <p className="font-medium text-gray-900">{formatDateStr(selected.completed_at)}</p>
            </div>
            {selected.gov_reference_number && (
              <div>
                <p className="text-gray-500">Government Reference</p>
                <p className="font-medium text-gray-900 font-mono">{selected.gov_reference_number}</p>
              </div>
            )}
            {selected.notes && (
              <div className="sm:col-span-2">
                <p className="text-gray-500">Notes</p>
                <p className="font-medium text-gray-700">{selected.notes}</p>
              </div>
            )}
          </div>

          {editable && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h5 className="text-sm font-medium text-gray-700">Update Step</h5>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent resize-none"
              />
              <button
                onClick={handleUpdate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
              >
                Update
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const demoVisaSteps: VisaStep[] = [
  { step_number: 1, step_name: "quota_check", step_label: "Quota Check", status: "completed" as const, started_at: "2025-03-10T09:00:00Z", completed_at: "2025-03-10T14:00:00Z", notes: "Quota available: 2 remaining", gov_reference_number: null },
  { step_number: 2, step_name: "offer_letter", step_label: "Offer Letter", status: "completed" as const, started_at: "2025-03-11T09:00:00Z", completed_at: "2025-03-12T16:00:00Z", notes: "Signed by employee", gov_reference_number: null },
  { step_number: 3, step_name: "mohre_approval", step_label: "MOHRE Approval", status: "completed" as const, started_at: "2025-03-13T09:00:00Z", completed_at: "2025-03-15T11:00:00Z", notes: "Work permit approved", gov_reference_number: "WP-2025-123456" },
  { step_number: 4, step_name: "entry_permit", step_label: "Entry Permit", status: "in_progress" as const, started_at: "2025-03-16T09:00:00Z", completed_at: null, notes: "Applied to GDRFA", gov_reference_number: "EP-2025-789012" },
  { step_number: 5, step_name: "employee_arrival", step_label: "Employee Arrival", status: "not_started" as const, started_at: null, completed_at: null, notes: null, gov_reference_number: null },
  { step_number: 6, step_name: "medical_fitness", step_label: "Medical Fitness", status: "not_started" as const, started_at: null, completed_at: null, notes: null, gov_reference_number: null },
  { step_number: 7, step_name: "eid_biometrics", step_label: "EID Biometrics", status: "not_started" as const, started_at: null, completed_at: null, notes: null, gov_reference_number: null },
  { step_number: 8, step_name: "labor_contract", step_label: "Labor Contract", status: "not_started" as const, started_at: null, completed_at: null, notes: null, gov_reference_number: null },
  { step_number: 9, step_name: "visa_stamping", step_label: "Visa Stamping", status: "not_started" as const, started_at: null, completed_at: null, notes: null, gov_reference_number: null },
  { step_number: 10, step_name: "eid_collection", step_label: "EID Collection", status: "not_started" as const, started_at: null, completed_at: null, notes: null, gov_reference_number: null },
]
