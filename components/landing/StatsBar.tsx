"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Briefcase, FileText, LayoutGrid, Headphones } from "lucide-react"

const stats = [
  { value: 500, suffix: "+", label: "Clients Served", icon: Briefcase },
  { value: 5000, suffix: "+", label: "Transactions Processed", icon: FileText },
  { value: 15, suffix: "+", label: "Services Offered", icon: LayoutGrid },
  { value: 0, suffix: "", label: "Customer Support", icon: Headphones, display: "24/7" },
]

function CountUp({ target, suffix, display }: { target: number; suffix: string; display?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView || display) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target, display])

  if (display) {
    return <span ref={ref}>{display}</span>
  }

  return (
    <span ref={ref}>
      {inView ? count.toLocaleString() : "0"}
      {suffix}
    </span>
  )
}

export function StatsBar() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center relative"
            >
              <stat.icon className="h-6 w-6 text-[#d4a843] mx-auto mb-3" />
              <div className="text-4xl font-bold text-[#0f1d3a]">
                <CountUp target={stat.value} suffix={stat.suffix} display={stat.display} />
              </div>
              <div className="w-8 h-0.5 bg-[#d4a843] mx-auto mt-2 mb-2" />
              <div className="text-sm text-[#64748b]">{stat.label}</div>
              {i < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gray-200" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
