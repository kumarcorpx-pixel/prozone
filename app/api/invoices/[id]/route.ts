import { NextRequest, NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error-handler"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

    // Client scoping: verify the invoice belongs to this client
    const companyFilter = await getClientCompanyFilter(auth.user)
    if (companyFilter && invoice.clientId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let parsed: any = {}
    try { parsed = typeof invoice.items === "string" ? JSON.parse(invoice.items as string) : invoice.items } catch {}

    return NextResponse.json({
      invoice_id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      customer_name: parsed?.customerName || "Client",
      company_name: parsed?.companyName || "",
      date: invoice.createdAt.toISOString().split("T")[0],
      due_date: invoice.dueDate?.toISOString().split("T")[0],
      total: Number(invoice.totalAmount),
      sub_total: Number(invoice.subtotal),
      tax_total: Number(invoice.vatAmount),
      vat_percentage: Number(invoice.vatPercentage),
      discount: Number(invoice.discount),
      balance: invoice.status === "paid" ? 0 : Number(invoice.totalAmount),
      status: invoice.status,
      line_items: parsed?.lineItems || [],
      notes: parsed?.notes || "",
      terms: parsed?.terms || "",
      client_id: invoice.clientId,
      paid_date: invoice.paidDate?.toISOString().split("T")[0],
      payment_method: invoice.paymentMethod,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

    // Record payment
    if (action === "record_payment") {
      const { payment_method } = body
      await prisma.invoice.update({
        where: { id },
        data: {
          status: "paid",
          paidDate: new Date(),
          paymentMethod: payment_method || "bank_transfer",
        },
      })

      // Create notification for client
      if (invoice.clientId) {
        try {
          await prisma.notification.create({
            data: {
              userId: invoice.clientId,
              title: "Payment Confirmed",
              message: `Payment received for invoice ${invoice.invoiceNumber} — AED ${Number(invoice.totalAmount).toLocaleString()}`,
              type: "success",
              isRead: false,
            },
          })
        } catch {}
      }

      return NextResponse.json({ success: true, message: "Payment recorded" })
    }

    // Send invoice to client
    if (action === "send") {
      let parsed: any = {}
      try { parsed = typeof invoice.items === "string" ? JSON.parse(invoice.items as string) : invoice.items } catch {}

      // Create notification
      if (invoice.clientId) {
        try {
          await prisma.notification.create({
            data: {
              userId: invoice.clientId,
              title: `Invoice ${invoice.invoiceNumber}`,
              message: `New invoice for AED ${Number(invoice.totalAmount).toLocaleString()} — due ${invoice.dueDate?.toLocaleDateString("en-GB") || "in 30 days"}`,
              type: "info",
              isRead: false,
              link: "/dashboard/payments",
            },
          })
        } catch {}
      }

      // Send email
      if (invoice.clientId && process.env.RESEND_API_KEY) {
        try {
          const client = await prisma.user.findUnique({ where: { id: invoice.clientId }, select: { email: true, fullName: true } })
          if (client?.email) {
            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY)
            await resend.emails.send({
              from: process.env.EMAIL_FROM || "YABS PRO <noreply@yabspro.com>",
              to: client.email,
              subject: `Invoice ${invoice.invoiceNumber} — AED ${Number(invoice.totalAmount).toLocaleString()}`,
              html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#1a3a6b;padding:24px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0">YABS PRO Services</h1></div><div style="padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px"><h2 style="color:#1a3a6b">Invoice ${invoice.invoiceNumber}</h2><p>Dear ${client.fullName || parsed?.customerName || "Client"},</p><div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0"><p><strong>Amount:</strong> AED ${Number(invoice.totalAmount).toLocaleString()}</p><p><strong>Due:</strong> ${invoice.dueDate?.toLocaleDateString("en-GB") || "30 days"}</p></div><a href="https://corporatepro.cloud/dashboard/payments" style="display:inline-block;padding:12px 30px;background:#1a3a6b;color:white;border-radius:8px;text-decoration:none;font-weight:bold">View Invoice</a><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/><p style="color:#999;font-size:12px;text-align:center">YABS Public Relations Management LLC | +971 56 520 4844</p></div></div>`,
            })
          }
        } catch {}
      }

      return NextResponse.json({ success: true, message: "Invoice sent" })
    }

    // Void invoice
    if (action === "void") {
      await prisma.invoice.update({ where: { id }, data: { status: "cancelled" } })
      return NextResponse.json({ success: true, message: "Invoice voided" })
    }

    // Mark overdue
    if (action === "mark_overdue") {
      await prisma.invoice.update({ where: { id }, data: { status: "overdue" } })
      return NextResponse.json({ success: true, message: "Marked as overdue" })
    }

    // Generate PDF (HTML)
    if (action === "pdf") {
      let parsed: any = {}
      try { parsed = typeof invoice.items === "string" ? JSON.parse(invoice.items as string) : invoice.items } catch {}
      const lineItems = parsed?.lineItems || []

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#333}.header{display:flex;justify-content:space-between;margin-bottom:40px}.logo{font-size:28px;font-weight:bold;color:#1a3a6b}.logo-sub{font-size:11px;color:#666}.invoice-title{font-size:32px;font-weight:bold;color:#1a3a6b;text-align:right}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px}.info-block h4{color:#1a3a6b;font-size:12px;text-transform:uppercase;margin:0 0 8px}.info-block p{margin:3px 0;font-size:13px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#1a3a6b;color:white;padding:10px 12px;text-align:left;font-size:12px}td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px}.totals{text-align:right;margin-top:20px}.totals table{width:300px;margin-left:auto}.totals td{border:none;padding:6px 12px}.grand-total{font-size:18px;font-weight:bold;color:#1a3a6b;border-top:2px solid #1a3a6b}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:11px;color:#888;text-align:center}.terms{margin-top:30px;padding:15px;background:#f7f8fa;border-radius:8px;font-size:12px;color:#666}@media print{body{padding:20px}}</style></head><body>
      <div class="header"><div><div class="logo">YABS</div><div class="logo-sub">Public Relations Management LLC</div><p style="font-size:12px;color:#666;margin-top:8px">258, Central Plaza, Schon Business Park<br>DIP(1), Dubai, UAE<br>+971 56 520 4844 | info@yabs.ae</p></div><div><div class="invoice-title">INVOICE</div><div style="font-size:14px;color:#666;text-align:right">${invoice.invoiceNumber}</div><div style="font-size:12px;color:#888;text-align:right;margin-top:8px">${invoice.status === "paid" ? '<span style="background:#16a34a;color:white;padding:3px 10px;border-radius:4px;font-size:11px">PAID</span>' : invoice.status === "overdue" ? '<span style="background:#dc2626;color:white;padding:3px 10px;border-radius:4px;font-size:11px">OVERDUE</span>' : '<span style="background:#d97706;color:white;padding:3px 10px;border-radius:4px;font-size:11px">PENDING</span>'}</div></div></div>
      <div class="info-grid"><div class="info-block"><h4>Bill To</h4><p><strong>${parsed?.customerName || "Client"}</strong></p><p>${parsed?.companyName || ""}</p></div><div class="info-block" style="text-align:right"><h4>Invoice Details</h4><p><strong>Date:</strong> ${invoice.createdAt.toLocaleDateString("en-GB")}</p><p><strong>Due Date:</strong> ${invoice.dueDate?.toLocaleDateString("en-GB") || "—"}</p>${invoice.paidDate ? `<p><strong>Paid:</strong> ${invoice.paidDate.toLocaleDateString("en-GB")}</p>` : ""}</div></div>
      <table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate (AED)</th><th style="text-align:right">Amount (AED)</th></tr></thead><tbody>${lineItems.map((item: any, i: number) => `<tr><td>${i + 1}</td><td><strong>${item.name}</strong>${item.description ? `<br><span style="color:#888;font-size:11px">${item.description}</span>` : ""}</td><td>${item.quantity}</td><td>${Number(item.rate).toLocaleString()}</td><td style="text-align:right">${Number(item.item_total).toLocaleString()}</td></tr>`).join("")}</tbody></table>
      <div class="totals"><table><tr><td>Subtotal</td><td style="text-align:right">AED ${Number(invoice.subtotal).toLocaleString()}</td></tr><tr><td>VAT (${Number(invoice.vatPercentage)}%)</td><td style="text-align:right">AED ${Number(invoice.vatAmount).toLocaleString()}</td></tr>${Number(invoice.discount) > 0 ? `<tr><td>Discount</td><td style="text-align:right">-AED ${Number(invoice.discount).toLocaleString()}</td></tr>` : ""}<tr><td class="grand-total">Total Due</td><td class="grand-total" style="text-align:right">AED ${Number(invoice.totalAmount).toLocaleString()}</td></tr></table></div>
      ${parsed?.terms ? `<div class="terms"><strong>Terms:</strong><br>${parsed.terms}</div>` : ""}
      ${parsed?.notes ? `<div class="terms"><strong>Notes:</strong><br>${parsed.notes}</div>` : ""}
      <div class="footer"><p>YABS Public Relations Management LLC | corporatepro.cloud</p><p>Computer-generated invoice. No signature required.</p></div>
      <script>window.onload=function(){window.print()}</script></body></html>`

      return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
    }

    // Regular update
    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.due_date) updateData.dueDate = new Date(body.due_date)
    await prisma.invoice.update({ where: { id }, data: updateData })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    await prisma.invoice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
