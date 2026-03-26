import { type LucideIcon } from "lucide-react"
import { type ComponentType } from "react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon | ComponentType<{ className?: string }>
  description?: string
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 ring-1 ring-gray-200 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-2xl font-bold mt-2 text-[#1a3a6b]">{value}</p>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      {trend && (
        <p className={`text-xs mt-1 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
          {trend.positive ? "\u2191" : "\u2193"} {Math.abs(trend.value)}% from last month
        </p>
      )}
    </div>
  )
}
