"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { FileText, Users, Building2, Stamp, Shield, BarChart3, Clock, Globe, CheckCircle2, MessageCircle, Video, Eye, EyeOff, Lock, Fingerprint, ArrowRight, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Briefcase, Scale, PenTool, Car, LandPlot } from "lucide-react"

const services = [
  { icon: Building2, label: "Business Setup in UAE", color: "text-blue-600" },
  { icon: FileText, label: "Trade License Renewal", color: "text-blue-500" },
  { icon: Users, label: "Visa & Immigration", color: "text-green-500" },
  { icon: Stamp, label: "Document Attestation", color: "text-amber-500" },
  { icon: Scale, label: "Auditing & Accounting", color: "text-red-500" },
  { icon: PenTool, label: "Private Notary Services", color: "text-purple-500" },
  { icon: Car, label: "RTA Related Works", color: "text-cyan-500" },
  { icon: LandPlot, label: "Dubai Municipality Works", color: "text-orange-500" },
]

const allServices = [
  { name: "Business Setup in UAE", desc: "Company formation, mainland & free zone licensing" },
  { name: "Corporate PRO Services", desc: "Government liaison, typing & document clearing" },
  { name: "Trade License Renewal", desc: "DED, free zone & offshore license renewal" },
  { name: "Visa & Immigration Services", desc: "Employment visa, family visa, golden visa processing" },
  { name: "Document Attestation", desc: "MOFA, embassy & notary attestation services" },
  { name: "Auditing & Accounting", desc: "VAT filing, corporate tax, financial auditing" },
  { name: "Private Notary Services", desc: "Contract authentication, POA & legal documents" },
  { name: "RTA Related Works", desc: "Vehicle registration, driving license, fines clearance" },
  { name: "Dubai Municipality Works", desc: "Building permits, health cards, food permits" },
  { name: "MOHRE & Labour Services", desc: "Work permits, labour cards, WPS compliance" },
  { name: "GDRFA & Immigration", desc: "Entry permits, residence visa, status change" },
  { name: "Emirates ID & Medical", desc: "EID application, medical fitness, health insurance" },
  { name: "Ejari & Tawtheeq", desc: "Tenancy contracts, lease registration" },
  { name: "Company Liquidation", desc: "Business closure, deregistration & cancellation" },
  { name: "PRO Typing Services", desc: "Arabic & English typing for all government forms" },
  { name: "Bank Account Opening", desc: "Corporate & personal bank account assistance" },
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

          {/* Action Cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            {/* WhatsApp Card */}
            <a href="https://wa.me/971565204844?text=Hi%20YABS%2C%20I%20need%20PRO%20services" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.764-6.206-2.056l-.434-.328-2.994 1.003 1.003-2.994-.328-.434A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">WhatsApp Us</p>
                <p className="text-[11px] text-green-100">Chat with our PRO team instantly</p>
              </div>
            </a>

            {/* Zoom Consultation Card */}
            <Link href="/consultation"
              className="flex items-center gap-3 px-5 py-3.5 bg-[#2D8CFF] hover:bg-[#2681F0] text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M4.585 4.585C2.37 4.585.585 6.37.585 8.585v6.83c0 2.214 1.785 4 4 4h8.83c2.214 0 4-1.786 4-4v-1.272l4.757 3.171c.393.263.828.271.828-.257V6.943c0-.529-.435-.52-.828-.257l-4.757 3.171V8.585c0-2.214-1.786-4-4-4H4.585z"/></svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Free 30-Min Consultation</p>
                <p className="text-[11px] text-blue-100">Book a Zoom call with our expert</p>
              </div>
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

      {/* Services Section — SEO Keywords */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">Our PRO Services in UAE</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">Complete government relations and corporate services across Dubai, Abu Dhabi & Sharjah</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allServices.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group bg-gray-50 hover:bg-[#1a3a6b] rounded-xl p-4 transition-all duration-300 hover:shadow-lg cursor-default"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#1a3a6b] group-hover:text-[#D4A843] flex-shrink-0 mt-0.5 transition-colors" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-white transition-colors">{service.name}</h3>
                    <p className="text-xs text-gray-500 group-hover:text-blue-200 mt-1 transition-colors">{service.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* SEO Stats Bar */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-12 bg-gradient-to-r from-[#1a3a6b] to-[#0f2340] rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-blue-200 mt-1">Clients Served</p>
              </div>
              <div>
                <p className="text-3xl font-bold">21+</p>
                <p className="text-sm text-blue-200 mt-1">Companies Managed</p>
              </div>
              <div>
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm text-blue-200 mt-1">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-blue-200 mt-1">Emirates Covered</p>
              </div>
            </div>
          </motion.div>

          {/* SEO Text — helps Google ranking */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-10 text-center">
            <p className="text-sm text-gray-400 max-w-3xl mx-auto leading-relaxed">
              <strong className="text-gray-500">YABS Public Relations Management LLC</strong> is a leading corporate PRO services provider in Dubai, offering business setup, trade license renewal, visa processing, document attestation, auditing and accounting, private notary services, RTA related works, Dubai Municipality approvals, MOHRE labour services, GDRFA immigration, Emirates ID processing, Ejari registration, and complete company formation services across UAE mainland and free zones.
            </p>
          </motion.div>
        </div>
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
