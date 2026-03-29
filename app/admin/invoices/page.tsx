"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Plus, Eye, Download, Send, FileText, X, Loader2, Trash2, CheckCircle2, Ban, CreditCard } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"
import { toast } from "sonner"

interface LineItem {
  name: string
  description: string
  rate: string
  quantity: string
}

interface Invoice {
  invoice_id: string
  invoice_number: string
  customer_name: string
  date: string
  due_date: string
  total: number
  balance: number
  status: string
  sub_total?: number
  tax_total?: number
  line_items?: any[]
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  partial: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-500",
}

const emptyLineItem = (): LineItem => ({ name: "", description: "", rate: "", quantity: "1" })

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState({ totalInvoiced: 0, totalPaid: 0, outstanding: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("Payment due within 30 days. Bank transfer to YABS account.")
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)
      const res = await fetch(`/api/invoices?${params}`)
      const data = await res.json()
      setInvoices(data.invoices || [])
      setSummary(data.summary || { totalInvoiced: 0, totalPaid: 0, outstanding: 0, overdue: 0 })
    } catch { setInvoices([]) }
    setLoading(false)
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { fetchInvoices() }, 300)
  }, [search, statusFilter])

  useEffect(() => { fetchInvoices() }, [statusFilter])
  useEffect(() => {
    if (search !== undefined) debouncedFetch()
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const addLineItem = () => setLineItems([...lineItems, emptyLineItem()])
  const removeLineItem = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i))
  const updateLineItem = (i: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems]
    updated[i] = { ...updated[i], [field]: value }
    setLineItems(updated)
  }

  const subtotal = lineItems.reduce((s, item) => s + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 1), 0)
  const vat = Math.round(subtotal * 5) / 100
  const total = subtotal + vat

  const handleCreate = async () => {
    if (!customerName.trim()) { toast.error("Customer name is required"); return }
    const validItems = lineItems.filter(i => i.name && parseFloat(i.rate) > 0)
    if (validItems.length === 0) { toast.error("At least one line item with name and rate is required"); return }

    setCreating(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          company_name: companyName,
          due_date: dueDate || undefined,
          notes, terms,
          line_items: validItems.map(i => ({
            name: i.name,
            description: i.description,
            rate: parseFloat(i.rate),
            quantity: parseInt(i.quantity) || 1,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success(`Invoice ${data.invoice.invoice_number} created!`)
      setShowForm(false)
      setCustomerName(""); setCompanyName(""); setDueDate(""); setNotes("")
      setLineItems([emptyLineItem()])
      fetchInvoices()
    } catch (err: any) { toast.error(err.message || "Failed to create invoice") }
    setCreating(false)
  }

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id + action)
    try {
      if (action === "pdf") {
        window.open(`/api/invoices/${id}`, "_blank")
        const res = await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "pdf" }) })
        if (res.ok) {
          const html = await res.text()
          const win = window.open("", "_blank")
          if (win) { win.document.write(html); win.document.close() }
        }
      } else if (action === "delete") {
        if (!confirm("Delete this invoice?")) { setActionLoading(null); return }
        await fetch(`/api/invoices/${id}`, { method: "DELETE" })
        toast.success("Invoice deleted")
      } else {
        const res = await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
        const data = await res.json()
        toast.success(data.message || "Done")
      }
      fetchInvoices()
    } catch { toast.error("Action failed") }
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoicing</h1>
          <p className="text-sm text-gray-500">Create and manage invoices with UAE VAT (5%)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a]">
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Invoice</>}
        </button>
      </div>

      {/* Create Invoice Form */}
      {showForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Create New Invoice</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Client name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <button onClick={addLineItem} className="text-xs text-[#1a3a6b] font-medium hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Item</button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <div className="col-span-4">Item Name</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Rate (AED)</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={item.name} onChange={e => updateLineItem(i, "name", e.target.value)} placeholder="e.g. Government Fees" className="col-span-4 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <input value={item.description} onChange={e => updateLineItem(i, "description", e.target.value)} placeholder="Description" className="col-span-3 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <input type="number" value={item.rate} onChange={e => updateLineItem(i, "rate", e.target.value)} placeholder="0.00" className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <input type="number" value={item.quantity} onChange={e => updateLineItem(i, "quantity", e.target.value)} placeholder="1" className="col-span-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                    {((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 1)).toLocaleString()}
                  </div>
                  <div className="col-span-1 text-center">
                    {lineItems.length > 1 && (
                      <button onClick={() => removeLineItem(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">AED {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">VAT (5%)</span><span className="font-medium">AED {vat.toLocaleString()}</span></div>
              <div className="flex justify-between border-t pt-1 mt-1"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-[#1a3a6b] text-lg">AED {total.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Additional notes for client..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="px-6 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] disabled:opacity-50 flex items-center gap-2">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4" /> Create Invoice</>}
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a3a6b] rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-blue-200">Total Invoiced</p><p className="text-2xl font-bold mt-1">AED {summary.totalInvoiced.toLocaleString()}</p></div>
            <AedIcon className="h-6 w-6 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 ring-1 ring-gray-200 border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Paid</p><p className="text-2xl font-bold text-green-700 mt-1">AED {summary.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 ring-1 ring-gray-200 border-l-4 border-amber-400">
          <p className="text-xs text-gray-500">Outstanding</p><p className="text-2xl font-bold text-amber-700 mt-1">AED {summary.outstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 ring-1 ring-gray-200 border-l-4 border-red-500">
          <p className="text-xs text-gray-500">Overdue</p><p className="text-2xl font-bold text-red-700 mt-1">AED {summary.overdue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLoading(true) }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Total (AED)</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Due Date</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No invoices found</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first invoice to get started</p>
                </td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.invoice_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[#1a3a6b]">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.date ? new Date(inv.date).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3 text-gray-900">{inv.customer_name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inv.status] || "bg-gray-100 text-gray-600"}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleAction(inv.invoice_id, "pdf")} title="Download PDF" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#1a3a6b]">
                        <Download className="h-4 w-4" />
                      </button>
                      {inv.status !== "paid" && inv.status !== "cancelled" && (
                        <>
                          <button onClick={() => handleAction(inv.invoice_id, "send")} title="Send to Client" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                            <Send className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleAction(inv.invoice_id, "record_payment")} title="Record Payment" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleAction(inv.invoice_id, "void")} title="Void Invoice" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                            <Ban className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleAction(inv.invoice_id, "delete")} title="Delete" className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
