// Meta WhatsApp Cloud API integration

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0"

interface WhatsAppMessageOptions {
  to: string // Phone number with country code (e.g., "971565204844")
  template?: string
  templateParams?: string[]
  text?: string
}

export async function sendWhatsAppMessage({ to, template, templateParams, text }: WhatsAppMessageOptions) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.log("[WhatsApp] Skipped (not configured):", { to, template, text })
    return { success: false, error: "WhatsApp not configured" }
  }

  // Format phone number (remove spaces, +, etc.)
  const formattedTo = to.replace(/[\s+\-()]/g, "")

  try {
    let body: Record<string, unknown>

    if (template) {
      // Template message (pre-approved by Meta)
      body = {
        messaging_product: "whatsapp",
        to: formattedTo,
        type: "template",
        template: {
          name: template,
          language: { code: "en" },
          components: templateParams
            ? [
                {
                  type: "body",
                  parameters: templateParams.map((p) => ({ type: "text", text: p })),
                },
              ]
            : undefined,
        },
      }
    } else {
      // Free-form text message (only within 24-hour window)
      body = {
        messaging_product: "whatsapp",
        to: formattedTo,
        type: "text",
        text: { body: text || "" },
      }
    }

    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "WhatsApp API error")
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err: any) {
    console.error("[WhatsApp] Error:", err)
    return { success: false, error: err.message }
  }
}

// Pre-built message templates for UAE PRO services
export const whatsappMessages = {
  requestStatusUpdate: (clientName: string, serviceType: string, status: string) =>
    `Hi ${clientName}, your ${serviceType} request has been updated to: *${status.replace(/_/g, " ").toUpperCase()}*. Track progress at corporatepro.cloud/dashboard/tracking — YABS PRO Services`,

  expiryAlert: (itemName: string, daysLeft: number) =>
    `⚠️ *Expiry Alert*: ${itemName} expires in *${daysLeft} days*. Please contact us to arrange renewal. — YABS PRO Services (+971 56 520 4844)`,

  paymentReminder: (invoiceId: string, amount: number) =>
    `💰 *Payment Reminder*: Invoice ${invoiceId} for *AED ${amount.toLocaleString()}* is pending. Please arrange payment. — YABS PRO Services`,

  documentReady: (documentName: string) =>
    `✅ *Document Ready*: Your ${documentName} is ready for collection. Contact us to arrange pickup. — YABS PRO Services`,

  appointmentReminder: (date: string, location: string) =>
    `📅 *Appointment Reminder*: You have an appointment on *${date}* at *${location}*. Please bring all required documents. — YABS PRO Services`,
}

// Generate wa.me link for quick WhatsApp chat
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[\s+\-()]/g, "")
  const encodedMsg = message ? encodeURIComponent(message) : ""
  return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`
}

// Context-aware WhatsApp links for different pages
export const whatsappContextLinks = {
  dashboard: getWhatsAppLink("971565204844", "Hi YABS, I need assistance with my account."),
  requests: getWhatsAppLink("971565204844", "Hi YABS, I have a question about my service request."),
  tracking: getWhatsAppLink("971565204844", "Hi YABS, I need an update on my request status."),
  payments: getWhatsAppLink("971565204844", "Hi YABS, I have a question about my invoice."),
  general: getWhatsAppLink("971565204844", "Hi YABS, I need PRO services."),
}
