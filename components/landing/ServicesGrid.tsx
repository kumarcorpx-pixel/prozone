"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText, Users, Building2, Stamp, CreditCard, FileCheck, ArrowRight,
} from "lucide-react"

const services = [
  {
    icon: FileText,
    title: "Trade License",
    desc: "New registration & annual renewals for Abu Dhabi, Dubai & Sharjah mainland and free zones.",
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: Users,
    title: "Visa Services",
    desc: "Employment, family, dependent & mission visa processing with real-time tracking.",
    gradient: "from-green-500 to-green-600",
    bgLight: "bg-green-50",
  },
  {
    icon: Building2,
    title: "Business Setup",
    desc: "Company formation in mainland & free zones across UAE with full compliance.",
    gradient: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
  },
  {
    icon: Stamp,
    title: "Document Services",
    desc: "Attestation, legal translation, Emirates ID processing & notarization services.",
    gradient: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50",
  },
  {
    icon: CreditCard,
    title: "Accounting & VAT",
    desc: "Bookkeeping, VAT registration, tax filing & comprehensive financial management.",
    gradient: "from-teal-500 to-teal-600",
    bgLight: "bg-teal-50",
  },
  {
    icon: FileCheck,
    title: "ADNOC & ICV",
    desc: "ADNOC vendor registration, ICV certification & compliance advisory services.",
    gradient: "from-[#1a3a6b] to-[#0f2340]",
    bgLight: "bg-blue-50",
  },
]

export function ServicesGrid() {
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
            Our Services
          </p>
          <h2 className="text-4xl font-bold text-[#0f1d3a] mt-2">
            PRO Services Across UAE
          </h2>
          <p className="mt-4 text-[#64748b] max-w-2xl mx-auto">
            Comprehensive range of corporate and individual PRO services in Abu Dhabi,
            Dubai &amp; Sharjah
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-[#ef4444]/20 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4`}
              >
                <service.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f1d3a] mt-4">{service.title}</h3>
              <p className="text-[#64748b] mt-2 text-sm leading-relaxed">{service.desc}</p>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-[#ef4444] text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/services">
            <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border-2 border-gray-300 rounded-full hover:border-[#ef4444] hover:text-[#ef4444] transition-colors">
              View All Services <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
