export interface ServiceCatalogItem {
  id: string
  name: string
  category: string
  subcategory: string
  base_price: number
  gov_fee: number
  estimated_days: number
  workflow_template?: string
}

export const serviceCatalog: ServiceCatalogItem[] = [
  // ─── Visa Services (12) ─────────────────────────────────────────────────────
  { id: "svc-001", name: "New Employment Visa", category: "visa", subcategory: "Employment", base_price: 2500, gov_fee: 3500, estimated_days: 10, workflow_template: "New Employment Visa" },
  { id: "svc-002", name: "Visa Renewal", category: "visa", subcategory: "Employment", base_price: 2000, gov_fee: 2700, estimated_days: 7, workflow_template: "Visa Renewal" },
  { id: "svc-003", name: "Visa Cancellation", category: "visa", subcategory: "Employment", base_price: 1500, gov_fee: 600, estimated_days: 5, workflow_template: "Visa Cancellation" },
  { id: "svc-004", name: "Dependent Visa (Spouse)", category: "visa", subcategory: "Dependent", base_price: 2000, gov_fee: 3100, estimated_days: 10, workflow_template: "Dependent Visa" },
  { id: "svc-005", name: "Dependent Visa (Child)", category: "visa", subcategory: "Dependent", base_price: 1800, gov_fee: 2900, estimated_days: 10, workflow_template: "Dependent Visa" },
  { id: "svc-006", name: "Investor / Partner Visa", category: "visa", subcategory: "Investor", base_price: 3500, gov_fee: 4200, estimated_days: 12 },
  { id: "svc-007", name: "Golden Visa Application", category: "visa", subcategory: "Golden", base_price: 5000, gov_fee: 4800, estimated_days: 30 },
  { id: "svc-008", name: "Maid / Domestic Worker Visa", category: "visa", subcategory: "Domestic", base_price: 2500, gov_fee: 5100, estimated_days: 14 },
  { id: "svc-009", name: "Mission Visa", category: "visa", subcategory: "Mission", base_price: 1200, gov_fee: 1100, estimated_days: 3 },
  { id: "svc-010", name: "Visit Visa (30 days)", category: "visa", subcategory: "Visit", base_price: 800, gov_fee: 1100, estimated_days: 2 },
  { id: "svc-011", name: "Visit Visa (90 days)", category: "visa", subcategory: "Visit", base_price: 1000, gov_fee: 1800, estimated_days: 2 },
  { id: "svc-012", name: "Visa Status Change (Inside Country)", category: "visa", subcategory: "Status Change", base_price: 1800, gov_fee: 1500, estimated_days: 7 },

  // ─── License Services (10) ──────────────────────────────────────────────────
  { id: "svc-013", name: "Trade License Renewal", category: "licensing", subcategory: "Renewal", base_price: 3000, gov_fee: 5500, estimated_days: 5, workflow_template: "Trade License Renewal" },
  { id: "svc-014", name: "Trade License Amendment", category: "licensing", subcategory: "Amendment", base_price: 2000, gov_fee: 1500, estimated_days: 5 },
  { id: "svc-015", name: "Add Trade Activity", category: "licensing", subcategory: "Amendment", base_price: 1500, gov_fee: 1000, estimated_days: 3 },
  { id: "svc-016", name: "Remove Trade Activity", category: "licensing", subcategory: "Amendment", base_price: 1000, gov_fee: 500, estimated_days: 3 },
  { id: "svc-017", name: "Company Formation - Mainland", category: "licensing", subcategory: "Formation", base_price: 8000, gov_fee: 15000, estimated_days: 15, workflow_template: "Company Formation Mainland" },
  { id: "svc-018", name: "Company Formation - Free Zone", category: "licensing", subcategory: "Formation", base_price: 10000, gov_fee: 12000, estimated_days: 10 },
  { id: "svc-019", name: "Branch Office Registration", category: "licensing", subcategory: "Formation", base_price: 6000, gov_fee: 8000, estimated_days: 12 },
  { id: "svc-020", name: "Trade Name Reservation", category: "licensing", subcategory: "Registration", base_price: 500, gov_fee: 620, estimated_days: 1 },
  { id: "svc-021", name: "License Liquidation / Closure", category: "licensing", subcategory: "Closure", base_price: 4000, gov_fee: 2000, estimated_days: 30 },
  { id: "svc-022", name: "Instant License (DED)", category: "licensing", subcategory: "Formation", base_price: 3500, gov_fee: 6000, estimated_days: 1 },

  // ─── Labor & HR Services (8) ────────────────────────────────────────────────
  { id: "svc-023", name: "MOHRE Work Permit - New", category: "labor", subcategory: "Work Permit", base_price: 1500, gov_fee: 2300, estimated_days: 3 },
  { id: "svc-024", name: "MOHRE Work Permit - Renewal", category: "labor", subcategory: "Work Permit", base_price: 1200, gov_fee: 2300, estimated_days: 3 },
  { id: "svc-025", name: "Labor Contract Registration", category: "labor", subcategory: "Contract", base_price: 800, gov_fee: 200, estimated_days: 2 },
  { id: "svc-026", name: "Labor Contract Amendment", category: "labor", subcategory: "Contract", base_price: 600, gov_fee: 200, estimated_days: 2 },
  { id: "svc-027", name: "Salary Certificate / NOC", category: "labor", subcategory: "Certificate", base_price: 300, gov_fee: 0, estimated_days: 1 },
  { id: "svc-028", name: "WPS Registration", category: "labor", subcategory: "WPS", base_price: 500, gov_fee: 0, estimated_days: 2 },
  { id: "svc-029", name: "Establishment Card - New/Renewal", category: "labor", subcategory: "Establishment", base_price: 1000, gov_fee: 2100, estimated_days: 3 },
  { id: "svc-030", name: "Visa Quota Increase", category: "labor", subcategory: "Quota", base_price: 1500, gov_fee: 1000, estimated_days: 5 },

  // ─── Document Services (5) ──────────────────────────────────────────────────
  { id: "svc-031", name: "Document Attestation (MOFA)", category: "documents", subcategory: "Attestation", base_price: 500, gov_fee: 150, estimated_days: 2 },
  { id: "svc-032", name: "Document Translation (Arabic/English)", category: "documents", subcategory: "Translation", base_price: 300, gov_fee: 0, estimated_days: 1 },
  { id: "svc-033", name: "Legal Translation (Certified)", category: "documents", subcategory: "Translation", base_price: 500, gov_fee: 0, estimated_days: 2 },
  { id: "svc-034", name: "Power of Attorney Drafting", category: "documents", subcategory: "Legal", base_price: 1500, gov_fee: 500, estimated_days: 3 },
  { id: "svc-035", name: "Notary Public Services", category: "documents", subcategory: "Notary", base_price: 800, gov_fee: 300, estimated_days: 1 },

  // ─── Government Services (6) ────────────────────────────────────────────────
  { id: "svc-036", name: "Ejari Registration", category: "government", subcategory: "Tenancy", base_price: 500, gov_fee: 220, estimated_days: 1 },
  { id: "svc-037", name: "Tawtheeq Registration", category: "government", subcategory: "Tenancy", base_price: 500, gov_fee: 100, estimated_days: 1 },
  { id: "svc-038", name: "Chamber of Commerce Registration", category: "government", subcategory: "Registration", base_price: 800, gov_fee: 1200, estimated_days: 2 },
  { id: "svc-039", name: "Immigration File Opening", category: "government", subcategory: "Immigration", base_price: 1500, gov_fee: 2050, estimated_days: 3 },
  { id: "svc-040", name: "Medical Fitness Test", category: "government", subcategory: "Medical", base_price: 200, gov_fee: 320, estimated_days: 1 },
  { id: "svc-041", name: "Emirates ID Application / Renewal", category: "government", subcategory: "Emirates ID", base_price: 300, gov_fee: 370, estimated_days: 5 },

  // ─── Tax & Finance (5) ──────────────────────────────────────────────────────
  { id: "svc-042", name: "VAT Registration", category: "tax", subcategory: "VAT", base_price: 2000, gov_fee: 0, estimated_days: 5 },
  { id: "svc-043", name: "VAT Return Filing", category: "tax", subcategory: "VAT", base_price: 1500, gov_fee: 0, estimated_days: 3 },
  { id: "svc-044", name: "Corporate Tax Registration", category: "tax", subcategory: "Corporate Tax", base_price: 2500, gov_fee: 0, estimated_days: 5 },
  { id: "svc-045", name: "Corporate Tax Return Filing", category: "tax", subcategory: "Corporate Tax", base_price: 3000, gov_fee: 0, estimated_days: 7 },
  { id: "svc-046", name: "Economic Substance Reporting", category: "tax", subcategory: "ESR", base_price: 2000, gov_fee: 0, estimated_days: 5 },

  // ─── Other Services (6) ─────────────────────────────────────────────────────
  { id: "svc-047", name: "PRO Runner Service (Half Day)", category: "other", subcategory: "PRO", base_price: 500, gov_fee: 0, estimated_days: 1 },
  { id: "svc-048", name: "PRO Runner Service (Full Day)", category: "other", subcategory: "PRO", base_price: 900, gov_fee: 0, estimated_days: 1 },
  { id: "svc-049", name: "Health Insurance Arrangement", category: "other", subcategory: "Insurance", base_price: 300, gov_fee: 0, estimated_days: 3 },
  { id: "svc-050", name: "Bank Account Opening Assistance", category: "other", subcategory: "Banking", base_price: 1500, gov_fee: 0, estimated_days: 10 },
  { id: "svc-051", name: "Office Lease / Ejari Package", category: "other", subcategory: "Real Estate", base_price: 2000, gov_fee: 220, estimated_days: 3 },
  { id: "svc-052", name: "Virtual Office / Flexi Desk", category: "other", subcategory: "Real Estate", base_price: 1000, gov_fee: 0, estimated_days: 1 },
]

/**
 * Look up a service catalog item by id.
 */
export function getServiceById(id: string): ServiceCatalogItem | undefined {
  return serviceCatalog.find((s) => s.id === id)
}

/**
 * Get all services in a given category.
 */
export function getServicesByCategory(category: string): ServiceCatalogItem[] {
  return serviceCatalog.filter((s) => s.category === category)
}

/**
 * Get unique category names from the catalog.
 */
export function getCategories(): string[] {
  return [...new Set(serviceCatalog.map((s) => s.category))]
}
