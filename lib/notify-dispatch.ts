// @ts-nocheck
// Unified notification dispatcher — fires WhatsApp, email, and push notifications together
import { sendWhatsAppMessage, whatsappMessages } from "@/lib/whatsapp"
import { notifyStatusUpdate, notifyDocumentReady, notifyExpiryWarning, notifyPaymentDue, notifyStaffNewTask } from "@/lib/notifications"
import prisma from "@/lib/prisma"

const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

function emailTemplate(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;">
<tr><td align="center" style="padding:30px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:#1a3a6b;padding:24px;text-align:center;">
<div style="font-size:24px;font-weight:bold;color:#fff;">YABS</div>
<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;">Public Relations Management LLC</div>
</td></tr>
<tr><td style="padding:32px;">
<h2 style="margin:0 0 16px;color:#1a3a6b;">${title}</h2>
${body}
<p style="margin:24px 0 0;font-size:13px;color:#888;">This is an automated message from <a href="https://corporatepro.cloud" style="color:#1a3a6b;">corporatepro.cloud</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) return
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to,
      subject,
      html,
    })
  } catch (err: any) {
    console.error("[Email] Error:", err.message)
  }
}

async function createDbNotification(userId: string, title: string, message: string, type: "info" | "warning" | "success" | "error", link?: string) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, isRead: false, link },
    })
  } catch (err: any) {
    console.error("[DB Notification] Error:", err.message)
  }
}

// ============ EVENT DISPATCHERS ============

export async function dispatchStatusUpdate(request: {
  id: string
  serviceType: string
  status: string
  clientId?: string | null
  companyId?: string | null
}) {
  const { id, serviceType, status, clientId } = request
  if (!clientId) return

  const client = await prisma.user.findUnique({ where: { id: clientId }, select: { fullName: true, email: true, phone: true } })
  if (!client) return

  const statusLabel = status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())

  // 1. Database notification
  await createDbNotification(
    clientId,
    `Status Update: ${serviceType}`,
    `Your ${serviceType} request has been updated to ${statusLabel}`,
    "info",
    `/dashboard/requests/${id}`
  )

  // 2. Push notification (ntfy)
  await notifyStatusUpdate(clientId, serviceType, status, id)

  // 3. WhatsApp
  if (client.phone) {
    await sendWhatsAppMessage({
      to: client.phone,
      text: whatsappMessages.requestStatusUpdate(client.fullName, serviceType, status),
    })
  }

  // 4. Email
  if (client.email) {
    await sendEmail(
      client.email,
      `YABS - ${serviceType} Status: ${statusLabel}`,
      emailTemplate("Request Status Update", `
        <p style="color:#333;">Hi ${client.fullName},</p>
        <p style="color:#333;">Your <strong>${serviceType}</strong> request has been updated:</p>
        <div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#1a3a6b;">${statusLabel}</p>
        </div>
        <p style="color:#333;"><a href="https://corporatepro.cloud/dashboard/requests/${id}" style="display:inline-block;padding:10px 24px;background:#1a3a6b;color:#fff;border-radius:8px;text-decoration:none;">Track Your Request</a></p>
      `)
    )
  }
}

export async function dispatchDocumentReady(document: {
  name: string
  companyId?: string | null
}) {
  if (!document.companyId) return

  const company = await prisma.company.findUnique({
    where: { id: document.companyId },
    select: { name: true, createdById: true },
  })
  if (!company?.createdById) return

  const client = await prisma.user.findUnique({ where: { id: company.createdById }, select: { id: true, fullName: true, email: true, phone: true } })
  if (!client) return

  await createDbNotification(client.id, "Document Ready", `${document.name} for ${company.name} is ready`, "success", "/dashboard/documents")
  await notifyDocumentReady(client.id, document.name, company.name)

  if (client.phone) {
    await sendWhatsAppMessage({ to: client.phone, text: whatsappMessages.documentReady(document.name) })
  }
  if (client.email) {
    await sendEmail(client.email, `YABS - Document Ready: ${document.name}`,
      emailTemplate("Document Ready for Collection", `
        <p style="color:#333;">Hi ${client.fullName},</p>
        <p style="color:#333;">Your document <strong>${document.name}</strong> for <strong>${company.name}</strong> is now ready.</p>
        <p style="color:#333;"><a href="https://corporatepro.cloud/dashboard/documents" style="display:inline-block;padding:10px 24px;background:#1a3a6b;color:#fff;border-radius:8px;text-decoration:none;">View Documents</a></p>
      `))
  }
}

