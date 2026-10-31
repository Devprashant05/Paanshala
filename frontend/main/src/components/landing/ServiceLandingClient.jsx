"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Users,
  Star,
  Check,
  Phone,
  Sparkles,
  Leaf,
  Utensils,
  Clock,
  Shield,
  Truck,
  Handshake,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EventBookingModal from "@/components/EventBookingModal";

const ICONS = {
  Sparkles,
  Users,
  Leaf,
  Utensils,
  Clock,
  Shield,
  Truck,
  Handshake,
};
const PHONE_TEL = "tel:+918510851039";
const PHONE_DISPLAY = "+91 8510851039";

const STEPS = [
  {
    title: "Share your event details",
    text: "Date, venue and approximate guests through the booking form.",
  },
  {
    title: "Get a tailored quote",
    text: "We confirm the menu, counter styling and pricing for your event.",
  },
  {
    title: "Confirm your slot",
    text: "Lock the date so your setup and stock are reserved.",
  },
  {
    title: "We handle the rest",
    text: "Setup, live service or delivery, and clean-up on the day.",
  },
];

/**
 * One template for every landing page.
 * All copy comes from `cfg` (lib/landing/data.js → getLandingConfig),
 * so a new service or area needs no new component.
 */
export default function ServiceLandingClient({ cfg }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState({
    title: cfg.bookingTitle,
  });

  const openBooking = (title) => {
    setSelectedExperience({ title: title || cfg.bookingTitle });
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#f5f2eb] to-white pb-20 md:pb-0">
      {/* ── HERO ── */}
      <section className="relative bg-linear-to-br from-[#264B0E] via-[#2d5016] to-[#264B0E] py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-left">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-body text-sm text-white/60"
          >
            <Link href="/" className="hover:text-gold-bright transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            <Link
              href="/paan-catering"
              className="hover:text-gold-bright transition-colors"
            >
              Paan Catering
            </Link>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            {cfg.area === "delhi" ? (
              <span className="text-white">{cfg.shortName}</span>
            ) : (
              <>
                <Link
                  href={`/${cfg.service}`}
                  className="hover:text-gold-bright transition-colors"
                >
                  {cfg.shortName}
                </Link>
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-white">{cfg.areaName}</span>
              </>
            )}
          </nav>

          <p className="text-body text-sm uppercase tracking-widest text-gold-bright mt-6">
            {cfg.eyebrow}
          </p>
          <h1 className="text-heading text-4xl md:text-6xl font-bold text-white mb-4 mt-2 uppercase tracking-wide">
            {cfg.h1}
          </h1>
          <p className="text-body text-lg md:text-xl text-white/80 max-w-3xl mb-8">
            {cfg.intro}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => openBooking()}
              className="inline-flex items-center justify-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] hover:from-[#d4a574] hover:to-gold-bright text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105"
            >
              <Calendar className="w-5 h-5" strokeWidth={2.5} />
              Get a Free Quote
            </button>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border-2 border-white/30"
            >
              <Phone className="w-5 h-5" strokeWidth={2.5} />
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat
            icon={Calendar}
            title="100+ Events"
            value="Successfully Hosted"
          />
          <Stat icon={Users} title="50K+ Guests" value="Made Happy" />
          <Stat icon={Star} title="Delhi NCR" value="Based Paan Experts" />
        </div>
      </div>

      {/* ── WHAT YOU GET ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <SectionHeading
          title={`What You Get in ${cfg.areaName}`}
          sub={`Everything for ${cfg.shortName.toLowerCase()} is handled by one team.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cfg.features.map((f) => {
            const Icon = ICONS[f.icon] || Sparkles;
            return (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-heading text-lg font-bold text-[#264B0E] mb-2 uppercase">
                  {f.title}
                </h3>
                <p className="text-body text-sm text-gray-600 leading-relaxed">
                  {f.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── MENU + OCCASIONS ── */}
      <section className="bg-[#f5e6d3]/50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-6 uppercase">
              Our Paan Menu
            </h2>
            <ChipList items={cfg.menu} />
          </div>
          <div>
            <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-6 uppercase">
              Occasions We Serve
            </h2>
            <ChipList items={cfg.occasions} variant="outline" />
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <SectionHeading
          title="Packages"
          sub="Final pricing depends on guest count, menu and styling. Request a quote for your date."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cfg.packages.map((p) => (
            <div
              key={p.name}
              className={cn(
                "bg-white rounded-2xl border p-6 flex flex-col shadow-md",
                p.highlight
                  ? "border-gold-bright shadow-xl"
                  : "border-gray-100",
              )}
            >
              <span className="text-body text-xs uppercase tracking-widest text-[#d4a574]">
                {p.tag}
              </span>
              <h3 className="text-heading text-2xl font-bold text-[#264B0E] my-2 uppercase">
                {p.name}
              </h3>
              <ul className="space-y-2 mb-6 flex-1">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm">
                    <Check
                      className="w-4 h-4 text-[#264B0E] shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    <span className="text-body text-gray-700">{pt}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openBooking(cfg.bookingTitle)}
                className="w-full bg-[#264B0E] hover:bg-[#2d5016] text-white py-3 rounded-xl font-bold transition-colors"
              >
                Get a Quote
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#f5e6d3]/50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeading title="How Booking Works" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#264B0E] text-white flex items-center justify-center font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="text-heading text-base font-bold text-[#264B0E] mb-2 uppercase">
                  {s.title}
                </h3>
                <p className="text-body text-sm text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AREA SECTION (unique per area) ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="max-w-4xl">
          <h2 className="text-heading text-3xl md:text-4xl font-bold text-[#264B0E] mb-4 uppercase flex items-center gap-3">
            <MapPin className="w-8 h-8 text-gold-bright" strokeWidth={2.5} />
            {cfg.shortName} in {cfg.areaName}
          </h2>
          <p className="text-body text-gray-600 leading-relaxed text-lg mb-6">
            {cfg.areaBlurb}
          </p>
          <p className="text-body text-sm uppercase tracking-widest text-gray-500 mb-3">
            Venues we work with in {cfg.areaName}
          </p>
          <ChipList items={cfg.venues} variant="outline" />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#f5e6d3]/50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <SectionHeading title="Frequently Asked Questions" />
          <div className="space-y-3">
            {cfg.faqs.map((f) => (
              <Faq key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED LINKS (internal linking) ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <h2 className="text-heading text-2xl font-bold text-[#264B0E] mb-4 uppercase">
          Also Explore
        </h2>
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={cfg.otherService.href}
            className="px-4 py-2 rounded-full bg-[#264B0E] text-white text-sm hover:bg-[#2d5016] transition-colors"
          >
            {cfg.otherService.label} in {cfg.areaName}
          </Link>
          <Link
            href="/paan-catering"
            className="px-4 py-2 rounded-full border border-[#264B0E] text-[#264B0E] text-sm hover:bg-[#264B0E] hover:text-white transition-colors"
          >
            All events &amp; experiences
          </Link>
          <Link
            href="/bulk-order"
            className="px-4 py-2 rounded-full border border-[#264B0E] text-[#264B0E] text-sm hover:bg-[#264B0E] hover:text-white transition-colors"
          >
            Hotels &amp; caterers (HoReCa)
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2 rounded-full border border-[#264B0E] text-[#264B0E] text-sm hover:bg-[#264B0E] hover:text-white transition-colors"
          >
            Order paan online
          </Link>
        </div>

        <p className="text-body text-sm uppercase tracking-widest text-gray-500 mb-3">
          {cfg.shortName} in other areas
        </p>
        <div className="flex flex-wrap gap-3">
          {cfg.siblingAreas.map((a) => (
            <Link
              key={a.slug}
              href={a.href}
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:border-[#264B0E] hover:text-[#264B0E] transition-colors"
            >
              {a.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-linear-to-br from-[#264B0E] via-[#2d5016] to-[#264B0E] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-heading text-3xl md:text-5xl font-bold text-white mb-6 uppercase">
            Book {cfg.shortName} in {cfg.areaName}
          </h2>
          <p className="text-body text-white/90 text-lg mb-10 max-w-2xl mx-auto">
            Tell us your date and guest count. We will reply with a menu and
            quote.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openBooking()}
              className="inline-flex items-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Calendar className="w-5 h-5" strokeWidth={2.5} />
              Book Your Event Now
            </button>
            <a
              href={PHONE_TEL}
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold border-2 border-white/30 transition-all duration-300"
            >
              <Phone className="w-5 h-5" strokeWidth={2.5} />
              Call: {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 p-3 flex gap-3">
        <button
          onClick={() => openBooking()}
          className="flex-1 bg-[#264B0E] text-white py-3 rounded-xl font-bold"
        >
          Get a Quote
        </button>
        <a
          href={PHONE_TEL}
          aria-label="Call Paanshala"
          className="w-14 flex items-center justify-center rounded-xl border-2 border-[#264B0E] text-[#264B0E]"
        >
          <Phone className="w-5 h-5" strokeWidth={2.5} />
        </a>
      </div>

      <EventBookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        selectedExperience={selectedExperience}
      />
    </div>
  );
}

/* ── small pieces ── */
function SectionHeading({ title, sub }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-heading text-3xl md:text-5xl font-bold text-[#264B0E] mb-4 uppercase">
        {title}
      </h2>
      {sub && (
        <p className="text-body text-gray-600 max-w-2xl mx-auto">{sub}</p>
      )}
    </div>
  );
}

function Stat({ icon: Icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <h3 className="text-heading text-sm font-bold text-[#264B0E] mb-1 uppercase">
        {title}
      </h3>
      <p className="text-body text-xs text-gray-600">{value}</p>
    </div>
  );
}

function ChipList({ items, variant = "solid" }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium",
            variant === "solid"
              ? "bg-[#264B0E] text-white"
              : "bg-white border border-[#264B0E]/30 text-[#264B0E]",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left p-5"
      >
        <span className="text-heading font-bold text-[#264B0E]">{q}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 shrink-0 text-[#264B0E] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {/* Answer stays in the DOM (hidden) so it is always crawlable and matches the FAQPage schema */}
      <div
        className={cn("px-5 pb-5 text-body text-gray-600", !open && "hidden")}
      >
        {a}
      </div>
    </div>
  );
}
