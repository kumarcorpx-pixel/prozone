"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"
import { Menu, Bell } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Route protection: redirect to login if not authenticated
  useEffect(() => {
    if (isLoading) return

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/login")
      return
    }

    const role = user.role

    // Staff trying to access admin routes → redirect to /staff
    if (role === "pro_staff" && pathname.startsWith("/admin")) {
      router.replace("/staff")
      return
    }
    // Staff trying to access client dashboard → redirect to /staff
    if (role === "pro_staff" && pathname.startsWith("/dashboard")) {
      router.replace("/staff")
      return
    }
    // Client trying to access admin or staff routes → redirect to /dashboard
    if (role === "client" && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
      router.replace("/dashboard")
      return
    }
    // Admin can access all portals — no redirect
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
    // Already redirecting via useEffect above
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
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
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                      {[
                        { title: "Trade License Expiring", message: "Alba Cleaning Services - 147 days", type: "warning" },
                        { title: "New Request Submitted", message: "Company formation request received", type: "info" },
                        { title: "Document Uploaded", message: "Trade license copy uploaded", type: "success" },
                      ].map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={pathname.startsWith("/admin") ? "/admin/messages" : pathname.startsWith("/staff") ? "/staff/notifications" : "/dashboard/notifications"}
                      className="block px-4 py-3 text-center text-sm text-[#1a3a6b] font-medium border-t border-gray-100 hover:bg-gray-50 rounded-b-xl"
                      onClick={() => setNotifOpen(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                </>
              )}
            </div>
            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="h-8 w-8 rounded-full bg-[#1a3a6b] flex items-center justify-center cursor-pointer"
              >
                <span className="text-white text-xs font-medium">
                  {user.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
                </span>
              </button>
              {avatarOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 z-50 py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href={role === "admin" ? "/admin/settings" : role === "pro_staff" ? "/staff/settings" : "/dashboard/settings"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setAvatarOpen(false)}>
                      Settings
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
