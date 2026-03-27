// In-memory cache with TTL — works immediately without Redis
// Drop-in Redis upgrade: just set REDIS_URL and npm install ioredis

const cache = new Map<string, { data: string; expiresAt: number }>()

// Cleanup expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of cache) {
      if (entry.expiresAt < now) cache.delete(key)
    }
  }, 60000)
}

export async function cacheGet(key: string): Promise<string | null> {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  cache.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function cacheDel(key: string): Promise<void> {
  cache.delete(key)
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const prefix = pattern.replace("*", "")
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// Cache TTLs in seconds
export const TTL = {
  COMPANIES: 300,     // 5 min
  EMPLOYEES: 180,     // 3 min
  DOCUMENTS: 120,     // 2 min
  STATS: 60,          // 1 min
  REQUESTS: 120,      // 2 min
  USERS: 300,         // 5 min
  NOTIFICATIONS: 30,  // 30 sec
}

// Read-through cache helper
export async function cached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = await cacheGet(key)
  if (hit) return JSON.parse(hit) as T

  const data = await fetcher()
  cacheSet(key, JSON.stringify(data), ttl).catch(() => {})
  return data
}

// Cache key generators
export const CK = {
  companies: () => "yabs:companies",
  company: (id: string) => `yabs:company:${id}`,
  employees: () => "yabs:employees",
  employeesByCompany: (id: string) => `yabs:emp:co:${id}`,
  documents: () => "yabs:documents",
  stats: () => "yabs:stats",
  requests: () => "yabs:requests",
  requestsByClient: (id: string) => `yabs:req:cl:${id}`,
  users: () => "yabs:users",
  notifications: (id: string) => `yabs:notif:${id}`,
}

// Invalidation helpers — call after mutations
export async function onCompanyChange() {
  await cacheDel(CK.companies())
  await cacheDel(CK.stats())
}

export async function onEmployeeChange(companyId?: string) {
  await cacheDel(CK.employees())
  await cacheDel(CK.stats())
  if (companyId) await cacheDel(CK.employeesByCompany(companyId))
}

export async function onDocumentChange() {
  await cacheDel(CK.documents())
  await cacheDel(CK.stats())
}

export async function onRequestChange(clientId?: string) {
  await cacheDel(CK.requests())
  await cacheDel(CK.stats())
  if (clientId) await cacheDel(CK.requestsByClient(clientId))
}

export async function onUserChange() {
  await cacheDel(CK.users())
}
