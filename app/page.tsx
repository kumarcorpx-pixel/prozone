"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { FileText, Users, Building2, Stamp, Shield, BarChart3, Clock, Globe, CheckCircle2, MessageCircle, Video, Eye, EyeOff, Lock, Fingerprint, ArrowRight, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const services = [
  { icon: FileText, label: "Trade License Renewal", color: "text-blue-500" },
  { icon: Users, label: "Visa Processing", color: "text-green-500" },
  { icon: Building2, label: "Company Formation", color: "text-purple-500" },
  { icon: Stamp, label: "Document Attestation", color: "text-amber-500" },
  { icon: BarChart3, label: "VAT & Accounting", color: "text-red-500" },
  { icon: Shield, label: "MOHRE & GDRFA", color: "text-cyan-500" },
  { icon: Globe, label: "Emirates ID & Medical", color: "text-indigo-500" },
  { icon: Clock, label: "PRO Typing Services", color: "text-orange-500" },
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

function ExpiredToast() {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Your session has expired. Please sign in again.")
    }
  }, [searchParams])
  return null
}

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("yabs_remember_email")
    if (saved) { setEmail(saved); setRememberMe(true) }
  }, [])

  useEffect(() => {
    if (user) {
      if (user.role === "admin") router.push("/admin")
      else if (user.role === "pro_staff") router.push("/staff")
      else router.push("/dashboard")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (rememberMe) localStorage.setItem("yabs_remember_email", email)
      else localStorage.removeItem("yabs_remember_email")
      const loggedInUser: any = await login(email, password)
      const role = loggedInUser?.role
      if (role === "admin") router.push("/admin")
      else if (role === "pro_staff") router.push("/staff")
      else router.push("/dashboard")
      toast.success("Welcome back!")
    } catch (err: any) {
      toast.error(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Suspense><ExpiredToast /></Suspense>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-10">

        {/* Left floating cards */}
        <div className="hidden xl:flex flex-col gap-4 absolute left-8 2xl:left-16 top-1/2 -translate-y-1/2">
          {services.slice(0, 4).map((s, i) => (
            <FloatingCard key={s.label} {...s} delay={0.2 + i * 0.15} side="left" />
          ))}
        </div>

        {/* Right floating cards */}
        <div className="hidden xl:flex flex-col gap-4 absolute right-8 2xl:right-16 top-1/2 -translate-y-1/2">
          {services.slice(4, 8).map((s, i) => (
            <FloatingCard key={s.label} {...s} delay={0.3 + i * 0.15} side="right" />
          ))}
        </div>

        {/* Center */}
        <div className="relative text-center px-4 max-w-md mx-auto z-10 w-full">

          {/* Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: "spring" }} className="flex justify-center mb-5">
            <img src="/images/yabs-logo.gif" alt="YABS PRO Services" className="h-24 w-auto" />
          </motion.div>

          {/* Tagline */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] leading-tight">Corporate PRO Services</h1>
            <p className="mt-3 text-base text-gray-500 max-w-sm mx-auto">
              Your trusted partner for trade license, visa processing, company formation & all government services across UAE.
            </p>
          </motion.div>

          {/* Login Button — shows when login form is hidden */}
          <AnimatePresence mode="wait">
            {!showLogin && (
              <motion.div
                key="login-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-8"
              >
                <button
                  onClick={() => setShowLogin(true)}
                  className="group w-full bg-gradient-to-r from-[#1a3a6b] to-[#0f2340] rounded-2xl p-5 shadow-xl shadow-[#1a3a6b]/15 hover:shadow-2xl hover:-translate-y-0.5 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center"
                      >
                        <Fingerprint className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-white font-semibold text-base">Client Portal</p>
                        <p className="text-blue-200/70 text-xs mt-0.5">Sign in to track your services</p>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] text-blue-200/50 border-t border-white/10 pt-3">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Encrypted</span>
                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Existing clients only</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 24/7 Access</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form — slides in when button is clicked */}
          <AnimatePresence>
            {showLogin && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className="mt-6"
              >
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-6 border border-gray-100 text-left relative">
                  {/* Close button */}
                  <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="h-5 w-5" />
                  </button>

                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: "spring" }} className="flex items-center justify-center mb-4">
                    <div className="h-11 w-11 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-[#1a3a6b]" />
                    </div>
                  </motion.div>

                  <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-lg font-semibold text-gray-900 text-center mb-1">Welcome back</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xs text-gray-400 text-center mb-5">All roles (Admin, Staff, Client) use this login</motion.p>

                  <form onSubmit={handleLogin} className="space-y-3">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-shadow" placeholder="you@example.com" autoFocus />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                      <div className="relative">
                        <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-shadow" placeholder="Enter password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 text-[#1a3a6b]" />
                        <span className="text-xs text-gray-500">Remember me</span>
                      </label>
                      <Link href="/forgot-password" className="text-xs text-[#1a3a6b] hover:underline">Forgot password?</Link>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      type="submit" disabled={loading}
                      className="w-full bg-[#1a3a6b] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#15305a] transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : "Sign In"}
                    </motion.button>
                  </form>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-4 text-center text-xs text-gray-400">
                    Not a client? <a href="https://wa.me/971565204844?text=Hi%20YABS%2C%20I%20need%20PRO%20services" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">Contact us on WhatsApp</a>
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <a href="https://wa.me/971565204844?text=Hi%20YABS%2C%20I%20need%20PRO%20services" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <Link href="/consultation"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <Video className="h-4 w-4" /> Free Consultation
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-green-500" /><span>Secure & Encrypted</span></div>
            <div className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-blue-500" /><span>Dubai · Abu Dhabi · Sharjah</span></div>
            <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /><span>Real-time Tracking</span></div>
          </motion.div>

          {/* Mobile service pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }} className="mt-6 flex flex-wrap justify-center gap-2 xl:hidden">
            {services.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100 text-xs text-gray-600">
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                {s.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-100/20 rounded-full blur-3xl" />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} YABS Public Relations Management LLC</p>
          <div className="flex items-center gap-4">
            <a href="tel:+971565204844" className="hover:text-[#1a3a6b]">+971 56 520 4844</a>
            <span className="text-gray-300">·</span>
            <a href="mailto:info@yabs.ae" className="hover:text-[#1a3a6b]">info@yabs.ae</a>
            <span className="text-gray-300">·</span>
            <Link href="/privacy" className="hover:text-[#1a3a6b]">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
