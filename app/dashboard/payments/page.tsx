"use client"

import { Download, CreditCard, Clock, CheckCircle2 } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"

// TODO: Replace with real payments table data once available (e.g. fetchInvoices() from data-fetcher)
const demoInvoices = [
  { id: "INV-2026-001", date: "2026-03-15", service: "Trade License Renewal", company: "Gulf Trading LLC", govFees: 10000, serviceFee: 2000, vat: 600, total: 12600, status: "pending" },
  { id: "INV-2026-002", date: "2026-03-01", service: "Document Attestation", company: "Gulf Trading LLC", govFees: 500, serviceFee: 300, vat: 40, total: 840, status: "paid" },
  { id: "INV-2026-003", date: "2026-03-10", service: "Company Formation", company: "Tech Ventures FZCO", govFees: 25000, serviceFee: 5000, vat: 1500, total: 31500, status: "partial" },
  { id: "INV-2026-004", date: "2026-03-18", service: "VAT Return Filing", company: "Emirates Zone Group", govFees: 0, serviceFee: 1500, vat: 75, total: 1575, status: "pending" },
  { id: "INV-2026-005", date: "2026-03-20", service: "New Employment Visa", company: "Gulf Trading LLC", govFees: 6920, serviceFee: 2500, vat: 471, total: 9895, status: "pending" },
]

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700",
  partial: "bg-blue-100 text-blue-700", overdue: "bg-red-100 text-red-700",
}

const totalInvoiced = demoInvoices.reduce((s, i) => s + i.total, 0)
const totalPaid = demoInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0)
const outstanding = totalInvoiced - totalPaid

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Fees</h1>
        <p className="text-sm text-gray-500 mt-1">Track all government fees and service charges</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: `AED ${totalInvoiced.toLocaleString()}`, icon: AedIcon, color: "text-[#1a3a6b]" },
          { label: "Total Paid", value: `AED ${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: "text-green-600" },
          { label: "Outstanding", value: `AED ${outstanding.toLocaleString()}`, icon: Clock, color: "text-yellow-600" },
          { label: "Next Due", value: "31 Mar 2026", icon: CreditCard, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{s.label}</p>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className={`text-xl font-bold mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Service</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Company</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Gov Fees</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Service</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">VAT</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {demoInvoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#1a3a6b]">{inv.id}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(inv.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                  <td className="px-4 py-3 font-medium">{inv.service}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{inv.company}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">{inv.govFees.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">{inv.serviceFee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">{inv.vat.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold">AED {inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-gray-400 hover:text-[#1a3a6b]"><Download className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-semibold">
              <td colSpan={7} className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">AED {totalInvoiced.toLocaleString()}</td>
              <td colSpan={2} />
            </tr></tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
