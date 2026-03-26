import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about UAE PRO services, visa processing, trade license renewal, and more.",
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children
}
