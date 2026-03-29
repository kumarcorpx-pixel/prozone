import { z } from "zod"

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  companyName: z.string().max(200).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
  token: z.string().min(1),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Business schemas
export const companySchema = z.object({
  name: z.string().min(2).max(200),
  tradeLicenseNumber: z.string().optional(),
  emirate: z.enum(["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"]).optional(),
  licenseType: z.enum(["mainland", "freezone", "offshore"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
})

export const employeeSchema = z.object({
  fullName: z.string().min(2).max(200),
  companyId: z.string().uuid(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
})

export const serviceRequestSchema = z.object({
  companyId: z.string().uuid().optional(),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
})

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
})

// Document schemas
export const documentCreateSchema = z.object({
  name: z.string().min(2, "Document name required").max(255).trim(),
  companyId: z.string().min(1, "Company is required"),
  employeeId: z.string().optional().nullable(),
  documentType: z.string().min(1, "Document type required"),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export const documentUploadSchema = z.object({
  name: z.string().min(1, "Document name required").max(255),
  companyId: z.string().min(1, "Company is required"),
  employeeId: z.string().optional().nullable(),
  documentType: z.string().default("other"),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

// Chat schema
export const chatMessageSchema = z.object({
  question: z.string().min(1, "Question is required").max(2000, "Question too long").trim(),
  userRole: z.string().optional(),
  userName: z.string().optional(),
})

// Notification update schema
export const notificationUpdateSchema = z.object({
  id: z.string().min(1, "Notification ID required"),
  isRead: z.boolean(),
})

// Request update schema
export const requestUpdateSchema = z.object({
  status: z.enum(["pending", "assigned", "in_progress", "under_review", "completed", "rejected", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigned_to: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
})

// Sanitize string input (remove script tags, etc.)
export function sanitize(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}
