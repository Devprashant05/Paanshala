"use client";

import { useEffect } from "react";
import { usePageSettingsStore } from "@/stores/usePageSettingsStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const { settings, fetchPageSettings } = usePageSettingsStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

  useEffect(() => {
    fetchPageSettings();
  }, [fetchPageSettings]);

  useEffect(() => {
    fetchActiveCategories();
  }, []);

  const phone = settings?.phoneNumbers?.[0];
  const email = settings?.email;
  const address = settings?.address;
  const whatsappNumber = settings?.whatsappNumber;
  const whatsappCommunityLink = settings?.whatsappCommunityLink;
  const social = settings?.socialLinks || {};

  return (
    <footer className="relative text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/footer-bg.png"
          alt="Paanshala Heritage"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#0b1f11]/95 via-[#0b1f11]/90 to-[#0b1f11]/95" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ── Brand ── */}
          <div className="lg:col-span-1">
            <div className="bg-[#F6F2E9] px-4 py-2 rounded-lg inline-block mb-5">
              <Image
                src="/paan-logo.png"
                alt="Paanshala"
                width={140}
                height={42}
                className="w-32 h-auto"
              />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Explore our online paan store and indulge in the rich flavors and
              aromatic blends of traditional and innovative paan varieties.
            </p>
          </div>

          {/* ── Useful Links ── */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">
              Useful Links
            </h4>
            <ul className="space-y-3">
              <li>
                <FooterLink href="/our-story">Our Story</FooterLink>
              </li>
              <li>
                <FooterLink href="/experiences">Experiences</FooterLink>
              </li>
              <li>
                <FooterLink href="/journal">Paan Journal</FooterLink>
              </li>
              <li>
                <FooterLink href="/create-your-paan">
                  Create Your Paan
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* ── Shop by Category (dynamic) ── */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">Shop</h4>
            <ul className="space-y-3">
              {categories.length === 0
                ? /* fallback skeleton while loading */
                  Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                    </li>
                  ))
                : categories.map((cat) => (
                    <li key={cat._id}>
                      <FooterLink href={`/collections/${cat.slug}`}>
                        {cat.name}
                      </FooterLink>
                      {/* show children as indented sub-links */}
                      {cat.children?.length > 0 && (
                        <ul className="mt-2 ml-3 space-y-2 border-l border-white/10 pl-3">
                          {cat.children.map((child) => (
                            <li key={child._id}>
                              <FooterLink href={`/collections/${child.slug}`}>
                                {child.name}
                              </FooterLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
            </ul>
          </div>

          {/* ── Get In Touch ── */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-white">
              Get In Touch
            </h4>
            <ul className="space-y-4 mb-6">
              {phone && (
                <li>
                  <a
                    href={`tel:+91${phone}`}
                    className="flex items-center gap-3 text-gray-300 hover:text-[#d4af37] transition-colors group"
                  >
                    <ContactIcon icon={Phone} />
                    <span className="text-sm">+91 {phone}</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-gray-300 hover:text-[#d4af37] transition-colors group"
                  >
                    <ContactIcon icon={Mail} />
                    <span className="text-sm break-all">{email}</span>
                  </a>
                </li>
              )}
              {address && (
                <li>
                  <div className="flex items-start gap-3 text-gray-300">
                    <ContactIcon icon={MapPin} />
                    <span className="text-sm leading-relaxed">{address}</span>
                  </div>
                </li>
              )}
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3">
              {social.instagram && (
                <SocialIcon
                  href={social.instagram}
                  icon={Instagram}
                  label="Instagram"
                />
              )}
              {social.facebook && (
                <SocialIcon
                  href={social.facebook}
                  icon={Facebook}
                  label="Facebook"
                />
              )}
              {social.youtube && (
                <SocialIcon
                  href={social.youtube}
                  icon={Youtube}
                  label="YouTube"
                />
              )}
              {social.twitterX && (
                <SocialIcon href={social.twitterX} icon={Twitter} label="X" />
              )}
            </div>
          </div>
        </div>

        {/* ── Information row ── */}
        <div className="mt-10 pt-8 border-t border-[#d4af37]/20">
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
            <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider self-center">
              Information
            </span>
            <FooterLink href="/terms">Terms & Conditions</FooterLink>
            <FooterLink href="/shipping">Shipping & Delivery</FooterLink>
            <FooterLink href="/return-policy">
              Return & Refund Policy
            </FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/get-in-touch">Get In Touch</FooterLink>
          </div>

          {/* WhatsApp CTA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 border border-[#d4af37]/20 rounded-2xl px-6 py-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                Let's Connect
              </h3>
              <p className="text-gray-300 text-sm">
                Join our WhatsApp community for daily updates and exclusive
                offers
              </p>
            </div>
            {whatsappCommunityLink && (
              <a
                href={whatsappCommunityLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shrink-0"
              >
                <WhatsAppIcon />
                Join Community
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-[#d4af37]/20 bg-[#0b1f11]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} Copyright Paanshala | All rights
              reserved
            </p>
            <p className="text-center md:text-right">
              Designed & Developed by{" "}
              <a
                href="https://aleczo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4af37] hover:text-[#f4d03f] transition-colors font-medium"
              >
                Aleczo Media Pvt. Ltd.
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp button */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/91${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="w-8 h-8" />
        </a>
      )}
    </footer>
  );
}

/* ── helpers ── */

function ContactIcon({ icon: Icon }) {
  return (
    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#d4af37]/20 transition-colors">
      <Icon className="w-4 h-4" />
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-[#d4af37] transition-colors text-sm inline-flex items-center gap-2 group"
    >
      <span className="w-1 h-1 rounded-full bg-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </Link>
  );
}

function SocialIcon({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#d4af37] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
    >
      <Icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
    </a>
  );
}

function WhatsAppIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={`${className} text-white`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}