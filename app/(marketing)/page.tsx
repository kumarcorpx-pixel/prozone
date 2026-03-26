import Link from "next/link"
import {
  FileText, Users, Building2, Stamp, CreditCard, FileCheck,
  BarChart3, Shield, Clock, Globe, ArrowRight, CheckCircle2,
} from "lucide-react"

const stats = [
  { value: "500+", label: "Clients Served" },
  { value: "5,000+", label: "Transactions" },
  { value: "15+", label: "Services" },
  { value: "24/7", label: "Support" },
]

const services = [
  { icon: FileText, title: "Trade License", desc: "New registration & annual renewals for Abu Dhabi, Dubai & Sharjah" },
  { icon: Users, title: "Visa Services", desc: "Employment, family, dependent & mission visa processing" },
  { icon: Building2, title: "Business Setup", desc: "Company formation in mainland & free zones across UAE" },
  { icon: Stamp, title: "Document Services", desc: "Attestation, legal translation & Emirates ID processing" },
  { icon: CreditCard, title: "Accounting & VAT", desc: "Bookkeeping, VAT registration & financial management" },
  { icon: FileCheck, title: "ADNOC & ICV", desc: "ADNOC vendor registration & ICV certification" },
]

const features = [
  { icon: BarChart3, title: "Track & Monitor", desc: "Monitor application process in real-time" },
  { icon: FileText, title: "Document Management", desc: "Manage all your documents from one place" },
  { icon: Shield, title: "Secure Platform", desc: "Cloud-based secure online access portal" },
  { icon: Clock, title: "Real-time Updates", desc: "Email & SMS notifications on task updates" },
  { icon: Globe, title: "One Window Portal", desc: "All your PRO needs in a single platform" },
  { icon: Users, title: "Client Dashboard", desc: "Easy to navigate dashboard for clients" },
]

const whyChoose = [
  "Expert team with government relations experience",
  "Real-time tracking of all applications",
  "Transparent pricing with no hidden fees",
  "Monthly & yearly PRO service packages",
  "24/7 customer support",
  "Secure cloud-based document management",
]

const proServices = [
  "New Employment Visa",
  "Renewal of Employment Visa",
  "Trade License Renewal",
  "Document Clearing",
  "Government Transactions",
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              One Platform for All Your <span className="text-red-400">PRO Services</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
              Track, monitor and manage all your government transactions in Abu Dhabi, Dubai &amp; Sharjah
              — hassle-free with our cloud-based platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                  Get Started <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-3 text-sm font-semibold border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#1a3a6b] transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1a3a6b]">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b]">
              PRO Services in Abu Dhabi, Dubai, Sharjah
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Comprehensive range of corporate and individual PRO services across UAE
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-6 ring-1 ring-gray-200 hover:shadow-lg transition-shadow">
                <s.icon className="h-10 w-10 text-[#1a3a6b] mb-4" />
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View All Services <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-red-500 font-semibold text-sm uppercase tracking-wide">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-2">
              A Platform That Puts You in Full Control
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Our cloud-based platform allows you to track, monitor and manage all your transactions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl p-6 bg-blue-50/50 border border-blue-100 ring-1 ring-gray-200/50">
                <f.icon className="h-8 w-8 text-[#1a3a6b] mb-3" />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose YABS */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b]">Why Choose YABS?</h2>
              <p className="mt-4 text-gray-600">
                Expert team with deep knowledge of UAE government rules and procedures,
                handling your paperwork so you can focus on your business.
              </p>
              <ul className="mt-6 space-y-3">
                {whyChoose.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Monthly PRO Services</h3>
              <p className="text-gray-300 mb-6">
                Let us handle your PRO operations. Choose a package that fits your business.
              </p>
              <div className="space-y-3 text-left text-sm">
                {proServices.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" /> {s}
                  </div>
                ))}
              </div>
              <Link href="/contact">
                <button className="mt-6 w-full py-2 text-sm font-medium bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                  Get a Quote
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a3a6b] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Want to Hire Our Team?</h2>
          <p className="mt-4 text-gray-300">
            We offer a wide range of corporate and individual PRO services across UAE.
          </p>
          <div className="mt-6 text-sm text-gray-400">Help Desk 24/7</div>
          <div className="text-2xl font-bold mt-2">+971 56 520 4844</div>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/signup">
              <button className="px-6 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Get Started
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-6 py-2.5 text-sm font-medium border border-white rounded-lg hover:bg-white/10 transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
