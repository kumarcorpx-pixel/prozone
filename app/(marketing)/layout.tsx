import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { WhatsAppButton } from "@/components/marketing/whatsapp-button"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "YABS Public Relations Management LLC",
  alternateName: "YABS PRO Services",
  url: "https://corporatepro.cloud",
  logo: "https://corporatepro.cloud/icons/icon-512.png",
  image: "https://corporatepro.cloud/icons/icon-512.png",
  description: "UAE's trusted PRO services company offering trade license renewal, visa processing, company formation, document attestation, and government transactions across Dubai, Abu Dhabi, and Sharjah.",
  telephone: "+971565204844",
  email: "info@yabs.ae",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Business Bay",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  geo: { "@type": "GeoCoordinates", latitude: 25.1865, longitude: 55.2653 },
  areaServed: [
    { "@type": "City", name: "Dubai" },
    { "@type": "City", name: "Abu Dhabi" },
    { "@type": "City", name: "Sharjah" },
  ],
  serviceType: [
    "PRO Services", "Trade License Renewal", "Visa Processing",
    "Company Formation", "Document Attestation", "VAT Registration",
    "MOHRE Services", "GDRFA Services", "Business Setup UAE",
  ],
  priceRange: "AED 1500 - AED 10000",
  openingHours: "Su-Th 08:00-18:00",
  sameAs: ["https://yabs.ae"],
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
