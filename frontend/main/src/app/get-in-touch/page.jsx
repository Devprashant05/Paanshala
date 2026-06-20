"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Building2,
  Store,
} from "lucide-react";
import { useContactStore } from "@/stores/useContactStore";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────
   RECAPTCHA v3 HOOK
───────────────────────────────────────── */
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

function useRecaptcha() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || window.grecaptcha) { if (window.grecaptcha) setReady(true); return; }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => window.grecaptcha.ready(() => setReady(true));
    document.head.appendChild(script);
  }, []);
  const execute = (action = "contact") =>
    new Promise((resolve, reject) => {
      if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) { resolve(null); return; }
      window.grecaptcha.ready(() =>
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve).catch(reject)
      );
    });
  return { ready, execute };
}

/* ── helper: convert a Google Maps share/plain URL into an embeddable iframe URL ── */
function toEmbedUrl(url) {
  if (!url) return null;
  // Already an embed URL
  if (url.includes("/maps/embed")) return url;
  // Fallback: wrap any maps URL into a basic embed via query
  try {
    const u = new URL(url);
    // If it's a plain google maps link, build a simple embed search query
    return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
  } catch {
    return null;
  }
}

export default function GetInTouchPage() {
  const { submitContact, contactLoading } = useContactStore();
  const { settings, fetchPageSettings } = usePageSettingsStore();
  const [captchaError, setCaptchaError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const { execute: executeRecaptcha } = useRecaptcha();

  useEffect(() => {
    fetchPageSettings();
  }, [fetchPageSettings]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCaptchaError("");
    let captchaToken = null;
    try {
      captchaToken = await executeRecaptcha("contact_submit");
    } catch {
      setCaptchaError("Security check failed. Please refresh and try again.");
      return;
    }
    const success = await submitContact(form);
    if (success) {
      setForm({ fullName: "", email: "", phone: "", message: "" });
    }
  };

  const activeStores = (settings?.offlineStores || []).filter(
    (s) => s.isActive,
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-cream-light to-[#f5e6d3]">
      {/* HERO SECTION */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-brand-green-dark to-[#264B0E] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-wide">
            Get in Touch
          </h1>
          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Have questions about our products? Want to place a bulk order? We'd
            love to hear from you.
          </p>
          <div className="flex items-center justify-center gap-2 text-body text-sm text-white/60">
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-white">Contact</span>
          </div>
        </div>
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
            />
          )}
          {settings?.email && (
            <QuickContactCard
              icon={Mail}
              title="Email Us"
              value={settings.email}
              href={`mailto:${settings.email}`}
            />
          )}
          {settings?.whatsappNumber && (
            <QuickContactCard
              icon={MessageCircle}
              title="WhatsApp"
              value="Chat with us"
              href={`https://wa.me/91${settings.whatsappNumber}`}
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-heading text-2xl font-bold text-[#264B0E] mb-6 flex items-center gap-3 uppercase">
                <div className="w-1.5 h-8 bg-linear-to-b from-gold-bright to-[#d4a574] rounded-full" />
                Contact Information
              </h2>

              <div className="space-y-6">
                {settings?.phoneNumbers?.[0] && (
                  <ContactInfoItem
                    icon={Phone}
                    label="Phone"
                    value={`+91 ${settings.phoneNumbers[0]}`}
                    href={`tel:+91${settings.phoneNumbers[0]}`}
                  />
                )}

                {settings?.email && (
                  <ContactInfoItem
                    icon={Mail}
                    label="Email"
                    value={settings.email}
                    href={`mailto:${settings.email}`}
                  />
                )}

                {settings?.address && (
                  <ContactInfoItem
                    icon={Building2}
                    label="Registered Office"
                    value={settings.address}
                  />
                )}

                <ContactInfoItem
                  icon={Clock}
                  label="Business Hours"
                  value="Monday - Sunday&#10;12:00 PM - 12:00 AM"
                />
              </div>
            </div>

            {settings?.whatsappNumber && (
              <div className="bg-linear-to-r from-[#264B0E] to-brand-green-dark rounded-2xl p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle
                    className="w-8 h-8 text-white"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-heading text-xl font-bold text-white mb-2 uppercase">
                  Need Quick Help?
                </h3>
                <p className="text-body text-white/80 mb-6 text-sm">
                  Chat with us on WhatsApp for instant support
                </p>
                <a
                  href={`https://wa.me/91${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
                  Start WhatsApp Chat
                </a>
              </div>
            )}
          </div>

          {/* RIGHT - CONTACT FORM */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-3 uppercase">
                  Send Us a Message
                </h2>
                <p className="text-body text-gray-600">
                  Fill out the form below and we'll get back to you within 24
                  hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 text-black">
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
                    maxLength={10}
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

                {captchaError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-xs text-red-600">
                    <AlertCircle size={13} className="shrink-0" />
                    {captchaError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={contactLoading}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 rounded-xl px-8 py-4 font-bold transition-all duration-300 shadow-lg",
                    contactLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-gold-bright to-[#d4a574] hover:from-[#d4a574] hover:to-gold-bright text-white hover:scale-[1.02]",
                  )}
                >
                  {contactLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" strokeWidth={2.5} />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-body text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our{" "}
                  <Link
                    href="/privacy"
                    className="text-[#264B0E] hover:text-gold-bright font-bold transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAPS SECTION — main office + offline stores ── */}
      {(settings?.mapUrl || activeStores.length > 0) && (
        <section className="bg-[#f5e6d3]/50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-heading text-4xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
                Visit Us
              </h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto">
                Experience our authentic paan varieties in person at our office
                or any of our store locations.
              </p>
            </div>

            {/* CHANGE: single grid for office + all stores together */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {settings?.mapUrl && (
                <MapCard
                  icon={Building2}
                  title="Registered Office"
                  address={settings.address}
                  mapUrl={settings.mapUrl}
                  phone={settings?.phoneNumbers?.[0]}
                />
              )}

              {activeStores
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((store, i) => (
                  <MapCard
                    key={i}
                    icon={Store}
                    title={store.name}
                    address={store.address}
                    mapUrl={store.mapUrl}
                    phone={store.phoneNumber}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-heading text-4xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-body text-gray-600 max-w-2xl mx-auto">
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
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAP CARD — used for both the main office and each store
═══════════════════════════════════════════════════════════════ */
function MapCard({ icon: Icon, title, address, mapUrl, phone, compact = false }) {
  const embedUrl = toEmbedUrl(mapUrl);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 md:p-6 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gold-bright/15 to-[#d4a574]/15 border border-gold-bright/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[#264B0E]" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-heading text-base md:text-lg font-bold text-[#264B0E] uppercase">
              {title}
            </h3>
            {address && (
              <p className="text-body text-xs md:text-sm text-gray-500 mt-1 max-w-md">
                {address}
              </p>
            )}
          </div>
        </div>

        {phone && (
          <a
            href={`tel:+91${phone}`}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#264B0E] hover:text-gold-bright transition-colors whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" />
            +91 {phone}
          </a>
        )}
      </div>

      {/* Map */}
      {embedUrl ? (
        <iframe
          title={title}
          src={embedUrl}
          className="w-full h-40 md:h-48"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="w-full h-40 md:h-48 flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
          <MapPin className="w-5 h-5 mr-2" />
          Map not available
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK CONTACT CARD
═══════════════════════════════════════════════════════════════ */
function QuickContactCard({ icon: Icon, title, value, href, external }) {
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
      <div className="w-14 h-14 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <h3 className="text-heading text-sm font-bold text-[#264B0E] mb-1 uppercase">{title}</h3>
      <p className="text-body text-xs text-gray-600">{value}</p>
    </Component>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT INFO ITEM
═══════════════════════════════════════════════════════════════ */
function ContactInfoItem({ icon: Icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-4 group">
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gold-bright/10 to-[#d4a574]/10 flex items-center justify-center shrink-0 group-hover:from-gold-bright group-hover:to-[#d4a574] transition-all duration-300 border border-gold-bright/20">
        <Icon className="w-5 h-5 text-[#264B0E] group-hover:text-white transition-colors" strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <p className="text-body text-sm font-semibold text-gray-500 mb-1">{label}</p>
        <p
          className="text-body text-sm font-bold text-[#264B0E] group-hover:text-gold-bright transition-colors whitespace-pre-line"
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

/* ═══════════════════════════════════════════════════════════════
   FORM INPUT
═══════════════════════════════════════════════════════════════ */
function FormInput({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-body text-sm font-bold text-[#264B0E]">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 text-body",
          "focus:outline-none focus:ring-2 focus:ring-gold-bright focus:border-transparent",
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-white hover:border-[#264B0E]",
        )}
      />
      {error && <p className="text-body text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM TEXTAREA
═══════════════════════════════════════════════════════════════ */
function FormTextarea({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-body text-sm font-bold text-[#264B0E]">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        rows={5}
        {...props}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-gray-900 placeholder:text-gray-400 resize-none transition-all duration-200 text-body",
          "focus:outline-none focus:ring-2 focus:ring-gold-bright focus:border-transparent",
          error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-white hover:border-[#264B0E]",
        )}
      />
      {error && <p className="text-body text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ CARD
═══════════════════════════════════════════════════════════════ */
function FAQCard({ question, answer }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gold-bright hover:shadow-lg transition-all duration-300">
      <h3 className="text-heading text-lg font-bold text-[#264B0E] mb-3 uppercase">{question}</h3>
      <p className="text-body text-sm text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}