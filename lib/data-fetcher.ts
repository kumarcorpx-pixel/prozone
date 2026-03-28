"use client"

export async function fetchCompanies() {
  try {
    const res = await fetch("/api/data/companies")
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export async function fetchEmployees(companyId?: string) {
  try {
    const url = companyId ? `/api/data/employees?companyId=${companyId}` : "/api/data/employees"
    const res = await fetch(url)
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export async function fetchDocuments(companyId?: string) {
  try {
    const url = companyId ? `/api/data/documents?companyId=${companyId}` : "/api/data/documents"
    const res = await fetch(url)
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export async function fetchRequests(filters?: Record<string, string>) {
  try {
    const params = new URLSearchParams(filters || {})
    const res = await fetch(`/api/data/requests?${params}`)
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export async function fetchCompany(id: string) {
  try {
    const res = await fetch(`/api/data/companies/${id}`)
    if (res.ok) return await res.json()
  } catch {}
  return null
}

export async function fetchProfiles() {
  try {
    const res = await fetch("/api/data/users")
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export async function fetchServices() {
  try {
    const res = await fetch("/api/data/services")
    if (res.ok) return await res.json()
  } catch {}
  return []
}

export async function fetchAdminStats() {
  try {
    const res = await fetch("/api/data/stats")
    if (res.ok) return await res.json()
  } catch {}
  return { companies: 0, employees: 0, requests: 0, documents: 0, isReal: false }
}
