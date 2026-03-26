"use client"

import { useState } from "react"
import Link from "next/link"
import { Phone, Menu, X } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Our Solution" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1a3a6b]">YABS</span>
            <span className="hidden sm:inline text-xs text-gray-500">Public Relations Management</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#1a3a6b] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+971565204844" className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              +971 56 520 4844
            </a>
            <Link href="/login">
              <button className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors">
                Sign Up
              </button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t space-y-2">
              <a href="tel:+971565204844" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                +971 56 520 4844
              </a>
              <div className="flex gap-2 px-3">
                <Link href="/login" className="flex-1">
                  <button className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg">
                    Login
                  </button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <button className="w-full px-3 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
