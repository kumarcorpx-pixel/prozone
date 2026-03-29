import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getClientCompanyFilter } from "@/lib/auth-middleware"
import { employeeSchema } from "@/lib/validation/schemas"
import { validateBody } from "@/lib/validation/validate"
import { handleApiError } from "@/lib/api-error-handler"
import { cached, CK, TTL, onEmployeeChange } from "@/lib/cache"
import { logAudit } from "@/lib/audit"

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff", "client"])
  if (!auth.success) return auth.response
  const user = auth.user

  try {
    const companyId = request.nextUrl.searchParams.get("companyId")
    const companyFilter = await getClientCompanyFilter(user)
    const isAdminOrStaff = user.role === "admin" || user.role === "pro_staff"

    const mapEmployee = (e: any) => ({
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
      work_permit_expiry: e.workPermitExpiry,
      health_insurance_expiry: e.healthInsuranceExpiry,
      medical_fitness_date: e.medicalFitnessDate,
      salary: e.salary,
      join_date: e.joinDate,
      status: e.status,
      notes: e.notes,
      created_at: e.createdAt,
    })

    if (isAdminOrStaff && !companyId) {
      const mapped = await cached(CK.employees(), TTL.EMPLOYEES, async () => {
        const employees = await prisma.employee.findMany({
          include: { company: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        })
        return employees.map(mapEmployee)
      })
      return NextResponse.json(mapped)
    }

    const whereClause: any = {}
    if (companyId) {
      // If client user, ensure the requested companyId is within their allowed companies
      if (companyFilter) {
        if (!companyFilter.includes(companyId)) {
          return NextResponse.json([])
        }
      }
      whereClause.companyId = companyId
    } else if (companyFilter) {
      whereClause.companyId = { in: companyFilter }
    }

    const employees = await prisma.employee.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    const mapped = employees.map(mapEmployee)

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin", "pro_staff"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const validation = validateBody(employeeSchema, {
      fullName: body.full_name || body.fullName,
      companyId: body.company_id || body.companyId,
      nationality: body.nationality,
      passportNumber: body.passport_number || body.passportNumber,
      designation: body.designation,
      phone: body.phone,
      email: body.email,
    })
    if (!validation.success) return validation.response

    const e = await prisma.employee.create({
      data: {
        company: { connect: { id: validation.data.companyId } },
        fullName: validation.data.fullName,
        email: validation.data.email,
        phone: validation.data.phone,
        designation: validation.data.designation,
        department: body.department,
        nationality: validation.data.nationality,
        visaStatus: body.visa_status || body.visaStatus,
        visaExpiry: body.visa_expiry || body.visaExpiry,
        emiratesId: body.emirates_id || body.emiratesId,
        emiratesIdExpiry: body.emirates_id_expiry || body.emiratesIdExpiry,
        passportNumber: validation.data.passportNumber,
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

    await onEmployeeChange(body.companyId || body.company_id)
    logAudit(auth.user.id, "CREATE", "employee", mapped.id, { name: mapped.full_name }).catch(() => {})
    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
