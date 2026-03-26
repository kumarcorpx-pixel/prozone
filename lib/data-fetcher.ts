"use client"

export async function fetchCompanies() {
  try {
    const res = await fetch("/api/data/companies")
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  const { demoCompanies } = await import("./company-data")
  return demoCompanies
}

export async function fetchEmployees(companyId?: string) {
  try {
    const url = companyId ? `/api/data/employees?companyId=${companyId}` : "/api/data/employees"
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  const { demoEmployees } = await import("./company-data")
  return companyId ? demoEmployees.filter(e => e.company_id === companyId) : demoEmployees
}

export async function fetchDocuments(companyId?: string) {
  try {
    const url = companyId ? `/api/data/documents?companyId=${companyId}` : "/api/data/documents"
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  const { companyDocuments } = await import("./company-data")
  return companyId ? companyDocuments.filter(d => d.company_id === companyId) : companyDocuments
}

export async function fetchRequests(filters?: Record<string, string>) {
  try {
    const params = new URLSearchParams(filters || {})
    const res = await fetch(`/api/data/requests?${params}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  const { demoRequests } = await import("./demo-data")
  return demoRequests
}

export async function fetchCompany(id: string) {
  try {
    const res = await fetch(`/api/data/companies/${id}`)
    if (res.ok) return await res.json()
  } catch {}
  const { demoCompanies } = await import("./company-data")
  return demoCompanies.find(c => c.id === id) || null
}

export async function fetchProfiles() {
  try {
    const res = await fetch("/api/data/users")
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  const { demoProfiles } = await import("./demo-data")
  return demoProfiles
}

export async function fetchServices() {
  try {
    const res = await fetch("/api/data/services")
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
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
