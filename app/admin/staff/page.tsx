"use client"

import { useState, useEffect } from "react"
import { Users, UserCog, Activity, Mail, Phone, X, Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

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
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "" })
  const [editSaving, setEditSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch("/api/data/users?role=pro_staff")
        if (res.ok) {
          const data = await res.json()
          setStaff(data || [])
        }
      } catch {}
      setLoading(false)
    }
    loadStaff()
  }, [])

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
      const newUser = await res.json()
      toast.success("Staff member added successfully")
      setShowAddForm(false)
      setFormData(defaultStaffForm)
      // Reload staff list
      const refreshRes = await fetch("/api/data/users?role=pro_staff")
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        setStaff(data || [])
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add staff")
    } finally {
      setSaving(false)
    }
  }

  const refreshStaff = async () => {
    const res = await fetch("/api/data/users?role=pro_staff")
    if (res.ok) {
      const data = await res.json()
      setStaff(data || [])
    }
  }

  const handleEditSave = async (memberId: string) => {
    if (!editForm.full_name.trim()) {
      toast.error("Full name is required")
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch("/api/data/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: memberId,
          fullName: editForm.full_name,
          phone: editForm.phone || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update staff")
      }
      toast.success("Staff member updated")
      setEditingId(null)
      await refreshStaff()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update staff")
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggleActive = async (member: any) => {
    setTogglingId(member.id)
    try {
      const res = await fetch("/api/data/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          isActive: !member.is_active,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update status")
      }
      toast.success(member.is_active ? "Staff member deactivated" : "Staff member activated")
      await refreshStaff()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6 page-entrance">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage PRO officers and track workload</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1a3a6b] to-[#2a5298] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 text-sm"
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 text-center">
              <Users className="h-6 w-6 text-[#1a3a6b] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#1a3a6b]">{staff.length}</p>
              <p className="text-xs text-gray-500">Total Staff</p>
            </div>
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 text-center">
              <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{staff.filter(s => s.is_active).length}</p>
              <p className="text-xs text-gray-500">Active Staff</p>
            </div>
            <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 text-center">
              <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{staff.filter(s => !s.is_active).length}</p>
              <p className="text-xs text-gray-500">Inactive Staff</p>
            </div>
          </div>

          {/* Staff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No staff members found. Add one above.</p>
              </div>
            ) : staff.map(member => (
              <div key={member.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:shadow-md transition-shadow">
                {editingId === member.id ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Edit Staff Member</h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(member.id)}
                        disabled={editSaving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] disabled:opacity-50"
                      >
                        {editSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1a3a6b] flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(member.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.full_name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">PRO Staff</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {member.phone}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(member.id)
                            setEditForm({ full_name: member.full_name, email: member.email, phone: member.phone || "" })
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(member)}
                          disabled={togglingId === member.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            member.is_active
                              ? "text-red-700 bg-red-50 hover:bg-red-100"
                              : "text-green-700 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {togglingId === member.id && <Loader2 className="h-3 w-3 animate-spin" />}
                          {member.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
