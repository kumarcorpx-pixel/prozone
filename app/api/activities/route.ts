import { NextRequest, NextResponse } from "next/server"
import { readFile, writeFile, mkdir } from "fs/promises"
import path from "path"
import { withAuth } from "@/lib/auth-middleware"

// DED Activity Master Data — searchable by name or code
// This serves as a lightweight lookup for the business activities dropdown
// Full dataset loaded from the master list provided by Dubai DED
//
// GET  /api/activities?q=search&limit=20  — search activities
// POST /api/activities                     — upload TSV data (bulk import)

interface Activity {
  code: string
  name: string
  category: string
  group: string
  description?: string
  isic4?: string
}

const DATA_FILE = "/var/www/prozone/data/ded-activities.json"

// Fallback sample data — used when no uploaded data exists
const ACTIVITIES_SAMPLE: Activity[] = [
  { code: "851250", name: "Podiatry Center", category: "Health & Social Work", group: "Medical Clinic" },
  { code: "851928", name: "Special Need Center", category: "Social & Personal Services", group: "CDA activities" },
  { code: "742183", name: "District Cooling Plants Engineering", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "100036", name: "Advanced agriculture for fodder and flowers", category: "Agriculture", group: "Agricultural" },
  { code: "514340", name: "Marble & Natural Stones Trading", category: "Trading & Services", group: "Building materials trading" },
  { code: "741424", name: "Pests Management Consultancy", category: "Agriculture", group: "Consultancy" },
  { code: "921406", name: "Laser & Lights Shows", category: "Social & Personal Services", group: "CDA activities" },
  { code: "100231", name: "E-sports Tournament Platform", category: "Social & Personal Services", group: "Sport Club" },
  { code: "242404", name: "Industrial Solvents Manufacturing", category: "Manufacturing", group: "Manufacturing of chemicals" },
  { code: "269601", name: "Stones Cutting, Shaping & Finishing", category: "Manufacturing", group: "Block and building stones industry" },
  { code: "514906", name: "Industrial & Liquefied Natural Gas Trading", category: "Trading & Services", group: "Chemicals trading" },
  { code: "809058", name: "Computer Training", category: "Education", group: "CDA activities" },
  { code: "151201", name: "Fish & Seafood Canning & preserving", category: "Manufacturing", group: "Fish canning & freezing" },
  { code: "742157", name: "Raw Materials Composition Engineering Services", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "100039", name: "Advanced Growing of Citrus Fruits", category: "Agriculture", group: "Agricultural" },
  { code: "511020", name: "Personal Shopping Services", category: "Trading & Services", group: "Commercial brokerage" },
  { code: "923204", name: "Wax Museum", category: "Social & Personal Services", group: "CDA activities" },
  { code: "741431", name: "Radiology Centers Consultancy", category: "Real Estate,Renting,Bus Servic", group: "Consultancy" },
  { code: "924141", name: "Badminton Training", category: "Classification Service", group: "Sport Club" },
  { code: "930101", name: "Cloth Pressing Services", category: "Social & Personal Services", group: "Laundry" },
  { code: "501001", name: "Motor Vehicles Trading", category: "Trading & Services", group: "Trading in motor vehicles" },
  { code: "515913", name: "Diving Equipment Trading", category: "Trading & Services", group: "Mechanical & engineering equipment" },
  { code: "851207", name: "Respiratory Clinic", category: "Health & Social Work", group: "Medical Clinic" },
  { code: "242907", name: "Candles Manufacturing", category: "Manufacturing", group: "Manufacturing of chemicals" },
  { code: "924901", name: "Billiard & Pool Room", category: "Social & Personal Services", group: "Recreation halls" },
  { code: "741105", name: "Trade Marks Registration Agent", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "502019", name: "Car Polish Services", category: "Trading & Services", group: "CDA activities" },
  { code: "725003", name: "Photocopiers Repairing & Maintenance", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "924118", name: "Gymnastics Club", category: "Social & Personal Services", group: "Sport Club" },
  { code: "930204", name: "Henna Saloon", category: "Social & Personal Services", group: "Ladies salon" },
  { code: "749301", name: "Building Cleaning Services", category: "Real Estate,Renting,Bus Servic", group: "Cleaning services" },
  { code: "749902", name: "Typing & Photocopying Services", category: "Real Estate,Renting,Bus Servic", group: "Typing and translation" },
  { code: "742174", name: "Building Facades Cladding Engineering Design", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "453001", name: "Air-Conditioning, Ventilations & Air Filtration Systems", category: "Construction", group: "Contracting and building works" },
  { code: "100191", name: "Early Childhood Center", category: "Social & Personal Services", group: "Nursery" },
  { code: "741427", name: "Customs Consultant", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "100054", name: "Unmanned Aerial Vehicle (Drone) Service", category: "Trasport,Storage & Communicati", group: "Transport" },
  { code: "514942", name: "Petrochemicals Trading", category: "Trading & Services", group: "Chemicals trading" },
  { code: "722901", name: "Computer Systems & Communication Equipment Software Design", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
  { code: "749906", name: "Documents Clearing Services", category: "Real Estate,Renting,Bus Servic", group: "Typing and translation" },
  { code: "741201", name: "Auditing Of Accounts", category: "Real Estate,Renting,Bus Servic", group: "Accounts" },
  { code: "672004", name: "Insurance Consultancies", category: "Financial Intermediation", group: "Insurance" },
  { code: "242402", name: "Detergents & Disinfectants Manufacturing", category: "Manufacturing", group: "Manufacturing of chemicals" },
  { code: "514321", name: "Decoration Materials & Partitions Trading", category: "Trading & Services", group: "Furniture trading" },
  { code: "322001", name: "Telecommunications Equipment & Accessories Manufacturing", category: "Manufacturing", group: "Appliances and machinery" },
  { code: "701008", name: "Shopping Center (Mall)", category: "Real Estate,Renting,Bus Servic", group: "Real estate" },
  { code: "749944", name: "Outdoor Temporary Car Sheds Services", category: "Classification Service", group: "Motor vehicle repairing" },
  { code: "292908", name: "Energy Efficient Equipment Manufacturing", category: "Manufacturing", group: "Equipment and engines" },
  { code: "502008", name: "Auto Oil Change", category: "Trading & Services", group: "CDA activities" },
  { code: "241104", name: "Petrochemical Manufacturing", category: "Manufacturing", group: "Manufacturing of chemicals" },
  { code: "749957", name: "Real Estate Registration Agent", category: "Classification Service", group: "Real estate" },
  { code: "702001", name: "Real Estate Buying & Selling Brokerage", category: "Real Estate,Renting,Bus Servic", group: "Real estate" },
  { code: "921301", name: "T.V Programs & Visual Materials Production", category: "Social & Personal Services", group: "Art production" },
  { code: "630106", name: "Logistic Services", category: "Classification Service", group: "Transport" },
  { code: "521904", name: "General Trading", category: "Trading & Services", group: "Other Trading Activities" },
  { code: "749912", name: "Exhibition Organizing", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "741302", name: "Marketing Management", category: "Real Estate,Renting,Bus Servic", group: "Promotion Services" },
  { code: "721001", name: "Computer Systems Consultancies", category: "Real Estate,Renting,Bus Servic", group: "Consultancy" },
  { code: "749920", name: "Facilities Management Services", category: "Real Estate,Renting,Bus Servic", group: "Facility management" },
  { code: "741405", name: "Management Consultancies", category: "Real Estate,Renting,Bus Servic", group: "Consultancy" },
  { code: "741402", name: "Feasibility Studies Consultancies", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "552001", name: "Restaurant", category: "Hotels", group: "Restaurants and coffee shops" },
  { code: "552002", name: "Coffee Shop", category: "Hotels", group: "Restaurants and coffee shops" },
  { code: "552003", name: "Cafeteria", category: "Hotels", group: "Restaurants and coffee shops" },
  { code: "551099", name: "Hotel", category: "Hotels", group: "Tourism Activities" },
  { code: "749101", name: "Labor Recruitment Brokerage Office Services", category: "Real Estate,Renting,Bus Servic", group: "Labour Supply" },
  { code: "749103", name: "On Demand Labors Supply (Temporary Employment)", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "630402", name: "Travel Agency", category: "Trasport,Storage & Communicati", group: "Tourism Activities" },
  { code: "630411", name: "Out Bound Tour Operator", category: "Trasport,Storage & Communicati", group: "Tourism Activities" },
  { code: "630412", name: "In Bound Tour Operator", category: "Trasport,Storage & Communicati", group: "Tourism Activities" },
  { code: "851201", name: "General Clinic", category: "Health & Social Work", group: "Medical Clinic" },
  { code: "851218", name: "Poly Clinic", category: "Health & Social Work", group: "Medical Clinic" },
  { code: "851101", name: "General Hospital", category: "Health & Social Work", group: "Hospitals" },
  { code: "513967", name: "Pharmacy", category: "Trading & Services", group: "Medicines trading" },
  { code: "851904", name: "Clinical Laboratory", category: "Health & Social Work", group: "Medical Clinic" },
  { code: "742110", name: "Interior Design Engineering Services", category: "Real Estate,Renting,Bus Servic", group: "Consultancy" },
  { code: "742170", name: "Architectural Design Consultancy", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "742103", name: "Construction Engineering Services", category: "Real Estate,Renting,Bus Servic", group: "Other engineering services" },
  { code: "452001", name: "Building Contracting", category: "Construction", group: "Contracting and building works" },
  { code: "452008", name: "Steel Constructions Contracting", category: "Construction", group: "Contracting and building works" },
  { code: "452009", name: "Road Contracting", category: "Construction", group: "Contracting and building works" },
  { code: "453014", name: "Electrical Fitting Contracting", category: "Construction", group: "Contracting and building works" },
  { code: "454006", name: "Insulation Contracting", category: "Construction", group: "Contracting and building works" },
  { code: "749915", name: "Hotel Management", category: "Real Estate,Renting,Bus Servic", group: "Facility management" },
  { code: "100049", name: "Lifestyle Coaching", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "100019", name: "Data Classification & Analysis Services", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
  { code: "724001", name: "IT Infrastructure", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
  { code: "100008", name: "Data Management & Cyber Security Services", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
  { code: "721006", name: "Cyber Security Consultancy", category: "Real Estate,Renting,Bus Servic", group: "Consultancy" },
  { code: "100306", name: "Distributed Ledger Technology Services", category: "Real Estate,Renting,Bus Servic", group: "CDA activities" },
  { code: "100307", name: "Metaverse Services Provider", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
  { code: "724011", name: "Cloud Service & Datacenters Providers", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
  { code: "100465", name: "Online Seller", category: "Real Estate,Renting,Bus Servic", group: "Information Technology" },
]

/**
 * Load uploaded activities from the JSON data file.
 * Returns an empty array if the file doesn't exist yet.
 */
async function loadUploadedActivities(): Promise<Activity[]> {
  // Try hardcoded path first, then process.cwd() path
  for (const filePath of [DATA_FILE, path.join(process.cwd(), "data", "ded-activities.json")]) {
    try {
      const raw = await readFile(filePath, "utf-8")
      const data = JSON.parse(raw)
      if (Array.isArray(data) && data.length > 0) return data
    } catch {}
  }
  return []
}

/**
 * Get the full merged activity list: uploaded data takes priority,
 * sample data fills in any codes not already present.
 */
async function getAllActivities(): Promise<Activity[]> {
  const uploaded = await loadUploadedActivities()

  if (uploaded.length > 0) {
    // If we have uploaded data, use it as the primary source.
    // Merge in sample entries whose codes aren't in the uploaded set.
    const uploadedCodes = new Set(uploaded.map((a) => a.code))
    const extras = ACTIVITIES_SAMPLE.filter((a) => !uploadedCodes.has(a.code))
    return [...uploaded, ...extras]
  }

  // No uploaded data yet — fall back to sample
  return ACTIVITIES_SAMPLE
}

/**
 * Parse TSV text into Activity objects.
 * Expected columns: activity_desc_en, activity_name_en, activity_category_en,
 *                   activity_code_isic_4, activity_code, activity_group_en
 */
function parseCSVLine(line: string, sep: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else { inQuotes = !inQuotes }
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseTSV(tsv: string): Activity[] {
  const lines = tsv.split(/\r?\n/).filter((line) => line.trim() !== "")
  if (lines.length < 2) return []

  // Parse header to find column indices — detect separator
  const headerLine = lines[0]
  const sep = headerLine.includes("\t") ? "\t" : ","
  const headers = parseCSVLine(headerLine, sep).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""))

  const colMap: Record<string, number> = {}
  headers.forEach((h, i) => {
    colMap[h] = i
  })

  // Support both exact column names and common variations
  const descIdx = colMap["activity_desc_en"] ?? colMap["description"] ?? -1
  const nameIdx = colMap["activity_name_en"] ?? colMap["name"] ?? -1
  const catIdx = colMap["activity_category_en"] ?? colMap["category"] ?? -1
  const isic4Idx = colMap["activity_code_isic_4"] ?? colMap["isic4"] ?? -1
  const codeIdx = colMap["activity_code"] ?? colMap["code"] ?? -1
  const groupIdx = colMap["activity_group_en"] ?? colMap["group"] ?? -1

  if (nameIdx === -1 || codeIdx === -1) {
    throw new Error(
      "TSV must contain at least 'activity_name_en' and 'activity_code' columns. " +
        `Found headers: ${headers.join(", ")}`
    )
  }

  const activities: Activity[] = []
  const seenCodes = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], sep)
    const code = cols[codeIdx]?.trim()
    const name = cols[nameIdx]?.trim()

    if (!code || !name) continue
    if (seenCodes.has(code)) continue
    seenCodes.add(code)

    activities.push({
      code,
      name,
      category: catIdx >= 0 ? cols[catIdx]?.trim() || "" : "",
      group: groupIdx >= 0 ? cols[groupIdx]?.trim() || "" : "",
      description: descIdx >= 0 ? cols[descIdx]?.trim() || "" : "",
      isic4: isic4Idx >= 0 ? cols[isic4Idx]?.trim() || "" : "",
    })
  }

  return activities
}

// ---------------------------------------------------------------------------
// GET /api/activities?q=search&limit=20
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.toLowerCase() || ""
  const limit = Number(request.nextUrl.searchParams.get("limit") || "20")
  const all = await getAllActivities()

  if (!q || q.length < 2) {
    return NextResponse.json({
      activities: all.slice(0, limit),
      total: all.length,
    })
  }

  const results = all
    .filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.group.toLowerCase().includes(q)
    )
    .slice(0, limit)

  return NextResponse.json({ activities: results, total: all.length })
}

