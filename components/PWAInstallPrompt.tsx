"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwaInstallDismissed")
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime()
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return // 7 days
    }

    // iOS detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowPrompt(true), 3000) // Show after 3s
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Show iOS prompt after delay
    if (isIOSDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      setTimeout(() => setShowPrompt(true), 5000)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") setIsInstalled(true)
      setDeferredPrompt(null)
    }
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem("pwaInstallDismissed", new Date().toISOString())
    setShowPrompt(false)
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto animate-in slide-in-from-bottom-4">
      <div className="bg-[#1a3a6b] text-white rounded-2xl p-4 shadow-2xl border border-white/10">
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-white/50 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-[#D4A843]/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-6 w-6 text-[#D4A843]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install CorporatePRO App</p>
            {isIOS ? (
              <p className="text-xs text-blue-200 mt-1">
                Tap <span className="inline-flex items-center bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                  <svg className="h-3 w-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a1 1 0 01-1 1h-4v4a1 1 0 01-2 0V9H4a1 1 0 010-2h4V3a1 1 0 012 0v4h4a1 1 0 011 1z"/></svg>
                  Share
                </span> then <strong>&quot;Add to Home Screen&quot;</strong>
              </p>
            ) : (
              <>
                <p className="text-xs text-blue-200 mt-1">Get instant access from your home screen</p>
                <button onClick={handleInstall} className="mt-2 px-4 py-1.5 bg-[#D4A843] text-[#1a3a6b] text-xs font-bold rounded-lg hover:bg-[#c9a040] transition-colors flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Install App
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
