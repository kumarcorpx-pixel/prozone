import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our PRO Services",
  description: "Comprehensive PRO services across UAE - visa processing, trade license, business setup, document attestation, and more.",
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
