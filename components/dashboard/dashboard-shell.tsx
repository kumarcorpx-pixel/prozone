"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "./sidebar"
import { NotificationSubscribe } from "@/components/NotificationSubscribe"
import { Menu, Bell, AlertTriangle, Info, CheckCircle, FileText, Search } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { CommandPalette } from "./command-palette"
import { Breadcrumbs } from "./breadcrumbs"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useNotifications } from "@/hooks/queries"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const { data: notifData } = useNotifications()
  const notifications = (notifData?.notifications || []).slice(0, 10)

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    } catch {}
  }

  function relativeTime(dateStr: string) {
    const now = Date.now()
    const diff = now - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  function notifIcon(type: string) {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info": return <Info className="h-4 w-4 text-blue-500" />
      default: return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  // Route protection: redirect to login if not authenticated
  useEffect(() => {
    if (isLoading) return

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/")
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

  // Determine which portal we're in based on the current path
  const portalType = pathname.startsWith("/admin") ? "admin"
    : pathname.startsWith("/staff") ? "pro_staff"
    : "client"

  // Use portalType for sidebar and header, not user role
  const sidebarRole = portalType

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar role={sidebarRole} />
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
              role={sidebarRole}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-16 px-4 lg:px-6 bg-white shadow-[0_1px_3px_0_rgb(0,0,0,0.04)] flex-shrink-0">
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
              <h1 className="text-sm font-medium text-gray-500 tracking-wide">
                {sidebarRole === "admin" ? "YABS Public Relations Management LLC" : sidebarRole === "pro_staff" ? "YABS PRO Staff" : "Corporate PRO Services"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors w-64"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-mono">Ctrl+K</kbd>
            </button>
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse-dot" />
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div role="menu" className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                      ) : notifications.map((n) => (
                        <div
                          key={n.id}
                          role="menuitem"
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!n.isRead ? "bg-blue-50/50" : ""}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{relativeTime(n.createdAt)}</p>
                            </div>
                            {!n.isRead && <span className="mt-1.5 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={pathname.startsWith("/admin") ? "/admin/messages" : pathname.startsWith("/staff") ? "/staff/notifications" : "/dashboard/notifications"}
                      prefetch={false}
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
                aria-label="Open profile menu"
                className="h-8 w-8 rounded-full bg-[#1a3a6b] flex items-center justify-center cursor-pointer hover:shadow-md active:scale-95 transition-all"
              >
                <span className="text-white text-xs font-medium">
                  {user.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
                </span>
              </button>
              {avatarOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-100 z-50 py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href={sidebarRole === "admin" ? "/admin/settings" : sidebarRole === "pro_staff" ? "/staff/settings" : "/dashboard/settings"} prefetch={false} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setAvatarOpen(false)}>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {user?.role !== "admin" && <NotificationSubscribe />}
          <Breadcrumbs />
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        basePath={sidebarRole === "admin" ? "/admin" : sidebarRole === "pro_staff" ? "/staff" : "/dashboard"}
      />
    </div>
  )
}
