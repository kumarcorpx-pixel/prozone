"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/971565204844?text=Hi%2C%20I%20need%20PRO%20services"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25d366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium hidden sm:inline">How can I help you?</span>
    </a>
  )
}
