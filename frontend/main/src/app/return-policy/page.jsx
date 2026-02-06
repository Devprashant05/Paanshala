"use client";

import { useEffect } from "react";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Package,
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
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* HERO SECTION */}
      <section className="relative h-100 md:h-125 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Return & Refund Policy"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/90 via-[#0b1f11]/80 to-[#0b1f11]/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <RotateCcw className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">
              Hassle-Free Returns
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Return & Refund Policy
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your satisfaction is our priority. Easy returns within 7 days.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Return & Refund Policy</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* QUICK INFO CARDS */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickInfoCard
            icon={Clock}
            title="7 Days"
            description="Return window from delivery"
            color="blue"
          />
          <QuickInfoCard
            icon={RotateCcw}
            title="Easy Returns"
            description="Simple return process"
            color="green"
          />
          <QuickInfoCard
            icon={CheckCircle}
            title="Full Refund"
            description="Money back guarantee"
            color="gold"
          />
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              We Stand Behind Our Products
            </h2>
            <p className="text-gray-600 leading-relaxed">
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
                  description:
                    "Email us at returns@paanshala.com or call +91 8510851039 within 7 days of delivery",
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
                    className="text-[#d4af37] hover:text-[#f4d03f] font-medium"
                  >
                    returns@paanshala.com
                  </a>
                  <br />
                  Phone:{" "}
                  {phone && (
                    <a
                      href={`tel:+91${phone}`}
                      className="text-[#d4af37] hover:text-[#f4d03f] font-medium"
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
                      className="text-[#d4af37] hover:text-[#f4d03f] font-medium"
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
            <div className="bg-linear-to-r from-[#0b1f11] to-[#1a3d22] rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Need to Return an Item?
              </h3>
              <p className="text-gray-300 mb-6">
                Our customer support team is here to help make the process easy
                and quick.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#f4d03f] text-[#0b1f11] px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Contact Support
                  <ChevronRight className="w-4 h-4" />
                </Link>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/91${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    WhatsApp Us
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

function QuickInfoCard({ icon: Icon, title, description, color }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    gold: "from-[#d4af37] to-[#f4d03f]",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
      <div
        className={`w-16 h-16 rounded-full bg-linear-to-br ${colorClasses[color]} flex items-center justify-center mx-auto mb-4`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function PolicySection({ number, title, content, items, steps }) {
  return (
    <div className="group">
      <div className="flex gap-4 md:gap-6">
        <div className="shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
            {number}
          </div>
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#d4af37] transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-3">{content}</p>
          {items && (
            <ul className="space-y-2 mt-4">
              {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-2 shrink-0" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          )}
          {steps && (
            <div className="space-y-4 mt-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
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
