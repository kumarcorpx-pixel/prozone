"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Settings, User, Bell, Lock } from "lucide-react"
import { toast } from "sonner"

export default function StaffSettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.full_name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [email, setEmail] = useState(user?.email || "")
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [saved, setSaved] = useState(false)

  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [changingPw, setChangingPw] = useState(false)

  const handleSave = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, phone }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        toast.success("Profile updated")
      } else {
        toast.error(data.error || "Failed to update profile")
      }
    } catch {
      toast.error("Failed to update profile")
    }
  }

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { toast.error("Both passwords required"); return }
    if (newPw.length < 8) { toast.error("New password must be at least 8 characters"); return }
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return }
    setChangingPw(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (res.ok) { toast.success("Password changed"); setCurrentPw(""); setNewPw(""); setConfirmPw("") }
      else toast.error(data.error || "Failed to change password")
    } catch { toast.error("Failed to change password") }
    setChangingPw(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#1a3a6b]" />
          My Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <User className="h-5 w-5" /> Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5" /> Change Password
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            className="px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors disabled:opacity-50"
          >
            {changingPw ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" /> Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
            <button onClick={() => setEmailNotifs(!emailNotifs)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? "bg-[#1a3a6b]" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-500">Receive urgent alerts via SMS</p>
            </div>
            <button onClick={() => setSmsNotifs(!smsNotifs)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsNotifs ? "bg-[#1a3a6b]" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsNotifs ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="px-6 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]">
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  )
}
