// Calendly + Zoom integration

// Default Calendly scheduling URL (set in .env or use default)
export function getCalendlyUrl(): string {
  return process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/yabs-uae/consultation"
}

// Pre-built scheduling links for different meeting types
export const meetingTypes = {
  consultation: {
    label: "Book Consultation",
    description: "30-min free consultation about our PRO services",
    duration: "30 min",
    icon: "video",
  },
  documentReview: {
    label: "Document Review Call",
    description: "Review your documents with our PRO officer",
    duration: "15 min",
    icon: "file",
  },
  followUp: {
    label: "Follow-up Meeting",
    description: "Discuss your ongoing service request",
    duration: "20 min",
    icon: "phone",
  },
}
