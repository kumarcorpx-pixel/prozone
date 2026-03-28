"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

const pathLabels: Record<string, string> = {
  admin: "Admin",
  staff: "Staff",
  dashboard: "Dashboard",
  companies: "Companies",
  employees: "Employees",
  documents: "Documents",
  requests: "Requests",
  invoices: "Invoicing",
  reports: "Reports",
  settings: "Settings",
  clients: "Clients",
  messages: "Messages",
  notifications: "Notifications",
  payments: "Payments",
  company: "My Company",
  tracking: "Track Progress",
  schedule: "My Schedule",
  activity: "Activity Log",
  "audit-log": "Audit Log",
  "expiry-calendar": "Expiry Calendar",
  consultation: "Consultation",
  privacy: "Privacy Policy",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Don't show on root dashboard pages
  if (segments.length <= 1) return null

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isLast = index === segments.length - 1
    const label = pathLabels[segment] || (segment.length > 20 ? segment.slice(0, 20) + "..." : segment)

    return { label, href, isLast }
  })

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 overflow-x-auto">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5 whitespace-nowrap">
          {i > 0 && <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
          {crumb.isLast ? (
            <span className="font-medium text-gray-700">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-[#1a3a6b] transition-colors">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}
