"use client"

import { WifiOff, RefreshCw, Phone } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a6b] to-[#0f2340] flex items-center justify-center px-4">
      <div className="text-center text-white max-w-sm">
        <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-10 w-10 text-[#D4A843]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
        <p className="text-blue-200 mb-8">
          Please check your internet connection and try again. Your data is safe and will sync when you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-[#1a3a6b] font-semibold rounded-xl hover:bg-[#c9a040] transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-blue-300 mb-2">Need urgent help?</p>
          <a href="tel:+971565204844" className="inline-flex items-center gap-2 text-sm text-[#D4A843] hover:underline">
            <Phone className="h-4 w-4" /> +971 56 520 4844
          </a>
        </div>
      </div>
    </div>
  )
}
