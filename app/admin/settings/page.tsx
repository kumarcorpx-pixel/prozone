"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import {
  Settings,
  User,
  Database,
  Mail,
  HardDrive,
  Bell,
  Bot,
  FileText,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Zap,
  Server,
  ExternalLink,
} from "lucide-react"

type ServiceStatus = "connected" | "configured" | "not_configured" | "error"

interface IntegrationData {
  database: { status: ServiceStatus; info: string }
  minio: { status: ServiceStatus; endpoint: string; port: string; accessKey: string; secretKey: string }
  smtp: { status: ServiceStatus; host: string; port: string; username: string; password: string }
  ntfy: { status: ServiceStatus; url: string; username: string; password: string }
  ollama: { status: ServiceStatus; url: string; model: string }
  zoho: { status: ServiceStatus; clientId: string; orgId: string; hasRefreshToken: boolean }
  google: { status: ServiceStatus; hasClientId: boolean }
  whatsapp: { status: ServiceStatus; phoneNumberId: string; accessToken: string }
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config = {
    connected: { label: "Connected", bg: "bg-green-100 text-green-800", icon: CheckCircle2 },
    configured: { label: "Configured", bg: "bg-green-100 text-green-800", icon: CheckCircle2 },
    not_configured: { label: "Not Configured", bg: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
    error: { label: "Error", bg: "bg-red-100 text-red-800", icon: XCircle },
  }
  const c = config[status]
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  )
}

function ConfigField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono">
        {value || <span className="text-gray-400 font-sans italic">Not set</span>}
      </div>
    </div>
  )
}

function TestButton({
  label,
  onClick,
  loading,
}: {
  label: string
  onClick: () => void
  loading: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1a3a6b] bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-lg hover:bg-[#1a3a6b]/10 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
      {label}
    </button>
  )
}

