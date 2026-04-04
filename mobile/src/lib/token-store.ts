// Secure token storage using Capacitor Preferences (encrypted on iOS)
// Falls back to localStorage for web/dev

let Preferences: any = null

async function getPreferences() {
  if (Preferences) return Preferences
  try {
    const mod = await import("@capacitor/preferences")
    Preferences = mod.Preferences
    return Preferences
  } catch {
    // Fallback for web dev
    return null
  }
}

export const tokenStore = {
  async getToken(): Promise<string | null> {
    const prefs = await getPreferences()
    if (prefs) {
      const { value } = await prefs.get({ key: "auth_token" })
      return value
    }
    return localStorage.getItem("auth_token")
  },

  async setToken(token: string): Promise<void> {
    const prefs = await getPreferences()
    if (prefs) {
      await prefs.set({ key: "auth_token", value: token })
    } else {
      localStorage.setItem("auth_token", token)
    }
  },

  async getUser(): Promise<any | null> {
    const prefs = await getPreferences()
    let raw: string | null = null
    if (prefs) {
      const { value } = await prefs.get({ key: "auth_user" })
      raw = value
    } else {
      raw = localStorage.getItem("auth_user")
    }
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  async setUser(user: any): Promise<void> {
    const raw = JSON.stringify(user)
    const prefs = await getPreferences()
    if (prefs) {
      await prefs.set({ key: "auth_user", value: raw })
    } else {
      localStorage.setItem("auth_user", raw)
    }
  },

  async clear(): Promise<void> {
    const prefs = await getPreferences()
    if (prefs) {
      await prefs.remove({ key: "auth_token" })
      await prefs.remove({ key: "auth_user" })
    } else {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    }
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken()
    return !!token
  },
}
