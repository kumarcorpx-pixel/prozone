"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronUp, ScanLine } from "lucide-react"

interface ExtractedField {
  value: string | null
  confidence: "high" | "low" | null
}

interface OCRConfirmModalProps {
  isOpen: boolean
  documentType: "Trade License" | "Passport" | "Emirates ID" | "Visa"
  extractedData: Record<string, ExtractedField>
  rawText: string
  onConfirm: (data: Record<string, string>) => void
  onSkip: () => void
}

const documentTypeBadgeStyles: Record<string, string> = {
  "Trade License": "bg-blue-100 text-blue-800",
  Passport: "bg-purple-100 text-purple-800",
  "Emirates ID": "bg-emerald-100 text-emerald-800",
  Visa: "bg-amber-100 text-amber-800",
}

function ConfidenceDot({ confidence }: { confidence: "high" | "low" | null }) {
  if (confidence === "high") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
        <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
        Detected
      </span>
    )
  }
  if (confidence === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-yellow-600">
        <span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
        Please verify
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-red-500">
      <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
      Not found
    </span>
  )
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

export function OCRConfirmModal({
  isOpen,
  documentType,
  extractedData,
  rawText,
  onConfirm,
  onSkip,
}: OCRConfirmModalProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const [key, field] of Object.entries(extractedData)) {
      initial[key] = field.value ?? ""
    }
    return initial
  })
  const [rawTextOpen, setRawTextOpen] = useState(false)

  if (!isOpen) return null

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleConfirm = () => {
    const cleaned: Record<string, string> = {}
    for (const [key, value] of Object.entries(formValues)) {
      if (value.trim()) cleaned[key] = value.trim()
    }
    onConfirm(cleaned)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onSkip}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[600px] max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-[#1a3a6b]/10 shrink-0">
              <ScanLine className="h-5 w-5 text-[#1a3a6b]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Extracted Document Information
              </h2>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${documentTypeBadgeStyles[documentType] ?? "bg-gray-100 text-gray-700"}`}
              >
                {documentType}
              </span>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {Object.entries(extractedData).map(([key, field]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`ocr-field-${key}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {formatLabel(key)}
                </label>
                <ConfidenceDot confidence={field.confidence} />
              </div>
              <input
                id={`ocr-field-${key}`}
                type="text"
                value={formValues[key] ?? ""}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                placeholder={`Enter ${formatLabel(key).toLowerCase()}`}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-colors ${
                  field.value === null
                    ? "border-yellow-400 bg-yellow-50/50"
                    : "border-gray-300"
                }`}
              />
            </div>
          ))}

          {/* Collapsible Raw Text */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
            <button
              type="button"
              onClick={() => setRawTextOpen((prev) => !prev)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span>View Raw Text</span>
              {rawTextOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {rawTextOpen && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-600 bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto font-mono leading-relaxed">
                  {rawText}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  )
}
