import { NextRequest, NextResponse } from "next/server"
import { sendWhatsAppMessage, whatsappMessages } from "@/lib/whatsapp"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, ...params } = body

    let text: string

    switch (type) {
      case "status_update":
        text = whatsappMessages.requestStatusUpdate(params.clientName, params.serviceType, params.status)
        break
      case "expiry_alert":
        text = whatsappMessages.expiryAlert(params.itemName, params.daysLeft)
        break
      case "payment_reminder":
        text = whatsappMessages.paymentReminder(params.invoiceId, params.amount)
        break
      case "document_ready":
        text = whatsappMessages.documentReady(params.documentName)
        break
      case "appointment":
        text = whatsappMessages.appointmentReminder(params.date, params.location)
        break
      default:
        text = params.text || params.message || ""
    }

    const result = await sendWhatsAppMessage({ to, text })
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
