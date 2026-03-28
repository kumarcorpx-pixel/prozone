import { NextRequest, NextResponse } from "next/server"
import { rateLimit, loginRateLimit } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-error-handler"
import { createZoomMeeting, isZoomConfigured } from "@/lib/zoom"
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

function buildStartTime(date?: string, time?: string): string {
  const d = date || new Date(Date.now() + 86400000).toISOString().split("T")[0]
  const timeMap: Record<string, string> = {
    "09:00 AM": "09:00", "10:00 AM": "10:00", "11:00 AM": "11:00",
    "12:00 PM": "12:00", "01:00 PM": "13:00", "02:00 PM": "14:00",
    "03:00 PM": "15:00", "04:00 PM": "16:00", "05:00 PM": "17:00",
  }
  const t = time ? (timeMap[time] || "10:00") : "10:00"
  return `${d}T${t}:00`
}

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
    let zoomLink = ""
    let zoomPassword = ""
    let meetingTime = ""

    // Auto-create Zoom meeting if configured
    if (isZoomConfigured()) {
      try {
        const startTime = buildStartTime(data.preferredDate, data.preferredTime)
        const meeting = await createZoomMeeting({
          topic: `YABS Consultation — ${data.name}`,
          startTime,
          duration: 30,
          agenda: `Free consultation with ${data.name}${data.company ? ` (${data.company})` : ""}${data.service ? ` — ${data.service}` : ""}`,
          inviteeEmail: data.email,
        })
        zoomLink = meeting.join_url
        zoomPassword = meeting.password
        meetingTime = startTime
      } catch (err) {
        console.error("[Zoom] Failed to create meeting:", err)
      }
    }

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
          Click: zoomLink || "https://corporatepro.cloud/admin",
        },
        body: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}${data.company ? `\nCompany: ${data.company}` : ""}${data.service ? `\nService: ${data.service}` : ""}${data.preferredDate ? `\nPreferred Date: ${data.preferredDate}` : ""}${data.preferredTime ? `\nPreferred Time: ${data.preferredTime}` : ""}${zoomLink ? `\nZoom: ${zoomLink}` : ""}${data.message ? `\nMessage: ${data.message}` : ""}`,
      })
    } catch {
      console.error("Failed to send consultation push notification")
    }

    // Send email notification to admin
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
            ${zoomLink ? `<p><strong>Zoom Meeting:</strong> <a href="${zoomLink}">${zoomLink}</a></p><p><strong>Password:</strong> ${zoomPassword}</p>` : ""}
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
            <hr />
            ${zoomLink ? "<p style='color: green;'>Zoom meeting auto-created and sent to client.</p>" : "<p style='color: #666;'>Zoom not configured — please schedule manually and send link to client.</p>"}
          `,
        })
      } catch {
        console.error("Failed to send consultation email")
      }
    }

    // Send confirmation email to client with Zoom link
    if (zoomLink && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        const formattedTime = data.preferredDate && data.preferredTime
          ? `${data.preferredDate} at ${data.preferredTime} (Dubai Time)`
          : meetingTime + " (Dubai Time)"

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "YABS PRO <noreply@yabspro.com>",
          to: data.email,
          subject: "Your Free Consultation with YABS — Zoom Meeting Confirmed",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1a3a6b, #0f2340); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Your Consultation is Confirmed!</h1>
              </div>
              <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p>Hi <strong>${data.name}</strong>,</p>
                <p>Thank you for booking a free consultation with YABS Public Relations Management. Here are your meeting details:</p>
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedTime}</p>
                  <p style="margin: 5px 0;"><strong>Duration:</strong> 30 minutes</p>
                  <p style="margin: 5px 0;"><strong>Password:</strong> ${zoomPassword}</p>
                  <div style="text-align: center; margin-top: 15px;">
                    <a href="${zoomLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Join Zoom Meeting</a>
                  </div>
                </div>
                <p style="color: #666; font-size: 14px;">If you need to reschedule, please contact us on WhatsApp: <a href="https://wa.me/971565204844">+971 56 520 4844</a></p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">YABS Public Relations Management LLC | Dubai, UAE</p>
              </div>
            </div>
          `,
        })
      } catch {
        console.error("Failed to send client confirmation email")
      }
    }

    return NextResponse.json({
      success: true,
      zoomLink: zoomLink || null,
      message: zoomLink
        ? "Your Zoom meeting has been scheduled! Check your email for the meeting link."
        : "Your consultation request has been submitted. We will contact you within 24 hours to schedule your Zoom meeting.",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
