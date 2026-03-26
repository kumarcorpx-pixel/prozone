"use client"

import { createClient } from "./client"
import type {
  Profile,
  Service,
  ServiceRequest,
  RequestTimeline,
  Payment,
  Notification,
  Company,
  Employee,
  CompanyDocument,
} from "../types"

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) return null
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("category")
  if (error) throw error
  return (data ?? []) as Service[]
}

// ─── Service Requests ────────────────────────────────────────────────────────

export async function getServiceRequests(
  filters?: {
    clientId?: string
    status?: string
    priority?: string
    assignedTo?: string
  }
): Promise<ServiceRequest[]> {
  const supabase = createClient()
  let query = supabase
    .from("service_requests")
    .select(`
      *,
      client:profiles!client_id(*),
      company:companies!company_id(name),
      assignee:profiles!assigned_to(*)
    `)
    .order("created_at", { ascending: false })

  if (filters?.clientId) query = query.eq("client_id", filters.clientId)
  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.priority) query = query.eq("priority", filters.priority)
  if (filters?.assignedTo) query = query.eq("assigned_to", filters.assignedTo)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ServiceRequest[]
}

export async function createServiceRequest(
  request: Omit<ServiceRequest, "id" | "created_at" | "updated_at" | "client" | "company" | "assignee">
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("service_requests")
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data as ServiceRequest
}

export async function updateServiceRequest(
  id: string,
  updates: Partial<ServiceRequest>
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("service_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as ServiceRequest
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export async function getRequestTimeline(requestId: string): Promise<RequestTimeline[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("request_timeline")
    .select(`
      *,
      creator:profiles!created_by(*)
    `)
    .eq("request_id", requestId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return (data ?? []) as RequestTimeline[]
}

export async function addTimelineEntry(
  entry: Omit<RequestTimeline, "id" | "created_at" | "creator">
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("request_timeline")
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data as RequestTimeline
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function getPayments(clientId?: string): Promise<Payment[]> {
  const supabase = createClient()
  let query = supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })

  if (clientId) query = query.eq("client_id", clientId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Payment[]
}

// ─── Notifications ──────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Notification[]
}

export async function markNotificationRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
  if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
  if (error) throw error
}

// ─── Companies ───────────────────────────────────────────────────────────────

export async function getCompanies(): Promise<Company[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name")
  if (error) throw error
  return (data ?? []) as Company[]
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as Company
}

export async function createCompany(
  company: Omit<Company, "id" | "created_at" | "updated_at">
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("companies")
    .insert(company)
    .select()
    .single()
  if (error) throw error
  return data as Company
}

export async function updateCompany(id: string, updates: Partial<Company>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Company
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function getEmployees(companyId?: string): Promise<Employee[]> {
  const supabase = createClient()
  let query = supabase
    .from("employees")
    .select("*")
    .order("full_name")

  if (companyId) query = query.eq("company_id", companyId)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Employee[]
}

export async function createEmployee(
  employee: Omit<Employee, "id" | "created_at" | "updated_at">
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("employees")
    .insert(employee)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

export async function updateEmployee(id: string, updates: Partial<Employee>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getCompanyDocuments(companyId: string): Promise<CompanyDocument[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("company_documents")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as CompanyDocument[]
}

export async function getAllDocuments(): Promise<CompanyDocument[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("company_documents")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as CompanyDocument[]
}

export async function createCompanyDocument(
  document: Omit<CompanyDocument, "id" | "created_at" | "updated_at">
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("company_documents")
    .insert(document)
    .select()
    .single()
  if (error) throw error
  return data as CompanyDocument
}

export async function getEmployeeDocuments(employeeId: string): Promise<CompanyDocument[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("company_documents")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as CompanyDocument[]
}

// ─── File Upload ─────────────────────────────────────────────────────────────

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })
  if (error) throw error
  return data.path
}

export function getFileUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ─── Realtime ────────────────────────────────────────────────────────────────

export function subscribeToRequests(
  clientId: string,
  callback: (payload: { new: ServiceRequest }) => void
) {
  const supabase = createClient()
  return supabase
    .channel("service-requests")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "service_requests",
        filter: `client_id=eq.${clientId}`,
      },
      (payload) => callback(payload as unknown as { new: ServiceRequest })
    )
    .subscribe()
}

export function subscribeToNotifications(
  userId: string,
  callback: (payload: { new: Notification }) => void
) {
  const supabase = createClient()
  return supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload as unknown as { new: Notification })
    )
    .subscribe()
}
