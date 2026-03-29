export const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  closed: "bg-gray-100 text-gray-800",
  on_hold: "bg-orange-100 text-orange-800",
}

export const documentCategories: Record<string, { label: string; color: string }> = {
  trade_license: { label: "Trade License", color: "bg-blue-100 text-blue-800" },
  visa: { label: "Visa", color: "bg-purple-100 text-purple-800" },
  emirates_id: { label: "Emirates ID", color: "bg-teal-100 text-teal-800" },
  passport: { label: "Passport", color: "bg-indigo-100 text-indigo-800" },
  labor_card: { label: "Labor Card", color: "bg-amber-100 text-amber-800" },
  establishment_card: { label: "Establishment Card", color: "bg-cyan-100 text-cyan-800" },
  ejari: { label: "Ejari / Tawtheeq", color: "bg-lime-100 text-lime-800" },
  moa: { label: "Memorandum of Association", color: "bg-violet-100 text-violet-800" },
  poa: { label: "Power of Attorney", color: "bg-rose-100 text-rose-800" },
  immigration_card: { label: "Immigration Card", color: "bg-sky-100 text-sky-800" },
  wps: { label: "Wage Protection System / Salary Information File", color: "bg-emerald-100 text-emerald-800" },
  noc: { label: "No Objection Certificate", color: "bg-fuchsia-100 text-fuchsia-800" },
  contract: { label: "Contract", color: "bg-orange-100 text-orange-800" },
  medical_insurance: { label: "Medical Insurance", color: "bg-pink-100 text-pink-800" },
  offer_letter: { label: "Offer Letter", color: "bg-yellow-100 text-yellow-800" },
  financial: { label: "Financial", color: "bg-green-100 text-green-800" },
  legal: { label: "Legal", color: "bg-red-100 text-red-800" },
  photo: { label: "Photo", color: "bg-slate-100 text-slate-800" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800" },
}
