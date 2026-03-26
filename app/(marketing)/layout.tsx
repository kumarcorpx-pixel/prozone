import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { WhatsAppButton } from "@/components/marketing/whatsapp-button"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
