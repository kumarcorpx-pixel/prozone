"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { fetchEmployees, fetchCompanies, fetchDocuments } from "@/lib/data-fetcher"
import { updateEmployee } from "@/lib/supabase/api"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { toast } from "sonner"
import {
  ArrowLeft, User, Building2, FileText, Clock, Shield,
  Phone, Mail, MapPin, Calendar, CreditCard, Save, Edit2, X
} from "lucide-react"

function getExpiryInfo(date: string | null) {
  if (!date) return { label: "N/A", color: "text-gray-400", days: null }
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: "text-red-600", days }
  if (days <= 30) return { label: `${days}d left`, color: "text-yellow-600", days }
  if (days <= 60) return { label: `${days}d left`, color: "text-orange-600", days }
  return { label: `${days}d left`, color: "text-green-600", days }
}

function InfoRow({ label, value, valueColor }: { label: string; value: string | null | undefined; valueColor?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${valueColor || "text-gray-900"}`}>{value || "N/A"}</span>
    </div>
  )
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const employeeId = params.id as string
  const [employee, setEmployee] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    async function load() {
      const [emps, comps, docs] = await Promise.all([
        fetchEmployees(),
        fetchCompanies(),
        fetchDocuments(),
      ])
      const emp = emps.find((e: any) => e.id === employeeId)
      setEmployee(emp)
      if (emp) {
        setCompany(comps.find((c: any) => c.id === emp.company_id))
        setDocuments(docs.filter((d: any) => d.employee_id === employeeId))
        setEditData(emp)
      }
      setLoading(false)
    }
    load()
  }, [employeeId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEmployee(employeeId, editData)
      setEmployee({ ...employee, ...editData })
      setEditing(false)
      toast.success("Employee updated successfully")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" /></div>

  if (!employee) return (
    <div className="text-center py-20">
      <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <h2 className="text-lg font-semibold">Employee not found</h2>
      <Link href="/admin/employees" className="text-sm text-[#1a3a6b] hover:underline mt-2 inline-block">Back to Employees</Link>
    </div>
  )

  const visaExpiry = getExpiryInfo(employee.visa_expiry)
  const eidExpiry = getExpiryInfo(employee.emirates_id_expiry)
  const passportExpiry = getExpiryInfo(employee.passport_expiry)
  const laborExpiry = getExpiryInfo(employee.labor_card_expiry)

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "immigration", label: "Immigration", icon: Shield },
    { id: "documents", label: `Documents (${documents.length})`, icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/employees" className="p-2 rounded-lg hover:bg-gray-100 mt-1">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#1a3a6b] flex items-center justify-center">
              <span className="text-white text-lg font-medium">
                {employee.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">{employee.designation || "Employee"}</span>
                {company && (
                  <>
                    <span className="text-gray-300">&middot;</span>
                    <Link href={`/admin/companies/${company.id}`} className="text-sm text-[#1a3a6b] hover:underline">{company.name}</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={employee.visa_status || employee.status || "active"} />
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white text-sm rounded-lg hover:bg-[#15305a] disabled:opacity-50">
                <Save className="h-4 w-4" />{saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
              <Edit2 className="h-4 w-4" />Edit
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Visa", value: visaExpiry.label, color: visaExpiry.color, sub: employee.visa_status },
          { label: "Emirates ID", value: eidExpiry.label, color: eidExpiry.color, sub: employee.emirates_id },
          { label: "Passport", value: passportExpiry.label, color: passportExpiry.color, sub: employee.passport_number },
          { label: "Labor Card", value: laborExpiry.label, color: laborExpiry.color, sub: employee.labor_card_number },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl ring-1 ring-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-sm font-semibold mt-1 ${s.color}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-0.5 font-mono">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-[#1a3a6b] text-[#1a3a6b]" : "border-transparent text-gray-500"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6">
        {activeTab === "personal" && (
          <div className="space-y-1">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "full_name" },
                  { label: "Designation", key: "designation" },
                  { label: "Department", key: "department" },
                  { label: "Nationality", key: "nationality" },
                  { label: "Phone", key: "phone" },
                  { label: "Email", key: "email" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input value={editData[field.key] || ""} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <InfoRow label="Full Name" value={employee.full_name} />
                <InfoRow label="Designation" value={employee.designation} />
                <InfoRow label="Department" value={employee.department} />
                <InfoRow label="Nationality" value={employee.nationality} />
                <InfoRow label="Phone" value={employee.phone} />
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Join Date" value={employee.join_date ? new Date(employee.join_date).toLocaleDateString() : null} />
                <InfoRow label="Status" value={employee.status} />
                <InfoRow label="Salary" value={employee.salary ? `AED ${Number(employee.salary).toLocaleString()}` : null} />
              </>
            )}
          </div>
        )}

        {activeTab === "immigration" && (
          <div className="space-y-1">
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Passport Number", key: "passport_number" },
                  { label: "Passport Expiry", key: "passport_expiry", type: "date" },
                  { label: "Visa Status", key: "visa_status" },
                  { label: "Visa Expiry", key: "visa_expiry", type: "date" },
                  { label: "Emirates ID", key: "emirates_id" },
                  { label: "EID Expiry", key: "emirates_id_expiry", type: "date" },
                  { label: "Labor Card Number", key: "labor_card_number" },
                  { label: "Labor Card Expiry", key: "labor_card_expiry", type: "date" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input type={field.type || "text"} value={editData[field.key] || ""} onChange={e => setEditData({ ...editData, [field.key]: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <InfoRow label="Passport Number" value={employee.passport_number} />
                <InfoRow label="Passport Expiry" value={employee.passport_expiry ? new Date(employee.passport_expiry).toLocaleDateString() : null} valueColor={passportExpiry.color} />
                <InfoRow label="Visa Status" value={employee.visa_status} />
                <InfoRow label="Visa Expiry" value={employee.visa_expiry ? new Date(employee.visa_expiry).toLocaleDateString() : null} valueColor={visaExpiry.color} />
                <InfoRow label="Emirates ID" value={employee.emirates_id} />
                <InfoRow label="EID Expiry" value={employee.emirates_id_expiry ? new Date(employee.emirates_id_expiry).toLocaleDateString() : null} valueColor={eidExpiry.color} />
                <InfoRow label="Labor Card Number" value={employee.labor_card_number} />
                <InfoRow label="Labor Card Expiry" value={employee.labor_card_expiry ? new Date(employee.labor_card_expiry).toLocaleDateString() : null} valueColor={laborExpiry.color} />
              </>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No documents found for this employee</p>
              </div>
            ) : (
              documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1a3a6b]" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.document_type || "Document"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {doc.expiry_date && (
                      <p className={`text-xs font-medium ${getExpiryInfo(doc.expiry_date).color}`}>
                        {new Date(doc.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                    <StatusBadge status={doc.status || "valid"} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
