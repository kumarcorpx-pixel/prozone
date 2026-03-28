import { Shield, Lock, Server, Eye, UserCheck, Clock, Mail, Phone, Building2 } from "lucide-react"

export const metadata = {
  title: "Privacy Policy | YABS PRO Services",
  description: "Privacy Policy for YABS Public Relations Management LLC. Learn how we collect, use, and protect your personal and business information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-[#1a3a6b] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-blue-300" />
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-lg text-blue-200">
            How we collect, use, and protect your information
          </p>
          <p className="mt-2 text-sm text-blue-300">Last updated: March 28, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">

          {/* Introduction */}
          <div>
            <p className="text-gray-600 leading-relaxed">
              YABS Public Relations Management LLC (&ldquo;YABS,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the privacy and security of your personal and business information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our PRO services, website, and client portal.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              By engaging our services or using our platform, you consent to the practices described in this policy.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              In the course of providing PRO and government relations services, we may collect the following types of information:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">&#8226;</span>
                <span><strong>Personal Information:</strong> Full name, nationality, date of birth, email address, phone number, and residential address.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">&#8226;</span>
                <span><strong>Company Documents:</strong> Trade licenses, memoranda of association, shareholder agreements, commercial registrations, and other corporate documents.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">&#8226;</span>
                <span><strong>Government-Issued Identification:</strong> Passport copies, Emirates ID, visa copies, and other identification documents required for government transactions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">&#8226;</span>
                <span><strong>Financial Information:</strong> Payment details for service invoicing (we do not store credit card numbers).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">&#8226;</span>
                <span><strong>Communication Records:</strong> Emails, WhatsApp messages, and other correspondence related to your service requests.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the information we collect solely for the purpose of delivering our services, including:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#8226;</span>
                <span><strong>PRO Services Processing:</strong> Submitting applications, renewals, and transactions to UAE government authorities (DED, MOHRE, GDRFA, ICP, FAIC, etc.) on your behalf.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#8226;</span>
                <span><strong>Document Management:</strong> Organizing, tracking, and securely storing your documents to ensure timely processing and compliance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#8226;</span>
                <span><strong>Service Communication:</strong> Sending updates on application status, document requirements, renewal reminders, and service-related notifications.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#8226;</span>
                <span><strong>Account Management:</strong> Managing your client portal access and maintaining accurate service records.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Server className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">3. Data Storage &amp; Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              We take the security of your data seriously and employ robust measures to protect it:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">&#8226;</span>
                <span><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest using industry-standard AES-256 encryption.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">&#8226;</span>
                <span><strong>Private UAE Servers:</strong> Your documents and data are stored on private, secure servers located within the United Arab Emirates, ensuring compliance with local data residency requirements.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">&#8226;</span>
                <span><strong>Secure Object Storage:</strong> Documents are stored using MinIO-based private object storage with strict access controls, versioning, and audit logging.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">&#8226;</span>
                <span><strong>Access Controls:</strong> Only authorized personnel with a legitimate business need can access your information. All access is logged and monitored.</span>
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">4. Third-Party Sharing</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              We do <strong>NOT</strong> sell, rent, or share your personal or business information with any third parties for marketing or commercial purposes.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Your information is only disclosed in the following limited circumstances:
            </p>
            <ul className="space-y-2 text-gray-600 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">&#8226;</span>
                <span><strong>UAE Government Authorities:</strong> We submit your information and documents to relevant government entities (e.g., DED, MOHRE, GDRFA, ICP) solely as required to process your requested services.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">&#8226;</span>
                <span><strong>Legal Obligations:</strong> We may disclose information if required to do so by UAE law or in response to a valid legal request from a competent authority.</span>
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">5. Your Rights</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">&#8226;</span>
                <span><strong>Right of Access:</strong> You may request a copy of the personal data we hold about you at any time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">&#8226;</span>
                <span><strong>Right of Correction:</strong> You may request that we correct any inaccurate or incomplete information.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">&#8226;</span>
                <span><strong>Right of Deletion:</strong> You may request deletion of your personal data, subject to our legal retention obligations (see Section 6 below).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">&#8226;</span>
                <span><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for data processing at any time by contacting us, though this may affect our ability to provide services.</span>
              </li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise any of these rights, please contact us using the details provided in Section 7.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">6. Data Retention</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal and business information for a period of <strong>seven (7) years</strong> from the date of last service engagement, in accordance with the UAE Federal Law No. 32 of 2021 (Commercial Companies Law) and other applicable regulations. This retention period ensures compliance with legal, regulatory, and audit requirements.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              After the retention period expires, your data will be securely deleted or anonymized unless a longer retention period is required by law.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">7. Contact Us</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <p className="font-semibold text-gray-900">YABS Public Relations Management LLC</p>
              <p className="text-gray-600">Dubai, United Arab Emirates</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href="mailto:info@yabs.ae" className="text-blue-600 hover:underline">info@yabs.ae</a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-blue-500" />
                <a href="tel:+971565204844" className="text-blue-600 hover:underline">+971 56 520 4844</a>
              </div>
            </div>
          </div>

          {/* Closing */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 leading-relaxed">
              This Privacy Policy may be updated from time to time. We will notify clients of any material changes via email or through our client portal. Your continued use of our services after any changes constitutes acceptance of the updated policy.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
