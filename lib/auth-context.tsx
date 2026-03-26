"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Profile, UserRole } from "./types"

interface AuthContextType {
  user: Profile | null
  isLoading: boolean
  isDemo: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_PROFILES: Record<string, Profile> = {
  "ahmed@company.ae": {
    id: "demo-client-001",
    email: "ahmed@company.ae",
    full_name: "Ahmed Al Mansoori",
    phone: "+971 50 123 4567",
    role: "client",
    avatar_url: null,
    company_id: "comp-001",
    is_active: true,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-06-01T10:30:00Z",
  },
  "admin@yabs.ae": {
    id: "demo-admin-001",
    email: "admin@yabs.ae",
    full_name: "Sarah Admin",
    phone: "+971 55 987 6543",
    role: "admin",
    avatar_url: null,
    company_id: null,
    is_active: true,
    created_at: "2024-01-01T08:00:00Z",
    updated_at: "2024-06-01T10:30:00Z",
  },
  "staff@yabs.ae": {
    id: "demo-staff-001",
    email: "staff@yabs.ae",
    full_name: "Mohammed PRO",
    phone: "+971 50 555 1234",
    role: "pro_staff",
    avatar_url: null,
    company_id: null,
    is_active: true,
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2024-06-01T10:30:00Z",
  },
}

function isDemoMode(): boolean {
  const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.DATABASE_URL
  return !dbUrl || dbUrl === ""
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isDemo = isDemoMode()

  useEffect(() => {
    async function checkAuth() {
      // Check localStorage first
      const saved = localStorage.getItem("prozone_user")
      if (saved) {
        try {
          setUser(JSON.parse(saved))
        } catch {}
      }

      // Also check demo role
      if (isDemo) {
        const savedRole = localStorage.getItem("prozone_demo_role")
        if (savedRole === "client") {
          setUser(DEMO_PROFILES["ahmed@company.ae"])
        } else if (savedRole === "admin") {
          setUser(DEMO_PROFILES["admin@yabs.ae"])
        } else if (savedRole === "pro_staff") {
          setUser(DEMO_PROFILES["staff@yabs.ae"])
        }
        setIsLoading(false)
        return
      }

      // Verify with server
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          localStorage.setItem("prozone_user", JSON.stringify(data.user))
        }
      } catch {}
      setIsLoading(false)
    }
    checkAuth()
  }, [isDemo])

  const login = useCallback(
    async (email: string, password: string) => {
      // Try API login first
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          localStorage.setItem("prozone_user", JSON.stringify(data.user))
          return
        }
        const err = await res.json()
        // If not a network/server issue, and we're not in demo mode, throw
        if (!isDemo) {
          throw new Error(err.error || "Login failed")
        }
      } catch (e: any) {
        if (!isDemo) throw e
      }

      // Fall back to demo mode if API fails
      if (isDemo) {
        let role: UserRole = "client"
        let profileKey = "ahmed@company.ae"
        if (email.includes("staff") || email.includes("pro")) {
          role = "pro_staff"
          profileKey = "staff@yabs.ae"
        } else if (email.includes("admin")) {
          role = "admin"
          profileKey = "admin@yabs.ae"
        }
        const profile = { ...DEMO_PROFILES[profileKey], email }
        localStorage.setItem("prozone_demo_role", role)
        document.cookie = `prozone_demo_role=${role}; path=/; max-age=86400`
        setUser(profile)
        return
      }
    },
    [isDemo]
  )

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (isDemo) {
        throw new Error("Sign up is not available in demo mode")
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, confirmPassword: password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Sign up failed")
      }
    },
    [isDemo]
  )

  const logout = useCallback(async () => {
    localStorage.removeItem("prozone_user")
    localStorage.removeItem("prozone_demo_role")
    document.cookie = "prozone_demo_role=; path=/; max-age=0"

    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}

    setUser(null)
    window.location.href = "/login"
  }, [])

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!isDemo) return
      const email = role === "admin" ? "admin@yabs.ae" : role === "pro_staff" ? "staff@yabs.ae" : "ahmed@company.ae"
      const profile = DEMO_PROFILES[email]
      localStorage.setItem("prozone_demo_role", role)
      document.cookie = `prozone_demo_role=${role}; path=/; max-age=86400`
      setUser(profile)
    },
    [isDemo]
  )

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isDemo, login, signup, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
