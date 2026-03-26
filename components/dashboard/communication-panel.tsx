"use client"

import { useState } from "react"
import { MessageCircle, Video, Mail, Phone, Calendar, ExternalLink, X, Send } from "lucide-react"
import { whatsappContextLinks } from "@/lib/whatsapp"
import { getCalendlyUrl, meetingTypes } from "@/lib/calendly"

interface CommunicationPanelProps {
  context?: "dashboard" | "requests" | "tracking" | "payments" | "general"
  clientPhone?: string
  clientEmail?: string
  clientName?: string
}

export function CommunicationPanel({ context = "general", clientPhone, clientEmail, clientName }: CommunicationPanelProps) {
  const [showBooking, setShowBooking] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sending, setSending] = useState(false)

  const whatsappLink = whatsappContextLinks[context] || whatsappContextLinks.general

  const handleSendEmail = async () => {
    if (!clientEmail || !emailSubject) return
    setSending(true)
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          to: clientEmail,
          subject: emailSubject,
          html: `<p>${emailBody.replace(/\n/g, "<br/>")}</p>`,
        }),
      })
      setShowEmailForm(false)
      setEmailSubject("")
      setEmailBody("")
    } catch {
      // Handle error silently in demo
    } finally {
      setSending(false)
    }
  }

  const handleSendWhatsApp = async (message: string) => {
    if (!clientPhone) return
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: clientPhone, text: message }),
      })
    } catch {
      // Fallback: open wa.me link
    }
    // Always open wa.me as fallback
    window.open(
      `https://wa.me/${clientPhone.replace(/[\s+\-()]/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    )
  }

  return (
    <>
      {/* Communication Buttons */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Communication</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#25d366]/10 text-[#25d366] hover:bg-[#25d366]/20 transition-colors text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>

          {/* Email */}
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>

          {/* Phone */}
          <a
            href="tel:+971565204844"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>

          {/* Book Meeting */}
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <Video className="h-4 w-4" />
            Zoom Call
          </button>
        </div>

        {/* Quick WhatsApp Messages */}
        {clientPhone && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Quick WhatsApp Messages:</p>
            <div className="space-y-1.5">
              {[
                "When will this be completed?",
                "I have uploaded the required document",
                "Please call me to discuss",
              ].map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleSendWhatsApp(msg)}
                  className="block w-full text-left px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" /> Send Email
            </h4>
            <button onClick={() => setShowEmailForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={clientEmail || ""}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              placeholder="To"
            />
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Subject"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm h-24 resize-none"
              placeholder="Message..."
            />
            <button
              onClick={handleSendEmail}
              disabled={sending || !emailSubject}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-[#15305a] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" /> Book a Meeting
            </h4>
            <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(meetingTypes).map(([key, meeting]) => (
              <a
                key={key}
                href={`${getCalendlyUrl()}?name=${encodeURIComponent(clientName || "")}&email=${encodeURIComponent(clientEmail || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{meeting.label}</p>
                  <p className="text-xs text-gray-500">{meeting.description} &middot; {meeting.duration}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Powered by Calendly + Zoom</p>
        </div>
      )}
    </>
  )
}

// Floating WhatsApp button for all dashboard pages
export function FloatingWhatsApp({ context = "general" }: { context?: string }) {
  const link = whatsappContextLinks[context as keyof typeof whatsappContextLinks] || whatsappContextLinks.general

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25d366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium hidden sm:inline">Chat with us</span>
    </a>
  )
}
