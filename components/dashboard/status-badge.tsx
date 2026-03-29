const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  assigned: { label: "Assigned", className: "bg-indigo-100 text-indigo-800" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800" },
  under_review: { label: "Under Review", className: "bg-purple-100 text-purple-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  active: { label: "Active", className: "bg-green-100 text-green-800" },
  expired: { label: "Expired", className: "bg-red-100 text-red-800" },
  expiring_soon: { label: "Expiring Soon", className: "bg-yellow-100 text-yellow-800" },
  valid: { label: "Valid", className: "bg-green-100 text-green-800" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
  paid: { label: "Paid", className: "bg-green-100 text-green-800" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", className: "bg-orange-100 text-orange-800" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
