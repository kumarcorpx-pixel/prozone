"use client"

import { useState } from "react"
import { Search, Plus, Eye, Download, Send, FileText, X } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"

const demoInvoices = [
  { id: "INV-2026-001", date: "2026-03-15", client: "Ahmed Al Mansoori", company: "Gulf Trading LLC", service: "Trade License Renewal", amount: 12600, status: "pending", dueDate: "2026-03-31" },
  { id: "INV-2026-002", date: "2026-03-01", client: "Ahmed Al Mansoori", company: "Gulf Trading LLC", service: "Document Attestation", amount: 840, status: "paid", dueDate: "2026-03-15" },
  { id: "INV-2026-003", date: "2026-03-10", client: "Sara Khan", company: "Tech Ventures FZCO", service: "Company Formation", amount: 31500, status: "partial", dueDate: "2026-04-10" },
  { id: "INV-2026-004", date: "2026-03-18", client: "Fatima Al Hashmi", company: "Emirates Zone Group", service: "VAT Return Filing", amount: 1575, status: "pending", dueDate: "2026-04-01" },
  { id: "INV-2026-005", date: "2026-03-20", client: "Ahmed Al Mansoori", company: "Gulf Trading LLC", service: "New Employment Visa", amount: 9895, status: "overdue", dueDate: "2026-03-20" },
]

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-800",
}

const summaryCards = [
  { label: "Total Invoiced", amount: "56,410", color: "bg-[#1a3a6b]", textColor: "text-white" },
  { label: "Paid", amount: "840", color: "bg-green-50", textColor: "text-green-700" },
  { label: "Outstanding", amount: "55,570", color: "bg-yellow-50", textColor: "text-yellow-700" },
  { label: "Overdue", amount: "12,600", color: "bg-red-50", textColor: "text-red-700" },
]

const defaultInvoiceForm = {
  client_name: "",
  company: "",
  service: "",
  amount: "",
  due_date: "",
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(defaultInvoiceForm)

  const filtered = demoInvoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.company.toLowerCase().includes(search.toLowerCase()) ||
      inv.service.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a6b]">Invoicing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] transition-colors"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Create Invoice"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New Invoice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="Enter service description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultInvoiceForm) }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowAddForm(false); setFormData(defaultInvoiceForm) }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} rounded-xl p-5 ${card.label === "Total Invoiced" ? "ring-0" : "ring-1 ring-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${card.label === "Total Invoiced" ? "text-white/80" : "text-gray-500"}`}>
                {card.label}
              </p>
              <AedIcon className={`h-5 w-5 ${card.label === "Total Invoiced" ? "text-white/60" : "text-gray-400"}`} />
            </div>
            <p className={`text-2xl font-bold mt-2 ${card.textColor}`}>
              AED {card.amount}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
          />
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Invoice #</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Service</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Amount (AED)</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Due Date</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1a3a6b]">{inv.id}</td>
                  <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                  <td className="px-6 py-4 text-gray-900">{inv.client}</td>
                  <td className="px-6 py-4 text-gray-600">{inv.company}</td>
                  <td className="px-6 py-4 text-gray-600">{inv.service}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{inv.dueDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-[#1a3a6b] hover:bg-gray-100 transition-colors" title="Send">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No invoices found matching your filters.
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
