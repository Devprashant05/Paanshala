"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import {
  ChevronRight,
  Phone,
  Mail,
  Building2,
  Users,
  Calendar,
  Gift,
  Smartphone,
  Apple,
  Download,
  Star,
  Package,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

/* =========================
   MAIN HORECA PAGE
========================= */
export default function HorecaPage() {
  const { products, loading, fetchAllProducts } = useProductStore();
  const [paanProducts, setPaanProducts] = useState([]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    // Filter only paan category products
    if (products.length > 0) {
      const filteredPaan = products.filter(
        (product) => product.parentCategory?.name === "Fresh Paan",
      );
      setPaanProducts(filteredPaan);
    }
  }, [products]);

  return (
    <div className="min-h-screen bg-cream-light">
      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/horeca.png"
            alt="Paanshala HORECA"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay with Green Tint */}
          <div className="absolute inset-0 bg-linear-to-b from-[#1a1a1a]/80 via-[#1a1a1a]/70 to-[#1a1a1a]/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 md:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-white text-6xl md:text-7xl lg:text-8xl xl:text-9xl mb-8 leading-none"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              HORECA
            </h1>

            <p className="text-[#f5e6d3] text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Premium Paan Solutions For Hotels, Restaurants & Catering Services
            </p>

            <Link
              href="#contact"
              className="inline-flex items-center gap-3 bg-linear-to-r from-gold-bright to-[#d4a574] text-[#1a1a1a] px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              GET IN TOUCH
            </Link>
          </motion.div>
        </div>

        {/* Wavy Bottom Transition to Cream */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#00000001"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* =========================
          OUR OFFERINGS - PAAN PRODUCTS
      ========================== */}
      <section className="bg-[#f5e6d3] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              className="text-[#1a1a1a] text-5xl md:text-6xl lg:text-7xl mb-6"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              OUR OFFERINGS
            </h2>
            <p className="text-gray-dark text-xl max-w-3xl mx-auto">
              Premium Fresh Paan Collection For Your Establishment
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/50 rounded-3xl h-80" />
                </div>
              ))}
            </div>
          ) : paanProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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

      {/* =========================
          GIFTING CATEGORIES
      ========================== */}
      <section className="bg-[#f5e6d3] pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="mb-12">
            <h2
              className="text-[#1a1a1a] text-4xl md:text-5xl lg:text-6xl mb-4"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              GIFTING
            </h2>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <GiftingCard
              icon={Calendar}
              title="EVENTS"
              description="Premium paan counters for corporate events and gatherings"
            />
            <GiftingCard
              icon={Gift}
              title="FESTIVE GIFTS"
              description="Curated paan gift boxes for festivals and celebrations"
            />
            <GiftingCard
              icon={Users}
              title="WEDDINGS"
              description="Exclusive paan service for your special day"
            />
          </div>
        </div>
      </section>

      {/* Wavy Transition to White */}
      <div className="bg-[#f5e6d3]">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#fff"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>

      {/* =========================
          MOBILE APP SECTION
      ========================== */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              className="text-[#1a1a1a] text-4xl md:text-5xl lg:text-6xl mb-4"
              style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
            >
              MOBILE APP
            </h2>
            <p className="text-[#6b6b6b] text-xl">
              Coming Soon For HORECA Partners
            </p>
          </div>

          {/* App Preview Cards */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* App Preview Mockup */}
            <div className="relative">
              <div className="bg-linear-to-br from-[#264B0E] to-brand-green-dark rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-bright/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <Smartphone className="w-20 h-20 text-gold-bright mx-auto mb-6" />

                  <h3
                    className="text-white text-3xl md:text-4xl mb-4"
                    style={{
                      fontFamily: "var(--font-special-gothic-condensed-one)",
                    }}
                  >
                    HORECA APP
                  </h3>

                  <p className="text-sage-light text-lg mb-8">
                    Streamline your paan orders with our dedicated HORECA mobile
                    application
                  </p>

                  {/* Coming Soon Badge */}
                  <div className="inline-flex items-center gap-2 bg-gold-bright text-[#1a1a1a] px-6 py-3 rounded-full mb-8">
                    <span className="font-bold uppercase tracking-wide text-sm">
                      Coming Soon
                    </span>
                  </div>

                  {/* App Store Badges */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Google Play Badge */}
                    <div className="relative cursor-not-allowed">
                      <Image
                        src="/playstore.png"
                        alt="Get it on Google Play"
                        width={160}
                        height={48}
                        className="w-46 h-auto object-contain"
                      />
                    </div>

                    {/* App Store Badge */}
                    <div className="relative cursor-not-allowed">
                      <Image
                        src="/appstore.png"
                        alt="Download on the App Store"
                        width={160}
                        height={48}
                        className="w-40 h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-cream-light rounded-3xl p-12 shadow-xl border-2 border-[#f5e6d3]">
              <div className="flex items-center gap-3 mb-8">
                <h3
                  className="text-2xl md:text-3xl text-[#1a1a1a]"
                  style={{
                    fontFamily: "var(--font-special-gothic-condensed-one)",
                  }}
                >
                  APP FEATURES
                </h3>
              </div>

              <ul className="space-y-6">
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

          {/* Notify Me CTA */}
          {/* <div className="bg-gradient-to-br from-[#f4c430] to-[#d4a574] rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle, #264B0E 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <Download className="w-5 h-5 text-[#1a1a1a]" />
                <span className="text-heading text-sm text-[#1a1a1a] uppercase tracking-wider">
                  Launch Alert
                </span>
              </div>

              <h3
                className="text-3xl md:text-4xl lg:text-5xl text-[#1a1a1a] mb-6"
                style={{
                  fontFamily: "var(--font-special-gothic-condensed-one)",
                }}
              >
                BE THE FIRST TO KNOW
              </h3>

              <p className="text-[#2d2d2d] text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                Get notified when we launch our HORECA mobile app. Be among the
                first to experience seamless paan ordering on the go!
              </p>

              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-xl bg-white text-[#1a1a1a] placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#264B0E] shadow-lg"
                  />
                  <button
                    className="inline-flex items-center justify-center gap-3 bg-[#264B0E] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#1a3509] transition-all duration-300 shadow-xl whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-special-gothic-condensed-one)",
                    }}
                  >
                    NOTIFY ME
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-[#2d2d2d] mt-4">
                  We'll send you an email when the app launches. No spam, ever.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    </div>
  );
}

/* =========================
   PRODUCT CARD COMPONENT
========================= */
function ProductCard({ product }) {
  const displayImage = product.images?.[0] || "/placeholder-paan.png";

  // Get price - handle both paan (variants) and non-paan products
  const getPrice = () => {
    if (product.isPaan && product.variants?.length > 0) {
      return (
        product.variants[0].discountedPrice || product.variants[0].originalPrice
      );
    }
    return product.discountedPrice || product.originalPrice;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Product Image */}
        <div className="relative aspect-square bg-cream-light overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="p-6 text-center">
          <h3
            className="text-[#1a1a1a] text-xl md:text-2xl mb-2 line-clamp-2"
            style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
          >
            {product.name}
          </h3>
          {/* <p className="text-[#264B0E] text-lg font-bold">₹{getPrice()}</p> */}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================
   FEATURE ITEM COMPONENT
========================= */
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <li className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h4 className="text-[#1a1a1a] font-bold text-lg mb-1">{title}</h4>
        <p className="text-[#6b6b6b] leading-relaxed">{description}</p>
      </div>
    </li>
  );
}

/* =========================
   GIFTING CARD COMPONENT
========================= */
function GiftingCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="bg-white hover:bg-cream-light rounded-3xl p-10 text-center transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-gold-bright">
        {/* Icon Circle */}
        <div className="w-24 h-24 rounded-full bg-linear-to-br from-gold-bright to-[#d4a574] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h3
          className="text-2xl md:text-3xl text-[#1a1a1a] mb-4"
          style={{ fontFamily: "var(--font-special-gothic-condensed-one)" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#6b6b6b] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
