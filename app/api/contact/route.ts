import { NextRequest, NextResponse } from "next/server"
import { rateLimit, loginRateLimit } from "@/lib/rate-limit"
import { contactFormSchema, sanitize } from "@/lib/validation/schemas"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  // Rate limit: 5 per 15 min (reuse loginRateLimit config)
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`contact:${ip}`, loginRateLimit)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    // Validate
    const result = contactFormSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, service, message } = result.data

    // Sanitize inputs
    const sanitizedData = {
      name: sanitize(name),
      email,
      phone: phone ? sanitize(phone) : undefined,
      service: service ? sanitize(service) : undefined,
      message: sanitize(message),
    }

    // Store in database
    try {
      await prisma.contactSubmission.create({
        data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone || null,
          service: sanitizedData.service || null,
          message: sanitizedData.message,
        },
      })
    } catch {
      // DB insert failure should not block the response
      console.error("Failed to store contact submission")
    }

    // Send email notification via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "YABS PRO <noreply@yabspro.com>",
          to: process.env.ADMIN_EMAIL || "admin@yabspro.com",
          subject: `New Contact Form: ${sanitizedData.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${sanitizedData.name}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
            ${sanitizedData.phone ? `<p><strong>Phone:</strong> ${sanitizedData.phone}</p>` : ""}
            ${sanitizedData.service ? `<p><strong>Service:</strong> ${sanitizedData.service}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p>${sanitizedData.message}</p>
          `,
        })
      } catch {
        // Email failure should not block the response
        console.error("Failed to send contact notification email")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting us. We will get back to you shortly.",
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit contact form" },
      { status: 500 }
    )
  }
}
