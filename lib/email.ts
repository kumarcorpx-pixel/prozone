// @ts-nocheck
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

function getEmailTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:30px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a3a6b;padding:30px;text-align:center;">
              <div style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">YABS</div>
              <div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:4px;">Public Relations Management LLC</div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;background-color:#ffffff;">
              <h1 style="margin:0 0 20px;font-size:24px;color:#1a3a6b;font-weight:bold;">${title}</h1>
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px;text-align:center;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#6b7280;">YABS Public Relations Management LLC</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Dubai, UAE</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">support@yabs.ae | www.corporatepro.cloud</p>
              <br>
              <p style="margin:0;font-size:11px;color:#9ca3af;">You received this email because you have an account on YABS Portal.</p>
              <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;"><a href="https://corporatepro.cloud/dashboard/settings" style="color:#1a3a6b;">Manage notification preferences</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function infoBox(items: { label: string; value: string }[]): string {
  return `<div style="background-color:#f0f4f8;border-radius:8px;padding:20px;margin:20px 0;">
    ${items.map(i => `<div style="margin-bottom:8px;"><span style="font-size:13px;color:#6b7280;">${i.label}:</span> <strong style="font-size:14px;color:#1a3a6b;">${i.value}</strong></div>`).join("")}
  </div>`
}

function blueButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:30px 0;">
    <a href="${url}" style="display:inline-block;background-color:#1a3a6b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">${text}</a>
  </div>`
}

function badge(text: string, color: string): string {
  const colors: Record<string, string> = {
    green: "background-color:#dcfce7;color:#166534;",
    gray: "background-color:#f3f4f6;color:#374151;",
    blue: "background-color:#dbeafe;color:#1e40af;",
    yellow: "background-color:#fef9c3;color:#854d0e;",
    red: "background-color:#fee2e2;color:#991b1b;",
    orange: "background-color:#ffedd5;color:#9a3412;",
  }
  return `<span style="display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;${colors[color] || colors.gray}">${text}</span>`
}

// ============ EMAIL FUNCTIONS ============

export async function sendWelcomeEmail(name: string, email: string, tempPassword: string) {
  try {
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">Your YABS Portal account has been created. You can now track your PRO services, documents, and payments online.</p>
      ${infoBox([
        { label: "Email", value: email },
        { label: "Temporary Password", value: tempPassword },
      ])}
      ${blueButton("Login to Portal", "https://corporatepro.cloud/login")}
      <p style="font-size:13px;color:#6b7280;">Please change your password after first login.</p>
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: "Welcome to YABS Portal",
      html: getEmailTemplate(content, "Welcome to YABS Portal"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendWelcomeEmail error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendRequestConfirmation(name: string, email: string, serviceName: string, companyName: string, requestId: string) {
  try {
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">Your service request has been submitted successfully.</p>
      ${infoBox([
        { label: "Service Type", value: serviceName },
        { label: "Company", value: companyName },
        { label: "Reference ID", value: requestId },
        { label: "Status", value: "Pending" },
      ])}
      <p style="font-size:14px;color:#374151;">Our team will review and assign a PRO officer shortly.</p>
      ${blueButton("Track Progress", "https://corporatepro.cloud/dashboard/requests")}
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `Request Confirmed - ${serviceName}`,
      html: getEmailTemplate(content, "Request Confirmed"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendRequestConfirmation error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendStatusUpdate(name: string, email: string, serviceName: string, companyName: string, oldStatus: string, newStatus: string) {
  try {
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">Your service request has been updated.</p>
      ${infoBox([
        { label: "Service", value: serviceName },
        { label: "Company", value: companyName },
      ])}
      <div style="text-align:center;margin:20px 0;">
        ${badge(oldStatus.replace(/_/g, " ").toUpperCase(), "gray")}
        <span style="margin:0 12px;font-size:18px;color:#9ca3af;">→</span>
        ${badge(newStatus.replace(/_/g, " ").toUpperCase(), "green")}
      </div>
      ${blueButton("View Details", "https://corporatepro.cloud/dashboard/requests")}
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `Status Update: ${serviceName} → ${newStatus.replace(/_/g, " ")}`,
      html: getEmailTemplate(content, "Status Update"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendStatusUpdate error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendDocumentNotification(name: string, email: string, documentName: string, companyName: string) {
  try {
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">A new document has been uploaded to your portal.</p>
      ${infoBox([
        { label: "Document", value: documentName },
        { label: "Company", value: companyName },
        { label: "Date", value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
      ])}
      ${blueButton("View Documents", "https://corporatepro.cloud/dashboard/documents")}
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `New Document Available - ${documentName}`,
      html: getEmailTemplate(content, "New Document Available"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendDocumentNotification error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendInvoiceEmail(name: string, email: string, invoiceNumber: string, amount: string, dueDate: string, services: { name: string; amount: string }[]) {
  try {
    const serviceRows = services.map(s =>
      `<tr><td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">${s.name}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;">AED ${s.amount}</td></tr>`
    ).join("")
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">A new invoice has been generated for your account.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;font-weight:600;">Service</th>
          <th style="padding:12px;text-align:right;font-size:13px;color:#6b7280;font-weight:600;">Amount</th>
        </tr>
        ${serviceRows}
        <tr style="background-color:#f0f4f8;">
          <td style="padding:12px;font-size:14px;font-weight:bold;color:#1a3a6b;">Total</td>
          <td style="padding:12px;font-size:16px;font-weight:bold;color:#1a3a6b;text-align:right;">AED ${amount}</td>
        </tr>
      </table>
      ${infoBox([
        { label: "Invoice #", value: invoiceNumber },
        { label: "Due Date", value: dueDate },
        { label: "Total Amount", value: `AED ${amount}` },
      ])}
      ${blueButton("Pay Online", "https://corporatepro.cloud/dashboard/payments")}
      <p style="font-size:12px;color:#6b7280;margin-top:20px;">For bank transfer: Emirates NBD | Account: XXXX | IBAN: XXXX</p>
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `Invoice #${invoiceNumber} - AED ${amount}`,
      html: getEmailTemplate(content, "Invoice"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendInvoiceEmail error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendPaymentConfirmation(name: string, email: string, amount: string, invoiceNumber: string) {
  try {
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">We have received your payment. Thank you!</p>
      ${infoBox([
        { label: "Amount Paid", value: `AED ${amount}` },
        { label: "Invoice #", value: invoiceNumber },
        { label: "Date", value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
      ])}
      <div style="text-align:center;margin:15px 0;">${badge("PAID", "green")}</div>
      ${blueButton("View Receipt", "https://corporatepro.cloud/dashboard/payments")}
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `Payment Received - AED ${amount}`,
      html: getEmailTemplate(content, "Payment Received"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendPaymentConfirmation error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendExpiryReminder(name: string, email: string, documentType: string, companyName: string, expiryDate: string, daysRemaining: number) {
  try {
    const urgency = daysRemaining <= 7 ? "red" : daysRemaining <= 30 ? "orange" : "yellow"
    const bgColor = urgency === "red" ? "#fee2e2" : urgency === "orange" ? "#ffedd5" : "#fef9c3"
    const textColor = urgency === "red" ? "#991b1b" : urgency === "orange" ? "#9a3412" : "#854d0e"
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <div style="background-color:${bgColor};border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid ${textColor};">
        <p style="margin:0;font-size:15px;color:${textColor};font-weight:600;">⚠️ ${documentType} for ${companyName} expires on ${expiryDate} (${daysRemaining} days remaining)</p>
      </div>
      <p style="font-size:14px;color:#374151;">To avoid penalties and business disruption, please initiate the renewal process.</p>
      ${blueButton("Submit Renewal Request", "https://corporatepro.cloud/dashboard/requests")}
      <p style="font-size:13px;color:#6b7280;">Or contact us at support@yabs.ae</p>
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `⚠️ ${documentType} Expiring in ${daysRemaining} Days`,
      html: getEmailTemplate(content, "Expiry Reminder"),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendExpiryReminder error:", err)
    return { success: false, error: err.message }
  }
}

export async function sendMonthlyReport(name: string, email: string, stats: { activeRequests: number; completedThisMonth: number; upcomingExpiries: number; pendingPayments: number; totalAmount: string }) {
  try {
    const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const statBox = (label: string, value: number, color: string) =>
      `<td style="padding:15px;text-align:center;background-color:${color};border-radius:8px;width:50%;">
        <div style="font-size:28px;font-weight:bold;color:#1a3a6b;">${value}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">${label}</div>
      </td>`
    const content = `
      <p style="font-size:15px;color:#374151;line-height:1.6;">Hi ${name},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;">Here's your monthly summary:</p>
      <table width="100%" cellpadding="0" cellspacing="8" style="margin:20px 0;">
        <tr>
          ${statBox("Active Requests", stats.activeRequests, "#dbeafe")}
          ${statBox("Completed", stats.completedThisMonth, "#dcfce7")}
        </tr>
        <tr>
          ${statBox("Upcoming Expiries", stats.upcomingExpiries, "#ffedd5")}
          ${statBox("Pending Payments", stats.pendingPayments, "#fee2e2")}
        </tr>
      </table>
      ${stats.pendingPayments > 0 ? `<p style="font-size:14px;color:#991b1b;font-weight:600;">You have AED ${stats.totalAmount} in pending payments.</p>` : ""}
      ${blueButton("Go to Dashboard", "https://corporatepro.cloud/dashboard")}
    `
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: email,
      subject: `Monthly Report - ${month}`,
      html: getEmailTemplate(content, `Monthly Report - ${month}`),
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendMonthlyReport error:", err)
    return { success: false, error: err.message }
  }
}

// Legacy exports for backward compatibility
export const emailTemplates = {
  requestStatusUpdate: (clientName: string, serviceType: string, status: string, companyName: string) => ({
    subject: `Status Update: ${serviceType} - ${status.replace(/_/g, " ").toUpperCase()}`,
    html: getEmailTemplate(`<p>Hi ${clientName},</p><p>Your ${serviceType} request for ${companyName} has been updated to <strong>${status.replace(/_/g, " ")}</strong>.</p>${blueButton("View Details", "https://corporatepro.cloud/dashboard/requests")}`, "Status Update"),
  }),
  expiryAlert: (recipientName: string, itemName: string, itemType: string, expiryDate: string, daysLeft: number, companyName: string) => ({
    subject: `⚠️ ${itemType} Expiry Alert: ${itemName}`,
    html: getEmailTemplate(`<p>Hi ${recipientName},</p><p>${itemName} for ${companyName} expires on ${expiryDate} (${daysLeft} days).</p>`, "Expiry Alert"),
  }),
  paymentReminder: (clientName: string, invoiceId: string, amount: number, dueDate: string) => ({
    subject: `Payment Reminder: ${invoiceId}`,
    html: getEmailTemplate(`<p>Hi ${clientName},</p><p>Invoice ${invoiceId} for AED ${amount.toLocaleString()} is due on ${dueDate}.</p>${blueButton("Pay Now", "https://corporatepro.cloud/dashboard/payments")}`, "Payment Reminder"),
  }),
  welcomeEmail: (clientName: string) => ({
    subject: "Welcome to YABS Portal",
    html: getEmailTemplate(`<p>Hi ${clientName},</p><p>Welcome to YABS PRO Services!</p>${blueButton("Go to Dashboard", "https://corporatepro.cloud/dashboard")}`, "Welcome"),
  }),
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "YABS Support <support@yabs.ae>",
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error("[Email] sendEmail error:", err)
    return { success: false, error: err.message }
  }
}
