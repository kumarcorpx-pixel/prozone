export interface WorkflowTemplate {
  service_type: string
  steps: { step_number: number; step_name: string; step_label: string }[]
}

export const visaWorkflows: WorkflowTemplate[] = [
  {
    service_type: "New Employment Visa",
    steps: [
      { step_number: 1, step_name: "quota_check", step_label: "Quota Check" },
      { step_number: 2, step_name: "offer_letter", step_label: "Offer Letter" },
      { step_number: 3, step_name: "mohre_approval", step_label: "MOHRE Approval" },
      { step_number: 4, step_name: "entry_permit", step_label: "Entry Permit" },
      { step_number: 5, step_name: "employee_arrival", step_label: "Employee Arrival" },
      { step_number: 6, step_name: "medical_fitness", step_label: "Medical Fitness" },
      { step_number: 7, step_name: "eid_biometrics", step_label: "Emirates ID Biometrics" },
      { step_number: 8, step_name: "labor_contract", step_label: "Labor Contract" },
      { step_number: 9, step_name: "visa_stamping", step_label: "Visa Stamping" },
      { step_number: 10, step_name: "eid_collection", step_label: "Emirates ID Collection" },
    ],
  },
  {
    service_type: "Visa Renewal",
    steps: [
      { step_number: 1, step_name: "medical_fitness", step_label: "Medical Fitness" },
      { step_number: 2, step_name: "eid_renewal", step_label: "Emirates ID Renewal" },
      { step_number: 3, step_name: "mohre_renewal", step_label: "MOHRE Work Permit Renewal" },
      { step_number: 4, step_name: "visa_stamping", step_label: "Visa Stamping" },
      { step_number: 5, step_name: "eid_collection", step_label: "Emirates ID Collection" },
    ],
  },
  {
    service_type: "Visa Cancellation",
    steps: [
      { step_number: 1, step_name: "noc_issuance", step_label: "NOC Issuance" },
      { step_number: 2, step_name: "labor_card_cancel", step_label: "Labor Card Cancellation" },
      { step_number: 3, step_name: "visa_cancel", step_label: "Visa Cancellation" },
      { step_number: 4, step_name: "final_exit", step_label: "Final Exit / Status Change" },
    ],
  },
  {
    service_type: "Trade License Renewal",
    steps: [
      { step_number: 1, step_name: "document_collection", step_label: "Document Collection" },
      { step_number: 2, step_name: "ded_payment", step_label: "DED Payment" },
      { step_number: 3, step_name: "ejari_verification", step_label: "Ejari Verification" },
      { step_number: 4, step_name: "activity_review", step_label: "Activity Review" },
      { step_number: 5, step_name: "license_issuance", step_label: "License Issuance" },
      { step_number: 6, step_name: "establishment_card_update", step_label: "Establishment Card Update" },
    ],
  },
  {
    service_type: "Company Formation Mainland",
    steps: [
      { step_number: 1, step_name: "name_reservation", step_label: "Trade Name Reservation" },
      { step_number: 2, step_name: "initial_approval", step_label: "Initial Approval" },
      { step_number: 3, step_name: "moa_drafting", step_label: "MOA Drafting & Notarization" },
      { step_number: 4, step_name: "ded_registration", step_label: "DED Registration" },
      { step_number: 5, step_name: "immigration_file", step_label: "Immigration File Opening" },
      { step_number: 6, step_name: "establishment_card", step_label: "Establishment Card" },
      { step_number: 7, step_name: "visa_quota", step_label: "Visa Quota Allocation" },
      { step_number: 8, step_name: "bank_account", step_label: "Bank Account Opening" },
    ],
  },
  {
    service_type: "Dependent Visa",
    steps: [
      { step_number: 1, step_name: "sponsor_noc", step_label: "Sponsor NOC" },
      { step_number: 2, step_name: "gdrfa_application", step_label: "GDRFA Application" },
      { step_number: 3, step_name: "entry_permit", step_label: "Entry Permit" },
      { step_number: 4, step_name: "medical_fitness", step_label: "Medical Fitness" },
      { step_number: 5, step_name: "eid_biometrics", step_label: "Emirates ID Biometrics" },
      { step_number: 6, step_name: "visa_stamping", step_label: "Visa Stamping" },
    ],
  },
]

/**
 * Look up the workflow template for a given service type.
 */
export function getWorkflowTemplate(serviceType: string): WorkflowTemplate | undefined {
  return visaWorkflows.find((w) => w.service_type === serviceType)
}
