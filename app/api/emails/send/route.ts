import { NextRequest, NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error-handler"
import { withAuth } from "@/lib/auth-middleware"
import {
  sendWelcomeEmail,
  sendRequestConfirmation,
  sendStatusUpdate,
  sendDocumentNotification,
  sendInvoiceEmail,
  sendPaymentConfirmation,
  sendExpiryReminder,
  sendMonthlyReport,
} from "@/lib/email"

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const { type, to, data } = await request.json()

    if (!type || !to) {
      return NextResponse.json({ error: "Missing type or to" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(data.name, to, data.tempPassword)
        break
      case "request-confirmation":
        result = await sendRequestConfirmation(data.name, to, data.serviceName, data.companyName, data.requestId)
        break
      case "status-update":
        result = await sendStatusUpdate(data.name, to, data.serviceName, data.companyName, data.oldStatus, data.newStatus)
        break
      case "document":
        result = await sendDocumentNotification(data.name, to, data.documentName, data.companyName)
        break
      case "invoice":
        result = await sendInvoiceEmail(data.name, to, data.invoiceNumber, data.amount, data.dueDate, data.services)
        break
      case "payment":
        result = await sendPaymentConfirmation(data.name, to, data.amount, data.invoiceNumber)
        break
      case "expiry-reminder":
        result = await sendExpiryReminder(data.name, to, data.documentType, data.companyName, data.expiryDate, data.daysRemaining)
        break
      case "monthly-report":
        result = await sendMonthlyReport(data.name, to, data.stats)
        break
      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    return handleApiError(error)
  }
}
