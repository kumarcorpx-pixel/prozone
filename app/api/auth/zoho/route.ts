import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.ZOHO_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: "ZOHO_CLIENT_ID not set in .env.local" }, { status: 500 })
  }

  const redirectUri = process.env.ZOHO_REDIRECT_URI || "https://corporatepro.cloud/api/auth/zoho/callback"

  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoInvoice.fullaccess.all&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(redirectUri)}`

  return NextResponse.redirect(authUrl)
}
