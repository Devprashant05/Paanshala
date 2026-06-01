"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import {
  ShoppingBag,
  Star,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";
import { useRouter } from "next/navigation";

const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;
const HIDDEN_CATEGORIES = ["Fresh Paan"];

// Slide transition styles — pure CSS, no framer-motion overhead on tab switch
const slideStyles = {
  idle: {
    transform: "translateX(0)",
    opacity: 1,
    transition:
      "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s ease",
  },
  exit: {
    transform: "translateX(-4%)",
    opacity: 0,
    transition: "transform 0.15s ease-in, opacity 0.15s ease-in",
  },
  enter: { transform: "translateX(4%)", opacity: 0, transition: "none" },
};

export default function BannerStyle() {
  // ── Stores ──────────────────────────────────────────────────
  const { filteredProducts, filterProducts, loading } = useProductStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

  // ── UI state ─────────────────────────────────────────────────
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeTabId, setActiveTabId] = useState(null);
  const [slideState, setSlideState] = useState("idle");

  // All featured products fetched once — never cleared
  const [allFeatured, setAllFeatured] = useState([]);
  // Stable displayed slice — only swapped after slide-out completes
  const [stableProducts, setStableProducts] = useState([]);

  const slideTimer = useRef(null);
  const prevTabId = useRef(null);

  // ── Boot: fetch categories + ALL featured products once ──────
  useEffect(() => {
    fetchActiveCategories();
  }, []);

  // Once categories are loaded, fire a single fetch for ALL featured products
  useEffect(() => {
    if (categories.length > 0 && allFeatured.length === 0 && !loading) {
      filterProducts({ isFeatured: true });
    }
  }, [categories]);

  // When the store returns products, capture them as our master list
  useEffect(() => {
    if (!loading && filteredProducts.length > 0 && allFeatured.length === 0) {
      setAllFeatured(filteredProducts);
    }
  }, [filteredProducts, loading]);

  // ── Auto-select first visible category ───────────────────────
  const visibleCategories = useMemo(
    () => categories.filter((c) => !HIDDEN_CATEGORIES.includes(c.name)),
    [categories],
  );

  useEffect(() => {
    if (visibleCategories.length > 0 && !activeTabId)
      setActiveTabId(visibleCategories[0]._id);
  }, [visibleCategories]);

  // ── Client-side filter — pure JS, zero API calls ─────────────
  const computedProducts = useMemo(() => {
    if (!activeTabId || allFeatured.length === 0) return [];
    return allFeatured
      .filter((p) => {
        const parentId = resolveId(p.parentCategory);
        const catId = resolveId(p.category);
        return parentId === activeTabId || catId === activeTabId;
      })
      .slice(0, 8);
  }, [allFeatured, activeTabId]);

  // ── Trigger slide transition only when computed products change ─
  const prevProductKey = useRef("");
  useEffect(() => {
    const newKey = computedProducts.map((p) => p._id).join(",");
    if (newKey === prevProductKey.current) return;
    prevProductKey.current = newKey;

    // Initial population — no animation
    if (stableProducts.length === 0) {
      setStableProducts(computedProducts);
      setSlideState("idle");
      return;
    }

    // Tab switch — slide out → swap → slide in
    clearTimeout(slideTimer.current);
    setSlideState("exit");
    slideTimer.current = setTimeout(() => {
      setStableProducts(computedProducts);
      setSlideState("enter");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setSlideState("idle")),
      );
    }, 155);

    return () => clearTimeout(slideTimer.current);
  }, [computedProducts]);

  // ── Reset scroll position on tab change ─────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [activeTabId]);

  // ── Scroll arrows ────────────────────────────────────────────
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [stableProducts, checkScroll]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.querySelector("[data-card]")?.offsetWidth ?? 220;
    el.scrollBy({
      left: dir === "left" ? -(cardW * 2 + 16) : cardW * 2 + 16,
      behavior: "smooth",
    });
  };

  const handleTabChange = (id) => {
    if (id !== activeTabId) setActiveTabId(id);
  };

  const activeRoot = categories.find((c) => c._id === activeTabId);
  const seeAllHref = activeRoot ? `/collections/${activeRoot.slug}` : "/shop";
  const isInitialLoad = loading && allFeatured.length === 0;
  const bannerBgImage = stableProducts[0]?.images?.[0] ?? null;

  return (
    <section
      className="relative py-10 md:py-16 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #fafaf6, #fff, #fafaf6)",
      }}
    >
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-[#2d5016]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 flex flex-col gap-5 md:gap-6">
        {/* ══════════════════════════════════════
            CINEMATIC BANNER
        ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden"
          style={{ minHeight: "clamp(180px, 28vw, 320px)" }}
        >
          {/* Blurred product image as banner background */}
          <div className="absolute inset-0">
            {bannerBgImage ? (
              <>
                <Image
                  src={bannerBgImage}
                  alt=""
                  fill
                  className="object-cover scale-110"
                  style={{
                    filter: "blur(18px) brightness(0.35) saturate(0.7)",
                  }}
                  sizes="100vw"
                  priority
                  aria-hidden
                />
                <div className="absolute inset-0 bg-[#0d1f05]/60" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f05] via-[#1a3009] to-[#2d5016]" />
            )}
          </div>

          {/* Decorative orbs */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 md:w-72 md:h-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-36 h-36 md:w-56 md:h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(45,80,22,0.4) 0%, transparent 70%)",
            }}
          />

          {/* Banner content */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 p-6 md:p-8 lg:p-10">
            {/* Left — headline */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  This week's picks
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 md:mb-3">
                Signature{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(to right, #d4af37, #f0d060, #d4af37)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Collections
                </span>
              </h2>
              <p className="text-sm md:text-base text-white/55 leading-relaxed max-w-lg">
                Hand-crafted paans and delicacies, chosen for those who
                appreciate authenticity and indulgence.
              </p>
            </div>

            {/* Right — tabs + CTA */}
            <div className="flex flex-col gap-4 md:items-end shrink-0">
              {visibleCategories.length > 0 && (
                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <div className="flex items-center gap-2 min-w-max">
                    {visibleCategories.map((cat) => (
                      <motion.button
                        key={cat._id}
                        onClick={() => handleTabChange(cat._id)}
                        className={cn(
                          "relative px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                          activeTabId === cat._id
                            ? "text-[#1a3009] shadow-lg"
                            : "bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white",
                        )}
                        style={
                          activeTabId === cat._id
                            ? {
                                background:
                                  "linear-gradient(to right, #d4af37, #f0d060)",
                              }
                            : {}
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cat.name}
                        {activeTabId === cat._id && (
                          <motion.span
                            layoutId="tab-dot-cin"
                            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1a3009]"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              <Link
                href={seeAllHref}
                className="group inline-flex items-center gap-2 bg-white text-[#2d5016] font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:bg-[#d4af37] hover:text-[#1a3009] transition-all duration-200 self-start md:self-auto"
              >
                See All {activeRoot?.name || "Products"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
        </motion.div>

        {/* ══════════════════════════════════════
            PRODUCT STRIP
        ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
        >
          <div
            className="overflow-hidden"
            style={{
              ...slideStyles[slideState],
              pointerEvents: slideState !== "idle" ? "none" : "auto",
            }}
          >
            {isInitialLoad ? (
              <StripSkeleton />
            ) : stableProducts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="relative">
                {canScrollLeft && (
                  <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                )}

                <div
                  ref={scrollRef}
                  className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                >
                  {stableProducts.map((product) => (
                    <div
                      key={product._id}
                      data-card
                      className="snap-start shrink-0 w-[72%] sm:w-[48%] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
                    >
                      <StripCard product={product} />
                    </div>
                  ))}
                </div>

                {canScrollRight && (
                  <div
                    className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to left, #fff 0%, transparent 100%)",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════
   STRIP CARD
═══════════════════════════════════════ */
function StripCard({ product }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();
  const { openCheckout } = useCheckoutUIStore();
  const { openGuestCheckout } = useGuestCheckoutUIStore();
  const [isAdding, setIsAdding] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isPaan = product.isPaan;
  const images = product.images || [];
  const hasVariants = isPaan && product.variants?.length > 0;
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

  const categoryName = resolveName(product.category);
  const parentName = resolveName(product.parentCategory);
  const displayLabel =
    categoryName && categoryName !== parentName
      ? categoryName
      : parentName || categoryName;

  const handleAdd = async (e) => {
    e?.stopPropagation?.();
    if (isOutOfStock) return;
    if (isPaan) {
      router.push(`/shop/${product.slug}`);
      return;
    }
    if (isAuthenticated) {
      setIsAdding(true);
      const ok = await addToCart({ productId: product._id, quantity: 1 });
      if (ok) toast.success("Added to cart!");
      openCart();
      setIsAdding(false);
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: images[0] ?? null,
        price: displayPrice,
        originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
      openCart();
    }
  };

  const handleBuyNow = async (e) => {
    e?.stopPropagation?.();
    if (isOutOfStock) return;
    if (isPaan) {
      router.push(`/shop/${product.slug}`);
      return;
    }
    if (isAuthenticated) {
      await addToCart({ productId: product._id, quantity: 1 });
      openCheckout();
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: images[0] ?? null,
        price: displayPrice,
        originalPrice,
        isPaan: false,
        variantSetSize: null,
        quantity: 1,
      });
      openGuestCheckout();
    }
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#2d5016]/25 hover:shadow-lg hover:shadow-[#2d5016]/8 hover:-translate-y-0.5 transition-all duration-300 h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="block relative overflow-hidden bg-[#f8f7f3]"
        style={{ paddingBottom: "100%" }}
      >
        {images[0] ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-contain absolute inset-0 transition-transform duration-500"
            style={{
              transform: hovered ? "scale(1.07)" : "scale(1)",
              padding: "8px",
            }}
            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 48vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isFeatured && (
            <span className="bg-[#d4af37] text-[#1a3009] text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              ✦ Popular
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#2d5016] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Hover arrow */}
        <div
          className={cn(
            "absolute top-2.5 right-2.5 z-10 transition-all duration-200",
            hovered ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
            <ArrowUpRight className="w-3 h-3 text-[#2d5016]" />
          </div>
        </div>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold text-[10px]">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick-add on hover */}
        {!isOutOfStock && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 px-3 pb-3 z-10 transition-all duration-200",
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            )}
          >
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="w-full py-2 rounded-xl bg-[#2d5016]/90 backdrop-blur-sm text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#d4af37] hover:text-[#1a3009] transition-colors shadow-lg"
            >
              {isAdding ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isPaan ? (
                <Eye className="w-3 h-3" />
              ) : (
                <ShoppingCart className="w-3 h-3" />
              )}
              {isPaan ? "View Options" : "Quick Add"}
            </button>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        <p className="text-[9px] md:text-[10px] text-[#2d5016]/70 uppercase tracking-[0.14em] font-semibold mb-1">
          {displayLabel}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-bold text-xs md:text-sm text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-[#2d5016] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center justify-between gap-1 mb-2.5">
          <div className="flex items-baseline gap-1">
            <span className="text-base md:text-lg font-extrabold text-[#2d5016]">
              ₹{displayPrice}
            </span>
            {discount > 0 && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[10px] md:text-[11px] font-semibold text-gray-700">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {isOutOfStock ? (
          <div className="w-full py-2 rounded-lg bg-gray-100 text-center text-gray-400 font-semibold text-xs">
            Out of Stock
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className={cn(
                "w-full py-2 md:py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
                isPaan
                  ? "border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                  : "bg-[#2d5016] text-white hover:bg-[#3d6820]",
              )}
            >
              {isAdding ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isPaan ? (
                <Eye className="w-3 h-3" />
              ) : null}
              {isPaan ? "Options" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-2 md:py-2.5 rounded-xl font-bold text-xs border-2 border-[#d4af37] text-[#2d5016] bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-[#1a3009] transition-all"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SKELETON + EMPTY
═══════════════════════════════════════ */
function StripSkeleton() {
  return (
    <div className="flex gap-3 md:gap-4 animate-pulse overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-[72%] sm:w-[48%] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] rounded-2xl bg-white border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-100" style={{ paddingBottom: "100%" }} />
          <div className="p-3 md:p-4 space-y-2">
            <div className="h-2.5 bg-gray-100 rounded w-1/3" />
            <div className="h-3.5 bg-gray-100 rounded w-3/4" />
            <div className="h-3.5 bg-gray-100 rounded w-1/2" />
            <div className="h-8 bg-gray-100 rounded mt-3" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 w-full">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No Featured Products Yet
      </h3>
      <p className="text-sm text-gray-500">
        Check back soon for our curated collections!
      </p>
    </div>
  );
}