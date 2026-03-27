import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.json({ error, message: "Zoho authorization denied" }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code received" }, { status: 400 })
  }

  // Try to exchange code for tokens automatically
  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const redirectUri = process.env.ZOHO_REDIRECT_URI || "https://corporatepro.cloud/api/auth/zoho/callback"

  if (clientId && clientSecret) {
    try {
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      })

      const res = await fetch(`https://accounts.zoho.com/oauth/v2/token?${params}`, { method: "POST" })
      const data = await res.json()

      if (data.refresh_token) {
        // Get organization ID
        let orgId = ""
        try {
          const orgRes = await fetch("https://www.zohoapis.com/invoice/v3/organizations", {
            headers: { Authorization: `Zoho-oauthtoken ${data.access_token}` },
          })
          const orgData = await orgRes.json()
          if (orgData.organizations?.length > 0) {
            orgId = orgData.organizations[0].organization_id
          }
        } catch {}

        return new NextResponse(
          `<!DOCTYPE html>
<html><head><title>Zoho Connected</title><style>
body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f4f8;margin:0}
.card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:600px;width:90%}
h1{color:#1a3a6b}code{background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:13px;word-break:break-all}
.env{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:13px;white-space:pre-wrap;word-break:break-all;margin:16px 0}
.success{color:#16a34a;font-size:24px}
</style></head><body>
<div class="card">
<p class="success">&#10003; Zoho Invoice Connected Successfully!</p>
<h1>Add these to your .env.local on VPS:</h1>
<div class="env">ZOHO_REFRESH_TOKEN=${data.refresh_token}
ZOHO_ORG_ID=${orgId || "Run: curl with access token to get org ID"}
ZOHO_ACCESS_TOKEN=${data.access_token}</div>
<p><strong>SSH into VPS and run:</strong></p>
<div class="env">cd /var/www/prozone
nano .env.local
# Add the ZOHO_REFRESH_TOKEN and ZOHO_ORG_ID lines above
pm2 restart prozone</div>
<p style="color:#6b7280;font-size:13px">Access token expires in ${data.expires_in || 3600}s. The refresh token is permanent — save it now.</p>
</div></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        )
      }

      // No refresh token but got some response
      return NextResponse.json({
        message: "Token exchange completed but no refresh_token received. You may have already authorized this app.",
        data,
        hint: "Try revoking access at accounts.zoho.com/home#privacy/connectedapps and re-authorizing",
      })
    } catch (err: any) {
      return NextResponse.json({
        error: "Token exchange failed",
        message: err.message,
        code,
        hint: "Use this code manually with curl to exchange for tokens",
      }, { status: 500 })
    }
  }

  // No client credentials in env — show the code for manual exchange
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><title>Zoho Auth Code</title><style>
body{font-family:Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f4f8;margin:0}
.card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:600px;width:90%}
h1{color:#1a3a6b}code{background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:13px;word-break:break-all}
.env{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:13px;white-space:pre-wrap;word-break:break-all;margin:16px 0}
</style></head><body>
<div class="card">
<h1>Zoho Authorization Code Received</h1>
<p>Your auth code:</p>
<div class="env">${code}</div>
<p>Exchange it for a refresh token using curl on your VPS:</p>
<div class="env">curl -X POST "https://accounts.zoho.com/oauth/v2/token" \\
  -d "code=${code}" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "redirect_uri=https://corporatepro.cloud/api/auth/zoho/callback" \\
  -d "grant_type=authorization_code"</div>
<p style="color:#ef4444">⚠ This code expires in ~10 minutes. Use it quickly!</p>
</div></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  )
}
