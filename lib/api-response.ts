import { NextResponse } from "next/server"

interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export function apiSuccess(data: any, meta?: ApiMeta, status = 200) {
  const body: any = { success: true, data }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

export function apiError(message: string, status = 400, details?: any) {
  const body: any = { success: false, error: message }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function paginatedResponse(data: any[], total: number, page: number, limit: number) {
  return apiSuccess(data, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
}
