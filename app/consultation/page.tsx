"use client"

import { useState } from "react"
import Link from "next/link"
import { Video, ArrowLeft, CheckCircle2, Clock, Shield, Phone } from "lucide-react"

const services = [
  "Trade License Renewal",
  "Visa Processing",
  "Company Formation",
  "Document Attestation",
  "VAT & Accounting",
  "MOHRE & GDRFA Services",
  "Emirates ID & Medical",
  "PRO Typing Services",
  "Other",
]

export default function ConsultationPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Booking Received!</h1>
          <p className="text-gray-600 mb-2">
            Thank you for your interest. Our team will contact you within 24 hours to schedule your free Zoom consultation.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Check your email and WhatsApp for the meeting link.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-[#1a3a6b] font-semibold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a6b] mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Video className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Free 30-Min Consultation</h1>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Book a free Zoom consultation with our PRO services experts. We&apos;ll discuss your requirements and provide the best solution.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-700">30 Minutes</p>
            <p className="text-[10px] text-gray-400">Free session</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <Video className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-700">Zoom Meeting</p>
            <p className="text-[10px] text-gray-400">Link sent via email</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
            <Shield className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-700">Expert Advice</p>
            <p className="text-[10px] text-gray-400">PRO specialists</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                placeholder="+971 5X XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
                placeholder="Your company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Interested In</label>
            <select
              value={form.service}
              onChange={e => setForm({ ...form, service: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent bg-white"
            >
              <option value="">Select a service</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date</label>
              <input
                type="date"
                value={form.preferredDate}
                onChange={e => setForm({ ...form, preferredDate: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Time</label>
              <select
                value={form.preferredTime}
                onChange={e => setForm({ ...form, preferredTime: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent bg-white"
              >
                <option value="">Select time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Message</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent"
              rows={3}
              placeholder="Tell us about your requirements..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Book Free Consultation
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <Phone className="h-3 w-3" />
            Or call us directly: <a href="tel:+971565204844" className="font-medium text-[#1a3a6b]">+971 56 520 4844</a>
          </p>
        </form>
      </div>
    </div>
  )
}
