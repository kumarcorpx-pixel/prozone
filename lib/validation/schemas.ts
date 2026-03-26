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

// Sanitize string input (remove script tags, etc.)
export function sanitize(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}
