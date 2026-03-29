"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Settings, User, Bell, Building2, Phone, Mail, MapPin, Clock, MessageCircle, Lock, Eye, EyeOff } from "lucide-react"
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
  const [linkedCompanies, setLinkedCompanies] = useState<any[]>([])
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("/api/client/companies")
        if (res.ok) setLinkedCompanies(await res.json())
      } catch {}
    }
    loadCompanies()
  }, [])

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

      {/* Security / Password */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4"><Lock className="h-5 w-5" /> Security</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-10" placeholder="Enter current password" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-10" placeholder="At least 8 characters" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Re-enter new password" />
          </div>
          <button disabled={changingPassword || !currentPassword || !newPassword} onClick={async () => {
            if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }
            if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return }
            setChangingPassword(true)
            try {
              const res = await fetch("/api/auth/change-password", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || "Failed")
              toast.success("Password changed successfully")
              setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
            } catch (err: any) { toast.error(err.message || "Failed to change password") }
            setChangingPassword(false)
          }} className="px-4 py-2 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a] disabled:opacity-50">
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
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
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">Notification preferences coming soon</p>
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
          {linkedCompanies.length === 0 && (
            <p className="text-sm text-gray-400 py-3">No linked companies found.</p>
          )}
          {linkedCompanies.map((company: any) => (
            <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><p className="text-sm font-medium">{company.name}</p><p className="text-xs text-gray-500">{company.emirate || "N/A"}{company.license_type === "freezone" ? " Free Zone" : ""}</p></div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${company.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{company.status === "active" ? "Active" : company.status || "N/A"}</span>
            </div>
          ))}
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
