"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Building2,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserCheck,
  UserCog,
  CalendarCheck,
  Activity,
  Bell,
  CreditCard,
  Receipt,
  BarChart3,
  ScrollText,
  MessageSquare,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { YabsLogo } from "@/components/marketing/yabs-logo"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const clientLinks: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Services & Requests", href: "/dashboard/requests", icon: FileText },
  { label: "My Documents", href: "/dashboard/documents", icon: FolderOpen },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "My Company", href: "/dashboard/company", icon: Building2 },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

const adminLinks: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Employees", href: "/admin/employees", icon: UserCheck },
  { label: "Requests", href: "/admin/requests", icon: FileText },
  { label: "Documents", href: "/admin/documents", icon: FolderOpen },
  { label: "Expiry Calendar", href: "/admin/expiry-calendar", icon: CalendarDays },
  { label: "Staff", href: "/admin/staff", icon: UserCog },
  { label: "Invoicing", href: "/admin/invoices", icon: Receipt },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const staffLinks: NavItem[] = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
  { label: "My Schedule", href: "/staff/schedule", icon: CalendarCheck },
  { label: "My Requests", href: "/staff/requests", icon: FileText },
  { label: "Companies", href: "/staff/companies", icon: Building2 },
  { label: "Documents", href: "/staff/documents", icon: FolderOpen },
  { label: "Activity Log", href: "/staff/activity", icon: Activity },
  { label: "Notifications", href: "/staff/notifications", icon: Bell },
  { label: "Settings", href: "/staff/settings", icon: Settings },
]

interface SidebarProps {
  role: "client" | "admin" | "pro_staff"
  onClose?: () => void
  mobile?: boolean
  autoCollapse?: boolean
}

export function Sidebar({ role, onClose, mobile = false, autoCollapse = false }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const links = role === "admin" ? adminLinks : role === "pro_staff" ? staffLinks : clientLinks

  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (mobile) return
    const saved = localStorage.getItem("sidebarCollapsed")
    if (saved === "true") setCollapsed(true)

    // Auto-collapse on screens < 1440px (13" laptops)
    if (autoCollapse) {
      const mq = window.matchMedia("(max-width: 1440px)")
      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches && localStorage.getItem("sidebarCollapsed") !== "false") {
          setCollapsed(true)
        }
      }
      handler(mq)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [mobile, autoCollapse])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("sidebarCollapsed", String(next))
  }

  function isActive(href: string): boolean {
    if (role === "admin" && href === "/admin") return pathname === "/admin"
    if (role === "client" && href === "/dashboard") return pathname === "/dashboard"
    if (role === "pro_staff" && href === "/staff") return pathname === "/staff"
    return pathname.startsWith(href) && href !== "/dashboard" && href !== "/admin" && href !== "/staff"
  }

  const sidebarWidth = mobile ? "w-72" : collapsed ? "w-[68px]" : "w-64"
  const isDark = role === "client"

  return (
    <aside className={`flex flex-col h-full relative transition-all duration-200 ease-in-out ${sidebarWidth} ${isDark ? "bg-[#0f2340] text-white" : "bg-white border-r border-gray-200"}`}>
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c9a96e] via-[#dfc08a] to-[#c9a96e]" />

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-5 ${isDark ? "border-b border-white/10" : "border-b border-gray-100/80 bg-gradient-to-b from-gray-50/50 to-white"}`}>
        <Link href={role === "admin" ? "/admin" : role === "pro_staff" ? "/staff" : "/dashboard"} prefetch={false} className="flex items-center overflow-hidden">
          {collapsed && !mobile ? (
            <div className={`h-8 w-8 rounded-lg ${isDark ? "bg-white" : "bg-gray-50"} flex items-center justify-center overflow-hidden`}>
              <img src="/images/yabs-logo.gif" alt="YABS" className="h-7 w-auto" />
            </div>
          ) : (
            <div className={`${isDark ? "bg-white" : "bg-white"} rounded-lg px-2 py-1`}>
              <img src="/images/yabs-logo.gif" alt="YABS PRO Services" className="h-8 w-auto" />
            </div>
          )}
        </Link>
        {mobile && onClose && (
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={mobile ? onClose : undefined}
              title={collapsed && !mobile ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                collapsed && !mobile ? "px-2.5 py-2.5 justify-center" : "px-3 py-2.5"
              } ${
                active
                  ? isDark ? "bg-[#D4A843]/20 text-[#D4A843]" : "bg-[#1a3a6b] text-white shadow-sm"
                  : isDark ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? isDark ? "text-[#D4A843]" : "text-white" : isDark ? "text-gray-500" : "text-gray-400"}`} />
              {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!mobile && (
        <button
          onClick={toggleCollapse}
          className={`mx-2 mb-2 flex items-center justify-center gap-2 p-2 rounded-lg text-xs transition-colors ${isDark ? "text-gray-500 hover:text-gray-300 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> <span>Collapse</span></>}
        </button>
      )}

      {/* User info at bottom */}
      <div className={`px-3 py-4 ${isDark ? "border-t border-white/10" : "border-t border-gray-100 bg-gradient-to-t from-gray-50/60 to-transparent"}`}>
        <div className={`flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <div className="h-9 w-9 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {user?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
            </span>
          </div>
          {(!collapsed || mobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{user?.full_name || "User"}</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                  role === "admin" ? "bg-purple-100 text-purple-700"
                  : role === "pro_staff" ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
                }`}>
                  {role === "pro_staff" ? "PRO Staff" : role}
                </span>
              </div>
              <button onClick={logout} className={`p-1.5 rounded-md transition-colors ${isDark ? "text-gray-500 hover:text-red-400 hover:bg-white/5" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`} title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
