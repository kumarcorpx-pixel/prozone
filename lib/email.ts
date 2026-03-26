import { Resend } from "resend"

// Only initialize Resend if API key is available
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "YABS PRO <noreply@yabs.ae>"

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const resend = getResend()
  if (!resend) {
    console.log("[Email] Skipped (no API key):", { to, subject })
    return { success: false, error: "Email not configured" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })
    if (error) throw error
    return { success: true, id: data?.id }
  } catch (err: any) {
    console.error("[Email] Error:", err)
    return { success: false, error: err.message }
  }
}

// Pre-built email templates for UAE PRO services
export const emailTemplates = {
  requestStatusUpdate: (clientName: string, serviceType: string, status: string, companyName: string) => ({
    subject: `Request Update: ${serviceType} - ${status.replace(/_/g, " ").toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3a6b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">YABS PRO Services</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear ${clientName},</p>
          <p>Your service request has been updated:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a3a6b;">
            <p><strong>Service:</strong> ${serviceType}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>New Status:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${status.replace(/_/g, " ").toUpperCase()}</span></p>
          </div>
          <p>You can track your request progress at any time through your <a href="https://corporatepro.cloud/dashboard/tracking" style="color: #1a3a6b;">client portal</a>.</p>
          <p>Best regards,<br/>YABS Public Relations Management LLC</p>
        </div>
        <div style="background: #1a3a6b; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>258, Central Plaza (Zone-3), Schon Business Park, DIP(1), Dubai</p>
          <p>+971 56 520 4844 | info@yabs.ae</p>
        </div>
      </div>
    `,
  }),

  expiryAlert: (recipientName: string, itemName: string, itemType: string, expiryDate: string, daysLeft: number, companyName: string) => ({
    subject: `⚠️ ${itemType} Expiry Alert: ${itemName} - ${daysLeft} days remaining`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3a6b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">YABS PRO Services</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear ${recipientName},</p>
          <p>This is an automated alert regarding an upcoming expiry:</p>
          <div style="background: ${daysLeft <= 7 ? "#fef2f2" : daysLeft <= 30 ? "#fffbeb" : "#f0fdf4"}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${daysLeft <= 7 ? "#ef4444" : daysLeft <= 30 ? "#f59e0b" : "#22c55e"};">
            <p><strong>${itemType}:</strong> ${itemName}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Expiry Date:</strong> ${expiryDate}</p>
            <p><strong>Days Remaining:</strong> <span style="font-size: 24px; font-weight: bold; color: ${daysLeft <= 7 ? "#ef4444" : daysLeft <= 30 ? "#f59e0b" : "#22c55e"};">${daysLeft}</span></p>
          </div>
          <p>Please take necessary action to renew before the expiry date.</p>
          <a href="https://corporatepro.cloud/login" style="display: inline-block; background: #1a3a6b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0;">View in Portal</a>
          <p>Best regards,<br/>YABS Public Relations Management LLC</p>
        </div>
        <div style="background: #1a3a6b; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>+971 56 520 4844 | info@yabs.ae</p>
        </div>
      </div>
    `,
  }),

  paymentReminder: (clientName: string, invoiceId: string, amount: number, dueDate: string) => ({
    subject: `Payment Reminder: Invoice ${invoiceId} - AED ${amount.toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3a6b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">YABS PRO Services</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear ${clientName},</p>
          <p>This is a reminder regarding your pending payment:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Invoice:</strong> ${invoiceId}</p>
            <p><strong>Amount:</strong> AED ${amount.toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <p>Please arrange payment at your earliest convenience.</p>
          <a href="https://corporatepro.cloud/dashboard/payments" style="display: inline-block; background: #1a3a6b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Payments</a>
          <p>Best regards,<br/>YABS Public Relations Management LLC</p>
        </div>
        <div style="background: #1a3a6b; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>+971 56 520 4844 | info@yabs.ae</p>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (clientName: string) => ({
    subject: `Welcome to YABS PRO Services`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a3a6b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">YABS PRO Services</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2>Welcome, ${clientName}!</h2>
          <p>Thank you for choosing YABS Public Relations Management LLC for your PRO services in the UAE.</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Track your service requests in real-time</li>
            <li>View and manage all your company documents</li>
            <li>Monitor visa and license expiry dates</li>
            <li>Communicate directly with your PRO officer</li>
          </ul>
          <a href="https://corporatepro.cloud/dashboard" style="display: inline-block; background: #1a3a6b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0;">Go to Dashboard</a>
          <p>If you need any help, contact us:</p>
          <p>Phone: +971 56 520 4844<br/>WhatsApp: +971 56 520 4844<br/>Email: info@yabs.ae</p>
          <p>Best regards,<br/>YABS Public Relations Management LLC</p>
        </div>
      </div>
    `,
  }),
}
