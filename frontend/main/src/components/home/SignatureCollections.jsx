"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/stores/useProductStore";
import { useCartStore } from "@/stores/useCartStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGuestCartStore } from "@/stores/useGuestCartStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import {
  ShoppingBag,
  Star,
  Heart,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartUIStore } from "@/stores/useCartUIStore";
import { useCheckoutUIStore } from "@/stores/useCheckoutUIStore";
import { useGuestCheckoutUIStore } from "@/stores/useGuestCheckoutUIStore";
import { useRouter } from "next/navigation";

/* ── helpers ── */
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;

export default function SignatureCollections() {
  const { products, filterProducts, loading } = useProductStore();
  const { categories, fetchActiveCategories } = useCategoryStore();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* Active tab — null means "All" / first root category */
  const [activeTabId, setActiveTabId] = useState(null);

  /* Load categories on mount */
  useEffect(() => {
    fetchActiveCategories();
  }, []);

  /* Auto-select first root category once loaded */
  useEffect(() => {
    if (categories.length > 0 && !activeTabId) {
      setActiveTabId(categories[0]._id);
    }
  }, [categories]);

  /* Fetch featured products for active tab */
  useEffect(() => {
    if (!activeTabId) return;
    const root = categories.find((c) => c._id === activeTabId);
    const hasChildren = (root?.children?.length ?? 0) > 0;
    if (hasChildren) {
      filterProducts({ parentCategory: activeTabId, isFeatured: true });
    } else {
      filterProducts({ category: activeTabId, isFeatured: true });
    }
  }, [activeTabId, categories]);

  /* Locally filter to featured only */
  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.isFeatured) return false;
        if (!activeTabId) return true;
        const parentId = resolveId(p.parentCategory);
        const catId = resolveId(p.category);
        return parentId === activeTabId || catId === activeTabId;
      })
      .slice(0, 8);
  }, [products, activeTabId]);

  /* Active root slug for "See All" link */
  const activeRoot = categories.find((c) => c._id === activeTabId);
  const seeAllHref = activeRoot ? `/collections/${activeRoot.slug}` : "/shop";

  /* Check scroll position */
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [displayProducts]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth;
      container.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="relative py-12 md:py-20 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #fafaf6, white, #fafaf6)",
      }}
    >
      {/* Decorative blobs */}
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
          className="text-center max-w-3xl mx-auto mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4">
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
          <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
            Hand-crafted paans and delicacies, chosen for those who appreciate
            authenticity and indulgence.
          </p>
        </motion.div>

        {/* ── Category Tabs ── */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-14"
          >
            {/* Mobile: Scrollable */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide px-4 -mx-4">
              <div className="flex items-center gap-2 min-w-max px-4">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveTabId(cat._id)}
                    className={cn(
                      "relative shrink-0 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 whitespace-nowrap",
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
                  >
                    {cat.name}
                    {activeTabId === cat._id && (
                      <motion.span
                        layoutId="tab-dot-mobile"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Centered */}
            <div className="hidden lg:flex items-center justify-center gap-2 px-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveTabId(cat._id)}
                  className={cn(
                    "relative shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap",
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
                >
                  {cat.name}
                  {activeTabId === cat._id && (
                    <motion.span
                      layoutId="tab-dot-desktop"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Product Grid/Scroll ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingSkeleton />
          ) : displayProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              {/* Mobile: Horizontal Scroll with Arrows */}
              <div className="lg:hidden relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                  <button
                    onClick={() => scroll("left")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                  <button
                    onClick={() => scroll("right")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  </button>
                )}

                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                >
                  {displayProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="snap-center shrink-0 w-full px-1 md:px-2"
                    >
                      <ProductCard product={product} index={index} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-6">
                {displayProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── See All button ── */}
        {!loading && displayProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 text-center"
          >
            <Link href={seeAllHref}>
              <Button
                size="lg"
                className="text-white font-semibold px-6 md:px-8 h-12 md:h-14 text-sm md:text-base shadow-xl group hover:opacity-90"
                style={{
                  background: "linear-gradient(to right, #2d5016, #3d6820)",
                }}
              >
                See All {activeRoot?.name || "Products"}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Add scrollbar-hide utility */}
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

/* ═══════════════════════════
   PRODUCT CARD - COMPACT MOBILE
═══════════════════════════ */
function ProductCard({ product, index }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();
  const { openCheckout } = useCheckoutUIStore();
  const { openGuestCheckout } = useGuestCheckoutUIStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const hoverTimeout = useRef(null);

  const isPaan = product.isPaan;
  const hasVariants = isPaan && product.variants?.length > 0;
  const images = product.images || [];
  const hasSecond = images.length > 1;

  const categoryName = resolveName(product.category);
  const parentName = resolveName(product.parentCategory);
  const displayLabel =
    categoryName && categoryName !== parentName
      ? categoryName
      : parentName || categoryName;

  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;
  const originalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;

  const priceRange =
    hasVariants && product.variants.length > 1
      ? (() => {
          const prices = product.variants.map((v) => v.discountedPrice);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
        })()
      : null;

  const discount =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  const handleMouseEnter = () => {
    if (!hasSecond) return;
    hoverTimeout.current = setTimeout(() => setImgIndex(1), 120);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setImgIndex(0);
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (isPaan) {
      router.push(`/shop/${product._id}`);
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

  const handleBuyNow = async () => {
    if (isOutOfStock) return;

    if (isPaan) {
      router.push(`/shop/${product._id}`);
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group flex flex-col bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image area - Compact */}
      <Link
        href={`/shop/${product._id}`}
        className="block relative overflow-hidden bg-gray-50"
        style={{ paddingBottom: "100%" }}
      >
        {/* Primary image */}
        <Image
          src={images[0] || "/placeholder-product.png"}
          alt={product.name}
          fill
          className={cn(
            "object-cover absolute inset-0 transition-all duration-500",
            imgIndex === 1 ? "opacity-0 scale-105" : "opacity-100 scale-100",
          )}
        />
        {/* Secondary image */}
        {hasSecond && (
          <Image
            src={images[1]}
            alt={`${product.name} – view 2`}
            fill
            className={cn(
              "object-cover absolute inset-0 transition-all duration-500",
              imgIndex === 1 ? "opacity-100 scale-100" : "opacity-0 scale-105",
            )}
          />
        )}

        {/* Badges - Smaller */}
        <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-1.5 z-10">
          {product.isFeatured && (
            <span className="bg-[#d4af37] text-black text-[10px] md:text-[11px] font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg shadow">
              Popular
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-3 md:px-5 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick-view hint - Hidden on mobile */}
        {!isOutOfStock && (
          <div
            className="hidden md:flex absolute inset-x-0 bottom-0 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end pb-2 justify-center z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)",
            }}
          >
            <span className="text-white text-xs font-semibold tracking-wide">
              View Details
            </span>
          </div>
        )}
      </Link>

      {/* Content - Compact */}
      <div className="flex flex-col flex-1 p-3 md:p-5">
        {/* Category label - Smaller */}
        <p className="text-[10px] md:text-[11px] text-black uppercase tracking-widest font-medium mb-1 md:mb-1.5">
          {displayLabel}
        </p>

        <Link href={`/shop/${product._id}`}>
          <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 leading-snug mb-1.5 md:mb-2 group-hover:text-[#2d5016] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex-1" />

        {/* Price - Compact */}
        <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap mb-1.5 md:mb-2">
          {priceRange ? (
            <span className="text-base md:text-lg font-extrabold text-gray-900">
              {priceRange}
            </span>
          ) : (
            <>
              <span className="text-lg md:text-xl font-extrabold text-[#2d5016]">
                ₹{displayPrice}
              </span>
              {discount > 0 && (
                <span className="text-xs md:text-sm text-gray-400 line-through font-medium">
                  ₹{originalPrice}
                </span>
              )}
            </>
          )}
        </div>

        {/* Discount % + Rating row - Compact */}
        <div className="flex items-center justify-between gap-2 mb-2 md:mb-4 min-h-4 md:min-h-5">
          {discount > 0 ? (
            <span className="text-[9px] md:text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full whitespace-nowrap">
              {discount}% off
            </span>
          ) : (
            <span />
          )}

          {/* Rating - Smaller */}
          {product.averageRating > 0 ? (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[10px] md:text-[12px] font-semibold text-gray-700">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-[9px] md:text-[11px] text-gray-400">
                ({product.totalReviews})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-gray-300" />
              <span className="text-[9px] md:text-[11px] text-gray-400">
                No reviews
              </span>
            </div>
          )}
        </div>

        {/* CTA Buttons - Compact, Stacked on Mobile */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              "w-full py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 transition-all",
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isPaan
                  ? "bg-[#fdf8f0] border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white"
                  : "bg-[#2d5016] hover:bg-[#3d6820] text-white",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                <span>Adding…</span>
              </>
            ) : isPaan ? (
              <>
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                <span>Options</span>
              </>
            ) : (
              <span>Add To Cart</span>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={cn(
              "w-full py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2 transition-all border-2",
              isOutOfStock
                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                : "border-[#d4af37] text-[#2d5016] bg-[#d4af37]/10 hover:bg-[#d4af37] hover:text-black",
            )}
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════
   LOADING SKELETON - COMPACT
═══════════════════════════ */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl md:rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />
          <div className="p-3 md:p-5 space-y-3 md:space-y-4">
            <div className="h-2 md:h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 md:h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-5 md:h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-8 md:h-10 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════
   EMPTY STATE
═══════════════════════════ */
function EmptyState() {
  return (
    <div className="text-center py-16 md:py-20">
      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
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