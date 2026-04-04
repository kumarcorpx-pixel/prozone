import type { Metadata } from "next"
import { HomePageClient } from "./HomePageClient"

export const metadata: Metadata = {
  title: "PRO Services Dubai | Corporate Services UAE | Business Setup | YABS",
  description:
    "YABS offers expert PRO services in Dubai & UAE — company formation, trade license renewal, visa services, document attestation, MOHRE services, and business setup across Dubai, Abu Dhabi & Sharjah. 15+ years of trusted corporate solutions.",
  keywords: [
    "PRO services Dubai",
    "corporate services UAE",
    "visa services Dubai",
    "trade license renewal Dubai",
    "document attestation UAE",
    "company formation Dubai",
    "MOHRE services",
    "business setup Dubai",
    "business setup UAE",
    "free zone company setup Dubai",
    "employment visa UAE",
    "Emirates ID processing",
    "golden visa UAE",
    "Ejari registration Dubai",
    "PRO typing services Dubai",
    "government transactions Dubai",
    "GDRFA visa Dubai",
    "corporate tax UAE",
    "VAT filing Dubai",
  ],
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://corporatepro.cloud",
    siteName: "YABS Corporate PRO Services",
    title: "PRO Services Dubai | Corporate Services & Business Setup UAE | YABS",
    description:
      "Expert PRO services for company formation, visa processing, trade license renewal, document attestation & MOHRE services across Dubai, Abu Dhabi & Sharjah.",
    images: [
      {
        url: "https://corporatepro.cloud/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "YABS Corporate PRO Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO Services Dubai | Business Setup UAE | YABS",
    description:
      "Expert PRO services for company formation, visa processing, trade license renewal & document attestation across UAE.",
    images: ["https://corporatepro.cloud/icons/icon-512.png"],
  },
  alternates: {
    canonical: "https://corporatepro.cloud",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://corporatepro.cloud/#organization",
  name: "YABS Public Relations Management LLC",
  alternateName: "YABS Corporate PRO Services",
  url: "https://corporatepro.cloud",
  logo: "https://corporatepro.cloud/images/yabs-logo.gif",
  image: "https://corporatepro.cloud/icons/icon-512.png",
  description:
    "Expert PRO services for company formation, visa processing, trade license renewal, document attestation, MOHRE services and business setup across Dubai, Abu Dhabi & Sharjah.",
  telephone: "+971565204844",
  email: "info@yabs.ae",
  address: {
    "@type": "PostalAddress",
    streetAddress: "258, Central Plaza, Schon Business Park, DIP(1)",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 25.0117,
    longitude: 55.1556,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Dubai" },
    { "@type": "City", name: "Abu Dhabi" },
    { "@type": "City", name: "Sharjah" },
  ],
  priceRange: "$$",
  sameAs: ["https://wa.me/971565204844"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "PRO Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Company Formation",
          description: "Mainland LLC, DMCC, IFZA, RAKEZ, Meydan & offshore company formation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Visa Processing",
          description: "Employment visas, family residency visas, golden visa, visa cancellations",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Trade License Renewal",
          description: "Trade license new issuance and annual renewal across UAE",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Document Attestation",
          description: "Document attestation, notary services and legal translation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "MOHRE Services",
          description: "Labour cards, work permits, MOHRE approvals and ministry transactions",
        },
      },
    ],
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  )
}
