import type { Metadata } from "next"
import localFont from "next/font/local"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ChatWidget } from "@/components/ChatWidget"
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar"
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt"
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
    default: "Corporate PRO Services Dubai | Business Setup UAE | YABS",
    template: "%s | YABS Corporate PRO Services",
  },
  description: "YABS Corporate PRO Services — Dubai's trusted partner for business setup, trade license renewal, visa processing, document attestation, auditing & accounting, private notary, RTA works, Dubai Municipality permits & all government services across UAE.",
  keywords: ["corporate PRO services Dubai", "business setup Dubai", "business setup UAE", "trade license renewal Dubai", "visa processing UAE", "company formation Dubai", "document attestation Dubai", "auditing and accounting services Dubai", "private notary services Dubai", "RTA related works Dubai", "Dubai Municipality works", "MOHRE services", "GDRFA visa", "PRO services UAE", "government transactions Dubai", "YABS PRO", "free zone company setup", "employment visa UAE", "corporate tax UAE", "VAT filing Dubai", "Ejari registration", "Emirates ID processing", "golden visa UAE", "company liquidation Dubai", "PRO typing services Dubai"],
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CorporatePRO" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
        <AuthProvider>
          {children}
          <ChatWidget />
          <PWAInstallPrompt />
          <Toaster />
          <ServiceWorkerRegistrar />
        </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
