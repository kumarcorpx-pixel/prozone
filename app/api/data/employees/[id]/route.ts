import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"
import { onEmployeeChange } from "@/lib/cache"
import { logAudit } from "@/lib/audit"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params

    const e = await prisma.employee.findUnique({
      where: { id },
    })

    if (!e) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // Client scoping: verify the employee belongs to one of the client's companies
    const companyFilter = await getClientCompanyFilter(auth.user)
    if (companyFilter && !companyFilter.includes(e.companyId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const mapped = {
      id: e.id,
      company_id: e.companyId,
      full_name: e.fullName,
      email: e.email,
      phone: e.phone,
      designation: e.designation,
      department: e.department,
      nationality: e.nationality,
      visa_status: e.visaStatus,
      visa_expiry: e.visaExpiry,
      emirates_id: e.emiratesId,
      emirates_id_expiry: e.emiratesIdExpiry,
      passport_number: e.passportNumber,
      passport_expiry: e.passportExpiry,
      labor_card_number: e.laborCardNumber,
      labor_card_expiry: e.laborCardExpiry,
      salary: e.salary,
      join_date: e.joinDate,
      status: e.status,
      notes: e.notes,
      created_at: e.createdAt,
    }

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()

    const data: any = {}
    if (body.full_name !== undefined || body.fullName !== undefined) data.fullName = body.full_name ?? body.fullName
    if (body.company_id !== undefined || body.companyId !== undefined) data.companyId = body.company_id ?? body.companyId
    if (body.email !== undefined) data.email = body.email
    if (body.phone !== undefined) data.phone = body.phone
    if (body.designation !== undefined) data.designation = body.designation
    if (body.department !== undefined) data.department = body.department
    if (body.nationality !== undefined) data.nationality = body.nationality
    if (body.visa_status !== undefined) data.visaStatus = body.visa_status
    if (body.visa_expiry !== undefined) data.visaExpiry = body.visa_expiry ? new Date(body.visa_expiry) : null
    if (body.emirates_id !== undefined) data.emiratesId = body.emirates_id
    if (body.emirates_id_expiry !== undefined) data.emiratesIdExpiry = body.emirates_id_expiry ? new Date(body.emirates_id_expiry) : null
    if (body.passport_number !== undefined) data.passportNumber = body.passport_number
    if (body.passport_expiry !== undefined) data.passportExpiry = body.passport_expiry ? new Date(body.passport_expiry) : null
    if (body.labor_card_number !== undefined) data.laborCardNumber = body.labor_card_number
    if (body.labor_card_expiry !== undefined) data.laborCardExpiry = body.labor_card_expiry ? new Date(body.labor_card_expiry) : null
    if (body.salary !== undefined) data.salary = body.salary ? Number(body.salary) : null
    if (body.join_date !== undefined) data.joinDate = body.join_date ? new Date(body.join_date) : null
    if (body.status !== undefined) data.status = body.status
    if (body.notes !== undefined) data.notes = body.notes

    const e = await prisma.employee.update({
      where: { id },
      data,
    })

    const mapped = {
      id: e.id,
      company_id: e.companyId,
      full_name: e.fullName,
      email: e.email,
      phone: e.phone,
      designation: e.designation,
      department: e.department,
      nationality: e.nationality,
      visa_status: e.visaStatus,
      visa_expiry: e.visaExpiry,
      emirates_id: e.emiratesId,
      emirates_id_expiry: e.emiratesIdExpiry,
      passport_number: e.passportNumber,
      passport_expiry: e.passportExpiry,
      labor_card_number: e.laborCardNumber,
      labor_card_expiry: e.laborCardExpiry,
      salary: e.salary,
      join_date: e.joinDate,
      status: e.status,
      notes: e.notes,
      created_at: e.createdAt,
    }

    await onEmployeeChange()
    logAudit(auth.user.id, "UPDATE", "employee", id, { fields: Object.keys(data) }).catch(() => {})
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
