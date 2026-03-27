import type { ZohoInvoice, ZohoInvoiceInput, ZohoCustomer, ZohoListParams, ZohoPaymentInput, ZohoEmailInput } from "@/types/zoho"

const ZOHO_AUTH_URL = process.env.ZOHO_AUTH_URL || "https://accounts.zoho.com/oauth/v2/token"
const ZOHO_API_BASE = process.env.ZOHO_API_BASE || "https://www.zohoapis.com/invoice/v3"
const ZOHO_ORG_ID = process.env.ZOHO_ORG_ID || ""

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    return cachedToken.token
  }

  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho credentials not configured")
  }

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  })

  const res = await fetch(`${ZOHO_AUTH_URL}?${params}`, { method: "POST" })
  const data = await res.json()

  if (data.error) {
    throw new Error(`Zoho auth error: ${data.error}`)
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  }

  return cachedToken.token
}

async function zohoRequest(method: string, endpoint: string, body?: any): Promise<any> {
  const token = await getAccessToken()

  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${token}`,
    "Content-Type": "application/json",
  }

  if (ZOHO_ORG_ID) {
    headers["X-com-zoho-invoice-organizationid"] = ZOHO_ORG_ID
  }

  const res = await fetch(`${ZOHO_API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 429) {
    // Rate limited - wait and retry once
    await new Promise(r => setTimeout(r, 2000))
    return zohoRequest(method, endpoint, body)
  }

  const data = await res.json()

  if (data.code !== 0 && data.code !== undefined) {
    throw new Error(data.message || "Zoho API error")
  }

  return data
}

// ============ INVOICES ============

export async function createInvoice(input: ZohoInvoiceInput): Promise<ZohoInvoice> {
  const data = await zohoRequest("POST", "/invoices", input)
  return data.invoice
}

export async function getInvoice(invoiceId: string): Promise<ZohoInvoice> {
  const data = await zohoRequest("GET", `/invoices/${invoiceId}`)
  return data.invoice
}

export async function listInvoices(params?: ZohoListParams): Promise<{ invoices: ZohoInvoice[]; page_context: any }> {
  const query = new URLSearchParams()
  if (params?.page) query.set("page", String(params.page))
  if (params?.per_page) query.set("per_page", String(params.per_page))
  if (params?.status) query.set("status", params.status)
  if (params?.customer_id) query.set("customer_id", params.customer_id)
  if (params?.search_text) query.set("search_text", params.search_text)
  if (params?.sort_column) query.set("sort_column", params.sort_column)
  if (params?.sort_order) query.set("sort_order", params.sort_order)

  const qs = query.toString() ? `?${query}` : ""
  const data = await zohoRequest("GET", `/invoices${qs}`)
  return { invoices: data.invoices || [], page_context: data.page_context }
}

export async function updateInvoice(invoiceId: string, input: Partial<ZohoInvoiceInput>): Promise<ZohoInvoice> {
  const data = await zohoRequest("PUT", `/invoices/${invoiceId}`, input)
  return data.invoice
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  await zohoRequest("DELETE", `/invoices/${invoiceId}`)
}

export async function sendInvoice(invoiceId: string, emailData: ZohoEmailInput): Promise<void> {
  await zohoRequest("POST", `/invoices/${invoiceId}/email`, emailData)
}

export async function getInvoicePdf(invoiceId: string): Promise<Buffer> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${token}`,
    Accept: "application/pdf",
  }
  if (ZOHO_ORG_ID) headers["X-com-zoho-invoice-organizationid"] = ZOHO_ORG_ID

  const res = await fetch(`${ZOHO_API_BASE}/invoices/${invoiceId}?accept=pdf`, { headers })
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}

export async function recordPayment(invoiceId: string, paymentData: ZohoPaymentInput): Promise<void> {
  await zohoRequest("POST", `/invoices/${invoiceId}/payments`, paymentData)
}

export async function voidInvoice(invoiceId: string): Promise<void> {
  await zohoRequest("POST", `/invoices/${invoiceId}/status/void`)
}

// ============ CUSTOMERS ============

export async function createCustomer(data: { contact_name: string; company_name?: string; email?: string; phone?: string }): Promise<ZohoCustomer> {
  const res = await zohoRequest("POST", "/contacts", data)
  return res.contact
}

export async function getCustomer(customerId: string): Promise<ZohoCustomer> {
  const data = await zohoRequest("GET", `/contacts/${customerId}`)
  return data.contact
}

export async function listCustomers(): Promise<ZohoCustomer[]> {
  const data = await zohoRequest("GET", "/contacts?contact_type=customer")
  return data.contacts || []
}

export async function updateCustomer(customerId: string, updates: Partial<ZohoCustomer>): Promise<ZohoCustomer> {
  const data = await zohoRequest("PUT", `/contacts/${customerId}`, updates)
  return data.contact
}

// ============ ITEMS ============

export async function createItem(data: { name: string; description?: string; rate: number }): Promise<any> {
  const res = await zohoRequest("POST", "/items", data)
  return res.item
}

export async function listItems(): Promise<any[]> {
  const data = await zohoRequest("GET", "/items")
  return data.items || []
}

// ============ HELPERS ============

export function isZohoConfigured(): boolean {
  return !!(process.env.ZOHO_CLIENT_ID && process.env.ZOHO_CLIENT_SECRET && process.env.ZOHO_REFRESH_TOKEN)
}
