import { ZodSchema } from "zod"
import { NextResponse } from "next/server"

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse }

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = result.error.issues.map(e => ({
    field: e.path.join("."),
    message: e.message,
  }))
  return {
    success: false,
    response: NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 400 }
    ),
  }
}

export function validateForm<T>(schema: ZodSchema<T>, data: unknown):
  { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: Record<string, string> = {}
  result.error.issues.forEach(e => {
    const field = e.path.join(".")
    if (!errors[field]) errors[field] = e.message
  })
  return { success: false, errors }
}
