"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"
import { Menu, Bell } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Route protection: redirect users to their correct portal
  useEffect(() => {
    if (isLoading || !user) return
    const role = user.role

    // Staff trying to access admin routes → redirect to /staff
    if (role === "pro_staff" && pathname.startsWith("/admin")) {
      router.replace("/staff")
      return
    }
    // Client trying to access admin or staff routes → redirect to /dashboard
    if (role === "client" && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
      router.replace("/dashboard")
      return
    }
    // Admin trying to access staff or client routes → redirect to /admin
    if (role === "admin" && (pathname.startsWith("/staff") || pathname.startsWith("/dashboard"))) {
      router.replace("/admin")
      return
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const role = user.role === "admin" ? "admin" : user.role === "pro_staff" ? "pro_staff" : "client"

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar role={role} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="fixed inset-y-0 left-0 z-50 flex">
            <Sidebar
              role={role}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-4 lg:px-6 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb area */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {role === "admin" ? "Admin Portal" : role === "pro_staff" ? "PRO Staff Portal" : "Client Portal"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            {/* User avatar */}
            <div className="h-8 w-8 rounded-full bg-[#1a3a6b] flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-medium">
                {user.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
