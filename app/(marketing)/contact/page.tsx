"use client"

import { useState } from "react"
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react"

const serviceOptions = [
  "Trade License Services",
  "Visa Services",
  "Business Setup",
  "Document Services",
  "Accounting & VAT",
  "ADNOC & ICV",
  "Monthly PRO Package",
  "Other",
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
        setFormData({ name: "", email: "", phone: "", service: "", message: "" })
      } else {
        const err = await res.json()
        alert(err.error || "Failed to send")
      }
    } catch {
      alert("Failed to send. Please try again.")
    }
    setSubmitting(false)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Contact <span className="text-red-400">Us</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Get in touch with our team for any inquiries about our PRO services
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Form */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-[#1a3a6b] mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800">Message Sent Successfully!</h3>
                  <p className="text-sm text-green-600 mt-2">Thank you for reaching out. We will get back to you shortly.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 text-sm font-medium bg-[#1a3a6b] text-white rounded-lg hover:bg-[#15305a] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3a6b] focus:ring-1 focus:ring-[#1a3a6b] outline-none transition-colors disabled:opacity-50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3a6b] focus:ring-1 focus:ring-[#1a3a6b] outline-none transition-colors disabled:opacity-50"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3a6b] focus:ring-1 focus:ring-[#1a3a6b] outline-none transition-colors disabled:opacity-50"
                        placeholder="+971 XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
                        Service Type
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3a6b] focus:ring-1 focus:ring-[#1a3a6b] outline-none transition-colors bg-white disabled:opacity-50"
                      >
                        <option value="">Select a service</option>
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      disabled={submitting}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3a6b] focus:ring-1 focus:ring-[#1a3a6b] outline-none transition-colors resize-none disabled:opacity-50"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div>
              <h2 className="text-2xl font-bold text-[#1a3a6b] mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a3a6b]">Phone</h3>
                    <p className="text-sm text-gray-600 mt-1">+971 56 520 4844</p>
                    <p className="text-sm text-gray-600">+971 58 584 9100</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a3a6b]">Email</h3>
                    <p className="text-sm text-gray-600 mt-1">info@yabs.ae</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a3a6b]">Address</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      258, Central Plaza (Zone-3),<br />
                      Schon Business Park, DIP(1),<br />
                      Dubai, UAE
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1a3a6b]">Office Hours</h3>
                    <p className="text-sm text-gray-600 mt-1">Sun - Thu: 8:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-600">Fri - Sat: Closed</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Card */}
              <div className="mt-8 bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg">Need Urgent Help?</h3>
                <p className="text-sm text-gray-300 mt-2">
                  Call us directly for immediate assistance with your PRO service needs.
                </p>
                <a
                  href="tel:+971565204844"
                  className="mt-4 inline-block w-full text-center py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
