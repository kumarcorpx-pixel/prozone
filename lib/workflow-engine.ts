import prisma from "@/lib/prisma"

/**
 * Workflow Engine
 * Triggered when a new ServiceRequest is created.
 * 1. Creates a timeline entry noting the request awaits admin review
 * 2. Notifies all admins via DB notification
 * Status stays "pending" — admin manually assigns to PRO staff.
 */
export async function runNewRequestWorkflow(requestId: string) {
  try {
    // Fetch the newly created request with company info
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { company: { select: { name: true } } },
    })

    if (!request) {
      console.error("[Workflow] Request not found:", requestId)
      return
    }

    // Skip if already assigned
    if (request.assignedToId) {
      return
    }

    // Create timeline entry — status stays "pending"
    await prisma.requestTimeline.create({
      data: {
        requestId: requestId,
        status: "pending",
        message: "Request submitted, awaiting admin review",
        createdById: request.clientId,
      },
    })

    // Notify all admins of the new request
    const admins = await prisma.user.findMany({
      where: { role: "admin" as any },
      select: { id: true },
    })

    if (admins.length > 0) {
      await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              title: "New Service Request",
              message: `New ${request.serviceType || "service"} request submitted${request.company ? ` for ${request.company.name}` : ""}, awaiting assignment`,
              type: "info" as any,
              isRead: false,
              link: `/admin/requests/${requestId}`,
            },
          })
        )
      )
      console.log(`[Workflow] Notified ${admins.length} admin(s) about request ${requestId}`)
    } else {
      console.warn("[Workflow] No admins found to notify for request:", requestId)
    }

    console.log(`[Workflow] Request ${requestId} awaiting admin review`)
  } catch (err) {
    console.error("[Workflow] Error processing request:", requestId, err instanceof Error ? err.message : "unknown")
  }
}
