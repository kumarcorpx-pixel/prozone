"use client"

import { useState } from "react"
import { Settings, User, Bell, Database, Shield } from "lucide-react"

export default function SettingsPage() {
  const [name, setName] = useState("Sarah Admin")
  const [email, setEmail] = useState("admin@yabs.ae")
  const [phone, setPhone] = useState("+971 55 987 6543")
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isConfigured = supabaseUrl && supabaseUrl !== "your_supabase_url_here"

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a6b]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and system preferences</p>
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
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive updates via email</p>
            </div>
            <button
              onClick={() => setEmailNotifs(!emailNotifs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? "bg-[#1a3a6b]" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-500">Receive urgent alerts via SMS</p>
            </div>
            <button
              onClick={() => setSmsNotifs(!smsNotifs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsNotifs ? "bg-[#1a3a6b]" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsNotifs ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* System Section */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        <h3 className="font-semibold text-[#1a3a6b] flex items-center gap-2 mb-4">
          <Database className="h-5 w-5" />
          System
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Supabase Connection</p>
              <p className="text-xs text-gray-500 font-mono">{supabaseUrl || "Not configured"}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConfigured ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
              {isConfigured ? "Connected" : "Not Configured"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Demo Mode</p>
              <p className="text-xs text-gray-500">Using demo data for preview purposes</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Shield className="h-3 w-3" />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
