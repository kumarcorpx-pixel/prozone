import { NextRequest, NextResponse } from "next/server"
import { listInvoices, createInvoice, isZohoConfigured } from "@/lib/zoho"
import type { ZohoInvoiceInput } from "@/types/zoho"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET(request: NextRequest) {
  try {
    if (!isZohoConfigured()) {
      return NextResponse.json({ invoices: [], message: "Zoho not configured" })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get("status") || undefined
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || undefined

    const result = await listInvoices({
      page,
      per_page: 25,
      status,
      search_text: search,
      sort_column: "date",
      sort_order: "D",
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isZohoConfigured()) {
      return NextResponse.json({ error: "Zoho not configured" }, { status: 503 })
    }

    const body = await request.json()
    const { customer_id, service_type, gov_fees, service_fee, due_date, notes, company_name } = body

    if (!customer_id) {
      return NextResponse.json({ error: "customer_id is required" }, { status: 400 })
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
