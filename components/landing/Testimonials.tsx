"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "YABS transformed how we manage our PRO operations. Everything is now trackable in real-time. Their platform saved us countless hours of manual follow-ups.",
    name: "Fatima Al Rashid",
    company: "Gulf Trading LLC",
    designation: "Operations Manager",
    initials: "FA",
  },
  {
    quote:
      "The client portal gives us complete visibility. No more chasing updates via email. We can see exactly where each application stands at any moment.",
    name: "Mohammed Hassan",
    company: "Horizon Properties",
    designation: "CEO",
    initials: "MH",
  },
  {
    quote:
      "Professional team, transparent pricing, and the best platform we've used for PRO services. Highly recommended for any business operating in the UAE.",
    name: "Sarah Johnson",
    company: "Tech Innovations DMCC",
    designation: "HR Director",
    initials: "SJ",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="bg-[#f8fafc] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-[#ef4444] font-semibold">
            Testimonials
          </p>
          <h2 className="text-4xl font-bold text-[#0f1d3a] mt-2">
            Trusted by Leading Companies in UAE
          </h2>
        </motion.div>

        {/* Desktop: 3-card grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#d4a843] text-[#d4a843]" />
                ))}
              </div>
              <p className="text-[#64748b] italic leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] flex items-center justify-center text-white text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0f1d3a]">{t.name}</div>
                  <div className="text-xs text-[#64748b]">
                    {t.designation}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#d4a843] text-[#d4a843]" />
                ))}
              </div>
              <p className="text-[#64748b] italic leading-relaxed mb-6">
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] flex items-center justify-center text-white text-xs font-bold">
                  {testimonials[current].initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0f1d3a]">
                    {testimonials[current].name}
                  </div>
                  <div className="text-xs text-[#64748b]">
                    {testimonials[current].designation}, {testimonials[current].company}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-[#ef4444]" : "bg-gray-300"}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
