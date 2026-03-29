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
      subject: parsed?.subject || "",
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

      // XSS escape helper
      const esc = (str: string) => String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

      const customerName = esc(parsed?.customerName || "Client")
      const companyName = esc(parsed?.companyName || "")
      const subjectText = parsed?.subject ? esc(parsed.subject) : ""
      const termsText = parsed?.terms ? esc(parsed.terms) : ""
      const notesText = parsed?.notes ? esc(parsed.notes) : "Thank you for choosing YABS. You just made our day."

      // Number to words converter (up to 999,999)
      const numberToWords = (num: number): string => {
        if (num === 0) return "Zero"
        const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
          "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

        const convert = (n: number): string => {
          if (n < 20) return ones[n]
          if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
          if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "")
          return ""
        }

        const intPart = Math.floor(num)
        const decimal = Math.round((num - intPart) * 100)

        let result = ""
        if (intPart >= 1000) {
          result += convert(Math.floor(intPart / 1000)) + " Thousand"
          if (intPart % 1000) result += " " + convert(intPart % 1000)
        } else {
          result = convert(intPart)
        }

        if (decimal > 0) {
          result += " and " + convert(decimal) + " Fils"
        }

        return result
      }

      const totalAmount = Number(invoice.totalAmount)
      const subtotalAmount = Number(invoice.subtotal)
      const taxTotal = Number(invoice.vatAmount)
      const balanceDue = invoice.status === "paid" ? 0 : totalAmount
      const totalInWords = "UAE Dirham " + numberToWords(totalAmount)

      // Calculate per-item taxes for display
      const itemRows = lineItems.map((item: any, i: number) => {
        const qty = Number(item.quantity) || 1
        const rate = Number(item.rate) || 0
        const taxableAmount = rate * qty
        const taxPercent = Number(item.tax_percent) || 0
        const taxAmt = Number(item.tax_amount) || Math.round(taxableAmount * taxPercent) / 100
        const amount = taxableAmount + taxAmt
        return `<tr>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:center;font-size:12px">${i + 1}</td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;font-size:12px">
            <strong>${esc(item.name || "")}</strong>${item.description ? `<br><span style="color:#666;font-size:11px">${esc(item.description)}</span>` : ""}
          </td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:center;font-size:12px">${qty}</td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-size:12px">${rate.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-size:12px">${taxableAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-size:12px">${taxAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${taxPercent}%)</td>
          <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-size:12px;font-weight:600">${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
        </tr>`
      }).join("")

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Tax Invoice ${esc(invoice.invoiceNumber || "")}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; padding: 0; margin: 0; background: #f5f5f5; }
  .page { max-width: 900px; margin: 0 auto; background: white; padding: 0; }
  .print-bar {
    background: #f0f4f8; border: 1px solid #d1d5db; border-radius: 8px;
    padding: 12px 20px; margin: 16px auto; max-width: 900px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .print-bar button {
    background: #1a3a6b; color: white; border: none; padding: 10px 24px;
    border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .print-bar button:hover { background: #15305a; }
  .print-bar .hint { color: #555; font-size: 13px; }
  @media print {
    .print-bar { display: none !important; }
    body { padding: 0; background: white; }
    .page { margin: 0; box-shadow: none; }
  }
  @media screen {
    .page { box-shadow: 0 2px 20px rgba(0,0,0,0.1); margin: 16px auto; }
  }
</style>
</head>
<body>
<div class="print-bar">
  <span class="hint">Download as PDF: Use <b>Ctrl+P</b> (Windows/Linux) or <b>Cmd+P</b> (Mac) to save as PDF</span>
  <button onclick="window.print()">Print / Save PDF</button>
</div>
<div class="page">
  <!-- Navy Header Bar -->
  <div style="background:#1a3a6b;padding:30px 40px;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:36px;font-weight:800;color:white;letter-spacing:2px">YABS</div>
      <div style="font-size:12px;color:#a0b4d0;margin-top:2px;text-transform:uppercase;letter-spacing:1px">PUBLIC RELATIONS MANAGEMENT LLC</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:28px;font-weight:700;color:white;letter-spacing:1px">TAX INVOICE</div>
      <div style="font-size:14px;color:#D4A843;margin-top:4px;font-weight:600">${esc(invoice.invoiceNumber || "")}</div>
    </div>
  </div>

  <!-- Company Info + Invoice Details -->
  <div style="padding:24px 40px;display:flex;justify-content:space-between;border-bottom:2px solid #D4A843">
    <div style="font-size:12px;color:#555;line-height:1.8">
      258 Sochon Business park<br>
      Dubai Investment Park 1, United Arab Emirates<br>
      info@yabsuae.com<br>
      <strong>TRN: 100534915200003</strong>
    </div>
    <div style="text-align:right;font-size:12px;color:#555;line-height:1.8">
      <div><strong>Invoice Date:</strong> ${invoice.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
      <div><strong>Terms:</strong> Net 30</div>
      <div><strong>Due Date:</strong> ${invoice.dueDate?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) || "On Receipt"}</div>
      ${invoice.paidDate ? `<div><strong>Paid:</strong> ${invoice.paidDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>` : ""}
    </div>
  </div>

  <!-- Customer Section -->
  <div style="padding:20px 40px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Customer:</div>
    <div style="font-size:16px;font-weight:700;color:#1a3a6b">${companyName || customerName}</div>
    ${companyName && customerName !== companyName ? `<div style="font-size:13px;color:#555;margin-top:2px">${customerName}</div>` : ""}
  </div>

  ${subjectText ? `
  <!-- Subject -->
  <div style="padding:0 40px 20px">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Subject:</div>
    <div style="font-size:14px;color:#333">${subjectText}</div>
  </div>
  ` : ""}

  <!-- Line Items Table -->
  <div style="padding:0 40px">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#1a3a6b">
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:center;border:1px solid #1a3a6b;width:36px">#</th>
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:left;border:1px solid #1a3a6b">Item &amp; Description</th>
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:center;border:1px solid #1a3a6b;width:50px">Qty</th>
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:right;border:1px solid #1a3a6b;width:90px">Rate</th>
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:right;border:1px solid #1a3a6b;width:110px">Taxable Amount</th>
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:right;border:1px solid #1a3a6b;width:100px">Tax</th>
          <th style="padding:10px 12px;color:white;font-size:11px;text-transform:uppercase;text-align:right;border:1px solid #1a3a6b;width:100px">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div style="padding:20px 40px;display:flex;justify-content:flex-end">
    <table style="width:320px;border-collapse:collapse">
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#555">Sub Total</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:500">${subtotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#555">Tax</td>
        <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:500">${taxTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr style="border-top:2px solid #1a3a6b">
        <td style="padding:12px;font-size:15px;font-weight:700;color:#1a3a6b">Total</td>
        <td style="padding:12px;font-size:15px;text-align:right;font-weight:700;color:#1a3a6b">AED ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr style="background:#f7f8fa">
        <td style="padding:12px;font-size:14px;font-weight:700;color:#1a3a6b">Balance Due</td>
        <td style="padding:12px;font-size:14px;text-align:right;font-weight:700;color:#1a3a6b">AED ${balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <!-- Total in Words -->
  <div style="padding:0 40px 20px">
    <div style="background:#f7f8fa;border:1px solid #e5e7eb;border-radius:6px;padding:12px 16px;font-size:12px;color:#555">
      <strong>Total In Words:</strong> ${esc(totalInWords)}
    </div>
  </div>

  ${termsText ? `
  <!-- Terms -->
  <div style="padding:0 40px 16px">
    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Terms &amp; Conditions</div>
    <div style="font-size:12px;color:#555">${termsText}</div>
  </div>
  ` : ""}

  <!-- Footer Note -->
  <div style="padding:16px 40px;text-align:center;font-size:13px;color:#666;font-style:italic;border-top:1px solid #eee">
    ${notesText}
  </div>

  <!-- Payment Options -->
  <div style="padding:20px 40px 30px;background:#f7f8fa;border-top:2px solid #D4A843">
    <div style="font-size:13px;font-weight:700;color:#1a3a6b;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Payment Options - Bank Account Details</div>
    <table style="font-size:12px;color:#555;line-height:1.8">
      <tr><td style="padding:2px 16px 2px 0;font-weight:600;color:#333">Account Name</td><td>YABS public relations management llc</td></tr>
      <tr><td style="padding:2px 16px 2px 0;font-weight:600;color:#333">Account Number</td><td>1015785570501</td></tr>
      <tr><td style="padding:2px 16px 2px 0;font-weight:600;color:#333">Bank Name</td><td>Emirates NBD</td></tr>
      <tr><td style="padding:2px 16px 2px 0;font-weight:600;color:#333">Branch Name</td><td>AL QIYADAH BRANCH</td></tr>
      <tr><td style="padding:2px 16px 2px 0;font-weight:600;color:#333">BIC Code</td><td>EBILAEADXXX</td></tr>
      <tr><td style="padding:2px 16px 2px 0;font-weight:600;color:#333">IBAN</td><td>AE180260001015785570501</td></tr>
    </table>
  </div>
</div>
</body>
</html>`

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
