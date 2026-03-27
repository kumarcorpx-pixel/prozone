import { NextResponse } from "next/server"

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } }
    switch (prismaError.code) {
      case "P2002": {
        const field = prismaError.meta?.target?.[0] || "field"
        return NextResponse.json({ error: `A record with this ${field} already exists` }, { status: 409 })
      }
      case "P2025":
        return NextResponse.json({ error: "Record not found" }, { status: 404 })
      case "P2003":
        return NextResponse.json({ error: "Referenced record does not exist" }, { status: 400 })
      default:
        return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
