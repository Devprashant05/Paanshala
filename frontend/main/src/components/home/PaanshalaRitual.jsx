"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const AUTO_SLIDE_MS = 3000; // auto-advance every 3 s

export default function PaanshalaRitual() {
  const { products, filterProducts, loading } = useProductStore();

  /* ── fetch isPaan products on mount ── */
  useEffect(() => {
    // Filter only paan products — adjust param key to match your API
    filterProducts({ isPaan: true });
  }, []);

  /* Only show paan products */
  const paanProducts = products.filter((p) => p.isPaan);

  return (
    <section className="relative bg-linear-to-b from-white via-[#fafaf6] to-white overflow-hidden">
      {/* ── Section heading ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37]/20 to-[#f4d03f]/20 px-4 py-2 rounded-full mb-4">
            <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              SIGNATURE PAAN
            </span>
          </div> */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Paanshala's{" "}
            <span className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Special Paan
            </span>
          </h2>
        </motion.div>
      </div>

      {/* ── Main split layout ── */}
      <div className="w-full mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row overflow-hidden shadow-2xl min-h-105 md:min-h-125"
        >
          {/* ── LEFT: hero image ── */}
          <div className="relative lg:w-[52%] min-h-65 sm:min-h-85 lg:min-h-0 shrink-0 overflow-hidden bg-[#FFC929]">
            <Image
              src="/paan-hero.webp"
              alt="Paanshala Special Paan"
              fill
              className="object-contain"
              priority
            />
            {/* Dark overlay for text legibility */}
            {/* <div className="absolute inset-0 bg-linear-to-r from-black/20 via-black/20 to-transparent" /> */}

            {/* Overlay text */}
            {/* <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-[#f4d03f] text-xs font-bold uppercase tracking-[0.2em] mb-3"
              >
                Handcrafted with Love
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                viewport={{ once: true }}
                className="text-white text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Elevate Your
                <br />
                Paan Experience.
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/create-your-paan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] hover:bg-[#c49d2f] text-black font-bold rounded-full text-sm transition-all shadow-lg hover:shadow-xl"
                >
                  Create Your Paan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div> */}
          </div>

          {/* ── RIGHT: product carousel ── */}
          <div className="flex-1 bg-white flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2d5016]" />
              </div>
            ) : paanProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 py-12 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-200" />
                <p className="text-gray-400 text-sm">
                  No paan products available yet.
                </p>
              </div>
            ) : (
              <PaanCarousel products={paanProducts} />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════
   PAAN CAROUSEL
   Shows 2 cards at a time, auto-advances every 3s
═══════════════════════════════ */
function PaanCarousel({ products }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const timerRef = useRef(null);

  const total = products.length;
  /* How many cards visible depends on container width — we track via state */
  const [visCount, setVisCount] = useState(2);
  const containerRef = useRef(null);

  /* Measure container to decide visible count */
  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      setVisCount(entry.contentRect.width < 380 ? 1 : 2);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const maxIndex = Math.max(0, total - visCount);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  /* Auto-advance */
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, AUTO_SLIDE_MS);
  }, [goNext]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const handlePrev = () => {
    goPrev();
    resetTimer();
  };
  const handleNext = () => {
    goNext();
    resetTimer();
  };

  const visibleProducts = products.slice(current, current + visCount);
  // If we're near the end and don't have enough, wrap around
  if (visibleProducts.length < visCount) {
    visibleProducts.push(
      ...products.slice(0, visCount - visibleProducts.length),
    );
  }

  const dotCount = maxIndex + 1;

  return (
    <div className="flex flex-col flex-1 p-5 md:p-7 gap-5">
      {/* Cards row */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex gap-4 h-full"
          >
            {visibleProducts.map((product, i) => (
              <div key={`${product._id}-${i}`} className="flex-1 min-w-0">
                <PaanCard product={product} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
                resetTimer();
              }}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-6 h-2.5 bg-[#2d5016]"
                  : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300",
              )}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#2d5016] hover:text-white text-gray-600 flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-9 h-9 rounded-full bg-[#2d5016] hover:bg-[#3d6820] text-white flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   PAAN PRODUCT CARD
═══════════════════════════════ */
function PaanCard({ product }) {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const images = product.images || [];
  const hasVariants = product.isPaan && product.variants?.length > 0;

  /* Price range for paan variants */
  const priceRange = hasVariants
    ? (() => {
        const prices = product.variants.map((v) => v.discountedPrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
      })()
    : `₹${product.discountedPrice}`;

  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;
  const originalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;
  const discount =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    /* Paan always goes to detail page for variant selection */
    window.location.href = `/shop/${product.slug}`;
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-400 overflow-hidden h-full">
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block overflow-hidden bg-gray-50 shrink-0"
        style={{ paddingBottom: "68%" }}
      >
        <Image
          src={images[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow z-10">
            {discount}% OFF
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold text-xs">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/shop/${product.slug}`}>
          <h4 className="font-bold text-[13px] md:text-sm text-gray-900 leading-snug line-clamp-2 mb-1.5 hover:text-[#2d5016] transition-colors">
            {product.name}
          </h4>
        </Link>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
            <span className="text-[11px] font-semibold text-gray-600">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">
              ({product.totalReviews})
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Price */}
        <p className="text-sm font-extrabold text-gray-900 mb-3">
          {priceRange}
          {hasVariants && (
            <span className="text-[10px] text-black font-normal ml-1">
              onwards
            </span>
          )}
        </p>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            "w-full py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5",
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white shadow-sm",
          )}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              Select Options
            </>
          )}
        </button>
      </div>
    </div>
  );
}