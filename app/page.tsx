"use client"

import Link from "next/link"
import { ArrowRight, FileText, Users, Building2, Stamp, Shield, BarChart3, Clock, Globe, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  { icon: FileText, label: "Trade License", color: "text-blue-500" },
  { icon: Users, label: "Visa Processing", color: "text-green-500" },
  { icon: Building2, label: "Company Formation", color: "text-purple-500" },
  { icon: Stamp, label: "Document Attestation", color: "text-amber-500" },
  { icon: BarChart3, label: "VAT & Accounting", color: "text-red-500" },
  { icon: Shield, label: "Compliance", color: "text-cyan-500" },
]

function FloatingCard({ icon: Icon, label, color, delay, side }: { icon: any; label: string; color: string; delay: number; side: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100"
    >
      <div className={`h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="text-[10px] text-gray-500">Available</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">

        {/* Left floating service cards */}
        <div className="hidden lg:flex flex-col gap-4 absolute left-8 xl:left-16 top-1/2 -translate-y-1/2">
          {services.slice(0, 3).map((s, i) => (
            <FloatingCard key={s.label} {...s} delay={0.2 + i * 0.15} side="left" />
          ))}
        </div>

        {/* Right floating service cards */}
        <div className="hidden lg:flex flex-col gap-4 absolute right-8 xl:right-16 top-1/2 -translate-y-1/2">
          {services.slice(3, 6).map((s, i) => (
            <FloatingCard key={s.label} {...s} delay={0.3 + i * 0.15} side="right" />
          ))}
        </div>

        {/* Center content */}
        <div className="relative text-center px-6 py-20 max-w-xl mx-auto z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <img src="/images/yabs-logo.gif" alt="YABS PRO Services" className="h-24 w-auto" />
          </motion.div>

          {/* Tagline */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] leading-tight">
              Corporate PRO Services
            </h1>
            <p className="mt-3 text-base text-gray-500 max-w-md mx-auto">
              Your complete platform for managing government transactions, documents, and compliance across the UAE.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1a3a6b] hover:bg-[#15305a] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#1a3a6b]/20 hover:shadow-xl hover:-translate-y-0.5">
              Sign In <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-[#1a3a6b]/20 text-[#1a3a6b] font-semibold rounded-xl text-sm hover:bg-[#1a3a6b] hover:text-white transition-all">
              Create Account
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span>Dubai · Abu Dhabi · Sharjah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Real-time Tracking</span>
            </div>
          </motion.div>

          {/* Mobile service pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-2 lg:hidden"
          >
            {services.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100 text-xs text-gray-600">
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                {s.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl" />
      </div>

      {/* Footer bar */}
      <div className="bg-white border-t border-gray-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} YABS Public Relations Management LLC</p>
          <div className="flex items-center gap-4">
            <a href="tel:+971565204844" className="hover:text-[#1a3a6b] transition-colors">+971 56 520 4844</a>
            <span className="text-gray-300">·</span>
            <a href="mailto:info@yabs.ae" className="hover:text-[#1a3a6b] transition-colors">info@yabs.ae</a>
            <span className="text-gray-300">·</span>
            <Link href="/contact" className="hover:text-[#1a3a6b] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
