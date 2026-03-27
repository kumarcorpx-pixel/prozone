"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Download, Send, FileText, X, Loader2, RefreshCw } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"
import { toast } from "sonner"

interface Invoice {
  invoice_id: string
  invoice_number: string
  customer_name: string
  date: string
  due_date: string
  total: number
  balance: number
  status: string
  line_items?: { name: string; description?: string; rate: number; quantity: number; item_total: number }[]
  notes?: string
  terms?: string
  sub_total?: number
  tax_total?: number
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  sent: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  partially_paid: "bg-blue-100 text-blue-800",
  draft: "bg-gray-100 text-gray-800",
  void: "bg-gray-100 text-gray-500",
}

const defaultInvoiceForm = {
  customer_id: "",
  customer_name: "",
  service_type: "",
  company_name: "",
  gov_fees: "",
  service_fee: "",
  due_date: "",
  notes: "",
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultInvoiceForm)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [zohoConfigured, setZohoConfigured] = useState(true)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)
      const res = await fetch(`/api/invoices?${params}`)
      const data = await res.json()
      if (data.error) {
        if (data.message === "Zoho not configured") setZohoConfigured(false)
        setInvoices([])
      } else {
        setInvoices(data.invoices || [])
        setZohoConfigured(true)
      }
    } catch {
      setInvoices([])
    }
    setLoading(false)
  }

  useEffect(() => { fetchInvoices() }, [statusFilter])

  const handleSearch = () => { setLoading(true); fetchInvoices() }

  const handleCreateInvoice = async () => {
    if (!formData.customer_name.trim()) {
      toast.error("Customer name is required")
      return
    }
    if (!formData.gov_fees && !formData.service_fee) {
      toast.error("At least one fee amount is required")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: formData.customer_id || formData.customer_name,
          service_type: formData.service_type,
          company_name: formData.company_name,
          gov_fees: parseFloat(formData.gov_fees) || 0,
          service_fee: parseFloat(formData.service_fee) || 0,
          due_date: formData.due_date,
          notes: formData.notes,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`Invoice ${data.invoice?.invoice_number || ""} created`)
      setShowAddForm(false)
      setFormData(defaultInvoiceForm)
      fetchInvoices()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create invoice")
    } finally {
      setCreating(false)
    }
  }

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`)
      if (!res.ok) throw new Error("Failed to load invoice")
      const data = await res.json()
      setViewInvoice(data.invoice)
    } catch {
      // Fallback: show from list data
      const inv = invoices.find(i => i.invoice_id === invoiceId)
      if (inv) setViewInvoice(inv)
      else toast.error("Failed to load invoice details")
    }
  }

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pdf" }),
      })
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to download PDF")
    }
  }

  const handleSendInvoice = async (invoiceId: string) => {
    setSendingId(invoiceId)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success("Invoice sent to customer via Zoho")
      fetchInvoices()
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invoice")
    } finally {
      setSendingId(null)
    }
  }

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0)
  const outstanding = invoices.reduce((s, i) => s + (i.balance || 0), 0)
  const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + (i.balance || 0), 0)

  const summaryCards = [
    { label: "Total Invoiced", amount: totalInvoiced.toLocaleString(), color: "bg-[#1a3a6b]", textColor: "text-white" },
    { label: "Paid", amount: totalPaid.toLocaleString(), color: "bg-green-50", textColor: "text-green-700" },
    { label: "Outstanding", amount: outstanding.toLocaleString(), color: "bg-yellow-50", textColor: "text-yellow-700" },
    { label: "Overdue", amount: overdue.toLocaleString(), color: "bg-red-50", textColor: "text-red-700" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Invoicing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage invoices and payments via Zoho Invoice</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchInvoices() }}
            className="p-2.5 text-gray-500 hover:text-[#1a3a6b] hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? "Cancel" : "Create Invoice"}
          </button>
        </div>
      </div>

      {!zohoConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          Zoho Invoice is not configured. Add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ORG_ID to your .env.local file.
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New Invoice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="Enter customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="Enter company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <input type="text" value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="e.g., Trade License Renewal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Government Fees (AED)</label>
              <input type="number" value={formData.gov_fees} onChange={(e) => setFormData({ ...formData, gov_fees: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Fee (AED)</label>
              <input type="number" value={formData.service_fee} onChange={(e) => setFormData({ ...formData, service_fee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowAddForm(false); setFormData(defaultInvoiceForm) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleCreateInvoice} disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors disabled:opacity-50">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {creating ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl p-5 ${card.label === "Total Invoiced" ? "ring-0" : "ring-1 ring-gray-200"}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${card.label === "Total Invoiced" ? "text-white/80" : "text-gray-500"}`}>{card.label}</p>
              <AedIcon className={`h-5 w-5 ${card.label === "Total Invoiced" ? "text-white/60" : "text-gray-400"}`} />
            </div>
            <p className={`text-2xl font-bold mt-2 ${card.textColor}`}>AED {card.amount}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white">
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="sent">Sent</option>
          <option value="overdue">Overdue</option>
          <option value="partially_paid">Partial</option>
          <option value="draft">Draft</option>
          <option value="void">Void</option>
        </select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search invoices..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]" />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#1a3a6b]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Invoice #</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Total (AED)</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Balance</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Due Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.invoice_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1a3a6b] cursor-pointer hover:underline" onClick={() => handleViewInvoice(inv.invoice_id)}>{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                    <td className="px-6 py-4 text-gray-900">{inv.customer_name}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{(inv.total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{(inv.balance || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inv.status] || "bg-gray-100 text-gray-700"}`}>
                        {inv.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{inv.due_date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleViewInvoice(inv.invoice_id)} className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="View Invoice">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDownloadPdf(inv.invoice_id)} className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Download PDF">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleSendInvoice(inv.invoice_id)} disabled={sendingId === inv.invoice_id} className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors disabled:opacity-50" title="Send to Customer">
                          {sendingId === inv.invoice_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      {loading ? "Loading..." : "No invoices found. Create your first invoice to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setViewInvoice(null)} />
          <div className="relative z-10 w-full max-w-[640px] max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invoice {viewInvoice.invoice_number}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${statusColors[viewInvoice.status] || "bg-gray-100 text-gray-700"}`}>
                  {viewInvoice.status?.replace("_", " ")}
                </span>
              </div>
              <button onClick={() => setViewInvoice(null)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Customer</p><p className="font-medium">{viewInvoice.customer_name}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-medium">{viewInvoice.date}</p></div>
                <div><p className="text-gray-500">Due Date</p><p className="font-medium">{viewInvoice.due_date}</p></div>
                <div><p className="text-gray-500">Balance Due</p><p className="font-medium text-red-600">AED {(viewInvoice.balance || 0).toLocaleString()}</p></div>
              </div>

              {viewInvoice.line_items && viewInvoice.line_items.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Line Items</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-gray-500">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Amount</th>
                    </tr></thead>
                    <tbody>
                      {viewInvoice.line_items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2">
                            <p className="font-medium">{item.name}</p>
                            {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                          </td>
                          <td className="py-2 text-right">{(item.rate || 0).toLocaleString()}</td>
                          <td className="py-2 text-right">{item.quantity}</td>
                          <td className="py-2 text-right font-medium">{(item.item_total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
                {viewInvoice.sub_total != null && (
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>AED {viewInvoice.sub_total.toLocaleString()}</span></div>
                )}
                {viewInvoice.tax_total != null && viewInvoice.tax_total > 0 && (
                  <div className="flex justify-between"><span className="text-gray-500">VAT</span><span>AED {viewInvoice.tax_total.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total</span><span>AED {(viewInvoice.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {viewInvoice.notes && (
                <div><p className="text-xs text-gray-500 mb-1">Notes</p><p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{viewInvoice.notes}</p></div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => handleDownloadPdf(viewInvoice.invoice_id)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button onClick={() => { handleSendInvoice(viewInvoice.invoice_id); setViewInvoice(null) }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a]">
                <Send className="h-4 w-4" /> Send to Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
