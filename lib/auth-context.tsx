"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Profile, UserRole } from "./types"

interface AuthContextType {
  user: Profile | null
  isLoading: boolean
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
  // Demo mode if no DATABASE_URL (checked server-side)
  // On client, we always try the API first, fall back to demo
  return false // Always try real auth first
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // Quick load from localStorage
      const saved = localStorage.getItem("prozone_user")
      if (saved) {
        try { setUser(JSON.parse(saved)) } catch {}
      }

      // Check demo mode
      const demoRole = localStorage.getItem("prozone_demo_role")
      if (demoRole) {
        const profileKey = demoRole === "admin" ? "admin@yabs.ae" : demoRole === "pro_staff" ? "staff@yabs.ae" : "ahmed@company.ae"
        setUser(DEMO_PROFILES[profileKey])
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
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Try real API login
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
      throw new Error(err.error || "Login failed")
    } catch (e: any) {
      // Fallback to demo mode for demo emails
      const demoEmails = Object.keys(DEMO_PROFILES)
      if (demoEmails.includes(email) || email.includes("demo")) {
        const profileKey = email.includes("admin") ? "admin@yabs.ae" : email.includes("staff") ? "staff@yabs.ae" : "ahmed@company.ae"
        const role = email.includes("admin") ? "admin" : email.includes("staff") ? "pro_staff" : "client"
        const profile = { ...DEMO_PROFILES[profileKey], email }
        localStorage.setItem("prozone_demo_role", role)
        document.cookie = `prozone_demo_role=${role}; path=/; max-age=86400`
        setUser(profile)
        return
      }
      throw e
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, confirmPassword: password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Sign up failed")
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}
    localStorage.removeItem("prozone_user")
    localStorage.removeItem("prozone_demo_role")
    document.cookie = "prozone_demo_role=; path=/; max-age=0"
    document.cookie = "auth_token=; path=/; max-age=0"
    setUser(null)
    window.location.href = "/login"
  }, [])

  const switchRole = useCallback((role: UserRole) => {
    const email = role === "admin" ? "admin@yabs.ae" : role === "pro_staff" ? "staff@yabs.ae" : "ahmed@company.ae"
    const profile = DEMO_PROFILES[email]
    localStorage.setItem("prozone_demo_role", role)
    document.cookie = `prozone_demo_role=${role}; path=/; max-age=86400`
    setUser(profile)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, switchRole }}
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
