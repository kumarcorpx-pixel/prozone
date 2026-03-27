"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Settings, User, Bell, Building2, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import { toast } from "sonner"

export default function ClientSettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.full_name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [paymentReminders, setPaymentReminders] = useState(true)
  const [requestUpdates, setRequestUpdates] = useState(true)
  const [expiry30, setExpiry30] = useState(true)
  const [expiry60, setExpiry60] = useState(true)
  const [expiry90, setExpiry90] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, phone }),
      })
      if (res.ok) {
        toast.success("Profile updated successfully")
      } else {
        toast.error("Failed to update profile")
      }
    } catch {
      toast.error("Failed to update profile")
    }
    setSaving(false)
  }

  const Toggle = ({ on, toggle }: { on: boolean; toggle: () => void }) => (
    <button onClick={toggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? "bg-[#1a3a6b]" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Settings className="h-6 w-6 text-[#1a3a6b]" /> Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><User className="h-5 w-5" /> Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={user?.email || ""} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Bell className="h-5 w-5" /> Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: "Email Notifications", desc: "Receive updates via email", on: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
            { label: "SMS Notifications", desc: "Receive urgent alerts via SMS", on: smsNotifs, toggle: () => setSmsNotifs(!smsNotifs) },
            { label: "Payment Reminders", desc: "Get notified about pending payments", on: paymentReminders, toggle: () => setPaymentReminders(!paymentReminders) },
            { label: "Request Status Updates", desc: "Get notified when request status changes", on: requestUpdates, toggle: () => setRequestUpdates(!requestUpdates) },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
              <Toggle on={item.on} toggle={item.toggle} />
            </div>
          ))}
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-900 mb-2">Expiry Alert Timing</p>
            <div className="flex gap-4">
              {[{ label: "90 days", on: expiry90, toggle: () => setExpiry90(!expiry90) }, { label: "60 days", on: expiry60, toggle: () => setExpiry60(!expiry60) }, { label: "30 days", on: expiry30, toggle: () => setExpiry30(!expiry30) }].map(item => (
                <label key={item.label} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={item.on} onChange={item.toggle} className="h-4 w-4 rounded border-gray-300 text-[#1a3a6b]" />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Linked Companies */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Building2 className="h-5 w-5" /> Linked Companies</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><p className="text-sm font-medium">Gulf Trading LLC</p><p className="text-xs text-gray-500">Abu Dhabi &middot; Primary</p></div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div><p className="text-sm font-medium">Emirates Zone Group</p><p className="text-xs text-gray-500">Dubai DMCC</p></div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
          </div>
        </div>
        <button className="mt-3 text-sm text-[#1a3a6b] hover:underline">+ Request to add company</button>
      </div>

      {/* Support */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] mb-4">Support</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#1a3a6b]">
            <MessageCircle className="h-4 w-4" /> Contact via WhatsApp
          </a>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> +971 56 520 4844</div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> info@yabs.ae</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> 258, Central Plaza, Schon Business Park, DIP(1), Dubai</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /> Sun-Thu: 8:00 AM - 6:00 PM</div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] disabled:opacity-50">
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}
