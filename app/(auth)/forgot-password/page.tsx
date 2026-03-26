"use client"

import { useState } from "react"
import Link from "next/link"
import { forgotPasswordSchema } from "@/lib/validation/schemas"
import { YabsLogo } from "@/components/marketing/yabs-logo"
import { Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error) setError(data.error)
      }

      // Always show success to prevent email enumeration
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <YabsLogo variant="full" className="h-12 w-auto mx-auto" light />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-[#1a3a6b]" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter your email and we&apos;ll send you a reset link
          </p>

          {submitted ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-800">
                  If an account exists, a reset link has been sent.
                </p>
              </div>
              <Link
                href="/login"
                className="text-[#1a3a6b] font-semibold hover:underline text-sm"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-shadow"
                  placeholder="you@example.com"
                />
                {error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a6b] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#15305a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="text-[#1a3a6b] font-semibold hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} YABS Public Relations Management LLC
        </p>
      </div>
    </div>
  )
}
