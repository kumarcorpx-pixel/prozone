import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["194.238.19.203"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
}

export default nextConfig
