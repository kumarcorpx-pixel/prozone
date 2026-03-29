import { NextRequest, NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error-handler"
import { withAuth } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined

    const where: any = {}
    if (status && status !== "all") where.status = status
    if (auth.user.role === "client") where.clientId = auth.user.id

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const mapped = invoices.map((inv: any) => {
      let customerName = "Client"
      let lineItems: any[] = []
      try {
        const items = typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items
        lineItems = items || []
        customerName = items?.[0]?.customerName || items?.[0]?.description || "Client"
      } catch {}

      return {
        invoice_id: inv.id,
        invoice_number: inv.invoiceNumber,
        customer_name: customerName,
        date: inv.createdAt?.toISOString().split("T")[0],
        due_date: inv.dueDate?.toISOString().split("T")[0],
        total: Number(inv.totalAmount),
        sub_total: Number(inv.subtotal),
        tax_total: Number(inv.vatAmount),
        balance: inv.status === "paid" ? 0 : Number(inv.totalAmount),
        status: inv.status,
        line_items: lineItems,
        notes: inv.items ? (() => { try { const p = typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items; return p?.notes } catch { return "" } })() : "",
        client_id: inv.clientId,
        paid_date: inv.paidDate?.toISOString().split("T")[0],
        payment_method: inv.paymentMethod,
      }
    })

    // Filter by search
    let filtered = mapped
    if (search) {
      const q = search.toLowerCase()
      filtered = mapped.filter((inv: any) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.customer_name.toLowerCase().includes(q)
      )
    }

    // Summary stats
    const totalInvoiced = mapped.reduce((s: number, i: any) => s + i.total, 0)
    const totalPaid = mapped.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + i.total, 0)
    const outstanding = mapped.filter((i: any) => i.status !== "paid" && i.status !== "cancelled").reduce((s: number, i: any) => s + i.total, 0)
    const overdue = mapped.filter((i: any) => {
      if (i.status === "paid" || i.status === "cancelled") return false
      return i.due_date && new Date(i.due_date) < new Date()
    }).reduce((s: number, i: any) => s + i.total, 0)

    return NextResponse.json({
      invoices: filtered,
      summary: { totalInvoiced, totalPaid, outstanding, overdue },
      total: filtered.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { customer_name, company_name, client_id, line_items, due_date, notes, terms } = body

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json({ error: "At least one line item is required" }, { status: 400 })
    }

    if (!customer_name && !company_name) {
      return NextResponse.json({ error: "Customer or company name is required" }, { status: 400 })
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Calculate totals
    const items = line_items.map((item: any) => ({
      name: item.name || "Service",
      description: item.description || "",
      rate: Number(item.rate) || 0,
      quantity: Number(item.quantity) || 1,
      item_total: (Number(item.rate) || 0) * (Number(item.quantity) || 1),
    }))

    const subtotal = items.reduce((s: number, i: any) => s + i.item_total, 0)
    const vatPercent = 5
    const vatAmount = Math.round(subtotal * vatPercent) / 100
    const totalAmount = subtotal + vatAmount

    // Store with customer info in items JSON
    const itemsWithMeta = {
      customerName: customer_name || company_name,
      companyName: company_name || customer_name,
      notes: notes || "",
      terms: terms || "Payment due within 30 days. Bank transfer to YABS account.",
      lineItems: items,
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: client_id || null,
        subtotal,
        vatPercentage: vatPercent,
        vatAmount,
        totalAmount,
        discount: 0,
        status: "pending",
        dueDate: due_date ? new Date(due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: JSON.stringify(itemsWithMeta),
      },
    })

    return NextResponse.json({
      success: true,
      invoice: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        customer_name: customer_name || company_name,
        total: Number(invoice.totalAmount),
        sub_total: Number(invoice.subtotal),
        tax_total: Number(invoice.vatAmount),
        balance: Number(invoice.totalAmount),
        status: invoice.status,
        date: invoice.createdAt.toISOString().split("T")[0],
        due_date: invoice.dueDate?.toISOString().split("T")[0],
        line_items: items,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
