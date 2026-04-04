import Link from "next/link"
import {
  FileText, Users, Building2, Stamp, CreditCard, Landmark,
  ArrowRight, CheckCircle2, Phone, Mail, MapPin,
  ClipboardList, Cog, BarChart3, Star, Shield, Clock,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "8+", label: "Years of Experience" },
  { value: "5,000+", label: "Transactions Completed" },
  { value: "15+", label: "PRO Services" },
  { value: "3", label: "Emirates Covered" },
]

const services = [
  {
    icon: FileText,
    title: "Trade License Renewal",
    bullets: [
      "DED, DMCC, DAFZA, JAFZA, RAKEZ",
      "New registration & annual renewals",
      "Activity amendment & license modification",
      "Trade name reservation & approval",
    ],
  },
  {
    icon: Users,
    title: "Visa Processing",
    bullets: [
      "Employment visa (new & renewal)",
      "Family & dependent visa sponsorship",
      "Visit & mission visa arrangements",
      "GDRFA status change & cancellation",
    ],
  },
  {
    icon: Building2,
    title: "Company Formation",
    bullets: [
      "Mainland company setup (LLC, sole prop)",
      "Free zone incorporation (DMCC, JAFZA, RAKEZ)",
      "Offshore company registration",
      "MOA drafting & share structuring",
    ],
  },
  {
    icon: Stamp,
    title: "Document Services",
    bullets: [
      "UAE & international attestation",
      "Legal translation (Arabic / English)",
      "Notarization & legalisation",
      "Emirates ID & medical typing",
    ],
  },
  {
    icon: CreditCard,
    title: "Accounting & VAT",
    bullets: [
      "VAT registration & de-registration",
      "Quarterly & annual VAT returns",
      "Bookkeeping & financial reporting",
      "Corporate tax advisory",
    ],
  },
  {
    icon: Landmark,
    title: "Government Transactions",
    bullets: [
      "MOHRE labour cards & contracts",
      "GDRFA visa & permit services",
      "ICA federal authority services",
      "DED & municipality approvals",
    ],
  },
]

const steps = [
  {
    num: "01",
    title: "Submit Your Request",
    desc: "Tell us what you need — trade license renewal, visa processing, company formation, or any government service. We review your requirements within hours.",
  },
  {
    num: "02",
    title: "We Handle Everything",
    desc: "Our expert PRO team liaises with MOHRE, GDRFA, DED, and all relevant government authorities on your behalf. No queues, no paperwork headaches.",
  },
  {
    num: "03",
    title: "Track Progress Online",
    desc: "Monitor every step through our secure client portal. Receive real-time SMS and email updates until your transaction is completed.",
  },
]

const emirates = [
  {
    name: "Dubai",
    authorities: ["DED", "DMCC", "DAFZA", "JAFZA", "DIFC"],
  },
  {
    name: "Abu Dhabi",
    authorities: ["ADDED", "ADGM", "KIZAD", "ADNOC ICV"],
  },
  {
    name: "Sharjah",
    authorities: ["SRTIP", "SAIF Zone", "Hamriyah FZ", "Sharjah DED"],
  },
]

const packages = [
  {
    name: "Starter",
    price: "AED 1,500",
    period: "/mo",
    features: [
      "Up to 5 transactions per month",
      "Trade license renewal assistance",
      "Basic visa processing",
      "Email support",
      "Online tracking portal",
    ],
    highlight: false,
  },
  {
    name: "Professional",
    price: "AED 3,500",
    period: "/mo",
    features: [
      "Up to 15 transactions per month",
      "Full PRO service coverage",
      "Priority visa processing",
      "Dedicated account manager",
      "Phone & WhatsApp support",
      "Document attestation included",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited transactions",
      "All PRO services included",
      "Multiple entity management",
      "Dedicated PRO team on-site",
      "24/7 priority support",
      "Quarterly business reviews",
    ],
    highlight: false,
  },
]

