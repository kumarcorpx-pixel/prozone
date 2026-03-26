import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description: "YABS Public Relations Management LLC - Your trusted PRO services partner in UAE since 2015.",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
