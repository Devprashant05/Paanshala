import Link from "next/link";
import { ChevronRight, FileText, Shield, Lock, CreditCard } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/20">
            <FileText className="w-4 h-4 text-[#f4c430]" strokeWidth={2.5} />
            <span className="text-body text-sm font-semibold text-[#f4c430] uppercase tracking-wider">
              Legal Information
            </span>
          </div> */}

          <h1 className="text-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-wide">
            Terms & Conditions
          </h1>

          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Please read these terms carefully before using our services
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Terms & Conditions</span>
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
              <InfoCard
                icon={Shield}
                text="Secure"
                subtext="Your data is safe"
              />
              <InfoCard icon={Lock} text="Privacy" subtext="Protected info" />
              <InfoCard
                icon={CreditCard}
                text="Payment"
                subtext="Secure checkout"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          {/* Introduction */}
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-4 uppercase">
              Welcome to Paanshala
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              These Terms & Conditions govern your use of the Paanshala website
              and the purchase of products through our platform. By accessing or
              using our services, you agree to comply with and be bound by these
              terms. Please read them carefully before proceeding.
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-10">
            <TermSection
              number="1"
              title="Acceptance of Terms"
              content="By accessing or using the Paanshala Online website, you acknowledge and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our services."
            />

            <TermSection
              number="2"
              title="Account Creation"
              content="To make purchases on our Website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and agree to accept responsibility for all activities that occur under your account."
            />

            <TermSection
              number="3"
              title="Age Restriction"
              content="By using our Website, you confirm that you are of legal age to purchase tobacco and related products in your jurisdiction. We do not sell products to individuals under the legal age for such purchases."
            />

            <TermSection
              number="4"
              title="Product Information"
              content="We make every effort to provide accurate and up-to-date product information, including images and descriptions. However, we do not guarantee the accuracy, completeness, or reliability of any product information on our Website. Products may vary slightly from the images shown."
            />

            <TermSection
              number="5"
              title="Orders and Payments"
              content="Placing an order on our Website constitutes an offer to purchase products from us. All orders are subject to acceptance by us. We reserve the right to refuse or cancel any order for any reason, including but not limited to inaccuracies in product information or pricing errors."
              subcontent="Payment for orders is processed securely through our payment gateway partners. You agree to provide accurate and complete payment information and to promptly update such information if necessary."
            />

            <TermSection
              number="6"
              title="Shipping and Delivery"
              content="We aim to process and ship orders promptly. Delivery times may vary depending on your location and other factors. We are not responsible for any delays in delivery caused by factors beyond our control."
            />

            <TermSection
              number="7"
              title="Returns and Refunds"
              content={
                <>
                  Please refer to our{" "}
                  <Link
                    href="/return-policy"
                    className="text-[#264B0E] hover:text-gold-bright font-bold underline transition-colors"
                  >
                    Returns and Refunds Policy
                  </Link>{" "}
                  for information regarding returns, exchanges, and refunds.
                </>
              }
            />

            <TermSection
              number="8"
              title="Prohibited Use"
              content="You agree not to use our Website for any unlawful or unauthorized purposes. This includes, but is not limited to, attempting to gain unauthorized access to our systems, interfering with the proper functioning of the Website, and using the Website to engage in illegal activities."
            />

            <TermSection
              number="9"
              title="Intellectual Property"
              content="The content on our Website, including images, text, and graphics, is protected by copyright and other intellectual property laws. You may not reproduce, modify, distribute, or otherwise use any content from our Website without our prior written consent."
            />

            <TermSection
              number="10"
              title="Limitation of Liability"
              content="To the fullest extent permitted by applicable law, we shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use of our Website or the products purchased through it."
            />

            <TermSection
              number="11"
              title="Changes to Terms & Conditions"
              content="We reserve the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of our Website after any changes shall constitute your consent to such changes."
            />

            <TermSection
              number="12"
              title="Governing Law"
              content="These Terms & Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles."
            />
          </div>

          {/* Contact CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <h3 className="text-heading text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
                Have Questions?
              </h3>
              <p className="text-body text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you have any questions about our Terms & Conditions, please
                don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/get-in-touch">
                  <button className="btn-gold w-full sm:w-auto px-8 py-4 text-base inline-flex items-center justify-center gap-2">
                    <span className="font-bold">Contact Us</span>
                    <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </Link>
                <Link href="/privacy">
                  <button className="btn-outline w-full sm:w-auto px-8 py-4 text-base border-2 border-white text-white hover:bg-white inline-flex items-center justify-center gap-2">
                    <span className="font-bold text-white">Privacy Policy</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <RelatedLink
            href="/privacy"
            icon={Shield}
            title="Privacy Policy"
            description="How we protect your data"
          />
          <RelatedLink
            href="/return-policy"
            icon={FileText}
            title="Return Policy"
            description="Returns & refunds info"
          />
          <RelatedLink
            href="/shipping"
            icon={CreditCard}
            title="Shipping Info"
            description="Delivery & shipping details"
          />
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
   TERM SECTION
═══════════════════════════════════════════════════════════════ */
function TermSection({ number, title, content, subcontent }) {
  return (
    <div className="group">
      <div className="flex gap-4 md:gap-6">
        {/* Number Badge */}
        <div className="shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
            {number}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <h3 className="text-heading text-xl md:text-2xl font-bold text-[#264B0E] mb-3 group-hover:text-gold-bright transition-colors uppercase">
            {title}
          </h3>
          <p className="text-body text-gray-600 leading-relaxed mb-3">
            {content}
          </p>
          {subcontent && (
            <p className="text-body text-gray-600 leading-relaxed pl-4 border-l-2 border-gold-bright/50">
              {subcontent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RELATED LINK
═══════════════════════════════════════════════════════════════ */
function RelatedLink({ href, icon: Icon, title, description }) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gold-bright hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gold-bright/10 to-[#d4a574]/10 flex items-center justify-center mb-4 group-hover:bg-linear-to-br group-hover:from-gold-bright group-hover:to-[#d4a574] transition-all border border-gold-bright/20">
        <Icon
          className="w-6 h-6 text-[#264B0E] group-hover:text-white transition-colors"
          strokeWidth={2}
        />
      </div>
      <h4 className="text-heading text-lg font-bold text-[#264B0E] mb-2 group-hover:text-gold-bright transition-colors uppercase">
        {title}
      </h4>
      <p className="text-body text-sm text-gray-600">{description}</p>
    </Link>
  );
}
