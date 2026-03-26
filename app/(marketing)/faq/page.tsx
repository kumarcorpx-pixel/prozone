"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ArrowRight } from "lucide-react"

const faqs = [
  {
    question: "What are PRO services?",
    answer:
      "PRO (Public Relations Officer) services handle all government-related documentation and transactions on behalf of businesses and individuals. This includes trade license processing, visa applications, document attestation, Emirates ID services, and liaising with government authorities such as the Ministry of Human Resources, Immigration, and the Department of Economic Development.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "We operate across Abu Dhabi, Dubai, and Sharjah, providing comprehensive PRO services in all three emirates. Our team is well-versed with the specific requirements and procedures of government departments in each emirate, ensuring smooth processing regardless of your location.",
  },
  {
    question: "How long does visa processing take?",
    answer:
      "Employment visa processing typically takes 7-10 working days from the date of submission, depending on the type of visa and the relevant authority. Family/dependent visas may take 10-15 working days. Mission visas can be processed within 3-5 working days. Timelines may vary based on government processing speeds and document completeness.",
  },
  {
    question: "What documents do I need for trade license renewal?",
    answer:
      "For trade license renewal, you typically need: a copy of your current trade license, tenancy contract (Ejari), Memorandum of Association (MOA), passport copies of all partners/shareholders, Emirates ID copies, and establishment card. Additional documents may be required depending on your business activity and emirate. Our team will guide you through the exact requirements.",
  },
  {
    question: "Do you handle free zone company setup?",
    answer:
      "Yes, we assist with company formation in all major UAE free zones including JAFZA, DAFZA, DMCC, ADGM, Sharjah Media City, and many more. Our services cover the entire setup process from initial consultation and activity selection to license issuance and visa processing. We help you choose the right free zone based on your business activity and requirements.",
  },
  {
    question: "What is ICV certification?",
    answer:
      "In-Country Value (ICV) certification measures the amount of value retained within the UAE economy by a company through its business activities. It is mandatory for companies wishing to participate in government and semi-government tenders, particularly with ADNOC. The ICV certificate is issued annually by approved certifying bodies and considers factors like local employment, local procurement, and investment in the UAE.",
  },
  {
    question: "How can I track my application?",
    answer:
      "Through our cloud-based platform, you can track the real-time status of all your applications and transactions. Simply log in to your client dashboard to view progress updates, pending requirements, and estimated completion dates. You will also receive email and SMS notifications whenever there is an update on your tasks.",
  },
  {
    question: "What are your payment options?",
    answer:
      "We accept multiple payment methods for your convenience: bank transfer, credit/debit cards, cash payments at our office, and online payment through our secure platform. For corporate clients on monthly or yearly packages, we can arrange invoicing with flexible payment terms.",
  },
  {
    question: "Do you offer monthly PRO packages?",
    answer:
      "Yes, we offer both monthly and yearly PRO service packages tailored to different business sizes and needs. Our packages cover routine government transactions such as visa renewals, trade license renewals, document clearing, and more. Packages provide cost savings compared to individual service pricing and include priority processing.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! You can contact us via phone, email, or through our website contact form. Alternatively, sign up on our platform to create your account. Our team will schedule a consultation to understand your requirements and recommend the best service plan for your business. We handle everything from there.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Frequently Asked <span className="text-red-400">Questions</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our PRO services in the UAE
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl ring-1 ring-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#1a3a6b] pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                      openIndex === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a3a6b]">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Our team is here to help. Get in touch and we will be happy to assist you.
          </p>
          <div className="mt-8 flex justify-center flex-wrap gap-4">
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Contact Us <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/services">
              <button className="px-8 py-3 text-sm font-semibold border-2 border-[#1a3a6b] text-[#1a3a6b] rounded-lg hover:bg-[#1a3a6b] hover:text-white transition-colors">
                View Services
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
