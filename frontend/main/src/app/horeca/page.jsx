"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useHorecaPageStore } from "@/stores/useHorecaPageStore";
import {
  Package,
  TrendingUp,
  Users,
  Calendar,
  Smartphone,
  Coffee,
  UtensilsCrossed,
  Building2,
  Hotel,
  Wine,
  PartyPopper,
} from "lucide-react";
import HorecaInquiryModal from "@/components/HorecaInquiryModal";

/* ── DEFAULT / FALLBACK CONTENT — used whenever admin hasn't set a field ── */
const DEFAULTS = {
  hero: {
    backgroundImage: "/horeca.png",
    heading: "HORECA",
    subheading:
      "Premium Paan Solutions For Hotels, Restaurants & Catering Services",
    ctaText: "GET IN TOUCH",
  },
  offerings: {
    heading: "OUR OFFERINGS",
    subheading: "Premium Fresh Paan Collection For Your Establishment",
  },
  whoWeServe: {
    heading: "WHO WE SERVE",
    subheading:
      "Paanshala partners with premium hospitality businesses to deliver authentic paan experiences to their guests.",
    cards: [
      {
        icon: Coffee,
        title: "Cafés",
        description:
          "Add a unique paan menu to your café — a talking point guests come back for.",
        accent: "from-amber-400 to-orange-400",
      },
      {
        icon: UtensilsCrossed,
        title: "Restaurants",
        description:
          "Elevate the after-dinner experience with a curated paan station.",
        accent: "from-emerald-500 to-green-600",
      },
      {
        icon: Building2,
        title: "Banquets",
        description:
          "Make every celebration memorable with a live paan counter for your guests.",
        accent: "from-rose-400 to-pink-500",
      },
      {
        icon: Hotel,
        title: "Hotels",
        description:
          "Offer guests a premium Indian tradition — from lobby lounges to room service.",
        accent: "from-blue-500 to-indigo-600",
      },
      {
        icon: Wine,
        title: "Clubs",
        description:
          "A sophisticated paan offering that pairs perfectly with your cocktail culture.",
        accent: "from-purple-500 to-violet-600",
      },
      {
        icon: PartyPopper,
        title: "Events",
        description:
          "Weddings, corporates, product launches — we bring the full paan experience.",
        accent: "from-[#d4af37] to-yellow-500",
      },
    ],
  },
  mobileApp: {
    isVisible: true,
    heading: "MOBILE APP",
    subheading: "Coming Soon For HORECA Partners",
    appTitle: "HORECA APP",
    appDescription:
      "Streamline your paan orders with our dedicated HORECA mobile application",
    badgeText: "Coming Soon",
    playStoreUrl: null,
    appStoreUrl: null,
    features: [
      {
        icon: Package,
        title: "Easy Bulk Ordering",
        description:
          "Order paan in bulk with just a few taps for your business needs",
      },
      {
        icon: TrendingUp,
        title: "Real-time Tracking",
        description: "Monitor your inventory and order status in real-time",
      },
      {
        icon: Users,
        title: "Dedicated Support",
        description:
          "Get assigned a personal account manager for your business",
      },
      {
        icon: Calendar,
        title: "Smart Scheduling",
        description: "Schedule deliveries according to your business hours",
      },
    ],
  },
};

/* ── helper: pick admin value if present/non-empty, else fallback ── */
const pick = (adminVal, fallbackVal) =>
  adminVal !== undefined && adminVal !== null && adminVal !== ""
    ? adminVal
    : fallbackVal;

