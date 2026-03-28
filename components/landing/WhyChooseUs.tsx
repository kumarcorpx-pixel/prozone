"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import {
  Handshake, Activity, BadgeDollarSign, UserCheck, HeadphonesIcon, ShieldCheck,
} from "lucide-react"

const benefits = [
  {
    icon: Handshake,
    title: "Government Relations Experts",
    desc: "Deep knowledge of UAE government procedures across all emirates.",
  },
  {
    icon: Activity,
    title: "Real-time Tracking",
    desc: "Monitor every application and transaction live from your dashboard.",
  },
  {
    icon: BadgeDollarSign,
    title: "Transparent Pricing",
    desc: "No hidden fees — clear packages with upfront cost breakdowns.",
  },
  {
    icon: UserCheck,
    title: "Dedicated Account Manager",
    desc: "Single point of contact for all your PRO service needs.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    desc: "Round the clock assistance via phone, email, and WhatsApp.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    desc: "Bank-grade encryption for all your documents and data.",
  },
]

function AnimatedRing({ value }: { value: number }) {
  const ref = useRef<SVGCircleElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, amount: 0.5 })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setProgress(value)
        clearInterval(timer)
      } else {
        setProgress(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (progress / 100) * circumference

  return (
    <div ref={containerRef} className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          ref={ref}
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#10b981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-100"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-[#0f1d3a]">{progress}%</span>
      </div>
    </div>
  )
}

export function WhyChooseUs() {
  return (
    <section className="bg-[#f8fafc] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm uppercase tracking-widest text-[#ef4444] font-semibold">
                Why Choose Us
              </p>
              <h2 className="text-4xl font-bold text-[#0f1d3a] mt-2">
                Expert Team. Proven Results.
              </h2>
              <p className="mt-4 text-[#64748b] max-w-lg">
                With years of experience handling UAE government procedures, our expert team ensures
                your PRO operations run smoothly while you focus on growing your business.
              </p>
            </motion.div>

            <div className="mt-8 space-y-5">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <benefit.icon className="h-4 w-4 text-[#10b981]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0f1d3a]">{benefit.title}</h4>
                    <p className="text-sm text-[#64748b] mt-0.5">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl p-8 space-y-8"
          >
            <AnimatedRing value={98} />
            <div className="text-center">
              <div className="text-lg font-bold text-[#0f1d3a]">Client Satisfaction</div>
              <div className="text-sm text-[#64748b]">Based on post-service surveys</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center p-4 bg-[#f8fafc] rounded-xl">
                <div className="text-2xl font-bold text-[#0f1d3a]">&lt; 24hr</div>
                <div className="text-xs text-[#64748b] mt-1">Avg. Response Time</div>
              </div>
              <div className="text-center p-4 bg-[#f8fafc] rounded-xl">
                <div className="text-2xl font-bold text-[#0f1d3a]">10+</div>
                <div className="text-xs text-[#64748b] mt-1">Years Experience</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
