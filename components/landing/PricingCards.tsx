"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    subtitle: "For small businesses",
    price: "AED 1,500",
    period: "/mo",
    popular: false,
    features: [
      "Up to 5 employees",
      "Trade license renewal",
      "Basic document management",
      "Email support",
      "Monthly reports",
    ],
    cta: "Get Started",
    ctaLink: "/signup",
  },
  {
    name: "Professional",
    subtitle: "For growing businesses",
    price: "AED 3,500",
    period: "/mo",
    popular: true,
    features: [
      "Up to 25 employees",
      "All visa services",
      "Full document management",
      "Client portal access",
      "Priority support",
      "Dedicated PRO officer",
    ],
    cta: "Get Started",
    ctaLink: "/signup",
  },
  {
    name: "Enterprise",
    subtitle: "For large organizations",
    price: "Custom",
    period: " Pricing",
    popular: false,
    features: [
      "Unlimited employees",
      "All services included",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom reporting",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    ctaLink: "/contact",
  },
]

export function PricingCards() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-[#ef4444] font-semibold">
            Pricing
          </p>
          <h2 className="text-4xl font-bold text-[#0f1d3a] mt-2">
            Monthly PRO Service Packages
          </h2>
          <p className="mt-4 text-[#64748b] max-w-2xl mx-auto">
            Choose a package that fits your business needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "border-2 border-[#ef4444] scale-105 shadow-xl"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#ef4444] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0f1d3a]">{plan.name}</h3>
                <p className="text-sm text-[#64748b] mt-1">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-[#0f1d3a]">{plan.price}</span>
                <span className="text-[#64748b]">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-[#10b981] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.ctaLink}>
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                      : "border-2 border-gray-300 text-[#0f1d3a] hover:border-[#ef4444] hover:text-[#ef4444]"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
