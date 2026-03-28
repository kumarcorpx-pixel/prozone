"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import {
  FileText, Users, Building2, Stamp, Shield, BarChart3, Clock, Globe,
  CheckCircle2, MessageCircle, Eye, EyeOff, Lock, Fingerprint, ArrowRight,
  Sparkles, X, Phone, Mail, MapPin, Video, ChevronRight, Star,
  Briefcase, Scale, PenTool, Car, LandPlot, CreditCard, Upload, Headphones
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function ExpiredToast() {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Your session has expired. Please sign in again.")
    }
  }, [searchParams])
  return null
}

const proServices = [
  { icon: FileText, label: "Trade License", desc: "New & renewal" },
  { icon: Users, label: "Visa Processing", desc: "All visa types" },
  { icon: BarChart3, label: "VAT & Accounting", desc: "Tax compliance" },
  { icon: Building2, label: "Company Formation", desc: "Mainland & free zone" },
  { icon: Shield, label: "Cloud Compliance", desc: "Digital tracking" },
  { icon: Briefcase, label: "PRO Services", desc: "Government liaison" },
  { icon: CreditCard, label: "Banking Solutions", desc: "Account opening" },
  { icon: LandPlot, label: "Office Solutions", desc: "Ejari & Tawtheeq" },
]

const wideServices = [
  { icon: Users, name: "Employment Visas" },
  { icon: Fingerprint, name: "Emirates ID" },
  { icon: CreditCard, name: "Bank Account Opening" },
  { icon: Building2, name: "Immigration Department" },
  { icon: Stamp, name: "Document Attestation" },
  { icon: FileText, name: "Labour Cards" },
  { icon: Users, name: "Family Residency Visas" },
  { icon: X, name: "Visa Cancellations" },
]

