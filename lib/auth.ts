import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("FATAL: JWT_SECRET environment variable is required")
  return secret
}
const JWT_EXPIRES = "30m"

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) throw new Error("Invalid credentials")

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error("Invalid credentials")

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const token = signToken({ userId: user.id, email: user.email, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
    },
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || !user.isActive) return null

  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    role: user.role,
    avatar_url: user.avatarUrl,
    company_id: null,
    is_active: user.isActive,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  }
}

export async function createUser(email: string, password: string, fullName: string, role: string = "client") {
  const hash = await bcrypt.hash(password, 12)
  return prisma.user.create({
    data: { email, password: hash, fullName, role: role as any },
  })
}
