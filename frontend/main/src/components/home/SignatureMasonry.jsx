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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";
import { useRouter } from "next/navigation";

const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;
const HIDDEN_CATEGORIES = ["Fresh Paan"];

const slideStyles = {
  idle: {
    transform: "translateX(0)",
    opacity: 1,
    transition:
      "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease",
  },
  exit: {
    transform: "translateX(-5%)",
    opacity: 0,
    transition: "transform 0.18s ease-in, opacity 0.18s ease-in",
  },
  enter: { transform: "translateX(5%)", opacity: 0, transition: "none" },
};

// Masonry layout pattern — alternates tall/short per column
// Each product gets a "size" that controls its card height
// Products with higher ratings/reviews get "tall", rest get "short"
// Pattern cycles across 4 columns so the grid looks organic
const COLUMN_PATTERNS = [
  ["tall", "short", "tall"], // col 0
  ["short", "tall", "short"], // col 1
  ["tall", "short", "short"], // col 2
  ["short", "tall", "tall"], // col 3
];

function assignSizes(products) {
  // Sort by rating desc so best products get tall slots
  const sorted = [...products].sort(
    (a, b) => (b.averageRating || 0) - (a.averageRating || 0),
  );
  // Distribute across 4 columns, row by row
  return sorted.map((p, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const pattern = COLUMN_PATTERNS[col];
    const size = pattern[row % pattern.length];
    return { ...p, _size: size };
  });
}

