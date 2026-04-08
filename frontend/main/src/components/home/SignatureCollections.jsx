"use client";

import { useEffect, useState, useMemo } from "react";
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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useCartUIStore } from "@/stores/useCartUIStore";

/* ── helpers ── */
const resolveName = (f) => (f && typeof f === "object" ? f.name : f) || "";
const resolveId = (f) => (f && typeof f === "object" ? f._id : f) || null;
const resolveSlug = (f) => (f && typeof f === "object" ? f.slug : null);

/* Soft background tints per card index — cycles if more than 6 products */
const CARD_TINTS = [
  "#e8d5c4",
  "#c8d8c0",
  "#c4ccd8",
  "#d8c4c4",
  "#d4d0c0",
  "#c4d4d0",
];

export default function SignatureCollections() {
  const { products, filterProducts, loading } = useProductStore();
  const { categories, fetchActiveCategories } = useCategoryStore();

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
    // For root categories with children → use parentCategory filter
    // For leaf/childless roots → filter by category directly
    if (hasChildren) {
      filterProducts({ parentCategory: activeTabId, isFeatured: true });
    } else {
      filterProducts({ category: activeTabId, isFeatured: true });
    }
  }, [activeTabId, categories]);

  /* Locally filter to featured only (backend may not support isFeatured param) */
  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.isFeatured) return false;
        if (!activeTabId) return true;
        const parentId = resolveId(p.parentCategory);
        const catId = resolveId(p.category);
        return parentId === activeTabId || catId === activeTabId;
      })
      .slice(0, 6); // cap at 6 cards
  }, [products, activeTabId]);

  /* Active root slug for "See All" link */
  const activeRoot = categories.find((c) => c._id === activeTabId);
  const seeAllHref = activeRoot
    ? `/collections/${activeRoot.slug}`
    : "/collections/collections";

  return (
    <section className="relative bg-linear-to-b from-[#fafaf6] via-white to-[#fafaf6] py-20 overflow-hidden">
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
          className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#d4af37]/20 to-[#f4d03f]/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-semibold text-[#2d5016] tracking-wide">
              CURATED PICKS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Signature{" "}
            <span className="bg-linear-to-r from-[#2d5016] via-[#3d6820] to-[#2d5016] bg-clip-text text-transparent">
              Collections
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
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
            className="flex items-center justify-center gap-2 mb-10 md:mb-14 px-2"
          >
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveTabId(cat._id)}
                className={cn(
                  "relative shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                  activeTabId === cat._id
                    ? "bg-linear-to-r from-[#2d5016] to-[#3d6820] text-white shadow-lg shadow-[#2d5016]/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#2d5016]/40 hover:text-[#2d5016] shadow-sm",
                )}
              >
                {cat.name}
                {activeTabId === cat._id && (
                  <motion.span
                    layoutId="tab-dot"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#d4af37]"
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Product Grid ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="h-80 bg-gray-200" />
                  <div className="p-5 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                    <div className="h-11 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : displayProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Featured Products Yet
              </h3>
              <p className="text-gray-600">
                Check back soon for our curated collections!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  tint={CARD_TINTS[index % CARD_TINTS.length]}
                />
              ))}
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
            className="mt-16 text-center"
          >
            <Link href={seeAllHref}>
              <Button
                size="lg"
                className="bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white font-semibold px-8 h-14 text-base shadow-xl group"
              >
                See All {activeRoot?.name || "Products"}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════
   PRODUCT CARD — Paanshala theme
═══════════════════════════ */
function ProductCard({ product, index, tint }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const { addItem: addGuestItem } = useGuestCartStore();
  const { openCart } = useCartUIStore();

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const isPaan = product.isPaan;
  const hasVariants = isPaan && product.variants?.length > 0;

  const displayPrice = hasVariants
    ? product.variants[0].discountedPrice
    : product.discountedPrice;
  const originalPrice = hasVariants
    ? product.variants[0].originalPrice
    : product.originalPrice;
  const discountPercent =
    originalPrice && displayPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const isOutOfStock = hasVariants
    ? product.variants.every((v) => (v.stock ?? 0) === 0)
    : (product.stock ?? 0) === 0;

  /* ── cycle images on hover ── */
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      const id = setInterval(
        () => setCurrentImageIndex((p) => (p + 1) % images.length),
        1500,
      );
      return () => clearInterval(id);
    } else {
      setCurrentImageIndex(0);
    }
  }, [isHovered, hasMultipleImages, images.length]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (isPaan) {
      window.location.href = `/shop/${product._id}`;
      return;
    }
    if (isAuthenticated) {
      setIsAdding(true);
      await addToCart({
        productId: product._id,
        quantity: 1,
        variantSetSize: hasVariants ? product.variants[0].setSize : undefined,
      });
      openCart();
      setIsAdding(false);
    } else {
      addGuestItem({
        productId: product._id,
        name: product.name,
        image: images[0] || null,
        price: displayPrice,
        originalPrice,
        isPaan,
        variantSetSize: hasVariants ? product.variants[0].setSize : null,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart!`);
      openCart();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* ── Image ── */}
      <Link
        href={`/shop/${product._id}`}
        className="block relative bg-gray-100"
        style={{ paddingBottom: "85%" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImageIndex] || "/placeholder-product.png"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discountPercent > 0 && (
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 font-bold text-xs">
              {discountPercent}% OFF
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-linear-to-r from-[#d4af37] to-[#f4d03f] text-black border-0 font-semibold text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="bg-gray-800 text-white border-0 text-xs"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite((v) => !v);
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-10"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600",
            )}
          />
        </button>

        {/* Image dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentImageIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </Link>

      {/* ── Content ── */}
      <div className="p-5">
        {/* Category badge + rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">
            {resolveName(product.category) ||
              resolveName(product.parentCategory)}
          </span>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-xs font-semibold text-gray-700">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({product.totalReviews})
              </span>
            </div>
          )}
        </div>

        {/* Name */}
        <Link href={`/shop/${product._id}`}>
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-3 hover:text-[#2d5016] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <span className="text-xl font-bold text-gray-900">
            ₹{displayPrice}
          </span>
          {originalPrice && originalPrice > displayPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice}
            </span>
          )}
          {hasVariants && (
            <span className="text-xs text-gray-400">onwards</span>
          )}
        </div>

        {/* Discount % pill */}
        {discountPercent > 0 && (
          <p className="text-[11px] font-bold text-green-600 bg-green-50 border border-green-200 inline-flex items-center px-2 py-0.5 rounded-full mb-3">
            {discountPercent}% off
          </p>
        )}

        {/* Add to cart */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            "w-full h-11 font-semibold transition-all duration-300",
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-[#2d5016] to-[#3d6820] hover:opacity-90 text-white",
          )}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding…
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>

      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#d4af37]/50 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}