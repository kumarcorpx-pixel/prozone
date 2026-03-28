import type { Metadata } from "next"
import localFont from "next/font/local"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ChatWidget } from "@/components/ChatWidget"
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "arial"],
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["monospace"],
})

export const metadata: Metadata = {
  title: {
    default: "YABS | PRO Services in UAE",
    template: "%s | YABS PRO Services",
  },
  description: "YABS PRO Services — UAE's trusted partner for trade license renewal, visa processing, company formation, document attestation & government transactions in Dubai, Abu Dhabi & Sharjah. Track all PRO services online.",
  keywords: ["PRO services UAE", "PRO services Dubai", "trade license renewal Dubai", "visa processing UAE", "company formation Dubai", "document attestation UAE", "business setup Dubai", "MOHRE services", "GDRFA visa", "corporate PRO services UAE", "government transactions Dubai", "YABS PRO", "UAE business services", "free zone company setup", "employment visa UAE", "trade license DED", "DMCC company formation"],
  authors: [{ name: "YABS Public Relations Management LLC" }],
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://corporatepro.cloud",
    siteName: "YABS PRO Services",
    title: "YABS | PRO Services in UAE",
    description: "Track, monitor and manage all your government transactions in Abu Dhabi, Dubai & Sharjah.",
  },
  twitter: {
    card: "summary_large_image",
    title: "YABS | PRO Services in UAE",
    description: "Cloud-based PRO services platform for UAE government transactions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://corporatepro.cloud"),
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#1a3a6b" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
        <AuthProvider>
          {children}
          <ChatWidget />
          <Toaster />
          <ServiceWorkerRegistrar />
        </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