export default function HorecaPage() {
  const { page, products, loading, fetchHorecaPage } = useHorecaPageStore();
  const [horecaModalOpen, setHorecaModalOpen] = useState(false);

  useEffect(() => {
    fetchHorecaPage();
  }, [fetchHorecaPage]);

  /* ── Merge admin content with defaults, field by field ── */
  const hero = {
    backgroundImage: pick(
      page?.hero?.backgroundImage,
      DEFAULTS.hero.backgroundImage,
    ),
    heading: pick(page?.hero?.heading, DEFAULTS.hero.heading),
    subheading: pick(page?.hero?.subheading, DEFAULTS.hero.subheading),
    ctaText: pick(page?.hero?.ctaText, DEFAULTS.hero.ctaText),
  };

  const offerings = {
    heading: pick(page?.offerings?.heading, DEFAULTS.offerings.heading),
    subheading: pick(
      page?.offerings?.subheading,
      DEFAULTS.offerings.subheading,
    ),
  };

  // Products: use admin-tagged products if any exist, else show nothing extra
  // (the section's empty state already handles zero products gracefully)
  const offeringProducts = products?.length > 0 ? products : [];

  const whoWeServe = {
    heading: pick(page?.whoWeServe?.heading, DEFAULTS.whoWeServe.heading),
    subheading: pick(
      page?.whoWeServe?.subheading,
      DEFAULTS.whoWeServe.subheading,
    ),
    // Admin cards (image-based) take priority; fall back to hardcoded icon cards
    cards:
      page?.whoWeServe?.cards?.length > 0
        ? page.whoWeServe.cards
        : DEFAULTS.whoWeServe.cards,
    usingAdminCards: page?.whoWeServe?.cards?.length > 0,
  };

  const mobileApp = {
    isVisible: page?.mobileApp?.isVisible ?? DEFAULTS.mobileApp.isVisible,
    heading: pick(page?.mobileApp?.heading, DEFAULTS.mobileApp.heading),
    subheading: pick(
      page?.mobileApp?.subheading,
      DEFAULTS.mobileApp.subheading,
    ),
    appTitle: pick(page?.mobileApp?.appTitle, DEFAULTS.mobileApp.appTitle),
    appDescription: pick(
      page?.mobileApp?.appDescription,
      DEFAULTS.mobileApp.appDescription,
    ),
    badgeText: pick(page?.mobileApp?.badgeText, DEFAULTS.mobileApp.badgeText),
    playStoreUrl:
      page?.mobileApp?.playStoreUrl || DEFAULTS.mobileApp.playStoreUrl,
    appStoreUrl: page?.mobileApp?.appStoreUrl || DEFAULTS.mobileApp.appStoreUrl,
    features: DEFAULTS.mobileApp.features, // app features stay static — not admin-managed
  };

  return (
    <div className="min-h-screen bg-cream-light">
      {/* ── HERO ── */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={hero.backgroundImage}
            alt="Paanshala HORECA"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl mb-4 sm:mb-8 leading-none"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              {hero.heading}
            </h1>

            <p className="text-[#f5e6d3] text-base sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              {hero.subheading}
            </p>

            <button
              onClick={() => setHorecaModalOpen(true)}
              className="inline-flex items-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] text-[#1a1a1a] px-6 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              {hero.ctaText}
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path
              fill="#f5e6d3"
              d="M0,40L80,45C160,50,320,60,480,55C640,50,800,30,960,25C1120,20,1280,30,1360,35L1440,40L1440,80L0,80Z"
            />
          </svg>
        </div>
      </section>

      {/* ── OUR OFFERINGS ── */}
      <section className="bg-[#f5e6d3] py-14 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2
              className="text-[#1a1a1a] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              {offerings.heading}
            </h2>
            <p className="text-gray-dark text-base sm:text-xl max-w-3xl mx-auto px-4">
              {offerings.subheading}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/50 rounded-2xl sm:rounded-3xl h-52 sm:h-80" />
                </div>
              ))}
            </div>
          ) : offeringProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {offeringProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={() => setHorecaModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-[#264B0E] mx-auto mb-4 opacity-50" />
              <p className="text-gray-dark text-lg">
                No paan products available at the moment
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section className="bg-[#f5e6d3] pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8 sm:mb-12">
            <h2
              className="text-[#1a1a1a] text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              {whoWeServe.heading}
            </h2>
            <p className="text-[#6b6b6b] text-base sm:text-xl max-w-2xl">
              {whoWeServe.subheading}
            </p>
          </div>

          {/* 2-col on mobile, 3-col on md+ */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {whoWeServe.usingAdminCards
              ? whoWeServe.cards.map((card) => (
                  <WhoWeServeCardImage
                    key={card._id}
                    image={card.image}
                    title={card.title}
                    description={card.description}
                    onClick={() => setHorecaModalOpen(true)}
                  />
                ))
              : whoWeServe.cards.map((card) => (
                  <WhoWeServeCard
                    key={card.title}
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    accent={card.accent}
                    onClick={() => setHorecaModalOpen(true)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Wave transition */}
      <div className="bg-[#f5e6d3]">
        <svg viewBox="0 0 1440 80" className="w-full h-auto">
          <path
            fill="#fff"
            d="M0,40L80,45C160,50,320,60,480,55C640,50,800,30,960,25C1120,20,1280,30,1360,35L1440,40L1440,80L0,80Z"
          />
        </svg>
      </div>

      {/* ── MOBILE APP ── */}
      {mobileApp.isVisible && (
        <section className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2
                className="text-[#1a1a1a] text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4"
                style={{
                  fontFamily: "var(--font-special-gothic-condensed-one)",
                }}
              >
                {mobileApp.heading}
              </h2>
              <p className="text-[#6b6b6b] text-base sm:text-xl">
                {mobileApp.subheading}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
              {/* App preview */}
              <div className="relative">
                <div className="bg-linear-to-br from-[#264B0E] to-brand-green-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold-bright/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

                  <div className="relative z-10">
                    <Smartphone className="w-14 h-14 sm:w-20 sm:h-20 text-gold-bright mx-auto mb-4 sm:mb-6" />

                    <h3
                      className="text-white text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4"
                      style={{
                        fontFamily: "var(--font-special-gothic-condensed-one)",
                      }}
                    >
                      {mobileApp.appTitle}
                    </h3>

                    <p className="text-sage-light text-sm sm:text-lg mb-6 sm:mb-8">
                      {mobileApp.appDescription}
                    </p>

                    <div className="inline-flex items-center gap-2 bg-gold-bright text-[#1a1a1a] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full mb-6 sm:mb-8">
                      <span className="font-bold uppercase tracking-wide text-xs sm:text-sm">
                        {mobileApp.badgeText}
                      </span>
                    </div>

                    {/* Store badges — link out if URL set, else show as disabled */}
                    <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4">
                      {mobileApp.playStoreUrl ? (
                        <a
                          href={mobileApp.playStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src="/playstore.png"
                            alt="Get it on Google Play"
                            width={140}
                            height={42}
                            className="w-36 sm:w-46 h-auto object-contain hover:scale-105 transition-transform"
                          />
                        </a>
                      ) : (
                        <div className="cursor-not-allowed opacity-70">
                          <Image
                            src="/playstore.png"
                            alt="Get it on Google Play"
                            width={140}
                            height={42}
                            className="w-36 sm:w-46 h-auto object-contain"
                          />
                        </div>
                      )}
                      {mobileApp.appStoreUrl ? (
                        <a
                          href={mobileApp.appStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src="/appstore.png"
                            alt="Download on the App Store"
                            width={140}
                            height={42}
                            className="w-32 sm:w-40 h-auto object-contain hover:scale-105 transition-transform"
                          />
                        </a>
                      ) : (
                        <div className="cursor-not-allowed opacity-70">
                          <Image
                            src="/appstore.png"
                            alt="Download on the App Store"
                            width={140}
                            height={42}
                            className="w-32 sm:w-40 h-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-cream-light rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-xl border-2 border-[#f5e6d3]">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl text-[#1a1a1a] mb-6 sm:mb-8"
                  style={{
                    fontFamily: "var(--font-special-gothic-condensed-one)",
                  }}
                >
                  APP FEATURES
                </h3>

                <ul className="space-y-4 sm:space-y-6">
                  {mobileApp.features.map((feature) => (
                    <FeatureItem
                      key={feature.title}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <HorecaInquiryModal
        isOpen={horecaModalOpen}
        onClose={() => setHorecaModalOpen(false)}
      />
    </div>
  );
}

/* ── PRODUCT CARD ── */
function ProductCard({ product, onClick }) {
  const displayImage = product.images?.[0] || "/placeholder-paan.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <button
        onClick={onClick}
        className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <div className="relative aspect-square bg-cream-light overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="p-3 sm:p-6 text-center">
          <h3
            className="text-[#1a1a1a] text-base sm:text-xl md:text-2xl line-clamp-2"
            style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
          >
            {product.name}
          </h3>
        </div>
      </button>
    </motion.div>
  );
}

/* ── FEATURE ITEM ── */
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <li className="flex items-start gap-3 sm:gap-4">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div>
        <h4 className="text-[#1a1a1a] font-bold text-base sm:text-lg mb-0.5 sm:mb-1">
          {title}
        </h4>
        <p className="text-[#6b6b6b] leading-relaxed text-sm">{description}</p>
      </div>
    </li>
  );
}

/* ── WHO WE SERVE CARD — fallback, icon-based ── */
function WhoWeServeCard({ icon: Icon, title, description, accent, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left bg-white hover:bg-cream-light rounded-2xl sm:rounded-3xl p-4 sm:p-8 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-[#d4af37]/50 h-full flex flex-col cursor-pointer"
      >
        <div
          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br ${accent} flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md`}
        >
          <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
        </div>

        <h3
          className="text-[#1a1a1a] text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3"
          style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
        >
          {title}
        </h3>

        <p className="text-[#6b6b6b] leading-relaxed text-xs sm:text-sm flex-1">
          {description}
        </p>
      </button>
    </motion.div>
  );
}

/* ── WHO WE SERVE CARD — admin, image-based ── */
function WhoWeServeCardImage({ image, title, description, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left bg-white hover:bg-cream-light rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-[#d4af37]/50 h-full flex flex-col cursor-pointer"
      >
        <div className="relative aspect-4/3 sm:aspect-square overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="p-4 sm:p-6 flex flex-col flex-1">
          <h3
            className="text-[#1a1a1a] text-lg sm:text-2xl md:text-3xl mb-1.5 sm:mb-3"
            style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
          >
            {title}
          </h3>
          <p className="text-[#6b6b6b] leading-relaxed text-xs sm:text-sm flex-1">
            {description}
          </p>
        </div>
      </button>
    </motion.div>
  );
}