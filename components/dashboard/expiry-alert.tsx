import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { differenceInDays, parseISO } from "date-fns"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface ExpiryItem {
  name: string
  type: string
  expiry_date: string
  entity?: string
}

interface ExpiryStatus {
  status: "expired" | "critical" | "warning" | "notice" | "valid"
  label: string
  color: string
  bg: string
  icon: LucideIcon
  days: number
}

function getExpiryStatus(date: string): ExpiryStatus {
  const days = differenceInDays(parseISO(date), new Date())
  if (days < 0)
    return {
      status: "expired",
      label: "Expired",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: AlertTriangle,
      days: Math.abs(days),
    }
  if (days <= 30)
    return {
      status: "critical",
      label: "Expiring Soon",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: AlertTriangle,
      days,
    }
  if (days <= 60)
    return {
      status: "warning",
      label: "Expiring",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: Clock,
      days,
    }
  if (days <= 90)
    return {
      status: "notice",
      label: "Upcoming",
      color: "text-orange-600",
      bg: "bg-orange-50",
      icon: Clock,
      days,
    }
  return {
    status: "valid",
    label: "Valid",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle2,
    days,
  }
}

function sortByUrgency(items: ExpiryItem[]): (ExpiryItem & { expiryStatus: ExpiryStatus })[] {
  return items
    .map((item) => ({
      ...item,
      expiryStatus: getExpiryStatus(item.expiry_date),
    }))
    .sort((a, b) => {
      const priorityOrder = { expired: 0, critical: 1, warning: 2, notice: 3, valid: 4 }
      const aPriority = priorityOrder[a.expiryStatus.status]
      const bPriority = priorityOrder[b.expiryStatus.status]
      if (aPriority !== bPriority) return aPriority - bPriority
      // Within the same priority, sort by days (fewer days first)
      return a.expiryStatus.days - b.expiryStatus.days
    })
}

export function ExpiryAlertList({ items }: { items: ExpiryItem[] }) {
  const sorted = sortByUrgency(items)

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No expiry alerts to display.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((item, index) => {
        const { expiryStatus } = item
        const Icon = expiryStatus.icon

        return (
          <div
            key={`${item.name}-${item.expiry_date}-${index}`}
            className={`flex items-center gap-3 p-3 rounded-lg ${expiryStatus.bg}`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${expiryStatus.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/60 text-gray-700">
                  {item.type}
                </span>
              </div>
              {item.entity && (
                <p className="text-xs text-gray-500 truncate">{item.entity}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-medium ${expiryStatus.color}`}>
                {expiryStatus.status === "expired"
                  ? `${expiryStatus.days}d ago`
                  : `${expiryStatus.days}d left`}
              </p>
              <p className={`text-xs ${expiryStatus.color}`}>{expiryStatus.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ExpiryAlertWidget({
  items,
  viewAllHref = "/dashboard/documents",
}: {
  items: ExpiryItem[]
  viewAllHref?: string
}) {
  const sorted = sortByUrgency(items)

  const counts = sorted.reduce(
    (acc, item) => {
      const { status } = item.expiryStatus
      if (status === "expired") acc.expired++
      else if (status === "critical") acc.critical++
      else if (status === "warning") acc.warning++
      return acc
    },
    { expired: 0, critical: 0, warning: 0 }
  )

  const totalAlerts = counts.expired + counts.critical + counts.warning

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Expiry Alerts</h3>
        {totalAlerts > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {totalAlerts}
          </span>
        )}
      </div>

      {totalAlerts === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm">All documents are valid</p>
        </div>
      ) : (
        <div className="space-y-3">
          {counts.expired > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600">
                  {counts.expired} Expired
                </p>
                <p className="text-xs text-gray-500">Requires immediate action</p>
              </div>
            </div>
          )}
          {counts.critical > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-500">
                  {counts.critical} Expiring Soon
                </p>
                <p className="text-xs text-gray-500">Within 30 days</p>
              </div>
            </div>
          )}
          {counts.warning > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  {counts.warning} Expiring
                </p>
                <p className="text-xs text-gray-500">Within 60 days</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Link
        href={viewAllHref}
        className="block mt-4 text-center text-sm font-medium text-[#1a3a6b] hover:text-[#15305a] transition-colors"
      >
        View All
      </Link>
    </div>
  )
}
