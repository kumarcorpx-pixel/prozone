"use client"

// CRUD operations that call local Prisma API routes

// ============ AUTH ============
export async function signUp(email: string, password: string, fullName: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, confirmPassword: password }),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
  return await res.json()
}

export async function signIn(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error) }
  return await res.json()
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" })
}

export async function getSession() {
  try {
    const res = await fetch("/api/auth/me")
    if (res.ok) return { user: (await res.json()).user }
    return { user: null }
  } catch { return { user: null } }
}

export async function getProfile(userId: string) {
  return null
}

export async function updateProfile(userId: string, updates: any) {
  return updates
}

// ============ COMPANIES ============
export async function createCompany(data: any) {
  const res = await fetch("/api/data/companies", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to create company") }
  return await res.json()
}

export async function updateCompany(id: string, data: any) {
  const res = await fetch(`/api/data/companies/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to update") }
  return await res.json()
}

// ============ EMPLOYEES ============
export async function createEmployee(data: any) {
  const res = await fetch("/api/data/employees", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to create employee") }
  return await res.json()
}

export async function updateEmployee(id: string, data: any) {
  const res = await fetch(`/api/data/employees/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to update") }
  return await res.json()
}

// ============ SERVICE REQUESTS ============
export async function createServiceRequest(data: any) {
  const res = await fetch("/api/data/requests", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to create request") }
  return await res.json()
}

export async function updateServiceRequest(id: string, data: any) {
  const res = await fetch(`/api/data/requests/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to update") }
  return await res.json()
}

// ============ DOCUMENTS ============
export async function createCompanyDocument(data: any) {
  const res = await fetch("/api/data/documents", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to create document") }
  return await res.json()
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("path", path)
  const res = await fetch("/api/documents/upload", { method: "POST", body: formData })
  if (!res.ok) throw new Error("Upload failed")
  const data = await res.json()
  return data.fileUrl || data.file_url || ""
}

// ============ TIMELINE ============
export async function addTimelineEntry(entry: any) {
  const reqId = entry.requestId || entry.request_id || ""
  if (!reqId) return entry
  const res = await fetch(`/api/data/requests/${reqId}/timeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: entry.message || entry.description, status: entry.status }),
  })
  if (res.ok) return await res.json()
  return entry
}

export async function getRequestTimeline(requestId: string) {
  try {
    const res = await fetch(`/api/data/requests/${requestId}/timeline`)
    if (!res.ok) return []
    const data = await res.json()
    return data.timeline || []
  } catch {
    return []
  }
}

// ============ SERVICE CATALOG ============
export async function getServiceCatalog() {
  try {
    const res = await fetch("/api/services")
    if (res.ok) return await res.json()
  } catch {}
  return []
}

// ============ STUBS ============
export async function getServices() { return [] }
export async function getServiceRequests() { return [] }
export async function getPayments() { return [] }
export async function getNotifications() { return [] }
export async function markNotificationRead() {}
export async function markAllNotificationsRead() {}
export async function getCompanies() { return [] }
export async function getCompany() { return null }
export async function getEmployees() { return [] }
export async function getCompanyDocuments() { return [] }
export async function getAllDocuments() { return [] }
export async function getEmployeeDocuments() { return [] }
export async function getFileUrl() { return "" }
export async function getRequestDocuments() { return [] }
export async function addRequestDocument() { return null }
export async function getRequestChecklist() { return [] }
export async function addChecklistItem() { return null }
export async function toggleChecklistItem() { return null }
export async function getMyAssignedRequests() { return [] }
export async function subscribeToRequests() { return null }
export async function subscribeToNotifications() { return null }
