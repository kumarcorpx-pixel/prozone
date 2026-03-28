import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { dispatchPaymentReminder } from "@/lib/notify-dispatch"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "default-cron-secret"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()

    // Find overdue and due-soon invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["pending", "partial", "overdue"] },
        dueDate: { not: null },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        clientId: true,
        dueDate: true,
        status: true,
      },
    })

    let remindersSent = 0
    let overdueCount = 0

    for (const inv of invoices) {
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null
      if (!dueDate) continue

      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Mark as overdue if past due
      if (daysUntilDue < 0 && inv.status !== "overdue") {
        await prisma.invoice.update({ where: { id: inv.id }, data: { status: "overdue" } })
        overdueCount++
      }

      // Send reminders at: 7 days before, 3 days before, on due date, 1 day overdue, 7 days overdue
      const reminderDays = [7, 3, 0, -1, -7]
      if (reminderDays.includes(daysUntilDue)) {
        try {
          await dispatchPaymentReminder({
            invoiceNumber: inv.invoiceNumber,
            amount: Number(inv.totalAmount),
            clientId: inv.clientId,
          })
          remindersSent++
        } catch (err: any) {
          console.error("[Cron] Invoice reminder error:", err.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalInvoices: invoices.length,
      overdueCount,
      remindersSent,
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
