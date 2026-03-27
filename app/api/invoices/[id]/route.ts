import { NextRequest, NextResponse } from "next/server"
import { getInvoice, updateInvoice, deleteInvoice, sendInvoice, getInvoicePdf, recordPayment, voidInvoice, isZohoConfigured } from "@/lib/zoho"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isZohoConfigured()) return NextResponse.json({ error: "Zoho not configured" }, { status: 503 })
    const { id } = await params
    const invoice = await getInvoice(id)
    return NextResponse.json({ invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isZohoConfigured()) return NextResponse.json({ error: "Zoho not configured" }, { status: 503 })
    const { id } = await params
    const body = await request.json()

    // Handle special actions
    if (body.action === "send") {
      await sendInvoice(id, {
        to_mail_ids: body.to_mail_ids || [],
        subject: body.subject,
        body: body.body,
      })
      return NextResponse.json({ success: true, message: "Invoice sent" })
    }

    if (body.action === "record_payment") {
      await recordPayment(id, {
        amount: body.amount,
        date: body.date || new Date().toISOString().split("T")[0],
        payment_mode: body.payment_mode || "bank_transfer",
        description: body.description,
      })
      return NextResponse.json({ success: true, message: "Payment recorded" })
    }

    if (body.action === "void") {
      await voidInvoice(id)
      return NextResponse.json({ success: true, message: "Invoice voided" })
    }

    if (body.action === "pdf") {
      const pdf = await getInvoicePdf(id)
      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
        },
      })
    }

    // Regular update
    const invoice = await updateInvoice(id, body)
    return NextResponse.json({ success: true, invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isZohoConfigured()) return NextResponse.json({ error: "Zoho not configured" }, { status: 503 })
    const { id } = await params
    await deleteInvoice(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
