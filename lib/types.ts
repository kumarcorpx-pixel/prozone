export type UserRole = "client" | "admin"

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  company_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  trade_name: string | null
  license_number: string | null
  license_type: string | null
  license_expiry: string | null
  legal_form: string | null
  status: "active" | "expired" | "pending" | "closed" | "on_hold"
  emirate: string | null
  jurisdiction: string | null
  free_zone: string | null
  address: string | null
  po_box: string | null
  phone: string | null
  email: string | null
  website: string | null
  industry: string | null
  activities: string[]
  capital: number | null
  incorporation_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  company_id: string
  full_name: string
  email: string | null
  phone: string | null
  designation: string | null
  department: string | null
  nationality: string | null
  visa_status: "valid" | "expired" | "expiring_soon" | "processing" | "cancelled"
  visa_expiry: string | null
  emirates_id: string | null
  emirates_id_expiry: string | null
  passport_number: string | null
  passport_expiry: string | null
  labor_card_number: string | null
  labor_card_expiry: string | null
  salary: number | null
  join_date: string | null
  status: "active" | "resigned" | "terminated"
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CompanyDocument {
  id: string
  company_id: string
  employee_id: string | null
  name: string
  document_type: string
  file_url: string | null
  file_size: number | null
  expiry_date: string | null
  status: "valid" | "expired" | "expiring_soon"
  uploaded_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  category: "licensing" | "visa" | "business_setup" | "document_services" | "accounting" | "other"
  description: string | null
  price: number | null
  estimated_days: number | null
  created_at: string
}

export interface ServiceRequest {
  id: string
  client_id: string
  company_id: string | null
  service_type: string
  description: string | null
  status: "pending" | "in_progress" | "under_review" | "completed" | "rejected"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to: string | null
  notes: string | null
  due_date: string | null
  completed_date: string | null
  created_at: string
  updated_at: string
  client?: Profile
  company?: { name: string }
  assignee?: Profile
}

export interface RequestTimeline {
  id: string
  request_id: string
  status: string
  message: string
  created_by: string | null
  created_at: string
  creator?: Profile
}

export interface Payment {
  id: string
  request_id: string | null
  client_id: string
  amount: number
  vat_amount: number
  total_amount: number
  status: "pending" | "paid" | "failed" | "refunded"
  method: "bank_transfer" | "card" | "cash" | "online"
  description: string | null
  paid_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  type: "info" | "success" | "warning" | "error"
  link: string | null
  created_at: string
}

export interface Shareholder {
  id: string
  company_id: string
  name: string
  nationality: string | null
  share_percentage: number
  share_type: string | null
  emirates_id: string | null
  passport_number: string | null
  is_active: boolean
  created_at: string
}

export interface CompanyContact {
  id: string
  company_id: string
  name: string
  designation: string | null
  email: string | null
  phone: string | null
  is_primary: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  company_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: string | null
  created_at: string
}

export interface Task {
  id: string
  service_request_id: string | null
  company_id: string | null
  title: string
  description: string | null
  status: string
  priority: string
  assigned_to: string | null
  due_date: string | null
  completed_date: string | null
  created_at: string
  updated_at: string
}

export interface WPSData {
  total_employees: number
  wps_covered: number
  not_covered: number
  expired_work_cards: number
  compliance_percentage: number
  total_monthly_salary: number
  salary_paid: number
  salary_pending: number
  average_salary: number
  male_employees: number
  female_employees: number
  skilled_workers: number
  unskilled_workers: number
  last_updated: string
}

export interface MonthlyUpload {
  month: string | number
  year: number
  employee_list: boolean
  wps_report: boolean
  company_report: boolean
  gdrfad_report: boolean
}

export interface PersonExpiry {
  role: "owner" | "manager"
  name: string
  passport_expiry: string | null
  emirates_id_expiry: string | null
  visa_expiry: string | null
}

export type RequestStatus = string
export type RequestPriority = string
export type PaymentStatus = string
