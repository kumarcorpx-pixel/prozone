import { NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "./auth"

export type AuthUser = {
  id: string
  email: string
  role: string
  full_name: string
  phone: string | null
  company_id: string | null
}

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; response: NextResponse }

/**
 * Authenticate request and check role-based access.
 * Returns the user if authorized, or a NextResponse error.
 */
export async function withAuth(
  request: NextRequest,
  allowedRoles: string[] = ["admin", "pro_staff", "client"]
): Promise<AuthResult> {
  // Check Authorization header first (for mobile/API clients), then cookie fallback
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : request.cookies.get("auth_token")?.value

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    }
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { success: true, user: user as AuthUser }
}

/**
 * Get the authenticated user's company IDs for filtering client data.
 * Admin/staff see all. Clients see only their associated companies.
 */
export async function getClientCompanyFilter(user: AuthUser): Promise<string[] | null> {
  if (user.role === "admin" || user.role === "pro_staff") return null // null = no filter (see all)

  // For clients, find companies they own
  const prisma = (await import("./prisma")).default
  const companies = await prisma.company.findMany({
    where: { createdById: user.id },
    select: { id: true },
  })
  return companies.map((c: any) => c.id)
}
