const ALLOWED_ORIGINS = [
  "https://corporatepro.cloud",
  "https://www.corporatepro.cloud",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
].filter(Boolean)

const ALLOWED_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
const ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With, Accept, Origin"

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGINS[0]
  }

  return headers
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}
