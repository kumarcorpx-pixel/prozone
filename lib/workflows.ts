import { sendEmail, emailTemplates } from "./email"
import { sendWhatsAppMessage, whatsappMessages } from "./whatsapp"

export interface WorkflowAction {
  type: "email" | "whatsapp" | "notification" | "log"
  data: Record<string, any>
}

// Define what happens at each status change
export const requestWorkflow: Record<string, WorkflowAction[]> = {
  pending: [
    { type: "notification", data: { role: "admin", title: "New Request", message: "A new service request has been submitted" } },
    { type: "email", data: { template: "status_update" } },
  ],
  assigned: [
    { type: "notification", data: { role: "staff", title: "New Assignment", message: "A request has been assigned to you" } },
    { type: "email", data: { template: "status_update" } },
  ],
  in_progress: [
    { type: "notification", data: { role: "client", title: "Request In Progress", message: "Your service request is now being processed" } },
    { type: "email", data: { template: "status_update" } },
    { type: "whatsapp", data: { template: "status_update" } },
  ],
  under_review: [
    { type: "notification", data: { role: "admin", title: "Review Required", message: "A request is ready for review" } },
  ],
  completed: [
    { type: "notification", data: { role: "client", title: "Request Completed", message: "Your service request has been completed" } },
    { type: "email", data: { template: "status_update" } },
    { type: "whatsapp", data: { template: "status_update" } },
    { type: "log", data: { action: "request_completed" } },
  ],
  rejected: [
    { type: "notification", data: { role: "client", title: "Request Rejected", message: "Your service request has been rejected" } },
    { type: "email", data: { template: "status_update" } },
  ],
}

// Execute workflow actions for a status change
export async function executeWorkflow(
  status: string,
  context: {
    clientName: string
    clientEmail?: string
    clientPhone?: string
    serviceType: string
    companyName: string
    staffName?: string
  }
) {
  const actions = requestWorkflow[status]
  if (!actions) return

  const results: { type: string; success: boolean; error?: string }[] = []

  for (const action of actions) {
    try {
      switch (action.type) {
        case "email":
          if (context.clientEmail) {
            const template = emailTemplates.requestStatusUpdate(
              context.clientName,
              context.serviceType,
              status,
              context.companyName
            )
            const result = await sendEmail({ to: context.clientEmail, ...template })
            results.push({ type: "email", success: result.success, error: result.error })
          }
          break

        case "whatsapp":
          if (context.clientPhone) {
            const message = whatsappMessages.requestStatusUpdate(context.clientName, context.serviceType, status)
            const result = await sendWhatsAppMessage({ to: context.clientPhone, text: message })
            results.push({ type: "whatsapp", success: result.success, error: result.error })
          }
          break

        case "notification":
          results.push({ type: "notification", success: true })
          break

        case "log":
          results.push({ type: "log", success: true })
          break
      }
    } catch (err: any) {
      results.push({ type: action.type, success: false, error: err.message })
    }
  }

  return results
}
