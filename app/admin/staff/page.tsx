"use client"

import { useState } from "react"
import { Users, UserCog, Activity, Mail, Phone, Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

const demoStaff = [
  { id: "s1", name: "Mohammed PRO", email: "mohammed@yabs.ae", phone: "+971 50 555 1234", activeRequests: 5, completedMonth: 12, status: "active" },
  { id: "s2", name: "Ali Hassan", email: "ali@yabs.ae", phone: "+971 50 555 5678", activeRequests: 3, completedMonth: 8, status: "active" },
  { id: "s3", name: "Fatima Khan", email: "fatima@yabs.ae", phone: "+971 50 555 9012", activeRequests: 9, completedMonth: 15, status: "active" },
]

function getWorkloadBadge(count: number) {
  if (count > 8) return { label: "Overloaded", className: "bg-red-100 text-red-700" }
  if (count >= 4) return { label: "Balanced", className: "bg-yellow-100 text-yellow-700" }
  return { label: "Available", className: "bg-green-100 text-green-700" }
}

const defaultStaffForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
}

export default function StaffManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultStaffForm)
  const [saving, setSaving] = useState(false)

  const handleAddStaff = async () => {
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error("Full name and email are required")
      return
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/data/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          role: "pro_staff",
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to add staff")
      }
      toast.success("Staff member added successfully")
      setShowAddForm(false)
      setFormData(defaultStaffForm)
    } catch (err: any) {
      toast.error(err?.message || "Failed to add staff")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage PRO officers and track workload</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New Staff Member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter password (min 6 characters)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultStaffForm) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStaff}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Add Staff"}
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 text-center">
          <Users className="h-6 w-6 text-[#1a3a6b] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#1a3a6b]">{demoStaff.length}</p>
          <p className="text-xs text-gray-500">Total Staff</p>
        </div>
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 text-center">
          <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{demoStaff.reduce((s, st) => s + st.activeRequests, 0)}</p>
          <p className="text-xs text-gray-500">Active Requests</p>
        </div>
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 text-center">
          <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{demoStaff.reduce((s, st) => s + st.completedMonth, 0)}</p>
          <p className="text-xs text-gray-500">Completed This Month</p>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoStaff.map(staff => {
          const workload = getWorkloadBadge(staff.activeRequests)
          return (
            <div key={staff.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {staff.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{staff.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">PRO Staff</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${workload.className}`}>
                  {workload.label}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {staff.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {staff.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#1a3a6b]">{staff.activeRequests}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{staff.completedMonth}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