function CollapsiblePanel({
  title,
  icon: Icon,
  status,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  status: ServiceStatus
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-[#1a3a6b]" />
          <span className="font-semibold text-[#1a3a6b]">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.full_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [integrations, setIntegrations] = useState<IntegrationData | null>(null)
  const [loadingTest, setLoadingTest] = useState<string | null>(null)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { toast.error("Both passwords required"); return }
    if (newPw.length < 8) { toast.error("New password must be at least 8 characters"); return }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (res.ok) { toast.success("Password changed"); setCurrentPw(""); setNewPw("") }
      else toast.error(data.error || "Failed to change password")
    } catch { toast.error("Failed to change password") }
  }

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/integrations")
      if (res.ok) {
        setIntegrations(await res.json())
      }
    } catch {
      toast.error("Failed to load integration status")
    }
  }, [])

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  useEffect(() => {
    if (user) {
      setName(user.full_name || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const testConnection = async (service: string) => {
    setLoadingTest(service)
    try {
      let res: Response
      switch (service) {
        case "smtp":
          res = await fetch("/api/emails/test", { method: "POST" })
          break
        case "minio":
          res = await fetch("/api/health?check=minio", { method: "POST" })
          break
        case "ntfy":
          res = await fetch("/api/notifications/test", { method: "POST" })
          break
        case "ollama":
          res = await fetch("/api/chat/quick", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Hello, are you working?" }),
          })
          break
        case "zoho":
          res = await fetch("/api/invoices")
          break
        default:
          return
      }
      if (res.ok) {
        toast.success(`${service.toUpperCase()} connection successful`)
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(`${service.toUpperCase()} test failed: ${data.error || res.statusText}`)
      }
    } catch (err) {
      toast.error(`${service.toUpperCase()} test failed: Connection error`)
    } finally {
      setLoadingTest(null)
    }
  }

  const integrationGrid = [
    { name: "PostgreSQL", icon: Database, status: "connected" as ServiceStatus },
    { name: "MinIO Storage", icon: HardDrive, status: integrations?.minio.status || "not_configured" },
    { name: "SMTP Email", icon: Mail, status: integrations?.smtp.status || "not_configured" },
    { name: "Ntfy Push", icon: Bell, status: integrations?.ntfy.status || "not_configured" },
    { name: "Ollama AI", icon: Bot, status: integrations?.ollama.status || "not_configured" },
    { name: "Google Calendar", icon: Calendar, status: integrations?.google.status || "not_configured" },
    { name: "Zoho Invoice", icon: FileText, status: integrations?.zoho.status || "not_configured" },
    { name: "WhatsApp", icon: MessageSquare, status: integrations?.whatsapp.status || "not_configured" },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Admin Settings</h1>
        <p className="text-sm text-gray-500 mt-1">System configuration and integration management</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <User className="h-5 w-5" />
          Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          <button className="px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors">
            Save Changes
          </button>
          {/* Change Password */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Change Password</h4>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <input type="password" placeholder="New password (min 8 chars)" value={newPw} onChange={e => setNewPw(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <button onClick={handleChangePassword} className="px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status Dashboard */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5" />
          Integration Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {integrationGrid.map((item) => {
            const Icon = item.icon
            const isOk = item.status === "connected" || item.status === "configured"
            return (
              <div
                key={item.name}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${
                  isOk ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isOk ? "text-green-600" : "text-yellow-600"}`} />
                <span className="text-xs font-medium text-gray-700 text-center">{item.name}</span>
                <span className={`text-[10px] font-medium ${isOk ? "text-green-600" : "text-yellow-600"}`}>
                  {isOk ? "Connected" : "Not Configured"}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Service Configuration Panels */}
      <div>
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-3">
          <Server className="h-5 w-5" />
          Service Configuration
        </h3>
        <div className="space-y-3">
          {/* SMTP Email */}
          <CollapsiblePanel
            title="SMTP Email"
            icon={Mail}
            status={integrations?.smtp.status || "not_configured"}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ConfigField label="Host" value={integrations?.smtp.host || ""} />
              <ConfigField label="Port" value={integrations?.smtp.port || ""} />
              <ConfigField label="Username" value={integrations?.smtp.username || ""} />
              <ConfigField label="Password" value={integrations?.smtp.password || ""} />
            </div>
            <TestButton label="Test Connection" onClick={() => testConnection("smtp")} loading={loadingTest === "smtp"} />
          </CollapsiblePanel>

          {/* MinIO Storage */}
          <CollapsiblePanel
            title="MinIO Storage"
            icon={HardDrive}
            status={integrations?.minio.status || "not_configured"}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ConfigField label="Endpoint" value={integrations?.minio.endpoint || ""} />
              <ConfigField label="Port" value={integrations?.minio.port || ""} />
              <ConfigField label="Access Key" value={integrations?.minio.accessKey || ""} />
              <ConfigField label="Secret Key" value={integrations?.minio.secretKey || ""} />
            </div>
            <TestButton label="Test Connection" onClick={() => testConnection("minio")} loading={loadingTest === "minio"} />
          </CollapsiblePanel>

          {/* Ntfy Notifications */}
          <CollapsiblePanel
            title="Ntfy Push Notifications"
            icon={Bell}
            status={integrations?.ntfy.status || "not_configured"}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ConfigField label="Server URL" value={integrations?.ntfy.url || ""} />
              <ConfigField label="Username" value={integrations?.ntfy.username || ""} />
              <ConfigField label="Password" value={integrations?.ntfy.password || ""} />
            </div>
            <TestButton label="Test Connection" onClick={() => testConnection("ntfy")} loading={loadingTest === "ntfy"} />
          </CollapsiblePanel>

          {/* Ollama AI */}
          <CollapsiblePanel
            title="Ollama AI Chat"
            icon={Bot}
            status={integrations?.ollama.status || "not_configured"}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ConfigField label="URL" value={integrations?.ollama.url || ""} />
              <ConfigField label="Model" value={integrations?.ollama.model || ""} />
            </div>
            <TestButton label="Test Connection" onClick={() => testConnection("ollama")} loading={loadingTest === "ollama"} />
          </CollapsiblePanel>

          {/* Zoho Invoice */}
          <CollapsiblePanel
            title="Zoho Invoice"
            icon={FileText}
            status={integrations?.zoho.status || "not_configured"}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ConfigField label="Client ID" value={integrations?.zoho.clientId || ""} />
              <ConfigField label="Org ID" value={integrations?.zoho.orgId || ""} />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Refresh Token</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  {integrations?.zoho.hasRefreshToken ? (
                    <span className="text-green-600 font-medium">Present</span>
                  ) : (
                    <span className="text-yellow-600 italic">Not set</span>
                  )}
                </div>
              </div>
            </div>
            <TestButton label="Test Connection" onClick={() => testConnection("zoho")} loading={loadingTest === "zoho"} />
          </CollapsiblePanel>

          {/* Google Calendar */}
          <CollapsiblePanel
            title="Google Calendar"
            icon={Calendar}
            status={integrations?.google.status || "not_configured"}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  {integrations?.google.hasClientId ? (
                    <span className="text-green-600 font-medium">Client configured</span>
                  ) : (
                    <span className="text-yellow-600 italic">Not configured</span>
                  )}
                </div>
              </div>
              <a
                href="/api/auth/google"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1a3a6b] bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-lg hover:bg-[#1a3a6b]/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Connect Google Calendar
              </a>
            </div>
          </CollapsiblePanel>

          {/* WhatsApp */}
          <CollapsiblePanel
            title="WhatsApp"
            icon={MessageSquare}
            status={integrations?.whatsapp.status || "not_configured"}
          >
            <div className="grid grid-cols-2 gap-3">
              <ConfigField label="Phone Number ID" value={integrations?.whatsapp.phoneNumberId || ""} />
              <ConfigField label="Access Token" value={integrations?.whatsapp.accessToken || ""} />
            </div>
          </CollapsiblePanel>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <Database className="h-5 w-5" />
          System Info
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Database</span>
            <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              PostgreSQL
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Next.js</span>
            <span className="text-sm font-medium text-gray-900">16.2.1</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Prisma</span>
            <span className="text-sm font-medium text-gray-900">6.x</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Node.js</span>
            <span className="text-sm font-medium text-gray-900">{typeof window === "undefined" ? "" : "Runtime"}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Environment</span>
            <span className="text-sm font-medium text-gray-900">Production</span>
          </div>
        </div>
      </div>

      {/* DED Activities Master Data */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-[#1a3a6b]" />
          <h3 className="font-semibold text-[#1a3a6b]">DED Business Activities Master Data</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Upload the Dubai DED activity codes TSV file. This populates the searchable activities dropdown on company pages.</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#15305a]">
            <FileText className="h-4 w-4" />
            Upload TSV/CSV File
            <input type="file" className="hidden" accept=".tsv,.csv,.txt" onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const fd = new FormData()
                fd.append("file", file)
                const res = await fetch("/api/activities", { method: "POST", body: fd })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Upload failed")
                toast.success(`Imported ${data.imported} activities (${data.deduplicated} unique)`)
              } catch (err: any) { toast.error(err.message || "Upload failed") }
              e.target.value = ""
            }} />
          </label>
          <button onClick={async () => {
            try {
              const res = await fetch("/api/activities?limit=1")
              const data = await res.json()
              toast.success(`${data.total} activities currently loaded`)
            } catch { toast.error("Failed to check") }
          }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Check Count
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Expected columns: activity_name_en, activity_code, activity_category_en, activity_group_en</p>
      </div>
    </div>
  )
}
