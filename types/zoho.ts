export interface ZohoInvoice {
  invoice_id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  status: "draft" | "sent" | "overdue" | "paid" | "void" | "partially_paid"
  date: string
  due_date: string
  currency_code: string
  total: number
  balance: number
  sub_total: number
  tax_total: number
  line_items: ZohoLineItem[]
  notes: string
  terms: string
  created_time: string
  last_modified_time: string
  invoice_url: string
}

export interface ZohoLineItem {
  line_item_id?: string
  item_id?: string
  name: string
  description?: string
  rate: number
  quantity: number
  tax_id?: string
  tax_name?: string
  tax_percentage?: number
  item_total: number
}

export interface ZohoCustomer {
  contact_id: string
  contact_name: string
  company_name: string
  email: string
  phone: string
}

export interface ZohoInvoiceInput {
  customer_id: string
  invoice_number?: string
  reference_number?: string
  date: string
  due_date: string
  line_items: {
    item_id?: string
    name: string
    description?: string
    rate: number
    quantity: number
    tax_id?: string
  }[]
  notes?: string
  terms?: string
  is_inclusive_tax?: boolean
  custom_fields?: { label: string; value: string }[]
}

export interface ZohoPaymentInput {
  amount: number
  date: string
  payment_mode?: string
  description?: string
}

export interface ZohoEmailInput {
  send_from_org_email_id?: boolean
  to_mail_ids: string[]
  cc_mail_ids?: string[]
  subject?: string
  body?: string
}

export interface ZohoListParams {
  page?: number
  per_page?: number
  status?: string
  customer_id?: string
  search_text?: string
  sort_column?: string
  sort_order?: "ascending" | "descending" | "A" | "D"
}
