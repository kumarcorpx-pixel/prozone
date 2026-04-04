import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { tokenStore } from "./token-store"
import { api } from "./api"

interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: string
  avatar_url: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    async function restore() {
      const savedUser = await tokenStore.getUser()
      const isLoggedIn = await tokenStore.isLoggedIn()
      if (savedUser && isLoggedIn) {
        setUser(savedUser)
        // Silently refresh token in background
        api.post("/api/auth/refresh").then(async (res) => {
          if (res.success && res.user) {
            setUser(res.user)
            await tokenStore.setUser(res.user)
          }
        }).catch(() => {})
      }
      setLoading(false)
    }
    restore()
  }, [])

  // Listen for forced logout (token expired)
  useEffect(() => {
    const handler = () => {
      setUser(null)
    }
    window.addEventListener("auth:logout", handler)
    return () => window.removeEventListener("auth:logout", handler)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    if (res.success && res.user) {
      setUser(res.user)
      return { success: true }
    }
    return { success: false, error: res.error || "Login failed" }
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
