import { NextRequest, NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error-handler"
import {
  notifyStatusUpdate, notifyDocumentReady, notifyExpiryWarning,
  notifyPaymentDue, notifyPaymentReceived, notifyRequestAssigned,
  notifyStaffNewTask, notifyStaffReminder,
} from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const { type, clientId, staffId, data } = await request.json()
    if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 })

    let result
    switch (type) {
      case "status-update":
        result = await notifyStatusUpdate(clientId, data.serviceName, data.newStatus, data.requestId)
        break
      case "document-ready":
        result = await notifyDocumentReady(clientId, data.documentName, data.companyName)
        break
      case "expiry-warning":
        result = await notifyExpiryWarning(clientId, data.documentType, data.companyName, data.daysRemaining)
        break
      case "payment-due":
        result = await notifyPaymentDue(clientId, data.amount, data.invoiceNumber)
        break
      case "payment-received":
        result = await notifyPaymentReceived(clientId, data.amount)
        break
      case "request-assigned":
        result = await notifyRequestAssigned(clientId, data.serviceName, data.staffName)
        break
      case "staff-new-task":
        result = await notifyStaffNewTask(staffId, data.serviceName, data.companyName)
        break
      case "staff-reminder":
        result = await notifyStaffReminder(staffId, data.taskName, data.companyName)
        break
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
