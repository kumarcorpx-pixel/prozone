import { ZodSchema, ZodError } from "zod"
import { NextResponse } from "next/server"

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse }

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(e => ({
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
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid request data" }, { status: 400 }),
    }
  }
}

export function validateForm<T>(schema: ZodSchema<T>, data: unknown):
  { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach(e => {
        const field = e.path.join(".")
        if (!errors[field]) errors[field] = e.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _form: "Invalid data" } }
  }
}
