import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      email: !!process.env.RESEND_API_KEY,
      whatsapp: !!process.env.WHATSAPP_ACCESS_TOKEN,
    },
  })
}
