import { NextResponse } from "next/server"

export async function GET() {
  const integrations = {
    database: {
      status: "connected" as const,
      info: "PostgreSQL",
    },
    minio: {
      status: process.env.MINIO_ENDPOINT ? ("configured" as const) : ("not_configured" as const),
      endpoint: process.env.MINIO_ENDPOINT || "",
      port: process.env.MINIO_PORT || "9000",
      accessKey: process.env.MINIO_ACCESS_KEY ? "••••••••" : "",
      secretKey: process.env.MINIO_SECRET_KEY ? "••••••••" : "",
    },
    smtp: {
      status: process.env.SMTP_HOST ? ("configured" as const) : ("not_configured" as const),
      host: process.env.SMTP_HOST || "",
      port: process.env.SMTP_PORT || "587",
      username: process.env.SMTP_USER || "",
      password: process.env.SMTP_PASS ? "••••••••" : "",
    },
    ntfy: {
      status: process.env.NTFY_BASE_URL ? ("configured" as const) : ("not_configured" as const),
      url: process.env.NTFY_BASE_URL || "",
      username: process.env.NTFY_USERNAME || "",
      password: process.env.NTFY_PASSWORD ? "••••••••" : "",
    },
    ollama: {
      status: process.env.OLLAMA_BASE_URL ? ("configured" as const) : ("not_configured" as const),
      url: process.env.OLLAMA_BASE_URL || "",
      model: process.env.OLLAMA_MODEL || "",
    },
    zoho: {
      status: process.env.ZOHO_REFRESH_TOKEN ? ("configured" as const) : ("not_configured" as const),
      clientId: process.env.ZOHO_CLIENT_ID ? "••••••••" : "",
      orgId: process.env.ZOHO_ORG_ID || "",
      hasRefreshToken: !!process.env.ZOHO_REFRESH_TOKEN,
    },
    google: {
      status: process.env.GOOGLE_CLIENT_ID ? ("configured" as const) : ("not_configured" as const),
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    },
    whatsapp: {
      status: process.env.WHATSAPP_ACCESS_TOKEN ? ("configured" as const) : ("not_configured" as const),
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? "••••••••" : "",
    },
  }

  return NextResponse.json(integrations)
}
