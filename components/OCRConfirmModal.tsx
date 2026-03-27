"use client"

import { useState } from "react"
import { X, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp, ScanLine } from "lucide-react"

interface FieldData {
  value: string | null
  confidence: "high" | "low" | null
}

interface OCRConfirmModalProps {
  isOpen: boolean
  documentType: string
  extractedData: Record<string, FieldData> | null
  rawText: string
  onConfirm: (data: Record<string, string>) => void
  onSkip: () => void
}

const typeLabels: Record<string, string> = {
  "trade-license": "Trade License",
  passport: "Passport",
  "emirates-id": "Emirates ID",
  visa: "Visa",
  unknown: "Document",
}

const fieldLabels: Record<string, string> = {
  companyName: "Company Name",
  licenseNumber: "License Number",
  expiryDate: "Expiry Date",
  issueDate: "Issue Date",
  emirate: "Emirate",
  activity: "Business Activity",
  legalForm: "Legal Form",
  fullName: "Full Name",
  passportNumber: "Passport Number",
  nationality: "Nationality",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  idNumber: "Emirates ID Number",
  visaNumber: "Visa Number",
  visaType: "Visa Type",
  sponsor: "Sponsor",
  uid: "UID",
}

function ConfidenceDot({ confidence }: { confidence: "high" | "low" | null }) {
  if (confidence === "high") return <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /><span className="text-[10px] text-green-600">Detected</span></div>
  if (confidence === "low") return <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /><span className="text-[10px] text-yellow-600">Please verify</span></div>
  return <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /><span className="text-[10px] text-red-500">Not found</span></div>
}

export function OCRConfirmModal({ isOpen, documentType, extractedData, rawText, onConfirm, onSkip }: OCRConfirmModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    if (extractedData) {
      for (const [k, v] of Object.entries(extractedData)) {
        init[k] = v.value || ""
      }
    }
    return init
  })
  const [showRaw, setShowRaw] = useState(false)

  if (!isOpen || !extractedData) return null

  const handleConfirm = () => {
    const cleaned: Record<string, string> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) cleaned[k] = v.trim()
    }
    onConfirm(cleaned)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onSkip} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <ScanLine className="h-5 w-5 text-[#1a3a6b]" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Extracted Document Information</h2>
              <p className="text-xs text-gray-500">Verify and correct if needed</p>
            </div>
          </div>
          <button onClick={onSkip} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {typeLabels[documentType] || documentType}
          </span>

          <div className="space-y-3">
            {Object.entries(extractedData).map(([key, field]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">{fieldLabels[key] || key}</label>
                  <ConfidenceDot confidence={field.confidence} />
                </div>
                <input
                  value={values[key] || ""}
                  onChange={e => setValues({ ...values, [key]: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${!field.value ? "border-yellow-300 bg-yellow-50" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20`}
                  placeholder={`Enter ${fieldLabels[key] || key}`}
                />
              </div>
            ))}
          </div>

          <div>
            <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
              {showRaw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              View Raw Text
            </button>
            {showRaw && (
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono max-h-[200px] overflow-auto whitespace-pre-wrap">{rawText}</pre>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onSkip} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Skip</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a]">Confirm & Save</button>
        </div>
      </div>
    </div>
  )
}
