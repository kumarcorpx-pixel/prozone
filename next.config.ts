import type { NextConfig } from "next"
import { securityHeaders } from "./lib/security-headers"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["194.238.19.203"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
