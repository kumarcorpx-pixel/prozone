"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Phone } from "lucide-react"

export function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-[#ef4444] to-[#b91c1c] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Streamline Your PRO Operations?
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Join 500+ companies already using YABS
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 bg-white text-[#ef4444] rounded-full font-semibold hover:shadow-lg transition-shadow"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>

          <a
            href="tel:+971565204844"
            className="inline-flex items-center gap-2 mt-8 text-white/90 hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="text-lg font-semibold">+971 56 520 4844</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
