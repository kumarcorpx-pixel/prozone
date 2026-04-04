export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  companies: {
    all: ["companies"] as const,
    detail: (id: string) => ["companies", id] as const,
  },
  employees: {
    all: ["employees"] as const,
    byCompany: (id: string) => ["employees", "company", id] as const,
  },
  documents: {
    all: ["documents"] as const,
    byCompany: (id: string) => ["documents", "company", id] as const,
  },
  requests: {
    all: ["requests"] as const,
    detail: (id: string) => ["requests", id] as const,
  },
  stats: { dashboard: ["stats", "dashboard"] as const },
  users: { all: ["users"] as const },
  notifications: { all: ["notifications"] as const },
  invoices: { all: ["invoices"] as const },
  integrations: { all: ["integrations"] as const },
} as const
