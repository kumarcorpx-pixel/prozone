// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"
import { withAuth } from "@/lib/auth-middleware"

function toCSV(headers: string[], rows: Record<string, any>[]): string {
  const escapeField = (val: any): string => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.join(",")]
  for (const row of rows) {
    const values = headers.map((h) => escapeField(row[h]))
    lines.push(values.join(","))
  }
  return lines.join("\n")
}

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || !["companies", "employees", "documents", "requests"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be one of: companies, employees, documents, requests" },
        { status: 400 }
      )
    }

    let csv = ""
    const timestamp = new Date().toISOString().split("T")[0]

    if (type === "companies") {
      const data = await prisma.company.findMany({ orderBy: { createdAt: "desc" } })
      const headers = [
        "id", "name", "tradeName", "licenseNumber", "licenseType", "licenseExpiry",
        "status", "emirate", "jurisdiction", "freeZone", "address", "phone", "email",
        "industry", "incorporationDate", "createdAt",
      ]
      csv = toCSV(headers, data)
    }

    if (type === "employees") {
      const data = await prisma.employee.findMany({
        include: { company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      })
      const headers = [
        "id", "fullName", "email", "phone", "designation", "department",
        "nationality", "visaStatus", "visaExpiry", "emiratesId", "emiratesIdExpiry",
        "passportNumber", "passportExpiry", "status", "companyName", "companyId", "createdAt",
      ]
      const rows = data.map((e: any) => ({ ...e, companyName: e.company?.name || "" }))
      csv = toCSV(headers, rows)
    }

    if (type === "documents") {
      const data = await prisma.document.findMany({
        include: {
          company: { select: { name: true } },
          employee: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      const headers = [
        "id", "name", "documentType", "status", "expiryDate", "issueDate",
        "issuingAuthority", "referenceNumber", "companyName", "employeeName",
        "companyId", "employeeId", "createdAt",
      ]
      const rows = data.map((d: any) => ({
        ...d,
        companyName: d.company?.name || "",
        employeeName: d.employee?.fullName || "",
      }))
      csv = toCSV(headers, rows)
    }

    if (type === "requests") {
      const data = await prisma.serviceRequest.findMany({
        include: {
          company: { select: { name: true } },
          client: { select: { fullName: true } },
          assignedTo: { select: { fullName: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      const headers = [
        "id", "serviceType", "description", "status", "priority",
        "companyName", "clientName", "assignedToName",
        "dueDate", "completedDate", "notes", "createdAt", "updatedAt",
      ]
      const rows = data.map((r: any) => ({
        ...r,
        companyName: r.company?.name || "",
        clientName: r.client?.fullName || "",
        assignedToName: r.assignedTo?.fullName || "",
      }))
      csv = toCSV(headers, rows)
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}_export_${timestamp}.csv"`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
