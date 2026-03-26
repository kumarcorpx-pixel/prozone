export interface ChecklistTemplate {
  service_type: string
  items: string[]
}

export const checklistTemplates: ChecklistTemplate[] = [
  {
    service_type: "Trade License Renewal",
    items: [
      "Collect current trade license copy",
      "Verify sponsor/owner passport validity",
      "Check Ejari/Tawtheeq is valid",
      "Verify no pending DED violations or fines",
      "Pay DED renewal fees online",
      "Submit renewal application to DED",
      "Pay government fees (DED + Chamber of Commerce)",
      "Collect renewed trade license from DED",
    ],
  },
  {
    service_type: "Trade License Renewal (Free Zone)",
    items: [
      "Collect current license and supporting documents",
      "Check outstanding payments with free zone authority",
      "Submit renewal application to free zone portal",
      "Pay free zone renewal fees",
      "Receive approval email from free zone",
      "Download renewed license from portal",
    ],
  },
  {
    service_type: "New Employment Visa",
    items: [
      "Verify company visa quota availability",
      "Collect employee passport copy + photo + degree certificates",
      "Submit work permit application to MOHRE",
      "Receive MOHRE work permit approval",
      "Apply for entry permit through GDRFA",
      "Receive entry permit",
      "Employee enters UAE / change status (if inside country)",
      "Book and complete medical fitness test",
      "Apply for Emirates ID (ICA biometrics)",
      "Submit labor contract on MOHRE portal",
      "Submit passport for visa stamping at GDRFA",
      "Collect Emirates ID and stamped passport",
    ],
  },
  // Visa Renewal (8 steps)
  {
    service_type: "Visa Renewal",
    items: [
      "Check visa and Emirates ID expiry dates",
      "Complete medical fitness test",
      "Renew health insurance",
      "Apply for Emirates ID renewal",
      "Submit work permit renewal to MOHRE",
      "Pay renewal fees",
      "Submit passport for visa stamping",
      "Collect stamped passport and new Emirates ID",
    ],
  },
  // Visa Cancellation (6 steps)
  {
    service_type: "Visa Cancellation",
    items: [
      "Submit cancellation application to MOHRE",
      "Cancel health insurance",
      "Process end-of-service settlement",
      "Submit visa cancellation to GDRFA",
      "Receive cancellation confirmation",
      "Issue exit permit (if required)",
    ],
  },
  // Company Formation Mainland (10 steps)
  {
    service_type: "Company Formation (Mainland)",
    items: [
      "Reserve trade name with DED",
      "Get initial approval from DED",
      "Draft MOA/AOA documents",
      "Notarize MOA at notary public",
      "Sign tenancy contract and register Ejari/Tawtheeq",
      "Submit final license application to DED",
      "Pay license fees",
      "Obtain trade license",
      "Register with Chamber of Commerce",
      "Apply for establishment card and immigration file",
    ],
  },
  // Company Formation Free Zone (8 steps)
  {
    service_type: "Company Formation (Free Zone)",
    items: [
      "Submit initial approval application to free zone authority",
      "Receive initial approval",
      "Prepare MOA and AOA documents",
      "Confirm share capital deposit",
      "Sign lease agreement with free zone",
      "Submit final license application",
      "Pay license and registration fees",
      "Obtain final trade license from free zone",
    ],
  },
  // Document Attestation (5 steps)
  {
    service_type: "Document Attestation",
    items: [
      "Collect original documents from client",
      "Get translation (if needed - Arabic/English)",
      "Submit to MOFA for attestation",
      "Submit to relevant embassy (if needed)",
      "Deliver attested documents to client",
    ],
  },
  // VAT Return Filing (5 steps)
  {
    service_type: "VAT Return Filing",
    items: [
      "Collect sales and purchase invoices for the period",
      "Prepare VAT return calculation",
      "Client review and approval",
      "Submit VAT return on FTA portal",
      "Confirm payment and save acknowledgment",
    ],
  },
]

// Function to get checklist for a service type (fuzzy match)
export function getChecklistForServiceType(serviceType: string): string[] {
  const normalized = serviceType.toLowerCase()
  const template = checklistTemplates.find(t =>
    normalized.includes(t.service_type.toLowerCase()) ||
    t.service_type.toLowerCase().includes(normalized)
  )
  return template?.items || []
}
