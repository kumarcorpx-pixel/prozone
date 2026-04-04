import { tokenStore } from "./token-store"

const API_BASE = "https://corporatepro.cloud"
const REQUEST_TIMEOUT = 15000 // 15 seconds

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

function withTimeout(promise: Promise<Response>, ms: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timed out")), ms)
    promise.then(
      (res) => { clearTimeout(timer); resolve(res) },
      (err) => { clearTimeout(timer); reject(err) }
    )
  })
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
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const token = await tokenStore.getToken()
        if (!token) return null

        const res = await withTimeout(
          fetch(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          REQUEST_TIMEOUT
        )

        if (!res.ok) return null

        const data = await res.json()
        if (data.success && data.token) {
          await tokenStore.setToken(data.token)
          const user = data.user || data.data?.user
          if (user) await tokenStore.setUser(user)
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
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders()
    const url = `${API_BASE}${path}`

    try {
      let res = await withTimeout(
        fetch(url, {
          ...options,
          headers: { ...headers, ...(options.headers as Record<string, string>) },
        }),
        REQUEST_TIMEOUT
      )

      // Token expired — try refresh once
      if (res.status === 401) {
        const newToken = await this.refreshToken()
        if (newToken) {
          res = await withTimeout(
            fetch(url, {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`,
                ...(options.headers as Record<string, string>),
              },
            }),
            REQUEST_TIMEOUT
          )
        } else {
          await tokenStore.clear()
          window.dispatchEvent(new Event("auth:logout"))
          return { success: false, error: "Session expired. Please login again." }
        }
      }

      // Server error — retry once
      if (res.status >= 500 && retryCount < 1) {
        await new Promise((r) => setTimeout(r, 1000))
        return this.request<T>(path, options, retryCount + 1)
      }

      const data = await res.json()
      return data
    } catch (err: any) {
      // Network error — retry once
      if (retryCount < 1 && err?.message !== "Request timed out") {
        await new Promise((r) => setTimeout(r, 1000))
        return this.request<T>(path, options, retryCount + 1)
      }
      return {
        success: false,
        error: err?.message === "Request timed out"
          ? "Request timed out. Please try again."
          : "Network error. Check your connection.",
      }
    }
  }

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

  async login(email: string, password: string) {
    try {
      const res = await withTimeout(
        fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
        REQUEST_TIMEOUT
      )
      const data = await res.json()
      if (data.success && data.token) {
        await tokenStore.setToken(data.token)
        await tokenStore.setUser(data.user)
      }
      return data
    } catch (err: any) {
      return {
        success: false,
        error: err?.message === "Request timed out"
          ? "Server not responding. Try again."
          : "Cannot connect to server.",
      }
    }
  }

  async logout() {
    try {
      await this.post("/api/auth/logout")
    } catch {}
    await tokenStore.clear()
  }
}

export const api = new ApiClient()
