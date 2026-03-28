import { NextRequest, NextResponse } from "next/server"
import { rateLimit, loginRateLimit } from "@/lib/rate-limit"
import { sanitize } from "@/lib/validation/schemas"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const rl = rateLimit(`quote:${ip}`, loginRateLimit)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { companyName, emirate, employees, services, contactName, email, phone, message } = body

    if (!companyName || !emirate || !contactName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: companyName, emirate, contactName, email" },
        { status: 400 }
      )
    }

    const sanitizedData = {
      companyName: sanitize(companyName),
      emirate: sanitize(emirate),
      employees: employees ? sanitize(employees) : null,
      services: Array.isArray(services) ? services.map((s: string) => sanitize(s)) : [],
      contactName: sanitize(contactName),
      email: email.trim().toLowerCase(),
      phone: phone ? sanitize(phone) : null,
      message: message ? sanitize(message) : null,
    }

    try {
      await prisma.quoteRequest.create({
        data: sanitizedData,
      })
    } catch {
      console.error("Failed to store quote request")
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: process.env.EMAIL_FROM || "YABS PRO <noreply@yabspro.com>",
          to: process.env.ADMIN_EMAIL || "admin@yabspro.com",
          subject: `New Quote Request: ${sanitizedData.companyName}`,
          html: `
            <h2>New Quote Request</h2>
            <p><strong>Company:</strong> ${sanitizedData.companyName}</p>
            <p><strong>Emirate:</strong> ${sanitizedData.emirate}</p>
            <p><strong>Employees:</strong> ${sanitizedData.employees || "Not specified"}</p>
            <p><strong>Services:</strong> ${sanitizedData.services.join(", ") || "Not specified"}</p>
            <p><strong>Contact:</strong> ${sanitizedData.contactName}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
            ${sanitizedData.phone ? `<p><strong>Phone:</strong> ${sanitizedData.phone}</p>` : ""}
            ${sanitizedData.message ? `<p><strong>Message:</strong> ${sanitizedData.message}</p>` : ""}
          `,
        })
      } catch {
        console.error("Failed to send quote notification email")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Quote request received. We will get back to you within 24 hours.",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
