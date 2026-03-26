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
}

function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !url || url === "your_supabase_url_here"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isDemo = isDemoMode()

  useEffect(() => {
    if (isDemo) {
      const savedRole = localStorage.getItem("prozone_demo_role")
      if (savedRole === "client") {
        setUser(DEMO_PROFILES["ahmed@company.ae"])
      } else if (savedRole === "admin") {
        setUser(DEMO_PROFILES["admin@yabs.ae"])
      }
      setIsLoading(false)
      return
    }

    // Real Supabase auth
    let isMounted = true

    async function initAuth() {
      try {
        const { createClient } = await import("./supabase/client")
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user && isMounted) {
          const { getProfile } = await import("./supabase/api")
          const profile = await getProfile(session.user.id)
          if (isMounted) setUser(profile)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session?.user && isMounted) {
              const { getProfile } = await import("./supabase/api")
              const profile = await getProfile(session.user.id)
              if (isMounted) setUser(profile)
            } else if (isMounted) {
              setUser(null)
            }
          }
        )

        if (isMounted) setIsLoading(false)

        return () => {
          subscription.unsubscribe()
        }
      } catch {
        if (isMounted) setIsLoading(false)
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [isDemo])

  const login = useCallback(
    async (email: string, password: string) => {
      if (isDemo) {
        const profile = DEMO_PROFILES[email]
        if (!profile) throw new Error("Invalid demo credentials. Use ahmed@company.ae or admin@yabs.ae")
        const role = profile.role
        localStorage.setItem("prozone_demo_role", role)
        document.cookie = `prozone_demo_role=${role}; path=/; max-age=86400`
        setUser(profile)
        return
      }

      const { signIn, getProfile } = await import("./supabase/api")
      const data = await signIn(email, password)
      if (data.user) {
        const profile = await getProfile(data.user.id)
        setUser(profile)
      }
    },
    [isDemo]
  )

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (isDemo) {
        throw new Error("Sign up is not available in demo mode")
      }

      const { signUp } = await import("./supabase/api")
      await signUp(email, password, fullName)
    },
    [isDemo]
  )

  const logout = useCallback(async () => {
    if (isDemo) {
      localStorage.removeItem("prozone_demo_role")
      document.cookie = "prozone_demo_role=; path=/; max-age=0"
      setUser(null)
      return
    }

    const { signOut } = await import("./supabase/api")
    await signOut()
    setUser(null)
  }, [isDemo])

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!isDemo) return
      const email = role === "admin" ? "admin@yabs.ae" : "ahmed@company.ae"
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
