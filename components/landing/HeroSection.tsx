"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Play, Building2, Users, FileText, ShieldCheck } from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
}

const mockTableRows = [
  { name: "Gulf Trading LLC", status: "Active", statusColor: "bg-green-400" },
  { name: "Horizon Properties", status: "Pending", statusColor: "bg-yellow-400" },
  { name: "Tech Innovations", status: "Active", statusColor: "bg-green-400" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#0f1d3a] text-white overflow-hidden">
      {/* Dotted pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side */}
          <div>
            <motion.div
              custom={0}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4a843]/40 bg-[#d4a843]/10 text-sm mb-8"
            >
              <span>&#x1F1E6;&#x1F1EA;</span>
              <span className="text-[#d4a843] font-medium">#1 PRO Services Platform in UAE</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              One Platform for All Your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #ef4444, #d4a843)",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 4s ease infinite",
                }}
              >
                PRO Services
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-lg text-gray-300 max-w-lg mt-6"
            >
              Track, monitor and manage all your government transactions across Abu Dhabi,
              Dubai &amp; Sharjah — hassle-free with our cloud-based platform.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-full shadow-lg shadow-red-500/25 transition-shadow hover:shadow-xl hover:shadow-red-500/30"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold border border-white/30 text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <Play className="h-4 w-4" /> Watch Demo
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-12 flex items-center gap-3 text-sm text-gray-400"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 border-2 border-[#0f1d3a] flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {["FA", "MH", "SJ", "AK"][i - 1]}
                  </div>
                ))}
              </div>
              <span>Trusted by <strong className="text-white">500+</strong> companies</span>
            </motion.div>
          </div>

          {/* Right Side - Floating Dashboard Mock */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            <div
              className="relative"
              style={{
                transform: "perspective(1000px) rotateY(-5deg) rotateX(5deg)",
                animation: "float 6s ease-in-out infinite",
              }}
            >
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-800">
                {/* Top Bar */}
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded bg-[#1a3a6b] flex items-center justify-center text-[8px] font-bold text-white">
                    Y
                  </div>
                  <span className="text-sm font-semibold text-[#1a3a6b]">Dashboard</span>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  </div>
                </div>

                {/* Stat Cards Row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: Building2, label: "Companies", value: "21", color: "bg-blue-50 text-blue-600" },
                    { icon: Users, label: "Employees", value: "93", color: "bg-green-50 text-green-600" },
                    { icon: FileText, label: "Documents", value: "12", color: "bg-orange-50 text-orange-600" },
                    { icon: ShieldCheck, label: "Compliance", value: "85%", color: "bg-purple-50 text-purple-600" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl p-3 bg-gray-50">
                      <stat.icon className={`h-4 w-4 mb-1.5 ${stat.color.split(" ")[1]}`} />
                      <div className="text-lg font-bold text-[#0f1d3a]">{stat.value}</div>
                      <div className="text-[10px] text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini Table */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider grid grid-cols-3">
                    <span>Company</span>
                    <span>Emirate</span>
                    <span className="text-right">Status</span>
                  </div>
                  {mockTableRows.map((row) => (
                    <div key={row.name} className="px-3 py-2.5 border-t border-gray-50 grid grid-cols-3 items-center text-xs">
                      <span className="font-medium text-gray-700">{row.name}</span>
                      <span className="text-gray-500">Dubai</span>
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${row.status === "Active" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.statusColor}`} />
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Notification Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 text-xs"
              style={{ animation: "float 5s ease-in-out 1s infinite" }}
            >
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm">
                &#x2705;
              </div>
              <div>
                <div className="font-semibold text-gray-800">Visa Approved</div>
                <div className="text-gray-400 text-[10px]">Just now</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-2 text-xs"
              style={{ animation: "float 5s ease-in-out 2s infinite" }}
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">
                &#x1F4C4;
              </div>
              <div>
                <div className="font-semibold text-gray-800">Trade License Renewed</div>
                <div className="text-gray-400 text-[10px]">2 min ago</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}
