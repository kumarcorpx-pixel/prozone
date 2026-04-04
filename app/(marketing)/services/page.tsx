import Link from "next/link"
import {
  FileText, Users, Building2, Stamp, CreditCard, FileCheck, ArrowRight,
} from "lucide-react"

const services = [
  {
    icon: FileText,
    title: "Trade License Services",
    description:
      "New registration & annual renewals for Abu Dhabi, Dubai & Sharjah. We handle end-to-end trade license processing with all relevant government authorities including DED, ADDC, and municipality approvals.",
    subServices: [
      "New Trade License Registration",
      "Annual Trade License Renewal",
      "License Amendment",
      "Activity Addition/Removal",
    ],
  },
  {
    icon: Users,
    title: "Visa Services",
    description:
      "Employment, family, dependent & mission visa processing. Our team ensures smooth and timely visa processing with the Ministry of Human Resources, General Directorate of Residency and Foreigners Affairs.",
    subServices: [
      "New Employment Visa",
      "Employment Visa Renewal",
      "Family/Dependent Visa",
      "Mission Visa",
      "Visa Cancellation",
    ],
  },
  {
    icon: Building2,
    title: "Business Setup",
    description:
      "Company formation in mainland & free zones across UAE. Whether you are starting a new venture or expanding an existing business, we guide you through every step of the setup process.",
    subServices: [
      "Mainland Company Formation",
      "Free Zone Company Setup",
      "Branch Office Setup",
      "Business Transfer",
    ],
  },
  {
    icon: Stamp,
    title: "Document Services",
    description:
      "Attestation, legal translation & Emirates ID processing. We manage document clearance across ministries, embassies, and government departments with accuracy and speed.",
    subServices: [
      "Document Attestation",
      "Legal Translation",
      "Emirates ID Application/Renewal",
      "Document Clearing",
    ],
  },
  {
    icon: CreditCard,
    title: "Accounting & VAT",
    description:
      "Bookkeeping, VAT registration & financial management. Our certified accountants ensure your business stays compliant with UAE Federal Tax Authority regulations.",
    subServices: [
      "VAT Registration (FTA)",
      "Monthly Bookkeeping",
      "Annual Auditing",
      "Tax Return Filing",
    ],
  },
  {
    icon: FileCheck,
    title: "ADNOC & ICV",
    description:
      "Vendor registration & ICV certification. We assist businesses in obtaining and maintaining their In-Country Value certification required for government and semi-government contracts.",
    subServices: [
      "ADNOC Vendor Registration",
      "ICV Certification",
      "Annual ICV Renewal",
    ],
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Our <span className="text-red-400">PRO Services</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive government transaction services across Abu Dhabi, Dubai &amp; Sharjah — handled by experts so you can focus on your business.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      {services.map((service, idx) => (
        <section
          key={service.title}
          className={idx % 2 === 0 ? "bg-white py-16 md:py-20" : "bg-gray-50 py-16 md:py-20"}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* Info */}
              <div className={idx % 2 !== 0 ? "md:order-2" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <service.icon className="h-10 w-10 text-[#1a3a6b]" />
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">
                    {service.title}
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>

              {/* Sub-services */}
              <div className={idx % 2 !== 0 ? "md:order-1" : ""}>
                <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 shadow-sm">
                  <h3 className="font-semibold text-[#1a3a6b] mb-4">What&apos;s Included</h3>
                  <ul className="space-y-3">
                    {service.subServices.map((sub) => (
                      <li key={sub} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        <span className="text-sm text-gray-700">{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1a3a6b] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">Government fees are separate and passed through at cost. Our service fees cover PRO processing, tracking, and compliance management.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "1,500", period: "/month", desc: "For small businesses with 1-2 companies", features: ["Up to 2 companies", "10 employees", "Document management", "Expiry alerts", "Email support"], highlight: false },
              { name: "Professional", price: "3,500", period: "/month", desc: "For growing businesses managing multiple entities", features: ["Up to 10 companies", "50 employees", "Priority processing", "Dedicated PRO officer", "WhatsApp + phone support", "Invoice management"], highlight: true },
              { name: "Enterprise", price: "Custom", period: "", desc: "For large groups with complex requirements", features: ["Unlimited companies", "Unlimited employees", "API access", "Custom workflows", "24/7 priority support", "Dedicated account manager"], highlight: false },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.highlight ? "bg-[#1a3a6b] text-white ring-4 ring-[#1a3a6b]/20 scale-105" : "bg-white ring-1 ring-gray-200"}`}>
                <h3 className={`text-xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>{plan.desc}</p>
                <div className="mt-6 mb-8">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-[#1a3a6b]"}`}>AED {plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}>
                      <svg className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? "text-green-300" : "text-green-500"}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/contact" className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${plan.highlight ? "bg-white text-[#1a3a6b] hover:bg-gray-100" : "bg-[#1a3a6b] text-white hover:bg-[#15305a]"}`}>
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a3a6b] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Contact our team today to discuss your requirements and let us handle your PRO services efficiently.
          </p>
          <div className="mt-8 flex justify-center flex-wrap gap-4">
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
      </section>
    </>
  )
}
