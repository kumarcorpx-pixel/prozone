// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h: string) => h.trim().replace(/^"|"$/g, ""))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Handle quoted CSV values
    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((header: string, idx: number) => {
      row[header] = values[idx] || ""
    })
    rows.push(row)
  }

  return rows
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let csvText: string

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
      }
      csvText = await file.text()
    } else {
      csvText = await request.text()
    }

    const rows = parseCSV(csvText)
    if (rows.length === 0) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 })
    }

    let createdCount = 0
    let skippedCount = 0
    const errors: { row: number; error: string }[] = []

    // Build a lookup map for company names if needed
    const companyNameSet = new Set<string>()
    for (const row of rows) {
      if (row.company_name && !row.company_id && !row.companyId) {
        companyNameSet.add(row.company_name.trim())
      }
    }

    const companyNameMap: Record<string, string> = {}
    if (companyNameSet.size > 0) {
      const companies = await prisma.company.findMany({
        where: { name: { in: Array.from(companyNameSet) } },
        select: { id: true, name: true },
      })
      for (const c of companies) {
        companyNameMap[c.name] = c.id
      }
    }

    // Process rows in a transaction
    await prisma.$transaction(async (tx: any) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // 1-indexed, +1 for header

        const fullName = (row.full_name || row.fullName || "").trim()
        let companyId = (row.company_id || row.companyId || "").trim()

        // Resolve company name to ID
        if (!companyId && row.company_name) {
          companyId = companyNameMap[row.company_name.trim()] || ""
        }

        // Validate required fields
        if (!fullName) {
          errors.push({ row: rowNum, error: "Missing full_name" })
          skippedCount++
          continue
        }
        if (!companyId) {
          errors.push({ row: rowNum, error: "Missing or unresolved company_id" })
          skippedCount++
          continue
        }

        try {
          await tx.employee.create({
            data: {
              fullName,
              companyId,
              email: row.email?.trim() || null,
              phone: row.phone?.trim() || null,
              designation: row.designation?.trim() || null,
              department: row.department?.trim() || null,
              nationality: row.nationality?.trim() || null,
            },
          })
          createdCount++
        } catch (err: any) {
          errors.push({ row: rowNum, error: err.message })
          skippedCount++
        }
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        total: rows.length,
        created: createdCount,
        skipped: skippedCount,
        errors,
      },
    })
  } catch (err: any) {
    console.error("[Employee Import] Error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
