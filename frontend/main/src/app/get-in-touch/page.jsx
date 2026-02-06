"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useContactStore } from "@/stores/useContactStore";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { cn } from "@/lib/utils";

export default function GetInTouchPage() {
  const { submitContact, loading } = useContactStore();
  const { settings, fetchPageSettings } = usePageSettingsStore();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    fetchPageSettings();
  }, [fetchPageSettings]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitContact(form);
    if (success) {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        message: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* HERO SECTION */}
      <section className="relative h-100 md:h-125 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/footer-bg.png"
            alt="Contact Paanshala"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/95 via-[#0b1f11]/85 to-[#0b1f11]/95" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-medium text-[#d4af37]">
              We're Here to Help
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Have questions about our products? Want to place a bulk order? We'd
            love to hear from you.
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Contact</span>
          </div>
        </div>

        {/* Decorative gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
      </section>

      {/* QUICK CONTACT CARDS */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {settings?.phoneNumbers?.[0] && (
            <QuickContactCard
              icon={Phone}
              title="Call Us"
              value={`+91 ${settings.phoneNumbers[0]}`}
              href={`tel:+91${settings.phoneNumbers[0]}`}
              color="blue"
            />
          )}
          {settings?.email && (
            <QuickContactCard
              icon={Mail}
              title="Email Us"
              value={settings.email}
              href={`mailto:${settings.email}`}
              color="green"
            />
          )}
          {settings?.whatsappNumber && (
            <QuickContactCard
              icon={MessageCircle}
              title="WhatsApp"
              value="Chat with us"
              href={`https://wa.me/91${settings.whatsappNumber}`}
              color="whatsapp"
              external
            />
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* LEFT - CONTACT INFO */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-linear-to-b from-[#d4af37] to-[#f4d03f] rounded-full" />
                Contact Information
              </h2>

              <div className="space-y-6">
                {/* Phone */}
                {settings?.phoneNumbers?.[0] && (
                  <ContactInfoItem
                    icon={Phone}
                    label="Phone"
                    value={`+91 ${settings.phoneNumbers[0]}`}
                    href={`tel:+91${settings.phoneNumbers[0]}`}
                  />
                )}

                {/* Email */}
                {settings?.email && (
                  <ContactInfoItem
                    icon={Mail}
                    label="Email"
                    value={settings.email}
                    href={`mailto:${settings.email}`}
                  />
                )}

                {/* Address */}
                {settings?.address && (
                  <ContactInfoItem
                    icon={MapPin}
                    label="Address"
                    value={settings.address}
                  />
                )}

                {/* Business Hours */}
                <ContactInfoItem
                  icon={Clock}
                  label="Business Hours"
                  value="Monday - Sunday&#10;9:00 AM - 9:00 PM"
                />
              </div>
            </div>

            {/* WhatsApp CTA */}
            {settings?.whatsappNumber && (
              <div className="bg-linear-to-r from-[#0b1f11] to-[#1a3d22] rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Need Quick Help?
                </h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Chat with us on WhatsApp for instant support
                </p>
                <a
                  href={`https://wa.me/91${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start WhatsApp Chat
                </a>
              </div>
            )}

            {/* Why Contact Us */}
            {/* <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                How Can We Help?
              </h3>
              <ul className="space-y-3">
                <HelpItem text="Product inquiries & recommendations" />
                <HelpItem text="Bulk & corporate orders" />
                <HelpItem text="Custom paan requirements" />
                <HelpItem text="Delivery & shipping questions" />
                <HelpItem text="Feedback & suggestions" />
                <HelpItem text="Partnership opportunities" />
              </ul>
            </div> */}
          </div>

          {/* RIGHT - CONTACT FORM */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 24
                  hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                  />

                  <FormInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <FormTextarea
                  label="Your Message"
                  name="message"
                  placeholder="Tell us how we can help you..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 rounded-xl px-8 py-4 font-semibold transition-all duration-300 shadow-lg",
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#f4d03f] hover:to-[#d4af37] text-[#0b1f11] hover:scale-[1.02]",
                  )}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our{" "}
                  <Link
                    href="/privacy"
                    className="text-[#d4af37] hover:text-[#f4d03f] underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="bg-gray-100 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Visit Our Store
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience our authentic paan varieties in person. We're located
              in the heart of Delhi.
            </p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            {settings?.address && (
              <iframe
                title="Paanshala Location"
                src={`https://www.google.com/maps?q=${settings.address}&output=embed`}
                className="w-full h-100 md:h-125"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Quick answers to common questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <FAQCard
            question="What are your delivery areas?"
            answer="We deliver pan-India to all major cities. Check our shipping page for detailed delivery timelines."
          />
          <FAQCard
            question="Do you offer bulk orders?"
            answer="Yes! We specialize in bulk and corporate orders. Contact us for special pricing and customization."
          />
          <FAQCard
            question="How fresh are the products?"
            answer="All our paan products are prepared fresh daily and shipped with special packaging to maintain freshness."
          />
          <FAQCard
            question="What payment methods do you accept?"
            answer="We accept all major credit/debit cards, UPI, net banking, and cash on delivery (COD) for select locations."
          />
        </div>

        <div className="text-center mt-10">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] font-semibold transition-colors"
          >
            View All FAQs
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ===============================
   QUICK CONTACT CARD
=============================== */

function QuickContactCard({ icon: Icon, title, value, href, color, external }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    whatsapp: "from-[#25D366] to-[#20BD5A]",
  };

  const Component = href ? "a" : "div";
  const linkProps = href
    ? external
      ? { href, target: "_blank", rel: "noopener noreferrer" }
      : { href }
    : {};

  return (
    <Component
      {...linkProps}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 group"
    >
      <div
        className={cn(
          "w-14 h-14 rounded-full bg-linear-to-br flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform",
          colorClasses[color],
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{value}</p>
    </Component>
  );
}

/* ===============================
   CONTACT INFO ITEM
=============================== */

function ContactInfoItem({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-4 group">
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#d4af37]/20 to-[#f4d03f]/20 flex items-center justify-center shrink-0 group-hover:from-[#d4af37] group-hover:to-[#f4d03f] transition-all duration-300">
        <Icon className="w-5 h-5 text-[#d4af37] group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p
          className="text-sm font-semibold text-gray-900 group-hover:text-[#d4af37] transition-colors whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    </div>
  );

  return href ? (
    <a
      href={href}
      className="block hover:scale-[1.02] transition-transform"
      {...(href.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}

/* ===============================
   HELP ITEM
=============================== */

function HelpItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
      <span className="text-sm text-gray-700">{text}</span>
    </li>
  );
}

/* ===============================
   FORM INPUT
=============================== */

function FormInput({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent",
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-white hover:border-gray-400",
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ===============================
   FORM TEXTAREA
=============================== */

function FormTextarea({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        rows={5}
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-gray-900 placeholder:text-gray-400 resize-none transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent",
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-white hover:border-gray-400",
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ===============================
   FAQ CARD
=============================== */

function FAQCard({ question, answer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#d4af37] hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{question}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}