export async function dispatchExpiryAlert(item: {
  name: string
  daysRemaining: number
  companyId?: string
  type: string
}) {
  // Notify admin
  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true, email: true, phone: true, fullName: true } })
  for (const admin of admins) {
    await createDbNotification(admin.id, `Expiry Alert: ${item.name}`, `${item.name} expires in ${item.daysRemaining} days`, item.daysRemaining <= 7 ? "error" : "warning")
  }

  // Notify client (company owner)
  if (item.companyId) {
    const company = await prisma.company.findUnique({ where: { id: item.companyId }, select: { name: true, createdById: true } })
    if (company?.createdById) {
      const client = await prisma.user.findUnique({ where: { id: company.createdById }, select: { id: true, fullName: true, email: true, phone: true } })
      if (client) {
        await createDbNotification(client.id, `Expiry Alert`, `${item.name} expires in ${item.daysRemaining} days`, "warning", "/dashboard/company")
        await notifyExpiryWarning(client.id, item.type, company.name, item.daysRemaining)

        if (client.phone) {
          await sendWhatsAppMessage({ to: client.phone, text: whatsappMessages.expiryAlert(item.name, item.daysRemaining) })
        }
        if (client.email) {
          await sendEmail(client.email, `YABS - Expiry Alert: ${item.name}`,
            emailTemplate("Document Expiry Alert", `
              <p style="color:#333;">Hi ${client.fullName},</p>
              <p style="color:#333;"><strong>${item.name}</strong> expires in <strong>${item.daysRemaining} days</strong>.</p>
              <div style="background:${item.daysRemaining <= 7 ? "#fef2f2" : "#fffbeb"};padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid ${item.daysRemaining <= 7 ? "#ef4444" : "#f59e0b"};">
                <p style="margin:0;font-weight:bold;color:${item.daysRemaining <= 7 ? "#dc2626" : "#d97706"};">Action Required</p>
                <p style="margin:4px 0 0;color:#555;">Please contact us to arrange renewal before expiry.</p>
              </div>
              <p style="color:#333;"><a href="https://corporatepro.cloud/dashboard/company" style="display:inline-block;padding:10px 24px;background:#1a3a6b;color:#fff;border-radius:8px;text-decoration:none;">View Details</a></p>
            `))
        }
      }
    }
  }
}

export async function dispatchStaffAssignment(request: {
  id: string
  serviceType: string
  companyName: string
  staffId: string
  clientId?: string | null
}) {
  const staff = await prisma.user.findUnique({ where: { id: request.staffId }, select: { fullName: true, email: true, phone: true } })
  if (!staff) return

  // Notify staff
  await createDbNotification(request.staffId, "New Task Assigned", `${request.serviceType} for ${request.companyName}`, "info", `/staff/requests/${request.id}`)
  await notifyStaffNewTask(request.staffId, request.serviceType, request.companyName)

  if (staff.email) {
    await sendEmail(staff.email, `YABS - New Task: ${request.serviceType}`,
      emailTemplate("New Task Assigned", `
        <p style="color:#333;">Hi ${staff.fullName},</p>
        <p style="color:#333;">A new task has been assigned to you:</p>
        <div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:0;font-weight:bold;color:#1a3a6b;">${request.serviceType}</p>
          <p style="margin:4px 0 0;color:#555;">Company: ${request.companyName}</p>
        </div>
        <p style="color:#333;"><a href="https://corporatepro.cloud/staff/requests/${request.id}" style="display:inline-block;padding:10px 24px;background:#1a3a6b;color:#fff;border-radius:8px;text-decoration:none;">View Task</a></p>
      `))
  }

  // Notify client
  if (request.clientId) {
    const client = await prisma.user.findUnique({ where: { id: request.clientId }, select: { id: true, fullName: true } })
    if (client) {
      await createDbNotification(client.id, "Request Assigned", `${staff.fullName} is now handling your ${request.serviceType} request`, "success", `/dashboard/requests/${request.id}`)
    }
  }
}

export async function dispatchPaymentReminder(invoice: {
  invoiceNumber: string
  amount: number
  clientId?: string | null
}) {
  if (!invoice.clientId) return

  const client = await prisma.user.findUnique({ where: { id: invoice.clientId }, select: { id: true, fullName: true, email: true, phone: true } })
  if (!client) return

  await createDbNotification(client.id, "Payment Due", `Invoice #${invoice.invoiceNumber} - AED ${invoice.amount.toLocaleString()} is pending`, "warning", "/dashboard/payments")
  await notifyPaymentDue(client.id, invoice.amount.toLocaleString(), invoice.invoiceNumber)

  if (client.phone) {
    await sendWhatsAppMessage({ to: client.phone, text: whatsappMessages.paymentReminder(invoice.invoiceNumber, invoice.amount) })
  }
  if (client.email) {
    await sendEmail(client.email, `YABS - Payment Due: Invoice #${invoice.invoiceNumber}`,
      emailTemplate("Payment Reminder", `
        <p style="color:#333;">Hi ${client.fullName},</p>
        <p style="color:#333;">This is a reminder that your invoice is pending:</p>
        <div style="background:#fffbeb;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f59e0b;">
          <p style="margin:0;font-size:14px;color:#555;">Invoice #${invoice.invoiceNumber}</p>
          <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#1a3a6b;">AED ${invoice.amount.toLocaleString()}</p>
        </div>
        <p style="color:#333;"><a href="https://corporatepro.cloud/dashboard/payments" style="display:inline-block;padding:10px 24px;background:#1a3a6b;color:#fff;border-radius:8px;text-decoration:none;">View Invoice</a></p>
      `))
  }
}
