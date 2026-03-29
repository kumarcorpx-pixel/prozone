"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Bell, Smartphone, X, CheckCircle2 } from "lucide-react"
import { startNotificationListener } from "@/lib/notification-listener"

export function NotificationSubscribe() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [connected, setConnected] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("ntfy_enabled")
    if (saved === "true") setEnabled(true)
    const wasDismissed = localStorage.getItem("ntfy_dismissed")
    if (wasDismissed === "true") setDismissed(true)
  }, [])

  useEffect(() => {
    if (!enabled || !user) return
    const topic = user.role === "pro_staff" ? `yabs-staff-${user.id}` : `yabs-${user.id}`
    const cleanup = startNotificationListener(topic, undefined, setConnected)
    return cleanup
  }, [enabled, user])

  const enableBrowser = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        localStorage.setItem("ntfy_enabled", "true")
        setEnabled(true)
        new Notification("YABS Notifications Enabled", {
          body: "You'll receive alerts about your requests and documents.",
          icon: "/favicon.ico",
        })
      }
    }
  }

  const dismiss = () => {
    localStorage.setItem("ntfy_dismissed", "true")
    setDismissed(true)
  }

  if (enabled) {
    // Don't show "Connecting..." banner if ntfy isn't configured
    if (!connected) return null
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Notifications: ON
      </div>
    )
  }

  if (dismissed) return null

  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-[#1a3a6b]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Enable Push Notifications</h3>
            <p className="text-sm text-gray-500 mt-0.5">Get instant alerts when your requests are updated, documents are ready, or licenses are expiring.</p>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button onClick={enableBrowser} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]">
          <Bell className="h-4 w-4" /> Enable Browser Notifications
        </button>
        <button onClick={() => setShowInstructions(!showInstructions)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
          <Smartphone className="h-4 w-4" /> Get Mobile App
        </button>
        <button onClick={dismiss} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Later</button>
      </div>

      {showInstructions && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-3">
          <p className="font-medium text-gray-900">Setup Mobile Notifications:</p>
          <div className="flex gap-3">
            <a href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg">Android</a>
            <a href="https://apps.apple.com/app/ntfy/id1625396347" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg">iPhone</a>
          </div>
          <ol className="list-decimal list-inside text-gray-600 space-y-1">
            <li>Download the Ntfy app</li>
            <li>Open the app, tap "+" to add subscription</li>
            <li>Set server to: <code className="bg-white px-1 rounded">https://notify.corporatepro.cloud</code></li>
            <li>Set topic to: <code className="bg-white px-1 rounded">yabs-{user?.id?.substring(0, 8)}</code></li>
            <li>Done! You'll receive notifications automatically.</li>
          </ol>
        </div>
      )}
    </div>
  )
}
