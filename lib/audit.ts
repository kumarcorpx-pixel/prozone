import prisma from "./prisma"

export async function logAudit(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || undefined,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : undefined,
      },
    })
  } catch (err) {
    console.error("[Audit] Failed to log:", err)
  }
}
