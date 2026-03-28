"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Phone, Menu, X } from "lucide-react"
import { YabsLogo } from "./yabs-logo"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Our Solution" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-white border-b"
      }`}
    >
      {/* Gold gradient top border */}
      <div className="h-1 w-full bg-gradient-to-r from-[#d4a843] via-[#ef4444] to-[#d4a843]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <YabsLogo variant="full" className="h-10 w-auto hidden sm:block" />
            <YabsLogo variant="compact" className="h-8 w-auto sm:hidden" />
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
              <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg hover:bg-[#15305a] transition-colors">
                Sign Up
              </button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <div
        className={`md:hidden fixed inset-0 top-[calc(4rem+4px)] z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
        <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t space-y-3">
              <a href="tel:+971565204844" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                +971 56 520 4844
              </a>
              <div className="flex gap-2 px-4">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-3 py-2.5 text-sm font-medium border border-gray-300 rounded-lg">
                    Login
                  </button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-3 py-2.5 text-sm font-medium text-white bg-[#1a3a6b] rounded-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
