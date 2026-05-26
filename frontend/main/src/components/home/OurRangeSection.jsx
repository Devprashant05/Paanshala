"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProductStore } from "@/stores/useProductStore";
import { useCategoryStore } from "@/stores/useCategoryStore";

export default function OurRangeSection({
  parentCategorySlug = "mukhwas-and-more",
  title = "OUR RANGE",
}) {
  const { fetchSubcategoriesProducts, loading } = useProductStore();
  const { categories } = useCategoryStore();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const parentCategory = categories.find(
      (cat) => cat.slug === parentCategorySlug,
    );
    if (parentCategory?._id) {
      fetchData(parentCategory._id);
    }
  }, [categories, parentCategorySlug]);

  const fetchData = async (parentCategoryId) => {
    const result = await fetchSubcategoriesProducts(parentCategoryId);
    if (result && result.length > 0) {
      setProducts(result);
    }
  };

  // Auto-scroll for desktop
  const shouldAnimate = !isMobile && products.length > 2;
  const cardWidth = 340;
  const gap = 24;

  useAnimationFrame((time) => {
    if (shouldAnimate) {
      const totalWidth = products.length * (cardWidth + gap);
      setOffset((time / 35) % totalWidth);
    }
  });

  // Mobile navigation
  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Auto-play on mobile
  useEffect(() => {
    if (isMobile && products.length > 1) {
      const interval = setInterval(nextCard, 4000);
      return () => clearInterval(interval);
    }
  }, [isMobile, products.length, currentIndex]);

  if (loading) return <OurRangeSkeleton />;
  if (!products.length) return null;

  const displayProducts = shouldAnimate
    ? [...products, ...products, ...products]
    : products;

  return (
    <section className="relative bg-linear-to-b from-[#264B0E] to-brand-green-dark py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="max-w-450 mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="text-heading text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-3 md:mb-4 font-light px-4">
            {title}
          </h2>
          <div className="w-12 sm:w-16 h-px bg-gold-bright mx-auto" />
        </motion.div>

        {/* MOBILE: Single Card Carousel */}
        {isMobile ? (
          <div className="relative">
            {/* Cards Container */}
            <div className="overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${currentIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {products.map((product, index) => (
                  <div key={product._id} className="w-full shrink-0 px-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
              <>
                <button
                  onClick={prevCard}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white/90 backdrop-blur-sm text-[#264B0E] rounded-full p-2 shadow-lg z-20 hover:bg-white transition-all"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextCard}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white/90 backdrop-blur-sm text-[#264B0E] rounded-full p-2 shadow-lg z-20 hover:bg-white transition-all"
                  aria-label="Next product"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {products.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all ${
                      index === currentIndex
                        ? "w-8 h-2 bg-gold-bright"
                        : "w-2 h-2 bg-white/40 hover:bg-white/60"
                    } rounded-full`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* DESKTOP: Continuous Scroll */
          <div className="relative overflow-hidden -mx-6 md:-mx-12">
            <div
              className={`flex gap-6 ${!shouldAnimate ? "justify-center" : ""}`}
              style={
                shouldAnimate ? { transform: `translateX(-${offset}px)` } : {}
              }
            >
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={`${product._id}-${index}`}
                  product={product}
                />
              ))}
            </div>

            {/* Gradient Overlays */}
            {/* {shouldAnimate && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#1a3509] via-[#1a3509] to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#1a3509] via-[#1a3509] to-transparent pointer-events-none z-10" />
              </>
            )} */}
          </div>
        )}

        {/* Count Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <p className="text-white/60 text-xs sm:text-sm">
            {isMobile && products.length > 1
              ? `${currentIndex + 1} / ${products.length}`
              : `Showing ${products.length} ${products.length === 1 ? "variety" : "varieties"}`}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CARD - Optimized for Single View on Mobile
═══════════════════════════════════════════════════════════════ */
function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      className="shrink-0 w-full md:w-85 bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-lg mx-auto max-w-95 md:max-w-none"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-8 md:p-10 transition-transform duration-700 ease-out"
          style={{ transform: isHovered ? "scale(1.06)" : "scale(1)" }}
          sizes="(max-width: 768px) 380px, 340px"
        />

        {/* Category Badge */}
        {product.category?.name && (
          <div className="absolute top-4 right-4">
            <span className="inline-block px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-[#264B0E] text-xs font-bold uppercase tracking-wider shadow-md">
              {product.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Title */}
        <h3 className="text-heading text-xl md:text-2xl text-[#1a1a1a] uppercase tracking-wide font-bold line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-body text-sm md:text-base text-gray-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Weight */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-heading text-2xl md:text-3xl text-[#264B0E] font-bold">
              ₹{product.discountedPrice}
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-body text-base md:text-lg text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          {product.baseWeight && (
            <span className="text-body text-sm md:text-base text-gray-500 font-semibold">
              {product.baseWeight}g
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-bright"></span>
            <span className="font-medium">100% Authentic</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-bright"></span>
            <span className="font-medium">Fresh Daily</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/shop/${product._id}`} className="block pt-2">
          <motion.button
            whileHover={{ backgroundColor: "#1a3509" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#264B0E] text-white py-3.5 md:py-4 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
            <span>Shop Now</span>
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </motion.div>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════════ */
function OurRangeSkeleton() {
  return (
    <section className="bg-linear-to-b from-[#264B0E] to-brand-green-dark py-12 sm:py-16 md:py-20">
      <div className="max-w-450 mx-auto px-4 sm:px-6 md:px-12">
        {/* Header Skeleton */}
        <div className="h-10 md:h-12 bg-white/10 rounded-lg w-48 sm:w-64 mx-auto mb-12 md:mb-16 animate-pulse" />

        {/* Cards Skeleton */}
        <div className="flex gap-6 overflow-hidden justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shrink-0 w-full md:w-85 max-w-95 md:max-w-none bg-white rounded-xl overflow-hidden animate-pulse mx-2 md:mx-0"
            >
              <div className="aspect-square bg-gray-100" />
              <div className="p-5 md:p-6 space-y-4">
                <div className="h-6 md:h-7 bg-gray-100 rounded w-3/4" />
                <div className="h-10 md:h-12 bg-gray-100 rounded" />
                <div className="h-8 md:h-10 bg-gray-100 rounded w-1/2" />
                <div className="h-12 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Count Skeleton */}
        <div className="h-4 bg-white/10 rounded w-32 mx-auto mt-8 md:mt-12 animate-pulse" />
      </div>
    </section>
  );
}
