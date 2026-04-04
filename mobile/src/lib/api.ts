import { tokenStore } from "./token-store"

const API_BASE = "https://corporatepro.cloud"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiClient {
  private refreshPromise: Promise<string | null> | null = null

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await tokenStore.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  private async refreshToken(): Promise<string | null> {
    // Deduplicate concurrent refresh calls
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const token = await tokenStore.getToken()
        if (!token) return null

        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) return null

        const data = await res.json()
        if (data.success && data.token) {
          await tokenStore.setToken(data.token)
          await tokenStore.setUser(data.user)
          return data.token
        }
        return null
      } catch {
        return null
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders()
    const url = `${API_BASE}${path}`

    try {
      let res = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string>) },
      })

      // Token expired — try refresh
      if (res.status === 401) {
        const newToken = await this.refreshToken()
        if (newToken) {
          res = await fetch(url, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
              ...(options.headers as Record<string, string>),
            },
          })
        } else {
          await tokenStore.clear()
          window.dispatchEvent(new Event("auth:logout"))
          return { success: false, error: "Session expired. Please login again." }
        }
      }

      const data = await res.json()
      return data
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Network error. Check your connection.",
      }
    }
  }

  // Convenience methods
  get<T = any>(path: string) {
    return this.request<T>(path, { method: "GET" })
  }

  post<T = any>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T = any>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T = any>(path: string) {
    return this.request<T>(path, { method: "DELETE" })
  }

  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.success && data.token) {
      await tokenStore.setToken(data.token)
      await tokenStore.setUser(data.user)
    }
    return data
  }

  async logout() {
    try {
      await this.post("/api/auth/logout")
    } catch {}
    await tokenStore.clear()
  }
}

export const api = new ApiClient()
