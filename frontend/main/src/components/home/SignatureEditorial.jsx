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

export default function SignatureEditorial() {
  const { filteredProducts, filterProducts, loading } = useProductStore();
  const { categories, fetchActiveCategories } = useCategoryStore();
  const [activeTabId, setActiveTabId] = useState(null);
  const [stableProducts, setStableProducts] = useState([]);
  const [slideState, setSlideState] = useState("idle");
  // which side card is "expanded" in mobile stacked view
  const [activeSideIdx, setActiveSideIdx] = useState(0);

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
      .slice(0, 7); // hero + up to 6 side cards
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
      setActiveSideIdx(0);
      setSlideState("enter");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setSlideState("idle")),
      );
    }, 180);
    return () => clearTimeout(fadeTimer.current);
  }, [computedProducts, loading]);

  const handleTabChange = (id) => {
    if (id !== activeTabId) setActiveTabId(id);
  };

  const activeRoot = categories.find((c) => c._id === activeTabId);
  const seeAllHref = activeRoot ? `/collections/${activeRoot.slug}` : "/shop";

  const hero = stableProducts[0] ?? null;
  const sideCards = stableProducts.slice(1); // up to 6

  return (
    <section
      className="relative py-12 md:py-20 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #fafaf6, #fff, #fafaf6)",
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
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#d4af37] uppercase mb-2">
              Curated for you
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
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
          </div>

          {/* Tabs — desktop right-aligned */}
          {visibleCategories.length > 0 && (
            <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
              {visibleCategories.map((cat) => (
                <motion.button
                  key={cat._id}
                  onClick={() => handleTabChange(cat._id)}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap",
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
                      layoutId="tab-dot-desktop"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tabs — mobile scrollable */}
        {visibleCategories.length > 0 && (
          <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6">
            <div className="flex items-center gap-2 min-w-max">
              {visibleCategories.map((cat) => (
                <motion.button
                  key={cat._id}
                  onClick={() => handleTabChange(cat._id)}
                  className={cn(
                    "relative shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap",
                    activeTabId === cat._id
                      ? "text-white shadow-lg shadow-[#2d5016]/20"
                      : "bg-white text-gray-600 border border-gray-200",
                  )}
                  style={
                    activeTabId === cat._id
                      ? {
                          background:
                            "linear-gradient(to right, #2d5016, #3d6820)",
                        }
                      : {}
                  }
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.name}
                  {activeTabId === cat._id && (
                    <motion.span
                      layoutId="tab-dot-mobile"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
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
            <EditorialSkeleton />
          ) : stableProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* ── DESKTOP: hero left + side grid right ── */}
              <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-6">
                {/* Hero card — 3 cols */}
                {hero && (
                  <HeroCard
                    product={hero}
                    seeAllHref={seeAllHref}
                    categoryName={activeRoot?.name}
                  />
                )}

                {/* Side grid — 2 cols, up to 6 small cards in 2×3 */}
                <div className="col-span-2 grid grid-cols-2 gap-3 lg:gap-4 content-start">
                  {sideCards.map((product) => (
                    <SideCard key={product._id} product={product} />
                  ))}
                </div>
              </div>

              {/* ── MOBILE: hero full-width + side horizontal scroll ── */}
              <div className="md:hidden flex flex-col gap-4">
                {hero && <HeroCardMobile product={hero} />}
                {sideCards.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
                    {sideCards.map((product) => (
                      <div
                        key={product._id}
                        className="snap-center shrink-0 w-[72%]"
                      >
                        <SideCardMobile product={product} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-center">
                  <Link href={seeAllHref}>
                    <Button
                      size="sm"
                      className="text-white font-semibold px-6 h-11 shadow-lg"
                      style={{
                        background:
                          "linear-gradient(to right, #2d5016, #3d6820)",
                      }}
                    >
                      See All {activeRoot?.name || "Products"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
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
   HERO CARD — desktop, 3/5 width
═══════════════════════════════════════ */
function HeroCard({ product, seeAllHref, categoryName }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();
  const { openCheckout } = useCheckoutUIStore();
  const { openGuestCheckout } = useGuestCheckoutUIStore();
  const [isAdding, setIsAdding] = useState(false);

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

  const categoryName2 = resolveName(product.category);
  const parentName = resolveName(product.parentCategory);
  const displayLabel =
    categoryName2 && categoryName2 !== parentName
      ? categoryName2
      : parentName || categoryName2;

  const handleAdd = async () => {
    if (isOutOfStock || isPaan) {
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

  const handleBuy = async () => {
    if (isOutOfStock || isPaan) {
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
    <div className="col-span-3 group relative rounded-2xl overflow-hidden bg-[#1a3009] flex flex-col min-h-120 lg:min-h-135">
      {/* Background image */}
      {images[0] && (
        <div className="absolute inset-0">
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-[#0d1f05] via-[#1a3009]/60 to-transparent" />

      {/* Top badges */}
      <div className="relative z-10 flex items-start justify-between p-5 lg:p-7">
        <div className="flex flex-col gap-2">
          {product.isFeatured && (
            <span className="bg-[#d4af37] text-[#1a3009] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              ✦ Editor's Pick
            </span>
          )}
          {discount > 0 && (
            <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
              {discount}% off
            </span>
          )}
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all"
        >
          <ArrowUpRight className="w-4 h-4 text-white" />
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 p-5 lg:p-7">
        {/* Category + rating */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#d4af37] uppercase">
            {displayLabel}
          </p>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15">
              <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[11px] font-semibold text-white">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-white/60">
                ({product.totalReviews})
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-1 hover:text-[#d4af37] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-white/60 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-5">
          <span className="text-3xl font-extrabold text-white">
            ₹{displayPrice}
          </span>
          {discount > 0 && (
            <span className="text-base text-white/40 line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* CTAs */}
        {isOutOfStock ? (
          <div className="w-full py-3 rounded-xl bg-white/10 text-center text-white/50 font-semibold text-sm border border-white/10">
            Out of Stock
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-white text-[#2d5016] hover:bg-[#d4af37] hover:text-[#1a3009] transition-all duration-200"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPaan ? (
                <Eye className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              {isPaan ? "Options" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuy}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#d4af37] text-[#1a3009] hover:bg-white transition-all duration-200"
            >
              Buy Now
            </button>
          </div>
        )}

        {/* See all link */}
        <Link
          href={seeAllHref}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-[#d4af37] transition-colors group/link w-fit"
        >
          <span>See all {categoryName}</span>
          <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SIDE CARD — desktop small
═══════════════════════════════════════ */
function SideCard({ product }) {
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isOutOfStock || isPaan) {
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

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block rounded-xl overflow-hidden border border-gray-100 bg-white hover:border-[#2d5016]/30 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative bg-gray-50 overflow-hidden"
        style={{ paddingBottom: "90%" }}
      >
        {images[0] && (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className={cn(
              "object-contain absolute inset-0 transition-transform duration-500",
              hovered ? "scale-108" : "scale-100",
            )}
            style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
          />
        )}
        {!images[0] && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="bg-[#2d5016] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-gray-800 px-3 py-1 rounded-full font-bold text-[10px]">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick add — appears on hover */}
        {!isOutOfStock && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex items-center justify-center pb-2 z-10 transition-all duration-200",
              hovered ? "opacity-100" : "opacity-0",
            )}
          >
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="bg-[#2d5016] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-[#3d6820] transition-colors"
            >
              {isAdding ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isPaan ? (
                <Eye className="w-3 h-3" />
              ) : (
                <ShoppingCart className="w-3 h-3" />
              )}
              {isPaan ? "Options" : "Quick Add"}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-[#2d5016] transition-colors">
          {product.name}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-[#2d5016]">
              ₹{displayPrice}
            </span>
            {discount > 0 && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[10px] text-gray-600 font-semibold">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════
   HERO CARD — mobile full width
═══════════════════════════════════════ */
function HeroCardMobile({ product }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();
  const [isAdding, setIsAdding] = useState(false);

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

  const handleAdd = async () => {
    if (isOutOfStock || isPaan) {
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

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#1a3009] min-h-85 flex flex-col">
      {images[0] && (
        <div className="absolute inset-0">
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover opacity-35"
            sizes="100vw"
            priority
          />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-[#0d1f05] via-[#1a3009]/60 to-transparent" />

      <div className="relative z-10 p-4 flex items-start justify-between">
        {product.isFeatured && (
          <span className="bg-[#d4af37] text-[#1a3009] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            ✦ Editor's Pick
          </span>
        )}
        <Link
          href={`/shop/${product.slug}`}
          className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center ml-auto"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>

      <div className="flex-1" />

      <div className="relative z-10 p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-extrabold text-white">
            ₹{displayPrice}
          </span>
          {discount > 0 && (
            <span className="text-sm text-white/40 line-through">
              ₹{originalPrice}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs text-[#d4af37] font-bold">
              {discount}% off
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white text-[#2d5016] flex items-center justify-center gap-2 hover:bg-[#d4af37] hover:text-[#1a3009] transition-all"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPaan ? (
              <Eye className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            {isPaan ? "Options" : "Add to Cart"}
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#d4af37] text-[#1a3009] flex items-center justify-center"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SIDE CARD — mobile horizontal scroll
═══════════════════════════════════════ */
function SideCardMobile({ product }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const { addToCart } = useCartStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();
  const [isAdding, setIsAdding] = useState(false);

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

  const handleAdd = async () => {
    if (isOutOfStock || isPaan) {
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

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      <Link
        href={`/shop/${product.slug}`}
        className="block relative bg-gray-50"
        style={{ paddingBottom: "75%" }}
      >
        {images[0] ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-contain absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100" />
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-[#2d5016] text-white text-[9px] font-bold px-2 py-0.5 rounded-md z-10">
            -{discount}%
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-white text-gray-800 px-3 py-1 rounded-full font-bold text-[10px]">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      <div className="p-3">
        <Link href={`/shop/${product.slug}`}>
          <h4 className="font-bold text-xs text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h4>
        </Link>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-extrabold text-[#2d5016]">
            ₹{displayPrice}
          </span>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[10px] font-semibold text-gray-600">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding || isOutOfStock}
          className={cn(
            "w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all",
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isPaan
                ? "border-2 border-[#2d5016] text-[#2d5016] bg-transparent hover:bg-[#2d5016] hover:text-white"
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
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SKELETONS & EMPTY STATE
═══════════════════════════════════════ */
function EditorialSkeleton() {
  return (
    <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-6 animate-pulse">
      <div className="col-span-3 rounded-2xl bg-gray-200 min-h-120" />
      <div className="col-span-2 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-100 overflow-hidden">
            <div className="bg-gray-200" style={{ paddingBottom: "90%" }} />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
