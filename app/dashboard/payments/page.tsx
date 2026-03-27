"use client"

import { useState, useEffect } from "react"
import { Download, CreditCard, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { AedIcon } from "@/components/ui/aed-icon"
import { toast } from "sonner"

interface Invoice {
  invoice_id: string
  invoice_number: string
  date: string
  due_date: string
  total: number
  balance: number
  status: string
  line_items?: { name: string; description?: string; rate: number; quantity: number; item_total: number }[]
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  sent: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
  partially_paid: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-700",
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/invoices")
        const data = await res.json()
        setInvoices(data.invoices || [])
      } catch {
        setInvoices([])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleDownload = async (invoiceId: string) => {
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
      toast.error("Failed to download invoice")
    }
  }

  const totalInvoiced = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0)
  const outstanding = invoices.reduce((s, i) => s + (i.balance || 0), 0)

  const nextDue = invoices
    .filter(i => i.status !== "paid" && i.status !== "void" && i.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

  const nextDueStr = nextDue
    ? new Date(nextDue.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "None"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      </div>
    )
  }

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
          { label: "Next Due", value: nextDueStr, icon: CreditCard, color: "text-orange-600" },
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
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Due Date</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Balance</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.invoice_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#1a3a6b]">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {inv.date ? new Date(inv.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">AED {(inv.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">AED {(inv.balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[inv.status] || "bg-gray-100 text-gray-700"}`}>
                      {inv.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDownload(inv.invoice_id)} className="p-1.5 text-gray-400 hover:text-[#1a3a6b]">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
            {invoices.length > 0 && (
              <tfoot><tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right">AED {totalInvoiced.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">AED {outstanding.toLocaleString()}</td>
                <td colSpan={2} />
              </tr></tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
