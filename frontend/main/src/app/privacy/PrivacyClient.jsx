import Link from "next/link";
import { ChevronRight, Shield, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/20">
            <Shield className="w-4 h-4 text-[#f4c430]" strokeWidth={2.5} />
            <span className="text-body text-sm font-semibold text-[#f4c430] uppercase tracking-wider">
              Your Privacy Matters
            </span>
          </div> */}

          <h1 className="text-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-wide">
            Privacy Policy
          </h1>

          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            We are committed to protecting your personal information
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Privacy Policy</span>
          </div>
        </div>
      </section>

      {/* LAST UPDATED */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-body text-sm text-gray-500 mb-1">
                Last Updated
              </p>
              <p className="text-heading text-lg font-bold text-[#264B0E]">
                January 15, 2026
              </p>
            </div>
            <div className="flex items-center gap-3">
              <InfoCard icon={Shield} text="GDPR" subtext="Compliant" />
              <InfoCard icon={Lock} text="Encrypted" subtext="256-bit SSL" />
              <InfoCard
                icon={Eye}
                text="Transparent"
                subtext="Clear policies"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-4 uppercase">
              Your Privacy is Our Priority
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              At Paanshala, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, and safeguard your data.
            </p>
          </div>

          <div className="space-y-10">
            <PrivacySection
              number="1"
              title="Information We Collect"
              content="We collect information you provide directly to us, including:"
              items={[
                "Personal details (name, email, phone number)",
                "Billing and shipping addresses",
                "Payment information (processed securely)",
                "Order history and preferences",
                "Communication preferences",
              ]}
            />

            <PrivacySection
              number="2"
              title="How We Use Your Information"
              content="We use the collected information for:"
              items={[
                "Processing and fulfilling your orders",
                "Communicating about your purchases",
                "Improving our products and services",
                "Sending promotional offers (with your consent)",
                "Preventing fraud and ensuring security",
              ]}
            />

            <PrivacySection
              number="3"
              title="Information Sharing"
              content="We do not sell your personal information. We may share data with:"
              items={[
                "Payment processors for secure transactions",
                "Shipping partners for order delivery",
                "Service providers who assist our operations",
                "Legal authorities when required by law",
              ]}
            />

            <PrivacySection
              number="4"
              title="Data Security"
              content="We implement industry-standard security measures including:"
              items={[
                "256-bit SSL encryption for data transmission",
                "Secure payment gateways (PCI DSS compliant)",
                "Regular security audits and updates",
                "Limited employee access to personal data",
                "Secure data storage with backup systems",
              ]}
            />

            <PrivacySection
              number="5"
              title="Cookies and Tracking"
              content="We use cookies to enhance your experience:"
              items={[
                "Essential cookies for website functionality",
                "Analytics cookies to improve our services",
                "Marketing cookies (with your consent)",
                "You can manage cookie preferences in your browser",
              ]}
            />

            <PrivacySection
              number="6"
              title="Your Rights"
              content="You have the right to:"
              items={[
                "Access your personal data we hold",
                "Request correction of inaccurate information",
                "Request deletion of your data",
                "Opt-out of marketing communications",
                "Download your data in a portable format",
              ]}
            />

            <PrivacySection
              number="7"
              title="Data Retention"
              content="We retain your information for as long as necessary to provide our services and comply with legal obligations. Order history is maintained for 7 years as per legal requirements."
            />

            <PrivacySection
              number="8"
              title="Children's Privacy"
              content="Our services are not intended for individuals under 18 years of age. We do not knowingly collect data from minors. If you believe a minor has provided us with personal information, please contact us immediately."
            />

            <PrivacySection
              number="9"
              title="Changes to This Policy"
              content="We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent website notice. Continued use after changes constitutes acceptance."
            />

            <PrivacySection
              number="10"
              title="Contact Us"
              content={
                <>
                  For privacy-related questions or to exercise your rights:
                  <br />
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:privacy@paanshala.com"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    privacy@paanshala.com
                  </a>
                  <br />
                  Phone:{" "}
                  <a
                    href="tel:+918510851039"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    +91 8510851039
                  </a>
                </>
              }
            />
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <h3 className="text-heading text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
                Questions About Your Privacy?
              </h3>
              <p className="text-body text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                We're here to help. Contact our privacy team anytime.
              </p>
              <Link href="/get-in-touch">
                <button className="btn-gold w-full sm:w-auto px-8 py-4 text-base inline-flex items-center justify-center gap-2">
                  <span className="font-bold">Contact Privacy Team</span>
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INFO CARD
═══════════════════════════════════════════════════════════════ */
function InfoCard({ icon: Icon, text, subtext }) {
  return (
    <div className="flex items-center gap-2 bg-[#f5e6d3]/50 px-4 py-2 rounded-lg border border-gold-bright/20">
      <div className="w-8 h-8 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="hidden md:block">
        <p className="text-body text-xs font-bold text-[#264B0E]">{text}</p>
        <p className="text-body text-xs text-gray-600">{subtext}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRIVACY SECTION
═══════════════════════════════════════════════════════════════ */
function PrivacySection({ number, title, content, items }) {
  return (
    <div className="group">
      <div className="flex gap-4 md:gap-6">
        <div className="shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
            {number}
          </div>
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-heading text-xl md:text-2xl font-bold text-[#264B0E] mb-3 group-hover:text-gold-bright transition-colors uppercase">
            {title}
          </h3>
          <p className="text-body text-gray-600 leading-relaxed mb-3">
            {content}
          </p>
          {items && (
            <ul className="space-y-2 mt-4">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-bright mt-2 shrink-0" />
                  <span className="text-body text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
