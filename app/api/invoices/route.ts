import { NextRequest, NextResponse } from "next/server"
import { listInvoices, createInvoice, isZohoConfigured } from "@/lib/zoho"
import type { ZohoInvoiceInput } from "@/types/zoho"
import { handleApiError } from "@/lib/api-error-handler"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get("status") || undefined
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || undefined

    let zohoInvoices: any[] = []
    let pageContext: any = undefined

    if (isZohoConfigured()) {
      try {
        const result = await listInvoices({
          page,
          per_page: 25,
          status,
          search_text: search,
          sort_column: "date",
          sort_order: "D",
        })
        zohoInvoices = result.invoices || []
        pageContext = result.page_context
      } catch {
        // Zoho fetch failed, continue with local invoices only
      }
    }

    // Also fetch local invoices from DB
    try {
      const localInvoices = await prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
      })
      const localMapped = localInvoices.map((inv: any) => ({
        invoice_id: inv.id,
        invoice_number: inv.invoiceNumber,
        customer_name: inv.items ? (() => {
          try {
            const items = JSON.parse(typeof inv.items === "string" ? inv.items : JSON.stringify(inv.items))
            return items[0]?.description || "Local Client"
          } catch { return "Local Client" }
        })() : "Local Client",
        date: inv.createdAt?.toISOString().split("T")[0],
        due_date: inv.dueDate?.toISOString().split("T")[0],
        total: Number(inv.totalAmount),
        balance: inv.status === "paid" ? 0 : Number(inv.totalAmount),
        status: inv.status,
      }))
      const zohoConfigured = isZohoConfigured()
      return NextResponse.json({ invoices: [...zohoInvoices, ...localMapped], page_context: pageContext, zoho_configured: zohoConfigured })
    } catch {
      const zohoConfigured = isZohoConfigured()
      return NextResponse.json({ invoices: zohoInvoices, page_context: pageContext, zoho_configured: zohoConfigured })
    }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, customer_name, service_type, gov_fees, service_fee, due_date, notes, company_name, client_id } = body

    // If Zoho is not configured or customer_id is missing, create local invoice
    if (!isZohoConfigured() || !customer_id) {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      const govFeesNum = parseFloat(gov_fees) || 0
      const serviceFeeNum = parseFloat(service_fee) || 0
      const subtotal = govFeesNum + serviceFeeNum
      const vat = subtotal * 0.05
      const total = subtotal + vat

      if (subtotal === 0) {
        return NextResponse.json({ error: "At least one fee is required" }, { status: 400 })
      }

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          clientId: client_id || null,
          subtotal,
          vatPercentage: 5,
          vatAmount: vat,
          totalAmount: total,
          status: "pending",
          dueDate: due_date ? new Date(due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: JSON.stringify([
            ...(govFeesNum > 0 ? [{ name: "Government Fees", description: service_type || "PRO Service", rate: govFeesNum, quantity: 1 }] : []),
            ...(serviceFeeNum > 0 ? [{ name: "Service Charge", description: company_name || "", rate: serviceFeeNum, quantity: 1 }] : []),
          ]),
        },
      })

      return NextResponse.json({ success: true, invoice: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        customer_name: customer_name || company_name || "Client",
        total: Number(invoice.totalAmount),
        balance: Number(invoice.totalAmount),
        status: invoice.status,
        date: invoice.createdAt,
        due_date: invoice.dueDate,
      }})
    }

    // Build line items
    const line_items: ZohoInvoiceInput["line_items"] = []

    if (gov_fees && gov_fees > 0) {
      line_items.push({
        name: "Government Fees",
        description: `${service_type || "PRO Service"} - Government fees for ${company_name || "client"}`,
        rate: gov_fees,
        quantity: 1,
      })
    }

    if (service_fee && service_fee > 0) {
      line_items.push({
        name: "YABS Service Charge",
        description: `${service_type || "PRO Service"} - Professional service charge`,
        rate: service_fee,
        quantity: 1,
      })
    }

    if (line_items.length === 0) {
      return NextResponse.json({ error: "At least one fee is required" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    const invoiceData: ZohoInvoiceInput = {
      customer_id,
      date: today,
      due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      line_items,
      notes: notes || `Invoice for ${service_type || "PRO Services"}\nCompany: ${company_name || "N/A"}`,
      terms: "Payment due within 30 days. Bank transfer to YABS account.",
      is_inclusive_tax: false,
    }

    const invoice = await createInvoice(invoiceData)
    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    return handleApiError(error)
  }
}
