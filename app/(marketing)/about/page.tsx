import Link from "next/link"
import { Shield, Star, Lightbulb, Heart, ArrowRight } from "lucide-react"

const values = [
  {
    icon: Shield,
    title: "Integrity",
    description: "We maintain the highest standards of honesty and transparency in every transaction we handle.",
  },
  {
    icon: Star,
    title: "Excellence",
    description: "We strive for excellence in service delivery, ensuring accuracy and timeliness in all processes.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage technology to simplify government transactions and provide a seamless digital experience.",
  },
  {
    icon: Heart,
    title: "Client Focus",
    description: "Our clients are at the center of everything we do. We tailor solutions to meet each business's unique needs.",
  },
]

const stats = [
  { value: "500+", label: "Clients Served" },
  { value: "5,000+", label: "Transactions Completed" },
  { value: "15+", label: "Services Offered" },
  { value: "8+", label: "Years Experience" },
]

const teamMembers = [
  { name: "Team Member", role: "Managing Director" },
  { name: "Team Member", role: "Head of Operations" },
  { name: "Team Member", role: "Senior PRO Officer" },
  { name: "Team Member", role: "Client Relations Manager" },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            About <span className="text-red-400">YABS</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Your trusted PRO services partner in the UAE
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b]">Our Story</h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              YABS Public Relations Management LLC, established in Dubai, provides comprehensive PRO
              services across Abu Dhabi, Dubai, and Sharjah. Our expert team brings deep knowledge of
              UAE government procedures, ensuring businesses can navigate regulatory requirements with
              confidence and ease.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              From humble beginnings, we have grown into a full-service PRO company trusted by hundreds
              of businesses across the UAE. Our cloud-based platform brings transparency and efficiency
              to every government transaction we handle.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-xl p-8 ring-1 ring-gray-200 shadow-sm">
              <p className="text-red-500 font-semibold text-sm uppercase tracking-wide">Our Mission</p>
              <h3 className="text-2xl font-bold text-[#1a3a6b] mt-2">Simplifying Government Transactions</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                To simplify government transactions for businesses in the UAE through technology and
                expert service. We aim to remove the complexity from regulatory processes, enabling our
                clients to focus on what they do best — growing their business.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 ring-1 ring-gray-200 shadow-sm">
              <p className="text-red-500 font-semibold text-sm uppercase tracking-wide">Our Vision</p>
              <h3 className="text-2xl font-bold text-[#1a3a6b] mt-2">Leading PRO Platform in the GCC</h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                To be the leading PRO services platform in the GCC region — setting the standard for
                how businesses interact with government services through innovation, reliability, and
                unmatched customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-red-500 font-semibold text-sm uppercase tracking-wide">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-2">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-xl p-6 bg-blue-50/50 border border-blue-100 ring-1 ring-gray-200/50 text-center"
              >
                <v.icon className="h-10 w-10 text-[#1a3a6b] mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-[#1a3a6b] mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#0f2340] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{s.value}</div>
                <div className="text-sm text-gray-300 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-red-500 font-semibold text-sm uppercase tracking-wide">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a6b] mt-2">Meet the Experts</h2>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
              Our experienced team of PRO professionals is ready to assist you with all your government transaction needs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 ring-1 ring-gray-200 shadow-sm text-center">
                <div className="h-20 w-20 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl font-bold">
                    {member.role.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1a3a6b]">{member.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a3a6b] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Work With Us?</h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Partner with YABS for reliable, efficient, and transparent PRO services across the UAE.
          </p>
          <div className="mt-8 flex justify-center flex-wrap gap-4">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Get Started <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-3 text-sm font-semibold border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#1a3a6b] transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
