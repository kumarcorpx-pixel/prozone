"use client"

import { createClient } from "./supabase/client"

function supabase() {
  try {
    return createClient()
  } catch {
    return null
  }
}

export async function fetchCompanies() {
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from("companies").select("*").order("name")
    if (data && data.length > 0) return data
  }
  // Fallback to demo data
  const { demoCompanies } = await import("./company-data")
  return demoCompanies
}

export async function fetchEmployees(companyId?: string) {
  const sb = supabase()
  if (sb) {
    let query = sb.from("employees").select("*").order("full_name")
    if (companyId) query = query.eq("company_id", companyId)
    const { data } = await query
    if (data && data.length > 0) return data
  }
  const { demoEmployees } = await import("./company-data")
  return companyId ? demoEmployees.filter(e => e.company_id === companyId) : demoEmployees
}

export async function fetchDocuments(companyId?: string) {
  const sb = supabase()
  if (sb) {
    let query = sb.from("documents").select("*").order("created_at", { ascending: false })
    if (companyId) query = query.eq("company_id", companyId)
    const { data } = await query
    if (data && data.length > 0) return data
  }
  const { companyDocuments } = await import("./company-data")
  return companyId ? companyDocuments.filter(d => d.company_id === companyId) : companyDocuments
}

export async function fetchRequests(filters?: { clientId?: string; assignedTo?: string; status?: string }) {
  const sb = supabase()
  if (sb) {
    let query = sb.from("service_requests").select("*").order("created_at", { ascending: false })
    if (filters?.clientId) query = query.eq("client_id", filters.clientId)
    if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo)
    if (filters?.status) query = query.eq("status", filters.status)
    const { data } = await query
    if (data && data.length > 0) return data
  }
  const { demoRequests } = await import("./demo-data")
  return demoRequests
}

export async function fetchServices() {
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from("services").select("*").order("category")
    if (data && data.length > 0) return data
  }
  return []
}

export async function fetchProfiles() {
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from("profiles").select("*").order("created_at", { ascending: false })
    if (data && data.length > 0) return data
  }
  const { demoProfiles } = await import("./demo-data")
  return demoProfiles
}

export async function fetchCompany(id: string) {
  const sb = supabase()
  if (sb) {
    const { data } = await sb.from("companies").select("*").eq("id", id).single()
    if (data) return data
  }
  const { demoCompanies } = await import("./company-data")
  return demoCompanies.find(c => c.id === id) || null
}

// Dashboard stats
export async function fetchAdminStats() {
  const sb = supabase()
  if (sb) {
    const [companies, employees, requests, documents] = await Promise.all([
      sb.from("companies").select("id", { count: "exact", head: true }),
      sb.from("employees").select("id", { count: "exact", head: true }),
      sb.from("service_requests").select("id", { count: "exact", head: true }),
      sb.from("documents").select("id", { count: "exact", head: true }),
    ])
    return {
      companies: companies.count || 0,
      employees: employees.count || 0,
      requests: requests.count || 0,
      documents: documents.count || 0,
      isReal: true,
    }
  }
  return { companies: 5, employees: 7, requests: 6, documents: 17, isReal: false }
}
