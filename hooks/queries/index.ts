import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...opts?.headers }, ...opts })
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login?expired=true"
      throw new Error("Unauthorized")
    }
    const err = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(err.error || "Request failed")
  }
  return res.json()
}

// Companies
export function useCompanies() {
  return useQuery({ queryKey: queryKeys.companies.all, queryFn: () => api<any[]>("/api/data/companies"), staleTime: 5 * 60 * 1000 })
}
export function useCompany(id: string) {
  return useQuery({ queryKey: queryKeys.companies.detail(id), queryFn: () => api<any>(`/api/data/companies/${id}`), enabled: !!id })
}

// Employees
export function useEmployees(companyId?: string) {
  const url = companyId ? `/api/data/employees?companyId=${companyId}` : "/api/data/employees"
  return useQuery({
    queryKey: companyId ? queryKeys.employees.byCompany(companyId) : queryKeys.employees.all,
    queryFn: () => api<any[]>(url),
    staleTime: 3 * 60 * 1000,
  })
}

// Documents
export function useDocuments(companyId?: string) {
  const url = companyId ? `/api/data/documents?companyId=${companyId}` : "/api/data/documents"
  return useQuery({
    queryKey: companyId ? queryKeys.documents.byCompany(companyId) : queryKeys.documents.all,
    queryFn: () => api<any[]>(url),
    staleTime: 2 * 60 * 1000,
  })
}

// Requests
export function useRequests() {
  return useQuery({ queryKey: queryKeys.requests.all, queryFn: () => api<any[]>("/api/data/requests"), staleTime: 2 * 60 * 1000 })
}
export function useRequest(id: string) {
  return useQuery({ queryKey: queryKeys.requests.detail(id), queryFn: () => api<any>(`/api/data/requests/${id}`), enabled: !!id })
}

// Stats
export function useStats() {
  return useQuery({ queryKey: queryKeys.stats.dashboard, queryFn: () => api<any>("/api/data/stats"), staleTime: 60 * 1000 })
}

// Users (admin)
export function useUsers(role?: string) {
  const url = role ? `/api/data/users?role=${role}` : "/api/data/users"
  return useQuery({ queryKey: queryKeys.users.all, queryFn: () => api<any[]>(url), staleTime: 5 * 60 * 1000 })
}

// Notifications (polls every 60s)
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => api<{ notifications: any[] }>("/api/notifications"),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// Invoices
export function useInvoices(params?: { status?: string; search?: string }) {
  const sp = new URLSearchParams()
  if (params?.status && params.status !== "all") sp.set("status", params.status)
  if (params?.search) sp.set("search", params.search)
  const url = `/api/invoices${sp.toString() ? "?" + sp : ""}`
  return useQuery({ queryKey: queryKeys.invoices.all, queryFn: () => api<any>(url), staleTime: 3 * 60 * 1000 })
}

// Admin stats
export function useAdminDashboard() {
  return useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => api<any>("/api/admin/dashboard"), staleTime: 60 * 1000 })
}

// Integrations
export function useIntegrations() {
  return useQuery({ queryKey: queryKeys.integrations.all, queryFn: () => api<any>("/api/admin/integrations"), staleTime: 5 * 60 * 1000 })
}
