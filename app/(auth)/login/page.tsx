"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { YabsLogo } from "@/components/marketing/yabs-logo"
import { Lock } from "lucide-react"

function LoginExpiredToast() {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Your session has expired. Please sign in again.")
    }
  }, [searchParams])
  return null
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const loggedInUser: any = await login(email, password)
      const role = loggedInUser?.role
      if (role === "admin") {
        router.push("/admin")
      } else if (role === "pro_staff") {
        router.push("/staff")
      } else {
        router.push("/dashboard")
      }
      toast.success("Welcome back!")
    } catch (err: any) {
      toast.error(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <Suspense><LoginExpiredToast /></Suspense>
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative flex flex-col justify-center px-12 xl:px-16">
          <YabsLogo variant="full" className="h-14 w-auto mb-8" light />
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            One Platform for All Your<br />
            <span className="text-red-400">PRO Services</span>
          </h2>
          <p className="mt-4 text-gray-300 text-lg max-w-md">
            Track, monitor and manage all your government transactions in Abu Dhabi, Dubai & Sharjah.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6">
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-gray-400">Clients Served</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">5,000+</div>
              <div className="text-sm text-gray-400">Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">15+</div>
              <div className="text-sm text-gray-400">Services</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/">
              <YabsLogo variant="full" className="h-12 w-auto mx-auto" />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-[#1a3a6b]" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Sign in to your YABS account
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-[#1a3a6b] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] focus:border-transparent transition-shadow"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a6b] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#15305a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#1a3a6b] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} YABS Public Relations Management LLC
          </p>
        </div>
      </div>
    </div>
  )
}
