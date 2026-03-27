import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId")

    const employees = await prisma.employee.findMany({
      where: companyId ? { companyId } : undefined,
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })

    const mapped = employees.map((e: any) => ({
      id: e.id,
      company_id: e.companyId,
      company_name: e.company?.name || "Unknown",
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
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const e = await prisma.employee.create({
      data: {
        companyId: body.company_id || body.companyId,
        fullName: body.full_name || body.fullName,
        email: body.email,
        phone: body.phone,
        designation: body.designation,
        department: body.department,
        nationality: body.nationality,
        visaStatus: body.visa_status || body.visaStatus,
        visaExpiry: body.visa_expiry || body.visaExpiry,
        emiratesId: body.emirates_id || body.emiratesId,
        emiratesIdExpiry: body.emirates_id_expiry || body.emiratesIdExpiry,
        passportNumber: body.passport_number || body.passportNumber,
        passportExpiry: body.passport_expiry || body.passportExpiry,
        laborCardNumber: body.labor_card_number || body.laborCardNumber,
        laborCardExpiry: body.labor_card_expiry || body.laborCardExpiry,
        salary: body.salary,
        joinDate: body.join_date || body.joinDate,
        status: body.status || "active",
        notes: body.notes,
      },
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