export default function SignatureMasonry() {
  const { filteredProducts, filterProducts, loading } = useProductStore();
  const { categories, fetchActiveCategories } = useCategoryStore();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeTabId, setActiveTabId] = useState(null);
  const [stableProducts, setStableProducts] = useState([]);
  const [slideState, setSlideState] = useState("idle");

  const fadeTimer = useRef(null);
  const hasLoadedOnce = useRef(false);
  const prevProductKey = useRef("");

  useEffect(() => {
    fetchActiveCategories();
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter((c) => !HIDDEN_CATEGORIES.includes(c.name)),
    [categories],
  );

  useEffect(() => {
    if (visibleCategories.length > 0 && !activeTabId)
      setActiveTabId(visibleCategories[0]._id);
  }, [visibleCategories]);

  useEffect(() => {
    if (!activeTabId) return;
    const root = categories.find((c) => c._id === activeTabId);
    const hasChildren = (root?.children?.length ?? 0) > 0;
    hasChildren
      ? filterProducts({ parentCategory: activeTabId, isFeatured: true })
      : filterProducts({ category: activeTabId, isFeatured: true });
  }, [activeTabId, categories]);

  const computedProducts = useMemo(() => {
    return filteredProducts
      .filter((p) => {
        if (!p.isFeatured) return false;
        if (!activeTabId) return true;
        return (
          resolveId(p.parentCategory) === activeTabId ||
          resolveId(p.category) === activeTabId
        );
      })
      .slice(0, 8);
  }, [filteredProducts, activeTabId]);

  useEffect(() => {
    if (loading) return;
    const newKey = computedProducts.map((p) => p._id).join(",");
    if (newKey === prevProductKey.current) return;
    prevProductKey.current = newKey;

    if (!hasLoadedOnce.current) {
      setStableProducts(computedProducts);
      setSlideState("idle");
      hasLoadedOnce.current = true;
      return;
    }

    clearTimeout(fadeTimer.current);
    setSlideState("exit");
    fadeTimer.current = setTimeout(() => {
      setStableProducts(computedProducts);
      setSlideState("enter");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setSlideState("idle")),
      );
    }, 180);
    return () => clearTimeout(fadeTimer.current);
  }, [computedProducts, loading]);

  // Reset mobile scroll on tab change
  useEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "instant" });
  }, [activeTabId]);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
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
    scrollContainerRef.current?.scrollBy({
      left:
        dir === "left"
          ? -scrollContainerRef.current.clientWidth
          : scrollContainerRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleTabChange = (id) => {
    if (id !== activeTabId) setActiveTabId(id);
  };

  const activeRoot = categories.find((c) => c._id === activeTabId);
  const seeAllHref = activeRoot ? `/collections/${activeRoot.slug}` : "/shop";

  // Build masonry columns for desktop
  const masonryProducts = useMemo(
    () => assignSizes(stableProducts),
    [stableProducts],
  );
  const columns = [0, 1, 2, 3].map((col) =>
    masonryProducts.filter((_, i) => i % 4 === col),
  );

  return (
    <section
      className="relative py-12 md:py-20 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #fafaf6, #fff, #fafaf6)",
      }}
    >
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#2d5016]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 md:mb-10"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-[#d4af37] uppercase mb-2">
            Curated for you
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3">
            Signature{" "}
            <span
              style={{
                background:
                  "linear-gradient(to right, #2d5016, #3d6820, #2d5016)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Collections
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">
            Hand-crafted paans and delicacies, chosen for those who appreciate
            authenticity.
          </p>
        </motion.div>

        {/* ── Tabs ── */}
        {visibleCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8 md:mb-12"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max px-2">
                {visibleCategories.map((cat) => (
                  <motion.button
                    key={cat._id}
                    onClick={() => handleTabChange(cat._id)}
                    className={cn(
                      "relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                      activeTabId === cat._id
                        ? "text-white shadow-lg shadow-[#2d5016]/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#2d5016]/40 hover:text-[#2d5016] shadow-sm",
                    )}
                    style={
                      activeTabId === cat._id
                        ? {
                            background:
                              "linear-gradient(to right, #2d5016, #3d6820)",
                          }
                        : {}
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cat.name}
                    {activeTabId === cat._id && (
                      <motion.span
                        layoutId="tab-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Content ── */}
        <div
          className="relative overflow-hidden"
          style={{
            ...slideStyles[slideState],
            pointerEvents: slideState !== "idle" ? "none" : "auto",
          }}
        >
          {stableProducts.length === 0 && loading ? (
            <MasonrySkeleton />
          ) : stableProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* ── DESKTOP: 4-column masonry ── */}
              <div className="hidden md:flex gap-4 lg:gap-5 items-start">
                {columns.map((col, colIdx) => (
                  <div
                    key={colIdx}
                    className="flex-1 flex flex-col gap-4 lg:gap-5"
                  >
                    {col.map((product) => (
                      <MasonryCard
                        key={product._id}
                        product={product}
                        size={product._size}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* ── MOBILE: horizontal scroll ── */}
              <div className="md:hidden relative">
                {canScrollLeft && (
                  <button
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6"
                >
                  {stableProducts.map((product) => (
                    <div
                      key={product._id}
                      className="snap-center shrink-0 basis-[82%]"
                    >
                      <MasonryCard product={product} size="tall" mobile />
                    </div>
                  ))}
                </div>
              </div>

              {/* See all */}
              <div className="mt-8 md:mt-10 text-center">
                <Link href={seeAllHref}>
                  <Button
                    size="lg"
                    className="text-white font-semibold px-8 h-13 text-sm md:text-base shadow-xl hover:opacity-90"
                    style={{
                      background: "linear-gradient(to right, #2d5016, #3d6820)",
                    }}
                  >
                    See All {activeRoot?.name || "Products"}
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.span>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
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
   MASONRY CARD
   size = "tall" | "short"
   tall  → product image takes more space, description visible
   short → compact, image smaller, no description
═══════════════════════════════════════ */
function MasonryCard({ product, size = "short", mobile = false }) {
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

  const isTall = size === "tall" || mobile;

  // Image padding-bottom determines card height ratio
  const imgPb = isTall ? "105%" : "72%";

  const handleAdd = async (e) => {
    e?.preventDefault?.();
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
        image: images[0] || null,
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
    e?.preventDefault?.();
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
        image: images[0] || null,
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
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-white border border-gray-100",
        "hover:shadow-xl hover:shadow-[#2d5016]/8 hover:-translate-y-1",
        "transition-all duration-400 ease-out",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image zone ── */}
      <Link
        href={`/shop/${product.slug}`}
        className="block relative overflow-hidden bg-gray-50"
        style={{ paddingBottom: imgPb }}
      >
        {/* Product image */}
        {images[0] ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-contain absolute inset-0 transition-transform duration-600 ease-out"
            style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
            sizes="(max-width: 768px) 85vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Dark gradient on tall cards for text readability */}
        {isTall && (
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="bg-[#d4af37] text-[#1a3009] text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
              ✦ Popular
            </span>
          )}
          {discount > 0 && (
            <span className="bg-[#2d5016] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Top-right quick link */}
        <div
          className={cn(
            "absolute top-3 right-3 z-10 transition-all duration-200",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2d5016]" />
          </div>
        </div>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full font-bold text-xs tracking-wide shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover CTA overlay — only on tall cards */}
        {isTall && !isOutOfStock && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 px-3 pb-3 z-10 transition-all duration-250",
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            )}
          >
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="w-full py-2.5 rounded-xl bg-white/95 backdrop-blur-sm text-[#2d5016] font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg hover:bg-[#d4af37] hover:text-[#1a3009] transition-colors"
            >
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPaan ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              {isPaan ? "View Options" : "Quick Add"}
            </button>
          </div>
        )}
      </Link>

      {/* ── Content zone ── */}
      <div className={cn("p-3", isTall ? "p-4" : "p-3")}>
        {/* Category label */}
        <p className="text-[9px] md:text-[10px] text-[#2d5016] uppercase tracking-[0.15em] font-semibold mb-1">
          {displayLabel}
        </p>

        {/* Title */}
        <Link href={`/shop/${product.slug}`}>
          <h3
            className={cn(
              "font-bold text-gray-900 leading-snug group-hover:text-[#2d5016] transition-colors",
              isTall
                ? "text-sm md:text-base line-clamp-2 mb-2"
                : "text-xs line-clamp-2 mb-1.5",
            )}
          >
            {product.name}
          </h3>
        </Link>

        {/* Description — only on tall cards */}
        {isTall && product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price + rating row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className={cn(
                "font-extrabold text-[#2d5016]",
                isTall ? "text-lg md:text-xl" : "text-base",
              )}
            >
              ₹{displayPrice}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[11px] font-semibold text-gray-700">
                {product.averageRating.toFixed(1)}
              </span>
              {isTall && (
                <span className="text-[10px] text-gray-400">
                  ({product.totalReviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA buttons */}
        {isOutOfStock ? (
          <div className="w-full py-2 rounded-lg bg-gray-100 text-center text-gray-400 font-semibold text-xs">
            Out of Stock
          </div>
        ) : isTall ? (
          // Tall card: two buttons stacked
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className={cn(
                "w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
                isPaan
                  ? "border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                  : "bg-[#2d5016] text-white hover:bg-[#3d6820]",
              )}
            >
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPaan ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              {isPaan ? "View Options" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 rounded-xl font-bold text-xs border-2 border-[#d4af37] text-[#2d5016] bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-[#1a3009] transition-all"
            >
              Buy Now
            </button>
          </div>
        ) : (
          // Short card: single compact button
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className={cn(
              "w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
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
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SKELETON
═══════════════════════════════════════ */
function MasonrySkeleton() {
  // Mimic the tall/short pattern visually
  const heights = [
    ["h-80", "h-52"],
    ["h-56", "h-72"],
    ["h-72", "h-56"],
    ["h-52", "h-80"],
  ];
  return (
    <div className="hidden md:flex gap-4 lg:gap-5 items-start animate-pulse">
      {heights.map((col, ci) => (
        <div key={ci} className="flex-1 flex flex-col gap-4">
          {col.map((h, ri) => (
            <div key={ri} className={cn("rounded-2xl bg-gray-200", h)} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════ */
function EmptyState() {
  return (
    <div className="text-center py-16 md:py-24 w-full">
      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        No Featured Products Yet
      </h3>
      <p className="text-sm md:text-base text-gray-600">
        Check back soon for our curated collections!
      </p>
    </div>
  );
}
