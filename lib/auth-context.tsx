"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Profile } from "./types"

interface AuthContextType {
  user: Profile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<any>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

      // Clear any leftover demo data
      localStorage.removeItem("prozone_demo_role")
      localStorage.removeItem("prozone_demo_store")
      document.cookie = "prozone_demo_role=; path=/; max-age=0"

      // Verify with server
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          localStorage.setItem("prozone_user", JSON.stringify(data.user))
        } else {
          localStorage.removeItem("prozone_user")
          setUser(null)
        }
      } catch {}
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Session heartbeat
  useEffect(() => {
    if (!user) return
    const heartbeat = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          localStorage.removeItem("prozone_user")
          setUser(null)
          window.location.href = "/login?expired=true"
        }
      } catch {}
    }, 180000)
    return () => clearInterval(heartbeat)
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Login failed")
    }
    const data = await res.json()
    setUser(data.user)
    localStorage.setItem("prozone_user", JSON.stringify(data.user))
    return data.user
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
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    localStorage.removeItem("prozone_user")
    localStorage.removeItem("prozone_demo_role")
    localStorage.removeItem("prozone_demo_store")
    document.cookie = "prozone_demo_role=; path=/; max-age=0"
    document.cookie = "auth_token=; path=/; max-age=0"
    setUser(null)
    window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
