"use client"

import { Users, UserCog, Activity, Mail, Phone } from "lucide-react"

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

export default function StaffManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage PRO officers and track workload</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white text-sm font-medium rounded-lg hover:bg-[#15305a]">
          <UserCog className="h-4 w-4" />
          + Add Staff
        </button>
      </div>

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
