import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth-middleware"
import { handleApiError } from "@/lib/api-error-handler"

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
    console.error("Failed to fetch employee:", error)
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    )
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
    if (body.full_name !== undefined || body.fullName !== undefined) data.fullName = body.full_name || body.fullName
    if (body.company_id !== undefined || body.companyId !== undefined) data.companyId = body.company_id || body.companyId
    if (body.email !== undefined) data.email = body.email
    if (body.phone !== undefined) data.phone = body.phone
    if (body.designation !== undefined) data.designation = body.designation
    if (body.department !== undefined) data.department = body.department
    if (body.nationality !== undefined) data.nationality = body.nationality
    if (body.visa_status !== undefined || body.visaStatus !== undefined) data.visaStatus = body.visa_status || body.visaStatus
    if (body.visa_expiry !== undefined || body.visaExpiry !== undefined) data.visaExpiry = body.visa_expiry || body.visaExpiry
    if (body.emirates_id !== undefined || body.emiratesId !== undefined) data.emiratesId = body.emirates_id || body.emiratesId
    if (body.emirates_id_expiry !== undefined || body.emiratesIdExpiry !== undefined) data.emiratesIdExpiry = body.emirates_id_expiry || body.emiratesIdExpiry
    if (body.passport_number !== undefined || body.passportNumber !== undefined) data.passportNumber = body.passport_number || body.passportNumber
    if (body.passport_expiry !== undefined || body.passportExpiry !== undefined) data.passportExpiry = body.passport_expiry || body.passportExpiry
    if (body.labor_card_number !== undefined || body.laborCardNumber !== undefined) data.laborCardNumber = body.labor_card_number || body.laborCardNumber
    if (body.labor_card_expiry !== undefined || body.laborCardExpiry !== undefined) data.laborCardExpiry = body.labor_card_expiry || body.laborCardExpiry
    if (body.salary !== undefined) data.salary = body.salary
    if (body.join_date !== undefined || body.joinDate !== undefined) data.joinDate = body.join_date || body.joinDate
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

    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error("Failed to update employee:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update employee" },
      { status: 500 }
    )
  }
}
