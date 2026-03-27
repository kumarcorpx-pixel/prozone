import { NextResponse } from "next/server"

export async function GET() {
  const services: Record<string, any> = {
    database: { status: "connected" },
    smtp: { configured: !!process.env.SMTP_HOST },
    ntfy: { configured: !!process.env.NTFY_BASE_URL },
    ollama: { configured: !!process.env.OLLAMA_BASE_URL },
    zoho: { configured: !!process.env.ZOHO_REFRESH_TOKEN },
    whatsapp: { configured: !!process.env.WHATSAPP_ACCESS_TOKEN },
    minio: { configured: false },
  }

  // Check MinIO
  try {
    const { minioClient, BUCKET } = await import("@/lib/minio")
    const exists = await minioClient.bucketExists(BUCKET)
    services.minio = { configured: true, bucket: BUCKET, bucketExists: exists }
    if (!exists) {
      await minioClient.makeBucket(BUCKET)
      services.minio.bucketCreated = true
    }
  } catch (err: any) {
    services.minio = { configured: !!process.env.MINIO_ENDPOINT, error: err.message }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services,
  })
}
