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
    <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${className || ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="h-9 w-9 rounded-xl bg-[#1a3a6b]/5 flex items-center justify-center">
          <Icon className="h-[18px] w-[18px] text-[#1a3a6b]" />
        </div>
      </div>
      <p className="text-[28px] font-bold mt-2 text-[#1a3a6b] tracking-tight">{value}</p>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      {trend && (
        <p className={`text-xs mt-1 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
          {trend.positive ? "\u2191" : "\u2193"} {Math.abs(trend.value)}% from last month
        </p>
      )}
    </div>
  )
}
