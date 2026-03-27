import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST() {
  try {
    const timestamp = new Date().toISOString()
    const result = await sendEmail({
      to: "support@yabs.ae",
      subject: "YABS Email Test",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2 style="color:#1a3a6b;">Email System Test</h2>
          <p>Email system is working correctly.</p>
          <p>Sent at: <strong>${timestamp}</strong></p>
          <p style="color:#6b7280;font-size:12px;">This is an automated test from CorporatePro.</p>
        </div>
      `,
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: "Test email sent to support@yabs.ae" })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send test email" }, { status: 500 })
  }
}
