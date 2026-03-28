import Link from "next/link"
import { ArrowRight, Shield, Globe, Clock } from "lucide-react"
import { YabsLogo } from "@/components/marketing/yabs-logo"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#1a3a6b] via-[#15305a] to-[#0d2847] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

        <div className="relative text-center px-6 py-16 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl px-8 py-4 shadow-lg">
              <img src="/images/yabs-logo.gif" alt="YABS PRO Services" className="h-20 w-auto" />
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Corporate PRO Services
          </h1>
          <p className="mt-4 text-lg text-blue-200 max-w-lg mx-auto">
            Manage all your government transactions, documents, and compliance in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a3a6b] font-semibold rounded-xl text-base transition-colors shadow-lg shadow-[#c9a96e]/20">
              Sign In <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-base hover:bg-white hover:text-[#1a3a6b] transition-colors">
              Create Account
            </Link>
          </div>

          {/* Features pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {[
              { icon: Shield, text: "Secure & Private" },
              { icon: Globe, text: "Dubai · Abu Dhabi · Sharjah" },
              { icon: Clock, text: "Real-time Tracking" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-blue-200 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2">
                <item.icon className="h-4 w-4 text-[#c9a96e]" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-[#0d2847] border-t border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-blue-300">
          <p>&copy; {new Date().getFullYear()} YABS Public Relations Management LLC</p>
          <div className="flex items-center gap-4">
            <a href="tel:+971565204844" className="hover:text-white transition-colors">+971 56 520 4844</a>
            <span className="text-blue-500">·</span>
            <a href="mailto:info@yabs.ae" className="hover:text-white transition-colors">info@yabs.ae</a>
            <span className="text-blue-500">·</span>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
