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
  Clock,
  User,
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
  const social = settings?.socialLinks || {};

  return (
    <footer className="relative bg-[#264B0E] text-white overflow-hidden">
      {/* Main Content */}
      <div className="relative max-w-400 mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="bg-white px-4 py-3 rounded-lg inline-block mb-6">
              <Image
                src="/paan-logo.png"
                alt="Paanshala"
                width={120}
                height={36}
                className="w-28 h-auto"
              />
            </div>
            <p className="text-body text-sm text-white/80 leading-relaxed mb-6">
              Explore our online paan store and indulge in the rich flavors and aromatic blends of traditional and innovative paan varieties.
            </p>
            
            {/* Newsletter */}
            {/* <div className="mt-6">
              <h4 className="text-heading text-sm uppercase tracking-wider text-white mb-3">
                Sign up for our delicious offers
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="We don't spam!"
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-bright transition-colors"
                />
                <button className="btn-gold px-6 text-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div> */}
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-heading text-base uppercase tracking-wider text-white mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat._id}>
                  <FooterLink href={`/collections/${cat.slug}`}>
                    {cat.name}
                  </FooterLink>
                </li>
              ))}
              <li><FooterLink href="/create-your-paan">Create Your Box</FooterLink></li>
            </ul>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="text-heading text-base uppercase tracking-wider text-white mb-5">
              Explore
            </h4>
            <ul className="space-y-3">
              <li><FooterLink href="/our-story">Our Story</FooterLink></li>
              <li><FooterLink href="/journal">Journal</FooterLink></li>
              <li><FooterLink href="/experiences">Experiences</FooterLink></li>
              <li><FooterLink href="/career">Careers</FooterLink></li>
            </ul>
          </div>

          {/* Policies Column */}
          <div>
            <h4 className="text-heading text-base uppercase tracking-wider text-white mb-5">
              Our Policies
            </h4>
            <ul className="space-y-3">
              <li><FooterLink href="/terms">Terms & Conditions</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/return-policy">Return & Refund Policy</FooterLink></li>
              <li><FooterLink href="/shipping">Shipping & Delivery</FooterLink></li>
              <li><FooterLink href="/get-in-touch">Contact Us</FooterLink></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-heading text-base uppercase tracking-wider text-white mb-5">
              Contact Us
            </h4>
            
            {/* Contact Details */}
            <ul className="space-y-4 mb-6">
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold-bright shrink-0" strokeWidth={2.5} />
                  <a href={`tel:+91${phone}`} className="text-body text-sm text-white/90 hover:text-gold-bright transition-colors">
                    +91 {phone}
                  </a>
                </li>
              )}

              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold-bright shrink-0" strokeWidth={2.5} />
                  <a href={`mailto:${email}`} className="text-body text-sm text-white/90 hover:text-gold-bright transition-colors break-all">
                    {email}
                  </a>
                </li>
              )}

              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-bright shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-body text-sm text-white/90 leading-relaxed">{address}</p>
                </li>
              )}
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {social.instagram && (
                <SocialIcon href={social.instagram} icon={Instagram} label="Instagram" />
              )}
              {social.facebook && (
                <SocialIcon href={social.facebook} icon={Facebook} label="Facebook" />
              )}
              {social.youtube && (
                <SocialIcon href={social.youtube} icon={Youtube} label="YouTube" />
              )}
              {social.twitterX && (
                <SocialIcon href={social.twitterX} icon={Twitter} label="X" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-brand-green-dark">
        <div className="max-w-400 mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
            <p className="text-center md:text-left text-body">
              © {new Date().getFullYear()} Copyright Paanshala | All rights reserved
            </p>
            {/* <p className="text-center md:text-right text-body">
              Designed & Developed by{" "}
              <a
                href="https://aleczo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f4c430] hover:text-[#d4a574] transition-colors font-medium"
              >
                Aleczo Media Pvt. Ltd.
              </a>
            </p> */}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp */}
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

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════════════════════ */
function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-body text-sm text-white/80 hover:text-gold-bright transition-colors inline-block"
    >
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
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-bright flex items-center justify-center transition-all duration-300 hover:scale-110 group"
    >
      <Icon className="w-4 h-4 text-white group-hover:text-[#264B0E] transition-colors" strokeWidth={2.5} />
    </a>
  );
}

function WhatsAppIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={`${className} text-white`} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}