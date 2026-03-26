import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId")
  try {
    const employees = await prisma.employee.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { fullName: "asc" },
    })
    return NextResponse.json(employees.map(e => ({
      id: e.id, company_id: e.companyId, full_name: e.fullName, email: e.email,
      phone: e.phone, designation: e.designation, department: e.department,
      nationality: e.nationality, visa_status: e.visaStatus, visa_expiry: e.visaExpiry,
      emirates_id: e.emiratesId, emirates_id_expiry: e.emiratesIdExpiry,
      passport_number: e.passportNumber, passport_expiry: e.passportExpiry,
      labor_card_number: e.laborCardNumber, labor_card_expiry: e.laborCardExpiry,
      salary: e.salary, join_date: e.joinDate, status: e.status, notes: e.notes,
      created_at: e.createdAt,
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
