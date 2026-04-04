// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error-handler"
import { withAuth } from "@/lib/auth-middleware"

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

async function parseMOHREPdf(buffer: Buffer): Promise<Record<string, string>[]> {
  let pdfParse: any
  try {
    pdfParse = (await import("pdf-parse")).default
  } catch {
    throw new Error("PDF parsing not available. Install pdf-parse: npm install pdf-parse")
  }

  const pdf = await pdfParse(buffer)
  const text = pdf.text
  const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean)

  // Find establishment name for company matching
  let establishmentName = ""
  for (const line of lines) {
    if (line.includes("Establishment Name")) {
      const match = line.match(/Establishment Name[\/\s]*اسم المنشأة\s*(.+)/i)
      if (match) establishmentName = match[1].trim()
      break
    }
  }

  const employees: Record<string, string>[] = []

  // Strategy: find passport numbers (pattern like A1234567, P1234567, Z1234567, etc.)
  // and extract surrounding data
  const passportPattern = /^[A-Z]\d{6,8}$/
  const cardNumberPattern = /^\d{8,10}$/
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/

  // Parse line by line looking for passport numbers as row anchors
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this line looks like a passport number
    if (passportPattern.test(line) || /^\d{7,8}$/.test(line)) {
      const passportNumber = line

      // Collect next lines until we hit another passport number or end
      const rowLines: string[] = []
      let j = i + 1
      while (j < lines.length && j < i + 15) {
        const nextLine = lines[j]
        if (passportPattern.test(nextLine) || /^\d{7,8}$/.test(nextLine)) break
        // Skip Arabic text and ID numbers for now
        if (!/^[\u0600-\u06FF\s]+$/.test(nextLine)) {
          rowLines.push(nextLine)
        }
        j++
      }

      // Extract name — first non-passport, non-number, non-Arabic line with letters
      let fullName = ""
      let designation = ""
      let nationality = ""
      let cardNumber = ""
      let cardExpiry = ""
      let contractType = ""

      for (const rl of rowLines) {
        // Name: contains multiple words with uppercase letters
        if (!fullName && /^[A-Z\s]{5,}$/.test(rl) && rl.split(" ").length >= 2) {
          fullName = rl.split(" ").map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")
        }
        // Card number
        else if (!cardNumber && cardNumberPattern.test(rl)) {
          cardNumber = rl
        }
        // Date (card expiry)
        else if (!cardExpiry && datePattern.test(rl)) {
          cardExpiry = rl
        }
        // Nationality: single word in caps like INDIA, EGYPT, PHILIPPINES
        else if (!nationality && /^[A-Z]{3,}$/.test(rl) && !rl.includes("NEW") && !rl.includes("LIMITED") && !rl.includes("ELECTRONIC")) {
          nationality = rl.charAt(0) + rl.slice(1).toLowerCase()
        }
        // Contract type
        else if (!contractType && (rl === "Limited" || rl === "Unlimited" || rl === "limited" || rl === "unlimited")) {
          contractType = rl
        }
        // Job name: multi-word that's not a name (comes after card type info)
        else if (!designation && /^[A-Za-z\s&]{3,}$/.test(rl) && rl.split(" ").length <= 4 && !rl.includes("WORK PERMIT") && !rl.includes("ELECTRONIC")) {
          designation = rl
        }
      }

      if (fullName || passportNumber) {
        employees.push({
          full_name: fullName || `Employee ${passportNumber}`,
          passport_number: passportNumber,
          designation: designation || "",
          nationality: nationality || "",
          labor_card_number: cardNumber || "",
          labor_card_expiry: cardExpiry || "",
          contract_type: contractType || "",
          company_name: establishmentName || "",
        })
      }
    }
  }

  return employees
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf")
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    const contentType = request.headers.get("content-type") || ""
    let rows: Record<string, string>[]
    let isPdf = false

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
      }

      if (isPdfFile(file)) {
        isPdf = true
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        rows = await parseMOHREPdf(buffer)
      } else {
        const csvText = await file.text()
        rows = parseCSV(csvText)
      }
    } else {
      const csvText = await request.text()
      rows = parseCSV(csvText)
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: isPdf ? "No employee data found in PDF" : "No data rows found in CSV" }, { status: 400 })
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

        // Build notes from PDF-specific fields
        const notesParts: string[] = []
        if (row.contract_type) notesParts.push(`Contract: ${row.contract_type}`)
        if (row.card_type) notesParts.push(`Card Type: ${row.card_type}`)
        const notes = notesParts.length > 0 ? notesParts.join("; ") : undefined

        // Parse labor card expiry date if present
        let laborCardExpiry: Date | null = null
        const expiryStr = row.labor_card_expiry || row.laborCardExpiry || ""
        if (expiryStr) {
          // Handle DD/MM/YYYY format from MOHRE PDFs
          const ddmmyyyy = expiryStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
          if (ddmmyyyy) {
            laborCardExpiry = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`)
          } else {
            laborCardExpiry = new Date(expiryStr)
          }
          if (isNaN(laborCardExpiry.getTime())) laborCardExpiry = null
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
              passportNumber: (row.passport_number || row.passportNumber || "").trim() || null,
              laborCardNumber: (row.labor_card_number || row.laborCardNumber || "").trim() || null,
              laborCardExpiry,
              notes: notes || null,
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
  } catch (error) {
    return handleApiError(error)
  }
}
