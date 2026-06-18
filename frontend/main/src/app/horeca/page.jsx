"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
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

export default function HorecaPage() {
  const { products, loading, fetchAllProducts } = useProductStore();
  const [paanProducts, setPaanProducts] = useState([]);
  const [horecaModalOpen, setHorecaModalOpen] = useState(false);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    if (products.length > 0) {
      setPaanProducts(
        products.filter(
          (p) =>
            p.parentCategory?.name === "Fresh Paan" && p.isFeatured === true,
        ),
      );
    }
  }, [products]);

  return (
    <div className="min-h-screen bg-cream-light">
      {/* ── HERO ── */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/horeca.png"
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
              HORECA
            </h1>

            <p className="text-[#f5e6d3] text-base sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Premium Paan Solutions For Hotels, Restaurants & Catering Services
            </p>

            <button
              onClick={() => setHorecaModalOpen(true)}
              className="inline-flex items-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] text-[#1a1a1a] px-6 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              GET IN TOUCH
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
              OUR OFFERINGS
            </h2>
            <p className="text-gray-dark text-base sm:text-xl max-w-3xl mx-auto px-4">
              Premium Fresh Paan Collection For Your Establishment
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
          ) : paanProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {paanProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
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
              WHO WE SERVE
            </h2>
            <p className="text-[#6b6b6b] text-base sm:text-xl max-w-2xl">
              Paanshala partners with premium hospitality businesses to deliver
              authentic paan experiences to their guests.
            </p>
          </div>

          {/* 2-col on mobile, 3-col on md+ */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <WhoWeServeCard
              icon={Coffee}
              title="Cafés"
              description="Add a unique paan menu to your café — a talking point guests come back for."
              accent="from-amber-400 to-orange-400"
            />
            <WhoWeServeCard
              icon={UtensilsCrossed}
              title="Restaurants"
              description="Elevate the after-dinner experience with a curated paan station."
              accent="from-emerald-500 to-green-600"
            />
            <WhoWeServeCard
              icon={Building2}
              title="Banquets"
              description="Make every celebration memorable with a live paan counter for your guests."
              accent="from-rose-400 to-pink-500"
            />
            <WhoWeServeCard
              icon={Hotel}
              title="Hotels"
              description="Offer guests a premium Indian tradition — from lobby lounges to room service."
              accent="from-blue-500 to-indigo-600"
            />
            <WhoWeServeCard
              icon={Wine}
              title="Clubs"
              description="A sophisticated paan offering that pairs perfectly with your cocktail culture."
              accent="from-purple-500 to-violet-600"
            />
            <WhoWeServeCard
              icon={PartyPopper}
              title="Events"
              description="Weddings, corporates, product launches — we bring the full paan experience."
              accent="from-[#d4af37] to-yellow-500"
            />
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
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2
              className="text-[#1a1a1a] text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              MOBILE APP
            </h2>
            <p className="text-[#6b6b6b] text-base sm:text-xl">
              Coming Soon For HORECA Partners
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
                    HORECA APP
                  </h3>

                  <p className="text-sage-light text-sm sm:text-lg mb-6 sm:mb-8">
                    Streamline your paan orders with our dedicated HORECA mobile
                    application
                  </p>

                  <div className="inline-flex items-center gap-2 bg-gold-bright text-[#1a1a1a] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full mb-6 sm:mb-8">
                    <span className="font-bold uppercase tracking-wide text-xs sm:text-sm">
                      Coming Soon
                    </span>
                  </div>

                  {/* Store badges — stack on very small, row on sm+ */}
                  <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4">
                    <div className="cursor-not-allowed opacity-70">
                      <Image
                        src="/playstore.png"
                        alt="Get it on Google Play"
                        width={140}
                        height={42}
                        className="w-36 sm:w-46 h-auto object-contain"
                      />
                    </div>
                    <div className="cursor-not-allowed opacity-70">
                      <Image
                        src="/appstore.png"
                        alt="Download on the App Store"
                        width={140}
                        height={42}
                        className="w-32 sm:w-40 h-auto object-contain"
                      />
                    </div>
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
                <FeatureItem
                  icon={Package}
                  title="Easy Bulk Ordering"
                  description="Order paan in bulk with just a few taps for your business needs"
                />
                <FeatureItem
                  icon={TrendingUp}
                  title="Real-time Tracking"
                  description="Monitor your inventory and order status in real-time"
                />
                <FeatureItem
                  icon={Users}
                  title="Dedicated Support"
                  description="Get assigned a personal account manager for your business"
                />
                <FeatureItem
                  icon={Calendar}
                  title="Smart Scheduling"
                  description="Schedule deliveries according to your business hours"
                />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <HorecaInquiryModal
        isOpen={horecaModalOpen}
        onClose={() => setHorecaModalOpen(false)}
      />
    </div>
  );
}

/* ── PRODUCT CARD ── */
function ProductCard({ product }) {
  const displayImage = product.images?.[0] || "/placeholder-paan.png";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
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
      </div>
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

/* ── WHO WE SERVE CARD ── */
function WhoWeServeCard({ icon: Icon, title, description, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="bg-white hover:bg-cream-light rounded-2xl sm:rounded-3xl p-4 sm:p-8 transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-[#d4af37]/50 h-full flex flex-col">
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
      </div>
    </motion.div>
  );
}