"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3, FileText, Bell, Users, CalendarDays, Lock,
  Building2, ShieldCheck, Clock, Upload, CheckCircle2,
} from "lucide-react"

const features = [
  {
    id: "dashboard",
    icon: BarChart3,
    title: "Real-time Dashboard",
    content: <DashboardMock />,
  },
  {
    id: "documents",
    icon: FileText,
    title: "Document Management",
    content: <DocumentsMock />,
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Smart Notifications",
    content: <NotificationsMock />,
  },
  {
    id: "employees",
    icon: Users,
    title: "Employee Tracking",
    content: <EmployeesMock />,
  },
  {
    id: "calendar",
    icon: CalendarDays,
    title: "Expiry Calendar",
    content: <CalendarMock />,
  },
  {
    id: "portal",
    icon: Lock,
    title: "Secure Client Portal",
    content: <PortalMock />,
  },
]

function DashboardMock() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Requests", value: "24", change: "+12%", color: "text-green-600" },
          { label: "Pending Approvals", value: "8", change: "-3%", color: "text-red-500" },
          { label: "Completed Today", value: "15", change: "+8%", color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-[#0f1d3a]">{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
            <div className={`text-[10px] font-medium ${s.color} mt-1`}>{s.change}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-4 h-28 flex items-end gap-1">
        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-[#1a3a6b] to-[#3b82f6] rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

function DocumentsMock() {
  const docs = [
    { name: "Trade License.pdf", type: "PDF", size: "2.4 MB", status: "Valid" },
    { name: "Visa Copy.pdf", type: "PDF", size: "1.1 MB", status: "Expiring" },
    { name: "Emirates ID.jpg", type: "IMG", size: "850 KB", status: "Valid" },
  ]
  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc.name} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold">
            {doc.type}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">{doc.name}</div>
            <div className="text-[10px] text-gray-400">{doc.size}</div>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${doc.status === "Valid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
            {doc.status}
          </span>
        </div>
      ))}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
        <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
        <div className="text-xs text-gray-400">Drop files here to upload</div>
      </div>
    </div>
  )
}

function NotificationsMock() {
  const notifs = [
    { msg: "Visa application approved for Ahmed K.", time: "2 min ago", type: "success" },
    { msg: "Trade license expiring in 15 days", time: "1 hour ago", type: "warning" },
    { msg: "New document uploaded by Gulf Trading", time: "3 hours ago", type: "info" },
    { msg: "Payment received - Invoice #1042", time: "5 hours ago", type: "success" },
  ]
  return (
    <div className="space-y-2">
      {notifs.map((n, i) => (
        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`} />
          <div className="flex-1">
            <div className="text-sm text-gray-700">{n.msg}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmployeesMock() {
  const employees = [
    { name: "Ahmed Khan", visa: "Valid", expiry: "Dec 2026", dept: "Engineering" },
    { name: "Sara Ali", visa: "Expiring", expiry: "Apr 2026", dept: "Marketing" },
    { name: "John Smith", visa: "Processing", expiry: "—", dept: "Operations" },
  ]
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider grid grid-cols-4">
        <span>Employee</span>
        <span>Department</span>
        <span>Visa Status</span>
        <span>Expiry</span>
      </div>
      {employees.map((emp) => (
        <div key={emp.name} className="px-3 py-3 border-t border-gray-50 grid grid-cols-4 items-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center text-[9px] font-bold">
              {emp.name.split(" ").map(n => n[0]).join("")}
            </div>
            <span className="font-medium text-gray-700">{emp.name}</span>
          </div>
          <span className="text-gray-500">{emp.dept}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${emp.visa === "Valid" ? "bg-green-50 text-green-700" : emp.visa === "Expiring" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>
            {emp.visa}
          </span>
          <span className="text-gray-500">{emp.expiry}</span>
        </div>
      ))}
    </div>
  )
}

function CalendarMock() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const expiryDays = [7, 14, 22, 28]
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">April 2026</span>
        <div className="flex gap-1">
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-red-400" /> Expiry</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-500 ml-2"><span className="w-2 h-2 rounded-full bg-blue-400" /> Renewal</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {/* Empty cells for offset */}
        {[0, 0, 0].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={`py-1.5 rounded-lg ${expiryDays.includes(day) ? "bg-red-100 text-red-700 font-bold" : day === 15 ? "bg-blue-100 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}

function PortalMock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
        <Building2 className="h-4 w-4 text-[#1a3a6b]" />
        <select className="bg-transparent text-sm font-medium text-gray-700 border-none outline-none flex-1 cursor-pointer">
          <option>Gulf Trading LLC</option>
          <option>Horizon Properties</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Active Visas", value: "12", icon: CheckCircle2, color: "text-green-600" },
          { label: "Pending Docs", value: "3", icon: Clock, color: "text-yellow-600" },
          { label: "Compliance", value: "94%", icon: ShieldCheck, color: "text-blue-600" },
          { label: "Expiring Soon", value: "2", icon: Bell, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3">
            <s.icon className={`h-4 w-4 ${s.color} mb-1`} />
            <div className="text-lg font-bold text-[#0f1d3a]">{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeatureShowcase() {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-[#ef4444] font-semibold">
            Platform
          </p>
          <h2 className="text-4xl font-bold text-[#0f1d3a] mt-2">
            A Platform That Puts You in Full Control
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Tab Buttons */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {features.map((feature, i) => (
              <button
                key={feature.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium whitespace-nowrap transition-all ${
                  active === i
                    ? "bg-[#ef4444]/10 border-l-4 border-[#ef4444] text-[#0f1d3a] font-semibold"
                    : "bg-transparent text-[#64748b] hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                <feature.icon className={`h-5 w-5 shrink-0 ${active === i ? "text-[#ef4444]" : "text-gray-400"}`} />
                {feature.title}
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 min-h-[350px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {features[active].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
