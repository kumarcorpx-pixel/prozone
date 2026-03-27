import type { Metadata } from "next"
import localFont from "next/font/local"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ChatWidget } from "@/components/ChatWidget"
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
  description: "Cloud-based PRO services platform for Abu Dhabi, Dubai & Sharjah. Track, monitor and manage all your government transactions.",
  keywords: ["PRO services UAE", "business setup Dubai", "visa services UAE", "trade license renewal", "YABS", "government transactions UAE"],
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <ChatWidget />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
