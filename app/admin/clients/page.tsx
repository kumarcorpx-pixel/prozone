"use client"

import { useState, useEffect } from "react"
import { fetchProfiles } from "@/lib/data-fetcher"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Search, Users, Loader2, Plus, X, Pencil } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const defaultClientForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "client" as string,
}

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultClientForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ full_name: "", email: "", phone: "" })
  const [editSaving, setEditSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    async function load() {
      const data = await fetchProfiles()
      setProfiles(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAddUser = async () => {
    if (!formData.full_name.trim()) { toast.error("Full name is required"); return }
    if (!formData.email.trim()) { toast.error("Email is required"); return }
    if (!formData.password || formData.password.length < 8) { toast.error("Password must be at least 8 characters"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/data/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.full_name,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          role: formData.role,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create user")
      }
      toast.success(`${formData.role === "pro_staff" ? "PRO Staff" : "Client"} created successfully`)
      setShowAddForm(false)
      setFormData(defaultClientForm)
      const updated = await fetchProfiles()
      setProfiles(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) return
    try {
      const res = await fetch("/api/data/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }
      toast.success(`${userName} deleted`)
      const updated = await fetchProfiles()
      setProfiles(updated)
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user")
    }
  }

  const refreshClients = async () => {
    const updated = await fetchProfiles()
    setProfiles(updated)
  }

  const handleEditSave = async (clientId: string) => {
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
          id: clientId,
          fullName: editForm.full_name,
          phone: editForm.phone || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update client")
      }
      toast.success("Client updated")
      setEditingId(null)
      await refreshClients()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update client")
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggleActive = async (profile: any) => {
    setTogglingId(profile.id)
    try {
      const res = await fetch("/api/data/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile.id,
          isActive: !profile.is_active,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update status")
      }
      toast.success(profile.is_active ? "Client deactivated" : "Client activated")
      await refreshClients()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading clients...</p>
        </div>
      </div>
    )
  }

  const filteredByRole = roleFilter === "all" ? profiles : profiles.filter((p: any) => p.role === roleFilter)

  const filtered = filteredByRole.filter(
    (p: any) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all users — Admin, PRO Staff, and Clients</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Create User"}
        </button>
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-2">
        {[
          { id: "all", label: `All (${profiles.length})` },
          { id: "admin", label: `Admin (${profiles.filter((p: any) => p.role === "admin").length})` },
          { id: "pro_staff", label: `PRO Staff (${profiles.filter((p: any) => p.role === "pro_staff").length})` },
          { id: "client", label: `Clients (${profiles.filter((p: any) => p.role === "client").length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setRoleFilter(f.id)} className={`px-3 py-1.5 text-xs font-medium rounded-full ${roleFilter === f.id ? "bg-[#1a3a6b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New User</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="Enter email address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="+971 XX XXX XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white">
                <option value="client">Client</option>
                <option value="pro_staff">PRO Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowAddForm(false); setFormData(defaultClientForm) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleAddUser} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
        />
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Phone</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Role</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Joined</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile) => (
                editingId === profile.id ? (
                  <tr key={profile.id} className="border-b border-gray-50 bg-gray-50">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="email"
                        value={editForm.email}
                        disabled
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                      />
                    </td>
                    <td className="px-6 py-3" />
                    <td className="px-6 py-3" />
                    <td className="px-6 py-3" />
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSave(profile.id)}
                          disabled={editSaving}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] disabled:opacity-50"
                        >
                          {editSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#1a3a6b] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <Link href={`/admin/clients/${profile.id}`} prefetch={false} className="font-medium text-[#1a3a6b] hover:underline">{profile.full_name}</Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{profile.email}</td>
                  <td className="px-6 py-4 text-gray-600">{profile.phone || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.role === "admin" ? "bg-blue-100 text-blue-800" :
                      profile.role === "pro_staff" ? "bg-purple-100 text-purple-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {profile.role === "admin" ? "Admin" : profile.role === "pro_staff" ? "PRO Staff" : "Client"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={profile.is_active ? "active" : "expired"} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(profile.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(profile.id)
                          setEditForm({ full_name: profile.full_name, email: profile.email, phone: profile.phone || "" })
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(profile)}
                        disabled={togglingId === profile.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          profile.is_active
                            ? "text-red-700 bg-red-50 hover:bg-red-100"
                            : "text-green-700 bg-green-50 hover:bg-green-100"
                        }`}
                      >
                        {togglingId === profile.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        {profile.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(profile.id, profile.full_name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                )
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No clients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
