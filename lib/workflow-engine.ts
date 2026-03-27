// @ts-nocheck
import prisma from "@/lib/prisma"
import { dispatchStaffAssignment } from "@/lib/notify-dispatch"

/**
 * Automated Workflow Engine
 * Triggered when a new ServiceRequest is created.
 * 1. Auto-assigns to the staff member with fewest active requests
 * 2. Creates a timeline entry for the assignment
 * 3. Creates a DB notification for the assigned staff
 * 4. Dispatches multi-channel notifications (WhatsApp + email + push)
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

    // Step 1: Find staff member with fewest active requests
    const staffMembers = await prisma.user.findMany({
      where: { role: "pro_staff", isActive: true },
      select: {
        id: true,
        fullName: true,
        _count: {
          select: {
            assignedRequests: {
              where: {
                status: { in: ["pending", "assigned", "in_progress", "under_review"] },
              },
            },
          },
        },
      },
    })

    if (staffMembers.length === 0) {
      console.warn("[Workflow] No active pro_staff found for auto-assignment")
      return
    }

    // Pick the one with fewest active requests
    staffMembers.sort((a: any, b: any) => a._count.assignedRequests - b._count.assignedRequests)
    const selectedStaff = staffMembers[0]

    // Update the request with the assignment
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedToId: selectedStaff.id,
        status: "assigned",
      },
    })

    // Step 2: Create timeline entry
    await prisma.requestTimeline.create({
      data: {
        requestId: requestId,
        status: "assigned",
        message: `Auto-assigned to ${selectedStaff.fullName}`,
        createdById: selectedStaff.id,
      },
    })

    // Step 3: Create DB notification for the assigned staff
    await prisma.notification.create({
      data: {
        userId: selectedStaff.id,
        title: "New Task Assigned",
        message: `You have been assigned a new ${request.serviceType || "service"} request${request.company ? ` for ${request.company.name}` : ""}`,
        type: "info",
        isRead: false,
        link: `/staff/requests/${requestId}`,
      },
    })

    // Step 4: Dispatch multi-channel notifications (WhatsApp + email + push)
    await dispatchStaffAssignment({
      id: requestId,
      serviceType: request.serviceType || "Service Request",
      companyName: request.company?.name || "N/A",
      staffId: selectedStaff.id,
      clientId: request.clientId,
    })

    console.log(`[Workflow] Request ${requestId} auto-assigned to ${selectedStaff.fullName}`)
  } catch (err: any) {
    console.error("[Workflow] Error processing request:", requestId, err.message)
  }
}
