const NTFY_BASE_URL = process.env.NTFY_BASE_URL || "https://notify.corporatepro.cloud"
const NTFY_USER = process.env.NTFY_ADMIN_USER || "yabsadmin"
const NTFY_PASS = process.env.NTFY_ADMIN_PASSWORD || ""

async function sendPushNotification(
  topic: string,
  title: string,
  message: string,
  priority: number = 3,
  tags: string[] = [],
  clickUrl: string = "https://corporatepro.cloud"
) {
  try {
    const auth = Buffer.from(`${NTFY_USER}:${NTFY_PASS}`).toString("base64")
    const res = await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        Title: title,
        Priority: String(priority),
        Tags: tags.join(","),
        Click: clickUrl,
      },
      body: message,
    })
    if (!res.ok) {
      console.error("[Ntfy] Error:", res.status, await res.text())
      return { success: false, error: `HTTP ${res.status}` }
    }
    return { success: true }
  } catch (err: any) {
    console.error("[Ntfy] Error:", err.message)
    return { success: false, error: err.message }
  }
}

// Client notifications
export async function notifyStatusUpdate(clientId: string, serviceName: string, newStatus: string, requestId: string) {
  return sendPushNotification(
    `yabs-${clientId}`, "Status Update: " + serviceName,
    `Your request has been updated to ${newStatus.replace(/_/g, " ")}`,
    3, ["arrows_counterclockwise"],
    "https://corporatepro.cloud/dashboard/requests"
  )
}

export async function notifyDocumentReady(clientId: string, documentName: string, companyName: string) {
  return sendPushNotification(
    `yabs-${clientId}`, "New Document Available",
    `${documentName} for ${companyName} is ready`,
    3, ["page_facing_up"],
    "https://corporatepro.cloud/dashboard/documents"
  )
}

export async function notifyExpiryWarning(clientId: string, documentType: string, companyName: string, daysRemaining: number) {
  return sendPushNotification(
    `yabs-${clientId}`, "⚠️ Expiry Warning",
    `${documentType} for ${companyName} expires in ${daysRemaining} days`,
    4, ["warning"],
    "https://corporatepro.cloud/dashboard/company"
  )
}

export async function notifyPaymentDue(clientId: string, amount: string, invoiceNumber: string) {
  return sendPushNotification(
    `yabs-${clientId}`, "Payment Due",
    `Invoice #${invoiceNumber} - AED ${amount} is pending`,
    3, ["credit_card"],
    "https://corporatepro.cloud/dashboard/payments"
  )
}

export async function notifyPaymentReceived(clientId: string, amount: string) {
  return sendPushNotification(
    `yabs-${clientId}`, "Payment Confirmed",
    `AED ${amount} payment received. Thank you!`,
    3, ["white_check_mark"],
    "https://corporatepro.cloud/dashboard/payments"
  )
}

export async function notifyRequestAssigned(clientId: string, serviceName: string, staffName: string) {
  return sendPushNotification(
    `yabs-${clientId}`, "Request Assigned",
    `${staffName} has been assigned to your ${serviceName} request`,
    3, ["bust_in_silhouette"],
    "https://corporatepro.cloud/dashboard/requests"
  )
}

// Staff notifications
export async function notifyStaffNewTask(staffId: string, serviceName: string, companyName: string) {
  return sendPushNotification(
    `yabs-staff-${staffId}`, "New Task Assigned",
    `${serviceName} for ${companyName} assigned to you`,
    4, ["clipboard"],
    "https://corporatepro.cloud/staff/requests"
  )
}

export async function notifyStaffReminder(staffId: string, taskName: string, companyName: string) {
  return sendPushNotification(
    `yabs-staff-${staffId}`, "Task Reminder",
    `Pending: ${taskName} for ${companyName}`,
    3, ["bell"],
    "https://corporatepro.cloud/staff/schedule"
  )
}

// Test notification
export async function sendTestNotification() {
  return sendPushNotification(
    "yabs-test", "YABS Test",
    "Push notifications are working!",
    3, ["white_check_mark"],
    "https://corporatepro.cloud"
  )
}
