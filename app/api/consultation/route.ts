import { NextRequest, NextResponse } from "next/server"
import { rateLimit, loginRateLimit } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-error-handler"
import { z } from "zod"

const bookingSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(20),
  company: z.string().max(200).optional(),
  service: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
})

const NTFY_BASE_URL = process.env.NTFY_BASE_URL || "https://notify.corporatepro.cloud"
const NTFY_USER = process.env.NTFY_ADMIN_USER || "yabsadmin"
const NTFY_PASS = process.env.NTFY_ADMIN_PASSWORD || ""

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`consultation:${ip}`, loginRateLimit)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const result = bookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = result.data

    // Send push notification to admin via ntfy
    try {
      const auth = Buffer.from(`${NTFY_USER}:${NTFY_PASS}`).toString("base64")
      await fetch(`${NTFY_BASE_URL}/admin-alerts`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          Title: `New Consultation Booking: ${data.name}`,
          Priority: "4",
          Tags: "calendar,phone",
          Click: "https://corporatepro.cloud/admin",
        },
        body: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}${data.company ? `\nCompany: ${data.company}` : ""}${data.service ? `\nService: ${data.service}` : ""}${data.preferredDate ? `\nPreferred Date: ${data.preferredDate}` : ""}${data.preferredTime ? `\nPreferred Time: ${data.preferredTime}` : ""}${data.message ? `\nMessage: ${data.message}` : ""}`,
      })
    } catch {
      console.error("Failed to send consultation push notification")
    }

    // Send email notification
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "YABS PRO <noreply@yabspro.com>",
          to: process.env.ADMIN_EMAIL || "admin@yabspro.com",
          subject: `New Consultation Booking: ${data.name}`,
          html: `
            <h2>New Free Consultation Booking</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ""}
            ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ""}
            ${data.preferredDate ? `<p><strong>Preferred Date:</strong> ${data.preferredDate}</p>` : ""}
            ${data.preferredTime ? `<p><strong>Preferred Time:</strong> ${data.preferredTime}</p>` : ""}
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
            <hr />
            <p style="color: #666;">Please schedule a Zoom meeting and send the link to the client.</p>
          `,
        })
      } catch {
        console.error("Failed to send consultation email")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your consultation request has been submitted. We will contact you within 24 hours to schedule your Zoom meeting.",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
