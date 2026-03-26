import { NextRequest, NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...params } = body

    let emailOptions

    switch (type) {
      case "status_update":
        emailOptions = emailTemplates.requestStatusUpdate(
          params.clientName,
          params.serviceType,
          params.status,
          params.companyName
        )
        break
      case "expiry_alert":
        emailOptions = emailTemplates.expiryAlert(
          params.recipientName,
          params.itemName,
          params.itemType,
          params.expiryDate,
          params.daysLeft,
          params.companyName
        )
        break
      case "payment_reminder":
        emailOptions = emailTemplates.paymentReminder(
          params.clientName,
          params.invoiceId,
          params.amount,
          params.dueDate
        )
        break
      case "welcome":
        emailOptions = emailTemplates.welcomeEmail(params.clientName)
        break
      default:
        emailOptions = { subject: params.subject, html: params.html }
    }

    const result = await sendEmail({
      to: params.to,
      ...emailOptions,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
