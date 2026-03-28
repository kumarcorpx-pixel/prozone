"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

const emirates = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
]

const employeeRanges = [
  "1 - 5",
  "6 - 15",
  "16 - 50",
  "51 - 100",
  "100+",
]

const serviceOptions = [
  "Trade License",
  "Visa Services",
  "Business Setup",
  "Document Services",
  "Accounting & VAT",
  "ADNOC & ICV",
  "Monthly PRO Package",
]

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      companyName: formData.get("companyName"),
      emirate: formData.get("emirate"),
      employees: formData.get("employees"),
      services: selectedServices,
      contactName: formData.get("contactName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    }

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // Silently handle — toast can be added later
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#0f1d3a] py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Get a Free Quote in 60 Seconds
          </h2>
          <p className="mt-4 text-gray-400">
            Tell us about your business and we&apos;ll prepare a custom package
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Quote Request Received!</h3>
            <p className="text-gray-400">
              Our team will review your requirements and get back to you within 24 hours.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="companyName"
                type="text"
                placeholder="Company Name"
                required
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors"
              />
              <select
                name="emirate"
                required
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors appearance-none"
              >
                <option value="" className="text-gray-800">Select Emirate</option>
                {emirates.map((e) => (
                  <option key={e} value={e} className="text-gray-800">{e}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="employees"
                required
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors appearance-none"
              >
                <option value="" className="text-gray-800">Number of Employees</option>
                {employeeRanges.map((r) => (
                  <option key={r} value={r} className="text-gray-800">{r}</option>
                ))}
              </select>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-2">Services Needed</div>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedServices.includes(s)
                          ? "bg-[#ef4444] border-[#ef4444] text-white"
                          : "border-white/30 text-gray-300 hover:border-white/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="contactName"
                type="text"
                placeholder="Contact Name"
                required
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors"
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors"
              />
              <textarea
                name="message"
                placeholder="Additional Details (optional)"
                rows={1}
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-[#ef4444] focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Get Your Free Quote <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  )
}
