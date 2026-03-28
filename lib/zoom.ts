const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || ""
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID || ""
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || ""

let tokenCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64")

  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[Zoom] Token error:", res.status, err)
    throw new Error(`Zoom auth failed: ${res.status}`)
  }

  const data = await res.json()
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

export interface ZoomMeeting {
  id: number
  join_url: string
  start_url: string
  topic: string
  start_time: string
  duration: number
  password: string
}

export async function createZoomMeeting(options: {
  topic: string
  startTime: string // ISO 8601 format
  duration?: number // minutes, default 30
  agenda?: string
  inviteeEmail?: string
}): Promise<ZoomMeeting> {
  const token = await getAccessToken()

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: options.topic,
      type: 2, // Scheduled meeting
      start_time: options.startTime,
      duration: options.duration || 30,
      timezone: "Asia/Dubai",
      agenda: options.agenda || "",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        waiting_room: true,
        auto_recording: "none",
        meeting_invitees: options.inviteeEmail
          ? [{ email: options.inviteeEmail }]
          : [],
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[Zoom] Create meeting error:", res.status, err)
    throw new Error(`Zoom create meeting failed: ${res.status}`)
  }

  return res.json()
}

export function isZoomConfigured(): boolean {
  return !!(ZOOM_ACCOUNT_ID && ZOOM_CLIENT_ID && ZOOM_CLIENT_SECRET)
}