const whyPoints = [
  { icon: Star, text: "8+ years of government relations expertise across UAE" },
  { icon: Shield, text: "Fully licensed & insured PRO services company" },
  { icon: Clock, text: "Fast turnaround — most transactions in 2-5 working days" },
  { icon: BarChart3, text: "Real-time online tracking portal for every transaction" },
  { icon: CheckCircle2, text: "Transparent pricing with no hidden fees" },
  { icon: Users, text: "Dedicated account manager for every client" },
]

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="relative bg-gradient-to-br from-[#1a3a6b] via-[#15305a] to-[#0f2340] text-white overflow-hidden">
        {/* subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <p className="text-[#c9a96e] font-semibold text-sm uppercase tracking-widest mb-4">
              PRO Services UAE &middot; Dubai &middot; Abu Dhabi &middot; Sharjah
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              UAE&rsquo;s Most Trusted{" "}
              <span className="text-[#c9a96e]">PRO Services</span> Partner
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              Trade License Renewal &middot; Visa Processing &middot; Company Formation &middot; Document Attestation
              &mdash; All Government Services Under One Roof
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a3a6b] rounded-xl transition-colors shadow-lg shadow-[#c9a96e]/20">
                  Get Started <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <a href="tel:+971565204844">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold border-2 border-white/30 text-white rounded-xl hover:bg-white hover:text-[#1a3a6b] transition-colors">
                  <Phone className="h-4 w-4" /> Call Us: +971 56 520 4844
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
            Trusted by 500+ UAE Businesses
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1a3a6b]">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SERVICES GRID ==================== */}
      <section className="bg-gray-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c9a96e] font-semibold text-sm uppercase tracking-widest">What We Do</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-3">
              Comprehensive PRO Services in Dubai, Abu Dhabi &amp; Sharjah
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              From trade license renewal and visa processing to company formation and document attestation,
              YABS delivers end-to-end corporate PRO services across the UAE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <article
                key={s.title}
                className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="h-12 w-12 rounded-xl bg-[#1a3a6b]/5 flex items-center justify-center mb-5">
                  <s.icon className="h-6 w-6 text-[#1a3a6b]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
                <ul className="space-y-2 mb-5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-[#c9a96e] shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a3a6b] hover:text-[#c9a96e] transition-colors"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c9a96e] font-semibold text-sm uppercase tracking-widest">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-3">
              Three Simple Steps to Hassle-Free PRO Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#1a3a6b] text-white text-xl font-bold mb-5">
                  {s.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE YABS ==================== */}
      <section className="bg-gray-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[#c9a96e] font-semibold text-sm uppercase tracking-widest">Why Choose YABS</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-3">
                Your Dedicated Corporate PRO Services Partner in the UAE
              </h2>
              <p className="mt-5 text-gray-600 leading-relaxed">
                With over 8 years of experience in UAE government relations, YABS Public Relations
                Management LLC handles all your PRO service needs across Dubai, Abu Dhabi, and
                Sharjah. From trade license renewals and visa processing to company formation and
                document attestation, our expert team ensures fast, reliable service with complete
                transparency through our online tracking portal.
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Whether you need MOHRE labour cards, GDRFA visa services, DED trade license
                amendments, or corporate tax registration, YABS is the single point of contact for
                every government transaction your business requires in the UAE.
              </p>
            </div>

            <div className="space-y-4">
              {whyPoints.map((p) => (
                <div
                  key={p.text}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#1a3a6b]/5 flex items-center justify-center shrink-0">
                    <p.icon className="h-5 w-5 text-[#1a3a6b]" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium leading-relaxed">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EMIRATES COVERED ==================== */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c9a96e] font-semibold text-sm uppercase tracking-widest">Coverage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-3">
              PRO Services Across Three Emirates
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              We handle government transactions with all major free zones, mainland authorities, and
              federal departments in Dubai, Abu Dhabi, and Sharjah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {emirates.map((e) => (
              <div
                key={e.name}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-7 text-center shadow-sm"
              >
                <MapPin className="h-8 w-8 text-[#c9a96e] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1a3a6b] mb-4">{e.name}</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {e.authorities.map((a) => (
                    <span
                      key={a}
                      className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#1a3a6b]/5 text-[#1a3a6b]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MONTHLY PRO PACKAGES ==================== */}
      <section className="bg-gray-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#c9a96e] font-semibold text-sm uppercase tracking-widest">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-3">
              Monthly PRO Service Packages
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Flexible corporate PRO service packages designed for startups, SMEs, and enterprises
              operating in the UAE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl p-8 shadow-sm border transition-shadow hover:shadow-md ${
                  pkg.highlight
                    ? "bg-[#1a3a6b] text-white border-[#1a3a6b] ring-2 ring-[#c9a96e]"
                    : "bg-white text-gray-900 border-gray-100"
                }`}
              >
                {pkg.highlight && (
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#c9a96e] text-[#1a3a6b] rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{pkg.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{pkg.price}</span>
                  {pkg.period && (
                    <span className={`text-sm ${pkg.highlight ? "text-gray-300" : "text-gray-400"}`}>
                      {pkg.period}
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          pkg.highlight ? "text-[#c9a96e]" : "text-[#c9a96e]"
                        }`}
                      />
                      <span className={pkg.highlight ? "text-gray-200" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="block mt-8">
                  <button
                    className={`w-full py-3 text-sm font-semibold rounded-xl transition-colors ${
                      pkg.highlight
                        ? "bg-[#c9a96e] text-[#1a3a6b] hover:bg-[#b8944f]"
                        : "bg-[#1a3a6b] text-white hover:bg-[#15305a]"
                    }`}
                  >
                    {pkg.price === "Custom" ? "Contact Us" : "Get Started"}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="bg-gradient-to-br from-[#1a3a6b] via-[#15305a] to-[#0f2340] text-white py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Simplify Your Government Transactions?
          </h2>
          <p className="mt-5 text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Let YABS handle your PRO services in Dubai, Abu Dhabi, and Sharjah.
            Get in touch today for a free consultation.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+971565204844">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-[#c9a96e] text-[#1a3a6b] rounded-xl hover:bg-[#b8944f] transition-colors shadow-lg shadow-[#c9a96e]/20">
                <Phone className="h-4 w-4" /> +971 56 520 4844
              </button>
            </a>
            <a href="https://wa.me/971565204844" target="_blank" rel="noopener noreferrer">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold border-2 border-white/30 text-white rounded-xl hover:bg-white hover:text-[#1a3a6b] transition-colors">
                WhatsApp Us
              </button>
            </a>
            <a href="mailto:info@yabs.ae">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold border-2 border-white/30 text-white rounded-xl hover:bg-white hover:text-[#1a3a6b] transition-colors">
                <Mail className="h-4 w-4" /> info@yabs.ae
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== SEO CONTENT BLOCK (hidden visually, readable by crawlers) ==================== */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b] mb-6">
            About YABS PRO Services in UAE
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
            <p>
              YABS Public Relations Management LLC is a leading provider of corporate PRO services
              in the UAE, specialising in trade license renewal, visa processing, company formation,
              and document attestation across Dubai, Abu Dhabi, and Sharjah. Our government relations
              experts have deep working knowledge of every major authority including MOHRE, GDRFA,
              ICA, DED, DMCC, DAFZA, JAFZA, RAKEZ, ADGM, and KIZAD.
            </p>
            <p>
              Whether you are looking for business setup in Dubai, company formation in a UAE free
              zone, trade license renewal with DED, or GDRFA visa services, YABS delivers fast,
              transparent, and fully compliant PRO services. Our monthly PRO service packages give
              businesses of all sizes access to dedicated government liaison support without the
              overhead of an in-house PRO team.
            </p>
            <p>
              As one of the most trusted PRO services companies in the UAE, we have successfully
              processed over 5,000 government transactions for 500+ businesses. Our services
              include employment visa processing, family visa sponsorship, document attestation and
              legalisation, VAT registration and returns, MOHRE labour card processing, Emirates ID
              applications, and corporate PRO outsourcing across all three emirates.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
