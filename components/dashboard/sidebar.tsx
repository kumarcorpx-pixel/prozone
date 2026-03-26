"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  Search,
  FileText,
  FolderOpen,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  CalendarDays,
  UserCheck,
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
  { label: "Tracking", href: "/dashboard/tracking", icon: Search },
  { label: "Requests", href: "/dashboard/requests", icon: FileText },
  { label: "Documents", href: "/dashboard/documents", icon: FolderOpen },
]

const adminLinks: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Employees", href: "/admin/employees", icon: UserCheck },
  { label: "Requests", href: "/admin/requests", icon: FileText },
  { label: "Documents", href: "/admin/documents", icon: FolderOpen },
  { label: "Expiry Calendar", href: "/admin/expiry-calendar", icon: CalendarDays },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const staffLinks: NavItem[] = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
  { label: "My Requests", href: "/staff/requests", icon: FileText },
  { label: "Documents", href: "/staff/documents", icon: FolderOpen },
]

interface SidebarProps {
  role: "client" | "admin" | "pro_staff"
  onClose?: () => void
  mobile?: boolean
}

export function Sidebar({ role, onClose, mobile = false }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const links = role === "admin" ? adminLinks : role === "pro_staff" ? staffLinks : clientLinks

  function isActive(href: string): boolean {
    if (role === "admin" && href === "/admin") {
      return pathname === "/admin"
    }
    if (role === "client" && href === "/dashboard") {
      return pathname === "/dashboard"
    }
    if (role === "pro_staff" && href === "/staff") {
      return pathname === "/staff"
    }
    return pathname.startsWith(href) && href !== "/dashboard" && href !== "/admin" && href !== "/staff"
  }

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-gray-200 ${
        mobile ? "w-72" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <Link href={role === "admin" ? "/admin" : role === "pro_staff" ? "/staff" : "/dashboard"} className="flex items-center">
          <YabsLogo variant="compact" className="h-8 w-auto" />
        </Link>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobile ? onClose : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1a3a6b] text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-white" : "text-gray-400"}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="h-9 w-9 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {user?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || "User"}
            </p>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : role === "pro_staff"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {role === "pro_staff" ? "PRO Staff" : role}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
