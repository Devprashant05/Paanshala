"use client";

import { useEffect } from "react";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";

import Link from "next/link";
import {
  ChevronRight,
  RotateCcw,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function ReturnPolicyPage() {
  const { settings, fetchPageSettings } = usePageSettingsStore();
  useEffect(() => {
    fetchPageSettings();
  }, [fetchPageSettings]);
  const whatsappNumber = settings?.whatsappNumber;
  const phone = settings?.phoneNumbers?.[0];

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">

          <h1 className="text-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-wide">
            Return & Refund Policy
          </h1>

          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Your satisfaction is our priority. Easy returns within 7 days.
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Return & Refund Policy</span>
          </div>
        </div>
      </section>

      {/* QUICK INFO CARDS */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickInfoCard
            icon={Clock}
            title="7 Days"
            description="Return window from delivery"
          />
          <QuickInfoCard
            icon={RotateCcw}
            title="Easy Returns"
            description="Simple return process"
          />
          <QuickInfoCard
            icon={CheckCircle}
            title="Full Refund"
            description="Money back guarantee"
          />
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-4 uppercase">
              We Stand Behind Our Products
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              At Paanshala, we want you to be completely satisfied with your
              purchase. If you're not happy with your order, we offer a
              straightforward return and refund process.
            </p>
          </div>

          <div className="space-y-10">
            <PolicySection
              number="1"
              title="Return Eligibility"
              content="Items can be returned within 7 days of delivery if they meet the following conditions:"
              items={[
                "Product is unused and in original condition",
                "Original packaging is intact with all tags",
                "Receipt or proof of purchase is provided",
                "No signs of consumption or tampering",
                "Sealed products remain unopened",
              ]}
            />

            <PolicySection
              number="2"
              title="Non-Returnable Items"
              content="For health and safety reasons, the following items cannot be returned:"
              items={[
                "Opened or consumed paan products",
                "Perishable items past their best before date",
                "Items without original packaging",
                "Customized or personalized products",
                "Gift cards and promotional items",
              ]}
            />

            <PolicySection
              number="3"
              title="Return Process"
              content="To initiate a return, follow these simple steps:"
              steps={[
                {
                  title: "Contact Us",
                  description: `Email us at returns@paanshala.com or call +91 ${phone || '8510851039'} within 7 days of delivery`,
                },
                {
                  title: "Provide Details",
                  description:
                    "Share your order number, reason for return, and photos of the product if applicable",
                },
                {
                  title: "Get Approval",
                  description:
                    "Our team will review and approve your return request within 24 hours",
                },
                {
                  title: "Ship the Item",
                  description:
                    "Pack the item securely and ship it to our return address (we'll provide details)",
                },
                {
                  title: "Receive Refund",
                  description:
                    "Once we receive and inspect the item, your refund will be processed",
                },
              ]}
            />

            <PolicySection
              number="4"
              title="Refund Timeline"
              content="After we receive your returned item:"
              items={[
                "Inspection: 2-3 business days to verify condition",
                "Approval: You'll receive email confirmation once approved",
                "Processing: Refund initiated within 24 hours of approval",
                "Bank Transfer: 5-7 business days for amount to reflect",
                "Original Payment Method: Refund to the same payment method used",
              ]}
            />

            <PolicySection
              number="5"
              title="Shipping Costs"
              content="Please note the following regarding return shipping:"
              items={[
                "Customer pays return shipping for change of mind returns",
                "We cover shipping for defective or incorrect items",
                "Use a trackable shipping method for your protection",
                "We recommend insuring high-value returns",
                "Keep your shipping receipt until refund is complete",
              ]}
            />

            <PolicySection
              number="6"
              title="Damaged or Defective Items"
              content="If you receive a damaged or defective product:"
              items={[
                "Contact us immediately with photos of the damage",
                "Do not consume or use the defective product",
                "We'll arrange a free pickup or send a prepaid label",
                "Replacement or full refund will be processed immediately",
                "No questions asked for genuine quality issues",
              ]}
            />

            <PolicySection
              number="7"
              title="Exchanges"
              content="We currently do not offer direct exchanges. To exchange an item:"
              items={[
                "Return the unwanted item following our return process",
                "Place a new order for the desired item",
                "Contact us for a discount code to waive shipping on the new order",
                "Both processes can be handled simultaneously",
              ]}
            />

            <PolicySection
              number="8"
              title="Refund Method"
              content="Refunds are processed to the original payment method:"
              items={[
                "Credit/Debit Card: 5-7 business days",
                "UPI/Net Banking: 2-3 business days",
                "Paytm/Wallet: 1-2 business days",
                "Cash on Delivery: Bank transfer (provide details)",
                "Store Credit: Instant (if preferred)",
              ]}
            />

            <PolicySection
              number="9"
              title="Cancellation Policy"
              content="Orders can be cancelled before shipment:"
              items={[
                "Contact us immediately if you need to cancel",
                "Cancellations accepted within 24 hours of ordering",
                "Full refund for cancelled orders",
                "Once shipped, standard return policy applies",
                "No cancellation fee",
              ]}
            />

            <PolicySection
              number="10"
              title="Contact for Returns"
              content={
                <>
                  For return requests or questions:
                  <br />
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:returns@paanshala.com"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    returns@paanshala.com
                  </a>
                  <br />
                  Phone:{" "}
                  {phone && (
                    <a
                      href={`tel:+91${phone}`}
                      className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                    >
                      +91 {phone}
                    </a>
                  )}
                  <br />
                  WhatsApp:{" "}
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/91${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                    >
                      Chat with us
                    </a>
                  )}
                </>
              }
            />
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <h3 className="text-heading text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
                Need to Return an Item?
              </h3>
              <p className="text-body text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our customer support team is here to help make the process easy and quick.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/get-in-touch">
                  <button className="btn-gold w-full sm:w-auto px-8 py-4 text-base inline-flex items-center justify-center gap-2">
                    <span className="font-bold">Contact Support</span>
                    <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </Link>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/91${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full sm:w-auto px-8 py-4 text-base inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A]"
                  >
                    <span className="font-bold">WhatsApp Us</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK INFO CARD
═══════════════════════════════════════════════════════════════ */
function QuickInfoCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-white" strokeWidth={2} />
      </div>
      <h3 className="text-heading text-xl font-bold text-[#264B0E] mb-2 uppercase">{title}</h3>
      <p className="text-body text-sm text-gray-600">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   POLICY SECTION
═══════════════════════════════════════════════════════════════ */
function PolicySection({ number, title, content, items, steps }) {
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
          <p className="text-body text-gray-600 leading-relaxed mb-3">{content}</p>
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
          {steps && (
            <div className="space-y-4 mt-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-[#f5e6d3]/30 rounded-lg p-4 hover:bg-[#f5e6d3]/50 transition-colors border border-gold-bright/20"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-heading font-bold text-[#264B0E] mb-1 uppercase text-sm">
                      {step.title}
                    </h4>
                    <p className="text-body text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}