const whyChoose = [
  { title: "Expert Guidance", desc: "Our experienced PRO officers handle complex government procedures with precision and speed." },
  { title: "Transparent Costs", desc: "No hidden fees — clear pricing for every service with detailed breakdowns upfront." },
  { title: "Dedicated Support", desc: "Personal PRO manager assigned to each client with WhatsApp & portal access 24/7." },
  { title: "Digital Tracking", desc: "Track every document, visa and service request in real-time on corporatepro.cloud." },
]

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
    } catch (err: any) { toast.error(err?.message || "Login failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white">
      <Suspense><ExpiredToast /></Suspense>

      {/* Top Bar */}
      <div className="bg-[#1a3a6b] text-white text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="flex items-center gap-2">
            <Video className="h-3.5 w-3.5 text-[#D4A843]" />
            <span>FREE 30 Min Consultation with our Experts!</span>
          </p>
          <a href="tel:+971565204844" className="flex items-center gap-1.5 hover:text-[#D4A843] transition-colors">
            <Phone className="h-3.5 w-3.5" /> +971 56 520 4844
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/yabs-logo.gif" alt="YABS PRO Services" className="h-10 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-[#1a3a6b] transition-colors">Our Services</a>
            <a href="#packages" className="hover:text-[#1a3a6b] transition-colors">Packages</a>
            <a href="#why" className="hover:text-[#1a3a6b] transition-colors">Why Choose Us</a>
            <Link href="/consultation" className="hover:text-[#1a3a6b] transition-colors">Free Consultation</Link>
          </div>
          <button onClick={() => setShowLogin(true)} className="px-5 py-2 bg-[#1a3a6b] text-white text-sm font-semibold rounded-lg hover:bg-[#15305a] transition-colors">
            Login / Sign in
          </button>
        </div>
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", bounce: 0.25 }}
              className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"><X className="h-5 w-5" /></button>
              <div className="flex justify-center mb-4"><img src="/images/yabs-logo.gif" alt="YABS" className="h-14 w-auto" /></div>
              <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Client Portal Login</h2>
              <p className="text-xs text-gray-400 text-center mb-5">Admin, Staff & Client — all roles</p>
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="you@example.com" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 text-[#1a3a6b]" /><span className="text-xs text-gray-500">Remember me</span></label>
                  <Link href="/forgot-password" className="text-xs text-[#1a3a6b] hover:underline">Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1a3a6b] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#15305a] disabled:opacity-50">
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</span> : "Sign In"}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-gray-400">Not a client? <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">Contact us on WhatsApp</a></p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold text-[#1a3a6b] leading-tight">
              One Platform for All Services
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              PRO services in Abu Dhabi, Dubai, Sharjah — business setup, licensing, visa, attestation & more.
            </motion.p>
          </div>

          {/* Client Portal — prominent animated button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", bounce: 0.3 }}
            className="max-w-sm mx-auto mb-10"
          >
            <button onClick={() => setShowLogin(true)}
              className="group w-full bg-gradient-to-r from-[#1a3a6b] to-[#0f2340] rounded-2xl p-5 shadow-xl shadow-[#1a3a6b]/20 hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    className="h-12 w-12 rounded-xl bg-[#D4A843]/20 flex items-center justify-center"
                  >
                    <Fingerprint className="h-6 w-6 text-[#D4A843]" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-white font-bold text-base">Client Portal</p>
                    <p className="text-blue-200/70 text-xs">Sign in to track your services</p>
                  </div>
                </div>
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#D4A843]/30 transition-colors">
                  <ArrowRight className="h-5 w-5 text-white" />
                </motion.div>
              </div>
            </button>
          </motion.div>

          {/* Service Grid — 4 columns on desktop, 2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {proServices.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-[#1a3a6b]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default"
              >
                <s.icon className="h-7 w-7 text-[#1a3a6b] mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Our Services */}
      <section id="services" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">Explore Our Services</h2>
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">Complete corporate solutions for businesses of all sizes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Company Formation", desc: "Mainland LLC, DMCC, IFZA, RAKEZ, Meydan & offshore company formation with expert guidance.", points: ["Expert Guidance", "Transparent Costs", "Dedicated Support"], color: "bg-[#1a3a6b]" },
              { title: "Cloud Compliance", desc: "Digital document management, compliance tracking & real-time monitoring via corporatepro.cloud portal.", points: ["Real-time Tracking", "Document OCR", "Expiry Alerts"], color: "bg-[#0f2340]" },
              { title: "Restructuring", desc: "Business restructuring, company liquidation, ownership transfer & trade license amendment services.", points: ["Expert Guidance", "Complete Process", "Dedicated Support"], color: "bg-[#162d50]" },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`${card.color} rounded-2xl p-6 text-white`}>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-sm text-blue-200 mb-4">{card.desc}</p>
                <ul className="space-y-2 mb-5">
                  {card.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-[#D4A843]" /> {p}</li>
                  ))}
                </ul>
                <Link href="/consultation" className="inline-block px-5 py-2 bg-white text-[#1a3a6b] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly PRO Packages */}
      <section id="packages" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="text-xs font-semibold text-[#D4A843] bg-[#D4A843]/10 px-3 py-1 rounded-full">PRO Packages</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b] mt-3">Monthly PRO Services</h2>
            <p className="mt-2 text-gray-500">Outsource your company&apos;s government transactions to our experienced PRO team</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { plan: "Small Business", features: ["New Employment visa", "Trade License Renewal", "Free Typing Services"], highlight: false },
              { plan: "Medium Enterprise", features: ["New Employment visa", "Trade License Renewal", "Hedc License Renewal", "Free Services"], highlight: true },
              { plan: "Corporate", features: ["New Employment visa", "Hedc License Renewal", "Trade License Renewal", "Free Services"], highlight: false },
            ].map((pkg, i) => (
              <motion.div key={pkg.plan} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border-2 ${pkg.highlight ? "border-[#D4A843] bg-white shadow-lg scale-105" : "border-gray-200 bg-white"}`}>
                {pkg.highlight && <span className="text-xs font-bold text-[#D4A843] bg-[#D4A843]/10 px-3 py-1 rounded-full">Most Popular</span>}
                <h3 className={`text-xl font-bold mt-2 ${pkg.highlight ? "text-[#1a3a6b]" : "text-gray-800"}`}>{pkg.plan}</h3>
                <p className="text-[#D4A843] font-bold text-sm mt-1">Call for Pricing</p>
                <ul className="mt-4 space-y-2">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}</li>
                  ))}
                </ul>
                <a href="https://wa.me/971565204844?text=Hi%20YABS%2C%20I%20need%20pricing%20for%20the%20" target="_blank" rel="noopener noreferrer"
                  className={`block w-full text-center mt-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${pkg.highlight ? "bg-[#1a3a6b] text-white hover:bg-[#15305a]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  Call for Pricing
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Wide Range of PRO Services */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">Our Wide Range of PRO Services</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {wideServices.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-gray-50 rounded-xl p-5 text-center hover:bg-[#1a3a6b] hover:text-white group transition-all duration-300 cursor-default">
                <s.icon className="h-8 w-8 mx-auto mb-3 text-[#1a3a6b] group-hover:text-[#D4A843] transition-colors" />
                <p className="text-sm font-semibold text-gray-800 group-hover:text-white transition-colors">{s.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] rounded-2xl p-8 text-white">
                <div className="bg-white rounded-xl p-3 inline-block mb-4">
                  <img src="/images/yabs-logo.gif" alt="YABS" className="h-14 w-auto" />
                </div>
                <h3 className="text-2xl font-bold">15+ Years of Trust</h3>
                <p className="text-blue-200 mt-2">Serving 500+ businesses across Dubai, Abu Dhabi and Sharjah with dedicated PRO services.</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div><p className="text-2xl font-bold text-[#D4A843]">500+</p><p className="text-xs text-blue-200">Clients</p></div>
                  <div><p className="text-2xl font-bold text-[#D4A843]">21+</p><p className="text-xs text-blue-200">Companies</p></div>
                  <div><p className="text-2xl font-bold text-[#D4A843]">3</p><p className="text-xs text-blue-200">Emirates</p></div>
                  <div><p className="text-2xl font-bold text-[#D4A843]">24/7</p><p className="text-xs text-blue-200">Support</p></div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b] mb-6">Why Choose Us for PRO Services</h2>
              <div className="space-y-5">
                {whyChoose.map((item, i) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#D4A843] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Outsource CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">Outsource Your Company&apos;s PRO Services</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">Focus on your business while we handle all government transactions, licensing, visas and compliance.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a href="https://wa.me/971565204844?text=Hi%20YABS%2C%20I%20want%20to%20outsource%20PRO%20services" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg">
                <MessageCircle className="h-5 w-5" /> WhatsApp for Free Consultation
              </a>
              <Link href="/consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2D8CFF] hover:bg-[#2681F0] text-white font-semibold rounded-xl text-sm transition-all shadow-lg">
                <Video className="h-5 w-5" /> Book Zoom Call
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2340] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="bg-white rounded-lg p-2 inline-block mb-4">
                <img src="/images/yabs-logo.gif" alt="YABS" className="h-12 w-auto" />
              </div>
              <p className="text-sm text-blue-200">Your trusted partner for all corporate PRO services across UAE.</p>
              <div className="flex gap-3 mt-4">
                <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a href="mailto:info@yabs.ae" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </a>
                <a href="tel:+971565204844" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#D4A843]">Services</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>Business Setup</li>
                <li>Trade License Renewal</li>
                <li>Visa Processing</li>
                <li>Document Attestation</li>
                <li>Auditing & Accounting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#D4A843]">Government</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>MOHRE & Labour</li>
                <li>GDRFA & Immigration</li>
                <li>Dubai Municipality</li>
                <li>RTA Services</li>
                <li>Private Notary</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[#D4A843]">Official Info</h4>
              <div className="space-y-3 text-sm text-blue-200">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#D4A843]" />
                  <p>258, Central Plaza, Schon Business Park, DIP(1), Dubai, UAE</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#D4A843]" />
                  <a href="tel:+971565204844" className="hover:text-white">+971 56 520 4844</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#D4A843]" />
                  <a href="mailto:info@yabs.ae" className="hover:text-white">info@yabs.ae</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300">
            <p>&copy; {new Date().getFullYear()} YABS Public Relations Management LLC. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <span>·</span>
              <a href="https://corporatepro.cloud" className="hover:text-white">corporatepro.cloud</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
