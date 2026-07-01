"use client";

import { useEffect } from "react";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";

import Link from "next/link";
import {
  ChevronRight,
  VideoIcon,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function ReturnPolicyPage() {
  const { settings, fetchPageSettings } = usePageSettingsStore();
  useEffect(() => {
    fetchPageSettings();
  }, [fetchPageSettings]);
  const whatsappNumber = settings?.whatsappNumber;
  const phone = settings?.phoneNumbers?.[0];
  const email = settings?.email || "support@paanshala.com";

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-wide">
            Return & Refund Policy
          </h1>
          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Please read carefully before placing your order.
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
            icon={AlertTriangle}
            title="No Returns"
            description="All sales are final once placed"
          />
          <QuickInfoCard
            icon={RefreshCw}
            title="No Exchanges"
            description="Except for damage or wrong items"
          />
          <QuickInfoCard
            icon={VideoIcon}
            title="Unboxing Video"
            description="Required for any damage claims"
          />
        </div>
      </div>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          {/* Intro */}
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-4 uppercase">
              No Returns, Refunds or Exchange
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              We want to inform you that we do not accept returns — our policy
              is strictly <strong>no returns</strong>. Please carefully review
              your order before making a purchase. Once an order is placed, we
              do not offer exchanges. Once an item is received, no return
              requests will be entertained.
            </p>
          </div>

          <div className="space-y-10">
            <PolicySection
              number="1"
              title="Damage or Wrong Product"
              content="In case of damage or delivery of a wrong product, please follow these important steps:"
              items={[
                "Make an unboxing video while opening the parcel and keep recording until you are fully satisfied with your order.",
                "The video should clearly show you opening the parcel and inspecting the contents.",
                "If there is any defect, damage, or wrong item — show it clearly in the video and contact us immediately.",
                "Any item damaged during shipping will be replaced, but only if a valid unboxing video is provided.",
                "An unboxing video is compulsory to be eligible for an exchange.",
                "The defect must be clearly visible in the unboxing video.",
              ]}
            />

            <PolicySection
              number="2"
              title="Exchange Procedure"
              content="We only consider exchanges in case of damage or wrong product delivery. To start an exchange:"
              steps={[
                {
                  title: "Record an Unboxing Video",
                  description:
                    "Start recording before opening the parcel. The defect or issue must be clearly visible in the video — this is mandatory.",
                },
                {
                  title: "Contact Us Immediately",
                  description: `Reach out to us at ${email} with the unboxing video attached, or contact our team on WhatsApp/phone.`,
                },
                {
                  title: "Wait for Review",
                  description:
                    "Our team will review your video and evaluate the issue within 24–48 hours.",
                },
                {
                  title: "Exchange Processed",
                  description:
                    "If approved, we will arrange a replacement for the damaged or incorrect item at no additional cost.",
                },
              ]}
            />

            <PolicySection
              number="3"
              title="Important Reminders"
              content="Please keep the following in mind before and after placing your order:"
              items={[
                "Review your cart carefully before completing checkout — no changes can be made after an order is placed.",
                "We do not offer refunds under any circumstances, including change of mind.",
                "Exchanges are only applicable for damaged or wrong items with valid video proof.",
                "No exchange request will be considered without an unboxing video.",
                "Contact us as soon as possible — delayed claims may not be accepted.",
              ]}
            />

            <PolicySection
              number="4"
              title="Contact Us"
              content={
                <>
                  For exchange requests or any queries regarding your order:
                  <br />
                  <br />
                  Email:{" "}
                  <a
                    href={`mailto:${email}`}
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    {email}
                  </a>
                  <br />
                  {phone && (
                    <>
                      Phone:{" "}
                      <a
                        href={`tel:+91${phone}`}
                        className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                      >
                        +91 {phone}
                      </a>
                      <br />
                    </>
                  )}
                  {whatsappNumber && (
                    <>
                      WhatsApp:{" "}
                      <a
                        href={`https://wa.me/91${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                      >
                        Chat with us
                      </a>
                    </>
                  )}
                </>
              }
            />
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark rounded-2xl p-8 md:p-12 text-center shadow-xl">
              <h3 className="text-heading text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
                Have a Question About Your Order?
              </h3>
              <p className="text-body text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                If you received a damaged or wrong item, reach out to us
                immediately with your unboxing video and we'll make it right.
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
      <h3 className="text-heading text-xl font-bold text-[#264B0E] mb-2 uppercase">
        {title}
      </h3>
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
                    <p className="text-body text-sm text-gray-600">
                      {step.description}
                    </p>
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
