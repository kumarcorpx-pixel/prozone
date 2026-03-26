"use client"

import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react"

interface ComplianceScoreProps {
  company: any
  employees: any[]
  documents: any[]
}

function getExpiryStatus(dateStr: string | null | undefined): "valid" | "expiring" | "expired" | "not_set" {
  if (!dateStr) return "not_set"
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "expired"
  if (diffDays <= 30) return "expiring"
  return "valid"
}

function StatusIcon({ status }: { status: "valid" | "expiring" | "expired" | "not_set" }) {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
    case "expiring":
      return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
    case "expired":
      return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
    case "not_set":
      return <MinusCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
  }
}

function statusLabel(status: "valid" | "expiring" | "expired" | "not_set", context?: string): string {
  switch (status) {
    case "valid":
      return "Valid"
    case "expiring":
      return "Expiring Soon"
    case "expired":
      return "Expired"
    case "not_set":
      return context || "Not Set"
  }
}

export function ComplianceScore({ company, employees, documents }: ComplianceScoreProps) {
  // Calculate each checklist item
  const tradeLicenseStatus = getExpiryStatus(company.license_expiry)
  const establishmentCardStatus = company.establishment_card_expiry
    ? getExpiryStatus(company.establishment_card_expiry)
    : "not_set"
  const ejariStatus = company.ejari_tawtheeq_expiry
    ? getExpiryStatus(company.ejari_tawtheeq_expiry)
    : "not_set"

  // Employee visa stats
  const visaExpired = employees.filter(
    (e) => e.visa_expiry && getExpiryStatus(e.visa_expiry) === "expired"
  ).length
  const visaExpiring = employees.filter(
    (e) => e.visa_expiry && getExpiryStatus(e.visa_expiry) === "expiring"
  ).length
  const visaStatus: "valid" | "expiring" | "expired" =
    visaExpired > 0 ? "expired" : visaExpiring > 0 ? "expiring" : "valid"

  // EID stats
  const eidExpired = employees.filter(
    (e) => e.emirates_id_expiry && getExpiryStatus(e.emirates_id_expiry) === "expired"
  ).length
  const eidExpiring = employees.filter(
    (e) => e.emirates_id_expiry && getExpiryStatus(e.emirates_id_expiry) === "expiring"
  ).length
  const eidStatus: "valid" | "expiring" | "expired" =
    eidExpired > 0 ? "expired" : eidExpiring > 0 ? "expiring" : "valid"

  // Labor card stats
  const lcExpired = employees.filter(
    (e) => e.labor_card_expiry && getExpiryStatus(e.labor_card_expiry) === "expired"
  ).length
  const lcExpiring = employees.filter(
    (e) => e.labor_card_expiry && getExpiryStatus(e.labor_card_expiry) === "expiring"
  ).length
  const lcStatus: "valid" | "expiring" | "expired" =
    lcExpired > 0 ? "expired" : lcExpiring > 0 ? "expiring" : "valid"

  // Health insurance (placeholder)
  const insuredCount = employees.length > 0 ? employees.length - 1 : 0
  const uninsured = employees.length > 0 ? 1 : 0
  const insuranceStatus: "valid" | "expired" = uninsured > 0 ? "expired" : "valid"

  // Visa quota
  const quotaTotal = company.visa_quota_total || 0
  const quotaUsed = company.visa_quota_used || 0
  const quotaPercent = quotaTotal > 0 ? Math.round((quotaUsed / quotaTotal) * 100) : 0

  // Build checklist for scoring
  const items: { label: string; status: "valid" | "expiring" | "expired" | "not_set"; detail: string }[] = [
    {
      label: "Trade License",
      status: tradeLicenseStatus,
      detail: statusLabel(tradeLicenseStatus),
    },
    {
      label: "Establishment Card",
      status: establishmentCardStatus,
      detail: statusLabel(establishmentCardStatus, "Not Set"),
    },
    {
      label: "Ejari/Tawtheeq",
      status: ejariStatus,
      detail: statusLabel(ejariStatus, "Not Set"),
    },
    {
      label: "Employee Visas",
      status: visaStatus,
      detail:
        visaStatus === "valid"
          ? "All Valid"
          : visaExpired > 0
          ? `${visaExpired} expired`
          : `${visaExpiring} expiring`,
    },
    {
      label: "Emirates IDs",
      status: eidStatus,
      detail:
        eidStatus === "valid"
          ? "All Valid"
          : eidExpired > 0
          ? `${eidExpired} expired`
          : `${eidExpiring} expiring`,
    },
    {
      label: "Labor Cards",
      status: lcStatus,
      detail:
        lcStatus === "valid"
          ? "All Valid"
          : lcExpired > 0
          ? `${lcExpired} expired`
          : `${lcExpiring} expiring`,
    },
    {
      label: "Health Insurance",
      status: insuranceStatus,
      detail: insuranceStatus === "valid" ? "All Covered" : `${uninsured} missing`,
    },
  ]

  const greenCount = items.filter((i) => i.status === "valid").length
  const overallScore = items.length > 0 ? Math.round((greenCount / items.length) * 100) : 0
  const scoreColor =
    overallScore > 80 ? "text-green-600" : overallScore >= 60 ? "text-yellow-600" : "text-red-600"
  const ringStrokeColor =
    overallScore > 80 ? "stroke-green-500" : overallScore >= 60 ? "stroke-yellow-500" : "stroke-red-500"

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (overallScore / 100) * circumference

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular progress */}
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 flex flex-col items-center justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className={ringStrokeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>{overallScore}%</span>
              <span className="text-xs text-gray-500">Compliance</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {greenCount} of {items.length} items compliant
          </p>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2 bg-white rounded-xl ring-1 ring-gray-200 p-6">
          <h3 className="font-semibold text-[#1a3a6b] mb-4">Compliance Checklist</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusIcon status={item.status} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    item.status === "valid"
                      ? "text-green-600"
                      : item.status === "expiring"
                      ? "text-yellow-600"
                      : item.status === "expired"
                      ? "text-red-600"
                      : "text-gray-400"
                  }`}
                >
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visa Quota section */}
      {quotaTotal > 0 && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
          <h3 className="font-semibold text-[#1a3a6b] mb-4">Visa Quota</h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              Used {quotaUsed} of {quotaTotal} ({quotaTotal - quotaUsed} remaining)
            </span>
            <span className="font-medium text-gray-900">{quotaPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                quotaPercent > 90
                  ? "bg-red-500"
                  : quotaPercent > 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