// ---------------------------------------------------------------------------
// POST /api/activities  — upload TSV/CSV bulk data
// Body can be:
//   1. multipart/form-data with a "file" field (TSV/CSV file upload)
//   2. application/json with { "tsv": "..." } containing raw TSV text
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["admin"])
  if (!auth.success) return auth.response

  try {
    let tsvText = ""

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await request.formData()
      const file = formData.get("file")
      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          { error: "No file provided. Send a TSV/CSV file in the 'file' field." },
          { status: 400 }
        )
      }
      tsvText = await file.text()
    } else if (contentType.includes("application/json")) {
      // Raw TSV in JSON body
      const body = await request.json()
      tsvText = body.tsv || body.data || ""
    } else {
      // Try reading as plain text
      tsvText = await request.text()
    }

    if (!tsvText.trim()) {
      return NextResponse.json(
        { error: "Empty data. Provide TSV/CSV content with a header row." },
        { status: 400 }
      )
    }

    const activities = parseTSV(tsvText)

    if (activities.length === 0) {
      return NextResponse.json(
        { error: "No valid activities found in the uploaded data." },
        { status: 400 }
      )
    }

    // Ensure the data directory exists
    try {
      const dataDir = path.dirname(DATA_FILE)
      await mkdir(dataDir, { recursive: true })
    } catch {}

    // Write deduplicated activities to JSON file
    try {
      await writeFile(DATA_FILE, JSON.stringify(activities, null, 2), "utf-8")
    } catch (writeErr) {
      // If hardcoded path fails, try process.cwd() path
      const fallbackPath = path.join(process.cwd(), "data", "ded-activities.json")
      try {
        await mkdir(path.dirname(fallbackPath), { recursive: true })
        await writeFile(fallbackPath, JSON.stringify(activities, null, 2), "utf-8")
      } catch (fallbackErr) {
        console.error("[Activities] Write failed:", writeErr, fallbackErr)
        return NextResponse.json({ error: `Failed to save: ${writeErr}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      count: activities.length,
      message: `Imported ${activities.length} unique activities.`,
      sample: activities.slice(0, 5),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
